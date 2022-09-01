import { getPrices } from 'src/api/arthswap'
import { AssetType, AssetTypeValue } from 'src/models/pool'
import { AssetPrices } from 'src/models/price'
import { bigNumberJsOrZero, BN_ONE, BN_ZERO } from 'src/utils/number'
import { IPriceService } from './types'

const EMPTY_ASSET_PRICES: AssetPrices = {
  [AssetType.USD]: BN_ONE,
  [AssetType.BTC]: BN_ZERO,
  [AssetType.ETH]: BN_ZERO,
  [AssetType.ASTR]: BN_ZERO,
  [AssetType.KGL]: BN_ZERO,
  [AssetType.OTHER]: {},
  [AssetType.CRYPTO]: {},
}

export class PriceServiceArthSwapImpl implements IPriceService {
  private constructor(
    readonly assets: Partial<Record<AssetTypeValue, string>>,
  ) {}

  static new = (assets: Partial<Record<AssetTypeValue, string>>) =>
    new PriceServiceArthSwapImpl(assets)

  getAssetPricesInUSD: IPriceService['getAssetPricesInUSD'] = async () => {
    const prices = await getPrices(Object.values(this.assets))
    return {
      ...EMPTY_ASSET_PRICES,
      ...Object.entries(this.assets).reduce(
        (res, [key, token]) => ({
          ...res,
          [key]: bigNumberJsOrZero(prices[token]),
        }),
        {},
      ),
    }
  }
}
