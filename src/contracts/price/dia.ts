import { providers, Signer } from 'ethers'
import { AssetType } from 'src/models/pool'
import { BN_ONE, normalizeBn } from 'src/utils/number'
import { IMultiCallService } from '../multiCall'
import { IRegistryService } from '../registry'
import { IDiaAggregator__factory } from '../__generated__/factories/IDiaAggregator__factory'
import { IDiaAggregator } from '../__generated__/IDiaAggregator'
import { IPriceService } from './types'

const toDIAKey = (symbol: string) => `${symbol}/USD`
const DIA_DECIMALS = 8
const DIA_SYMBOLS = ['WBTC', 'ETH', 'ASTR']

export class PriceServiceDIAImpl implements IPriceService {
  private constructor(
    readonly contract: IDiaAggregator,
    readonly registry: IRegistryService,
    readonly multiCall: IMultiCallService,
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
  ) =>
    new PriceServiceDIAImpl(
      IDiaAggregator__factory.connect(
        params.diaAddress,
        params.signerOrProvider,
      ),
      dependencies.registry,
      dependencies.multiCall,
    )

  getAssetPricesInUSD: IPriceService['getAssetPricesInUSD'] = async () => {
    const { contract, multiCall } = this
    const { data } = await multiCall.callViewFunctionsByArgs({
      contract,
      viewFuntions: ['getValue'],
      argsMaps: DIA_SYMBOLS.map((symbol) => ({
        getValue: [toDIAKey(symbol)] as [string],
      })),
    })
    return {
      [AssetType.USD]: BN_ONE,
      [AssetType.BTC]: normalizeBn(
        data['0'].getValue.price.toString(),
        DIA_DECIMALS,
      ),
      [AssetType.ETH]: normalizeBn(
        data['1'].getValue.price.toString(),
        DIA_DECIMALS,
      ),
      [AssetType.OTHER]: {
        ASTR: normalizeBn(data['2'].getValue.price.toString(), DIA_DECIMALS),
      },
      [AssetType.CRYPTO]: {},
    }
  }
}
