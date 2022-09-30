import { OVERWRITE_COINS } from 'src/constants'
import { Coin } from 'src/models/coin'

export const overwriteCoins = (coins: Coin[]): Coin[] =>
  coins.map((coin) => {
    const overwrite = OVERWRITE_COINS[coin.address]
    if (!overwrite) return coin
    return { ...coin, ...overwrite } as Coin
  })
