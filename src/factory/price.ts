import { ChainId } from 'src/config'
import { AddressProviderService } from 'src/contracts/addressProvider'
import { ERC20MultiCallService } from 'src/contracts/erc20'
import { MultiCallService } from 'src/contracts/multiCall'
import { PriceServiceDIAImpl } from 'src/contracts/price'
import { RegistryService } from 'src/contracts/registry'
import { defaultParameters } from './default'

export const diaPriceService = (chainId?: ChainId) => {
  const params = defaultParameters(chainId)

  const addressProvider = AddressProviderService.new(params)
  const erc20MultiCall = ERC20MultiCallService.new(params)
  const multiCall = MultiCallService.new(params)
  const registry = RegistryService.new(params, {
    addressProvider,
    erc20MultiCall,
    multiCall,
  })

  const service = PriceServiceDIAImpl.new(
    {
      diaAddress: params.diaAddress,
      signerOrProvider: params.signerOrProvider,
    },
    { registry, multiCall },
  )
  return service
}
