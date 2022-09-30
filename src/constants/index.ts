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

export const OVERWRITE_COINS: Partial<Record<string, Partial<Coin>>> = {
  '0x3795C36e7D12A8c252A20C5a7B455f7c57b60283': {
    symbol: 'ceUSDT',
    name: 'Celer USDT',
  },
  '0x430D50963d9635bBef5a2fF27BD0bDDc26ed691F': {
    symbol: 'lceUSDT',
    name: 'Starlay interest bearing ceUSDT',
  },
}
