import { ethers, providers, Signer } from 'ethers'
import { getProtocolConfig } from 'src/config'
import { NATIVE_ASSET_INFO } from 'src/constants'
import { LiquidityGauge } from 'src/models/gauge'
import { MarketOverview } from 'src/models/market'
import {
  AssetType,
  Pool,
  PoolCoin,
  PoolMarketData,
  PoolOutline,
  PoolUnderlyingCoin,
} from 'src/models/pool'
import { IStatsService } from 'src/storage/Stats'
import { equals, isNativeAsset, notNativeAsset } from 'src/utils/address'
import { filterFalsy } from 'src/utils/array'
import { overwriteCoins } from 'src/utils/coin'
import { BigNumberJs, BN_ZERO, normalizeBn } from 'src/utils/number'
import { addressOr, bigNumberOr } from 'src/utils/optional'
import { ValueOf } from 'type-fest'
import { IERC20MultiCallService } from '../erc20'
import { IGaugeService } from '../gauge'
import {
  FunctionName,
  FunctionResult,
  FunctionResultMapper,
  FunctionResultsMapper,
  IMultiCallService,
  mapMultiCallResult,
} from '../multiCall'
import { IPriceService } from '../price'
import { IRegistryService } from '../registry'
import { PoolInfoV2, PoolInfoV2__factory } from '../__generated__'
import { calculatePoolsTVL } from './calculator'

export type IPoolInfoService = {
  listPools: (
    includeEolGauges?: boolean,
  ) => Promise<{ blockNumber: string; pools: PoolOutline[] }>
  getPool: (address: string) => Promise<{ blockNumber: string; pool?: Pool }>
  getPoolMarketData: (
    address: string,
    basePoolAddress?: string,
  ) => Promise<{ blockNumber: string; pool?: PoolMarketData }>
  getTVL: () => Promise<{ blockNumber: string; tvl: string }>
  getMarketOverView: () => Promise<{
    blockNumber: string
    market: MarketOverview
  }>
}

export class PoolInfoService implements IPoolInfoService {
  private constructor(
    readonly poolInfo: PoolInfoV2,
    readonly registry: IRegistryService,
    readonly gauge: IGaugeService,
    readonly multiCall: IMultiCallService,
    readonly erc20MultiCall: IERC20MultiCallService,
    readonly stats: IStatsService,
    readonly price: IPriceService,
    readonly kglPrice: () => Promise<number>,
  ) {}

  static new = (
    params: {
      poolInfoAddress: string
      signerOrProvider: Signer | providers.Provider
    },
    dependencies: {
      registry: IRegistryService
      gauge: IGaugeService
      multiCall: IMultiCallService
      erc20MultiCall: IERC20MultiCallService
      stats: IStatsService
      price: IPriceService
      kglPrice: () => Promise<number>
    },
  ) =>
    new PoolInfoService(
      PoolInfoV2__factory.connect(
        params.poolInfoAddress,
        params.signerOrProvider,
      ),
      dependencies.registry,
      dependencies.gauge,
      dependencies.multiCall,
      dependencies.erc20MultiCall,
      dependencies.stats,
      dependencies.price,
      dependencies.kglPrice,
    )

  listPools: IPoolInfoService['listPools'] = async (
    includeEolGauges = false,
  ) => {
    const poolAddresses = await this.registry.listPoolAddresses()
    const apyStats = await this.stats.getAPY()
    const { blockNumber, pools } = await this.poolMultiCall(
      includeEolGauges,
      ...poolAddresses,
    )
    return {
      blockNumber,
      pools: pools.map((poolInfo, idx) => ({
        address: poolAddresses[idx],
        name: poolInfo.name,
        assetType: poolInfo.assetType,
        lpToken: {
          address: poolInfo.lpToken.address,
          symbol: poolInfo.lpToken.symbol,
          totalSupply: poolInfo.lpToken.totalSupply,
          virtualPrice: poolInfo.lpToken.virtualPrice,
        },
        coins: poolInfo.coins.map(({ address, decimals }) => ({
          address,
          decimals,
        })),
        underlyingCoins: poolInfo.underlyingCoins.map(
          ({ address, decimals }) => ({
            address,
            decimals,
          }),
        ),
        balances: poolInfo.coins.map((coin) => coin.balance),
        underlyingBalances: poolInfo.underlyingCoins.map(
          (coin) => coin.balance,
        ),
        parameters: {
          a: poolInfo.parameters.a,
          fee: poolInfo.parameters.fee,
          adminFee: poolInfo.parameters.adminFee,
        },
        isMeta: poolInfo.isMeta,
        basePool: poolInfo.basePool,
        apy: apyStats?.apy.day[poolInfo.name]?.toString(),
        gauges: poolInfo.gauges,
      })),
    }
  }

