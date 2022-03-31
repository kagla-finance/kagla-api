import { ethers, providers, Signer } from 'ethers'
import { KGL_PRICE_IN_USD } from 'src/constants'
import { LiquidityGauge } from 'src/models/gauge'
import {
  AssetType,
  Pool,
  PoolCoin,
  PoolMarketData,
  PoolOutline,
  PoolUnderlyingCoin,
} from 'src/models/pool'
import { IStatsService } from 'src/storage/Stats'
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
import { PoolInfo, PoolInfo__factory } from '../__generated__'
import { calculatePoolsTVL } from './calculator'

export type IPoolInfoService = {
  listPools: () => Promise<{ blockNumber: string; pools: PoolOutline[] }>
  getPool: (address: string) => Promise<{ blockNumber: string; pool?: Pool }>
  getPoolMarketData: (
    address: string,
  ) => Promise<{ blockNumber: string; pool?: PoolMarketData }>
  getTVL: () => Promise<{ blockNumber: string; tvl: string }>
}

export class PoolInfoService implements IPoolInfoService {
  private constructor(
    readonly poolInfo: PoolInfo,
    readonly registry: IRegistryService,
    readonly gauge: IGaugeService,
    readonly multiCall: IMultiCallService,
    readonly erc20MultiCall: IERC20MultiCallService,
    readonly stats: IStatsService,
    readonly price: IPriceService,
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
    },
  ) =>
    new PoolInfoService(
      PoolInfo__factory.connect(
        params.poolInfoAddress,
        params.signerOrProvider,
      ),
      dependencies.registry,
      dependencies.gauge,
      dependencies.multiCall,
      dependencies.erc20MultiCall,
      dependencies.stats,
      dependencies.price,
    )

  listPools: IPoolInfoService['listPools'] = async () => {
    const poolAddresses = await this.registry.listPoolAddresses()
    const apyStats = await this.stats.getAPY()
    const { blockNumber, pools } = await this.poolMultiCall(...poolAddresses)
    return {
      blockNumber,
      pools: pools.map((poolInfo, idx) => ({
        address: poolAddresses[idx],
        name: poolInfo.name,
        assetType: poolInfo.assetType,
        lpToken: {
          address: poolInfo.lpToken.address,
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
        balances: poolInfo.coins.reduce(
          (res, coin) => ({ ...res, [coin.address]: coin.balance }),
          {},
        ),
        underlyingBalances: poolInfo.underlyingCoins.reduce(
          (res, coin) => ({ ...res, [coin.address]: coin.balance }),
          {},
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
    } = await this.poolMultiCall(address)
    if (!pool) return { blockNumber }
    const coinAddresses = pool.coins
      .map(({ address }) => address)
      .concat(pool.underlyingCoins.map(({ address }) => address))
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
        coins: pool.coins.map((coin) => {
          const coinDatum = coinData[coin.address]
          return { ...coin, ...coinDatum }
        }),
        underlyingCoins: pool.underlyingCoins.map((coin) => {
          const coinDatum = coinData[coin.address]
          return { ...coin, ...coinDatum }
        }),
        apy: apyStats?.apy.day[pool.name]?.toString(),
      },
    }
  }

  getPoolMarketData: IPoolInfoService['getPoolMarketData'] = async (
    address,
  ) => {
    const {
      blockNumber,
      pools: [pool],
    } = await this.poolMultiCall(address)
    if (!pool) return { blockNumber }
    const apyStats = await this.stats.getAPY()
    return {
      blockNumber,
      pool: {
        address,
        lpToken: {
          address: pool.lpToken.address,
          totalSupply: pool.lpToken.totalSupply,
          virtualPrice: pool.lpToken.virtualPrice,
        },
        balances: pool.coins.reduce(
          (res, coin) => ({ ...res, [coin.address]: coin.balance }),
          {},
        ),
        underlyingBalances: pool.underlyingCoins.reduce(
          (res, coin) => ({ ...res, [coin.address]: coin.balance }),
          {},
        ),
        apy: apyStats?.apy.day[pool.name]?.toString(),
        parameters: pool.parameters,
        gauges: pool.gauges,
      },
    }
  }

  getTVL: IPoolInfoService['getTVL'] = async () => {
    const [{ blockNumber, pools }, lpTokenAddresses, assetPrices] =
      await Promise.all([
        this.listPools(),
        this.registry.listLPTokenAddresses(),
        this.price.getAssetPricesInUSD(),
      ])
    const tvl = calculatePoolsTVL(pools, lpTokenAddresses, assetPrices)
    return {
      blockNumber: blockNumber.toString(),
      tvl: tvl.toString(),
    }
  }

  private poolMultiCall = async (...addresses: string[]) => {
    const { poolInfo, multiCall, price } = this
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
      const gauges: LiquidityGauge[] = multicallData[i].gauges.map((gauge) => {
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
            rewardPrice: KGL_PRICE_IN_USD,
            lpTokenVirtualPrice: normalizeBn(pool.lpToken.virtualPrice),
          },
        )
        nextIndex = mapped.nextIndex
        return mapped.gauge
      })
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
  PoolInfo,
  FunctionName<PoolInfo>,
  Omit<MappedPoolInfo, 'address'>
> = (res, functionName, current) => {
  if (functionName === 'get_pool_coins')
    return getPoolCoinsMapper(res as FunctionResult<PoolInfo, 'get_pool_coins'>)
  if (functionName === 'get_pool_info')
    return getPoolInfoMapper(
      res as FunctionResult<PoolInfo, 'get_pool_info'>,
      current,
    )
  console.warn(`no mapper found: ${functionName}`)
  return {}
}

const getPoolInfoMapper: FunctionResultMapper<
  PoolInfo,
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
})

const getPoolCoinsMapper: FunctionResultMapper<
  PoolInfo,
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
