import { ethers, providers, Signer } from 'ethers'
import { Coin } from 'src/models/coin'
import { equals } from 'src/utils/address'
import { unique } from 'src/utils/array'
import { IAddressProvider } from '../addressProvider'
import { ERC20ViewFunction, IERC20MultiCallService } from '../erc20'
import { IMultiCallService } from '../multiCall'
import { Registry__factory } from '../__generated__/factories/Registry__factory'

export type IRegistryService = {
  listCoins: () => Promise<Coin[]>
  listUnderlyingCoins: () => Promise<Coin[]>
  listLPTokens: () => Promise<Coin[]>
  listCoinAddresses: () => Promise<string[]>
  listUnderlyingCoinAddresses: () => Promise<string[]>
  listLPTokenAddresses: () => Promise<string[]>
  listPoolAddresses: () => Promise<string[]>
  getGauges: (
    poolAddress: string,
  ) => Promise<{ address: string; type: string }[]>
}

const COINS_FIELDS: ERC20ViewFunction[] = ['name', 'symbol', 'decimals']

export class RegistryService implements IRegistryService {
  private constructor(
    readonly addressProvider: IAddressProvider,
    readonly multiCall: IMultiCallService,
    readonly erc20MultiCall: IERC20MultiCallService,
    readonly signerOrProvider: Signer | providers.Provider,
  ) {}

  static new = (
    params: {
      signerOrProvider: Signer | providers.Provider
    },
    dependencies: {
      addressProvider: IAddressProvider
      multiCall: IMultiCallService
      erc20MultiCall: IERC20MultiCallService
    },
  ) =>
    new RegistryService(
      dependencies.addressProvider,
      dependencies.multiCall,
      dependencies.erc20MultiCall,
      params.signerOrProvider,
    )

  listCoinAddresses: IRegistryService['listCoinAddresses'] = async () => {
    const { multiCall } = this
    const registry = await this.registry()
    const numOfCoins = await registry.coin_count()

    return multiCall
      .callByIndex({
        contract: registry,
        functionName: 'get_coin',
        count: numOfCoins.toNumber(),
      })
      .then(({ data: coins }) => coins.flatMap((e) => e))
  }

  listUnderlyingCoinAddresses: IRegistryService['listUnderlyingCoinAddresses'] =
    async () => {
      const { multiCall } = this
      const registry = await this.registry()
      const poolAddresses = await this.listPoolAddresses()
      const { data } = await multiCall.callViewFunctionsByArgs({
        contract: registry,
        viewFuntions: ['get_underlying_coins'],
        argsMaps: poolAddresses.map((address) => ({
          get_underlying_coins: [address] as [string],
        })),
      })
      return unique(
        Object.values(data)
          .flatMap((datum) => datum['get_underlying_coins'])
          .flat()
          .filter((a) => !equals(a, ethers.constants.AddressZero)),
      )
    }

  listLPTokenAddresses: IRegistryService['listLPTokenAddresses'] = async () => {
    const { listPoolAddresses, multiCall } = this
    const registry = await this.registry()

    const poolAddresses = await listPoolAddresses()
    const { data } = await multiCall.callViewFunctionsByArgs({
      contract: registry,
      viewFuntions: ['get_lp_token'],
      argsMaps: poolAddresses.map((address) => ({
        get_lp_token: [address] as [string],
      })),
    })
    return Object.values(data).flatMap((datum) => datum['get_lp_token'])
  }

  listCoins: IRegistryService['listCoins'] = async () => {
    const { listCoinAddresses, erc20MultiCall } = this
    const coinAddresses = await listCoinAddresses()
    const { data: coins } = await erc20MultiCall.view(
      coinAddresses,
      COINS_FIELDS,
    )
    return Object.entries(coins).map(([address, coin]) => ({
      address,
      ...coin,
    }))
  }

  listUnderlyingCoins: IRegistryService['listUnderlyingCoins'] = async () => {
    const { erc20MultiCall } = this
    const coinAddresses = await this.listUnderlyingCoinAddresses()
    const { data: coins } = await erc20MultiCall.view(
      coinAddresses,
      COINS_FIELDS,
    )
    return Object.entries(coins).map(([address, coin]) => ({
      address,
      ...coin,
    }))
  }

  listLPTokens: IRegistryService['listLPTokens'] = async () => {
    const lpTokenAddresses = await this.listLPTokenAddresses()
    const { data: coins } = await this.erc20MultiCall.view(
      lpTokenAddresses,
      COINS_FIELDS,
    )
    return Object.entries(coins).map(([address, coin]) => ({
      address,
      ...coin,
    }))
  }

  listPoolAddresses: IRegistryService['listPoolAddresses'] = async () => {
    const { multiCall } = this
    const registry = await this.registry()

    const numOfPools = await registry.pool_count()

    const { data: poolAddresses } = await multiCall.callByIndex({
      contract: registry,
      functionName: 'pool_list',
      count: numOfPools.toNumber(),
    })
    return poolAddresses.flatMap((e) => e)
  }

  getGauges: IRegistryService['getGauges'] = async (poolAddress) => {
    const registry = await this.registry()
    const [addresses, types] = await registry.get_gauges(poolAddress)
    return addresses
      .map((address, idx) => ({
        address,
        type: types[idx].toString(),
      }))
      .filter(({ address }) => !equals(address, ethers.constants.AddressZero))
  }

  private registry = async () => {
    const address = await this.addressProvider.getRegisryAddress()
    return Registry__factory.connect(address, this.signerOrProvider)
  }
}
