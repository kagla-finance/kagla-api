import { providers, Signer } from 'ethers'
import { AssetTypeValue } from 'src/models/pool'
import { AssetPrices } from 'src/models/price'
import { BigNumberJs } from 'src/utils/number'
import { IMultiCallService } from '../multiCall'
import { IRegistryService } from '../registry'
import { PriceServiceArthSwapImpl } from './arthswap'
import { PriceServiceDIAImpl } from './dia'
import { IPriceService } from './types'

const isValidPrice = (
  price: BigNumberJs | Partial<Record<string, BigNumberJs>>,
) => {
  if (BigNumberJs.isBigNumber(price)) return !price.isZero()
  return Object.keys(price).length > 0
}

const mergePrices = (primary: AssetPrices, secondary: AssetPrices) => {
  const keys = Array.from(
    new Set([...Object.keys(primary), ...Object.keys(secondary)]),
  )
  return keys.reduce((res, key) => {
    const valPrimary = primary[key as keyof AssetPrices]
    const valSecondary = secondary[key as keyof AssetPrices]
    return {
      ...res,
      [key]: isValidPrice(valPrimary) ? valPrimary : valSecondary,
    }
  }, {}) as AssetPrices
}

export class PriceServiceDIAAndArthSwapImpl implements IPriceService {
  private constructor(
    readonly dia: PriceServiceDIAImpl,
    readonly arthswap: PriceServiceArthSwapImpl,
  ) {}

  static new = (
    params: {
      diaAddress: string
      signerOrProvider: Signer | providers.Provider
    },
    dependencies: {
      registry: IRegistryService
      multiCall: IMultiCallService
    },
    assets: Partial<Record<AssetTypeValue, string>>,
  ) =>
    new PriceServiceDIAAndArthSwapImpl(
      PriceServiceDIAImpl.new(params, dependencies),
      PriceServiceArthSwapImpl.new(assets),
    )

  getAssetPricesInUSD: IPriceService['getAssetPricesInUSD'] = async () => {
    const [diaPrices, arthswapPrices] = await Promise.all([
      this.dia.getAssetPricesInUSD(),
      this.arthswap.getAssetPricesInUSD(),
    ])
    return mergePrices(diaPrices, arthswapPrices)
  }
}
