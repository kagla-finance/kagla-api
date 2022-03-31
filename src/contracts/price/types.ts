import { AssetPrices } from 'src/models/price'

export type IPriceService = {
  getAssetPricesInUSD: () => Promise<AssetPrices>
}