  getPool: IPoolInfoService['getPool'] = async (address) => {
    const {
      blockNumber,
      pools: [pool],
    } = await this.poolMultiCall(false, address)
    if (!pool) return { blockNumber }
    const coinAddresses = [
      ...pool.coins.map(({ address }) => address),
      ...pool.underlyingCoins.map(({ address }) => address),
    ].filter(notNativeAsset)
    const { data: coinData } = await this.erc20MultiCall.view(coinAddresses, [
      'symbol',
      'name',
    ])
    const apyStats = await this.stats.getAPY()
    return {
      blockNumber,
      pool: {
        ...pool,
        address,
        coins: overwriteCoins(
          pool.coins.map((coin) => {
            const coinDatum = coinData[coin.address]
            if (isNativeAsset(coin.address))
              return { ...coin, ...NATIVE_ASSET_INFO }
            return { ...coin, ...coinDatum }
          }),
        ),
        underlyingCoins: overwriteCoins(
          pool.underlyingCoins.map((coin) => {
            const coinDatum = coinData[coin.address]
            if (isNativeAsset(coin.address))
              return { ...coin, ...NATIVE_ASSET_INFO }
            return { ...coin, ...coinDatum }
          }),
        ),
        apy: apyStats?.apy.day[pool.name]?.toString(),
      },
    }
  }

  getPoolMarketData: IPoolInfoService['getPoolMarketData'] = async (
    address,
    basePoolAddress,
  ) => {
    const {
      blockNumber,
      pools: [pool, basePool],
    } = await this.poolMultiCall(
      false,
      ...[address, basePoolAddress].filter(filterFalsy),
    )
    if (!pool) return { blockNumber }
    const apyStats = await this.stats.getAPY()
    return {
      blockNumber,
      pool: {
        address,
        lpToken: {
          address: pool.lpToken.address,
          symbol: pool.lpToken.symbol,
          totalSupply: pool.lpToken.totalSupply,
          virtualPrice: pool.lpToken.virtualPrice,
        },
        basePoolLPToken: basePool && {
          address: basePool.lpToken.address,
          symbol: basePool.lpToken.symbol,
          totalSupply: basePool.lpToken.totalSupply,
          virtualPrice: basePool.lpToken.virtualPrice,
        },
        balances: pool.coins.map((coin) => coin.balance),
        underlyingBalances: pool.underlyingCoins.map((coin) => coin.balance),
        basePoolUnderlyingBalances: basePool?.underlyingCoins.map(
          (coin) => coin.balance,
        ),
        apy: apyStats?.apy.day[pool.name]?.toString(),
        parameters: pool.parameters,
        gauges: pool.gauges,
      },
    }
  }

  getTVL: IPoolInfoService['getTVL'] = async () => {
    const [{ blockNumber, pools }, assetPrices] = await Promise.all([
      this.listPools(),
      this.price.getAssetPricesInUSD(),
    ])
    const tvl = calculatePoolsTVL(pools, assetPrices)
    return {
      blockNumber: blockNumber.toString(),
      tvl: tvl.toString(),
    }
  }

  getMarketOverView: IPoolInfoService['getMarketOverView'] = async () => {
    const { blockNumber, pools } = await this.listPools()
    return {
      blockNumber,
      market: {
        pools: pools.map((p) => ({
          address: p.address,
          apy: p.apy,
          gauges: p.gauges.map((g) => ({
            address: g.address,
            type: g.type,
            minAPR: g.minAPR,
            maxAPR: g.maxAPR,
            extraRewards: g.extraRewards,
          })),
        })),
      },
    }
  }

  private poolMultiCall = async (
    includeEolGauges: boolean,
    ...addresses: string[]
  ) => {
    const { eolGauges } = getProtocolConfig()

    const { poolInfo, multiCall, price, kglPrice } = this
    const kglPriceInUSD = await kglPrice()
    const multicallData = await Promise.all(
      addresses.map(this.createPoolMultiCallData),
    )
    const { blockNumber, returnData } = await multiCall.call(
      multicallData.flatMap((each) =>
        each.poolMCData.concat(...each.gaugeMCDataArray),
      ),
    )
    const assetPrices = await price.getAssetPricesInUSD()
    const pools: Omit<Pool, 'address'>[] = []

    let nextIndex = 0
    for (let i = 0; i < multicallData.length; i++) {
      // pool
      const poolDataLength = multicallData[i].poolMCData.length
      const poolMCData = returnData.slice(nextIndex, nextIndex + poolDataLength)
      nextIndex += poolDataLength

      const { pool } = mapMultiCallResult(poolMCData, {
        iContract: poolInfo.interface,
        viewFuntions: ['get_pool_coins', 'get_pool_info'],
        keyGenerator: () => 'pool',
        // @ts-ignore
        resultsMapper,
      }) as { pool: Omit<Pool, 'address' | 'gauges'> }

      // gauge
      const assetPrice = assetPrices[pool.assetType]
      const gauges: LiquidityGauge[] = multicallData[i].gauges
        .map((gauge) => {
          const mapped = this.gauge.mapGaugeMutilCallResults(
            gauge,
            returnData,
            nextIndex,
            {
              assetPrice: BigNumberJs.isBigNumber(assetPrice)
                ? assetPrice
                : // not supported yet
                  BN_ZERO,
              // other rewards not supported yet
              rewardPrice: kglPriceInUSD,
              lpTokenVirtualPrice: normalizeBn(pool.lpToken.virtualPrice),
            },
          )
          nextIndex = mapped.nextIndex
          return mapped.gauge
        })
        .filter(
          ({ address }) =>
            includeEolGauges ||
            !eolGauges?.find((eolGauge) => equals(address, eolGauge)),
        )
      pools.push({ ...pool, gauges })
    }
    return {
      blockNumber: blockNumber.toString(),
      pools,
    }
  }

