import { providers, Signer } from 'ethers'
import { AddressInfo } from 'src/models/addressInfo'
import { MultiCallService } from '../multiCall'
import { AddressProvider, AddressProvider__factory } from '../__generated__'

export type IAddressProvider = {
  listAddresses: () => Promise<AddressInfo[]>
  getRegisryAddress: () => Promise<string>
}

export class AddressProviderService implements IAddressProvider {
  private constructor(
    readonly addressProvider: AddressProvider,
    readonly multiCall: MultiCallService,
  ) {}

  static new = (params: {
    addressProviderAddress: string
    multiCallAddress: string
    signerOrProvider: Signer | providers.Provider
  }) =>
    new AddressProviderService(
      AddressProvider__factory.connect(
        params.addressProviderAddress,
        params.signerOrProvider,
      ),
      MultiCallService.new(params),
    )

  listAddresses: IAddressProvider['listAddresses'] = async () => {
    const { addressProvider, multiCall } = this

    const numOfAddresses = await addressProvider.max_id()

    const { data: addressInfoList } = await multiCall.callByIndex({
      contract: addressProvider,
      functionName: 'get_id_info',
      count: numOfAddresses.toNumber() - 1,
    })

    return addressInfoList.map((info) => ({
      address: info.addr,
      isActive: info.is_active,
      description: info.description,
    }))
  }

  getRegisryAddress: IAddressProvider['getRegisryAddress'] = async () =>
    this.addressProvider.get_address(0)
}
