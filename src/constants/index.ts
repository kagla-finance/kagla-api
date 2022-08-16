import { Coin } from 'src/models/coin'

export const KGL_PRICE_IN_USD = 0.01
export const WORST_APR_RATIO = 0.4

export const NATIVE_ASSET_DUMMY_ADDRESS =
  '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE'

export const NATIVE_ASSET_INFO: Coin = {
  address: NATIVE_ASSET_DUMMY_ADDRESS,
  name: 'Astar',
  symbol: 'ASTR',
  decimals: 18,
}
