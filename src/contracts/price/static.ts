import { AssetType } from 'src/models/pool'
import { BN_ONE, BN_ZERO } from 'src/utils/number'
import { IPriceService } from './types'

export class PriceServiceStaticImpl implements IPriceService {
  private constructor() {}

  static new = () => new PriceServiceStaticImpl()

  getAssetPricesInUSD: IPriceService['getAssetPricesInUSD'] = async () => {
    return {
      [AssetType.USD]: BN_ONE,
      [AssetType.BTC]: BN_ZERO,
      [AssetType.ETH]: BN_ZERO,
      [AssetType.OTHER]: {},
      [AssetType.CRYPTO]: {},
    }
  }
}
