import { PoolBalance } from 'src/models/balance'
import { AssetType } from 'src/models/pool'
import { AssetPrices } from 'src/models/price'
import { BigNumberJs, BN_ZERO, normalizeBn } from 'src/utils/number'
import { ValueOf } from 'type-fest'

export const calculatePoolsTVL = (
  pools: {
    isMeta: boolean
    assetType: ValueOf<typeof AssetType>
    coins: { address: string; decimals: number }[]
    balances: PoolBalance
    lpToken: { totalSupply: string; virtualPrice: string }
  }[],
  assetPrices: AssetPrices,
) =>
  pools.reduce((res, pool) => {
    const assetPrice = assetPrices[pool.assetType]
    if (!BigNumberJs.isBigNumber(assetPrice)) {
      // not supported yet
      return res
    }
    if (pool.isMeta) {
      return res.plus(calculateMetaPoolTVL(pool, assetPrice))
    }
    return res.plus(calculateBasePoolTVL(pool, assetPrice))
  }, BN_ZERO)

const calculateBasePoolTVL = (
  pool: {
    lpToken: { totalSupply: string; virtualPrice: string }
  },
  assetPrice: BigNumberJs,
) => {
  const { totalSupply, virtualPrice } = pool.lpToken
  const poolTVL = normalizeBn(totalSupply)
    .times(normalizeBn(virtualPrice))
    .decimalPlaces(18, BigNumberJs.ROUND_FLOOR)
  return poolTVL.times(assetPrice).decimalPlaces(18, BigNumberJs.ROUND_FLOOR)
}

const calculateMetaPoolTVL = (
  pool: {
    coins: { address: string; decimals: number }[]
    balances: PoolBalance
  },
  assetPrice: BigNumberJs,
) => {
  const poolTVL = normalizeBn(pool.balances[0], pool.coins[0].decimals)
  return poolTVL.times(assetPrice).decimalPlaces(18, BigNumberJs.ROUND_FLOOR)
}