  private createPoolMultiCallData = async (poolAddress: string) => {
    const { poolInfo, multiCall } = this
    const gauges = await this.registry.getGauges(poolAddress)

    const argsMaps = [
      {
        get_pool_info: [poolAddress] as [string],
        get_pool_coins: [poolAddress] as [string],
      },
    ]
    const poolMCData = multiCall.createViewFunctionsCallDataByArgs({
      contract: poolInfo,
      viewFuntions: ['get_pool_coins', 'get_pool_info'],
      argsMaps,
    })
    const gaugeMCDataArray = gauges.map(({ address }) =>
      this.gauge.createGaugeMutilCallData(address),
    )

    return {
      poolMCData,
      gaugeMCDataArray,
      gauges,
    }
  }
}

type MappedPoolInfo = Omit<Pool, 'coins' | 'underlyingCoins'> & {
  coins: Omit<PoolCoin, 'name' | 'symbol'>[]
  underlyingCoins: Omit<PoolUnderlyingCoin, 'name' | 'symbol'>[]
}

const resultsMapper: FunctionResultsMapper<
  PoolInfoV2,
  FunctionName<PoolInfoV2>,
  Omit<MappedPoolInfo, 'address'>
> = (res, functionName, current) => {
  if (functionName === 'get_pool_coins')
    return getPoolCoinsMapper(
      res as FunctionResult<PoolInfoV2, 'get_pool_coins'>,
    )
  if (functionName === 'get_pool_info')
    return getPoolInfoMapper(
      res as FunctionResult<PoolInfoV2, 'get_pool_info'>,
      current,
    )
  console.warn(`no mapper found: ${functionName}`)
  return {}
}

const getPoolInfoMapper: FunctionResultMapper<
  PoolInfoV2,
  'get_pool_info',
  MappedPoolInfo
> = (res, current = {}) => ({
  name: res.name,
  lpToken: {
    address: res.lp_token,
    symbol: res.lp_token_symbol,
    totalSupply: res.lp_token_total_supply.toString(),
    virtualPrice: res.lp_token_virtual_price.toString(),
  },
  isMeta: res.is_meta,
  assetType: res.asset_type.toString() as ValueOf<typeof AssetType>,
  basePool: addressOr(res.base_pool),
  parameters: {
    a: res.params.A.toString(),
    fee: res.params.fee.toString(),
    adminFee: res.params.admin_fee.toString(),
    initialA: bigNumberOr(res.params.initial_A)?.toString(),
    initialATime: bigNumberOr(res.params.initial_A_time)?.toNumber(),
    futureA: bigNumberOr(res.params.future_A)?.toString(),
    futureATime: bigNumberOr(res.params.future_A_time)?.toNumber(),
    futureFee: bigNumberOr(res.params.future_fee)?.toString(),
    futureAdminFee: bigNumberOr(res.params.future_admin_fee)?.toString(),
    futureOwner: addressOr(res.params.future_owner),
  },
  coins: current.coins?.map((coin, idx) => ({
    ...coin,
    balance: res.balances[idx].toString(),
    rate: res.rates[idx].toString(),
  })),
  underlyingCoins: current.underlyingCoins?.map((coin, idx) => ({
    ...coin,
    balance: res.underlying_balances[idx].toString(),
  })),
  zapper: addressOr(res.zap),
})

const getPoolCoinsMapper: FunctionResultMapper<
  PoolInfoV2,
  'get_pool_coins',
  MappedPoolInfo
> = (res) => ({
  coins: res.coins
    .filter((e) => e !== ethers.constants.AddressZero)
    .map((coin, idx) => ({
      index: idx,
      address: coin,
      decimals: res.decimals[idx].toNumber(),
    })),
  underlyingCoins: res.underlying_coins
    .filter((e) => e !== ethers.constants.AddressZero)
    .map((coin, idx) => ({
      address: coin,
      decimals: res.underlying_decimals[idx].toNumber(),
    })),
})
