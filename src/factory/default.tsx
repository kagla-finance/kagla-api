import { FallbackProvider, JsonRpcProvider } from '@ethersproject/providers'
import { ChainId, getProtocolConfig } from 'src/config'
import { AddressProviderService } from 'src/contracts/addressProvider'
import { ERC20MultiCallService } from 'src/contracts/erc20'
import { GaugeService } from 'src/contracts/gauge'
import { MinterService } from 'src/contracts/minter'
import { MultiCallService } from 'src/contracts/multiCall'
import { IPoolInfoService, PoolInfoService } from 'src/contracts/poolInfo'
import { PriceServiceStaticImpl } from 'src/contracts/price/static'
import { RegistryService } from 'src/contracts/registry'
import { StatsService } from 'src/storage/Stats'

export const poolInfoService = (chainId?: ChainId): IPoolInfoService => {
  const params = defaultParameters(chainId)

  const addressProvider = AddressProviderService.new(params)
  const erc20MultiCall = ERC20MultiCallService.new(params)
  const multiCall = MultiCallService.new(params)

  const service = PoolInfoService.new(params, {
    registry: RegistryService.new(params, {
      addressProvider,
      erc20MultiCall,
      multiCall,
    }),
    gauge: GaugeService.new(params),
    stats: StatsService.new(params),
    price: priceService(),
    erc20MultiCall,
    multiCall,
  })
  return service
}

export const registryService = (chainId?: ChainId) => {
  const params = defaultParameters(chainId)

  const service = RegistryService.new(params, {
    addressProvider: AddressProviderService.new(params),
    erc20MultiCall: ERC20MultiCallService.new(params),
    multiCall: MultiCallService.new(params),
  })
  return service
}

export const priceService = (chainId?: ChainId) => {
  return PriceServiceStaticImpl.new()
}

export const minterService = (chainId?: ChainId) => {
  const params = defaultParameters(chainId)
  return MinterService.new(params, {
    erc20: ERC20MultiCallService.new(params),
  })
}

export const defaultParameters = (chainId?: ChainId) => {
  const { rpcUrls, addresses, storageEndpoint } = getProtocolConfig(chainId)
  const signerOrProvider = new FallbackProvider(
    rpcUrls.map((url) => new JsonRpcProvider(url)),
  )
  return {
    signerOrProvider,
    storageEndpoint,
    multiCallAddress: addresses.multiCall,
    addressProviderAddress: addresses.addressProvider,
    poolInfoAddress: addresses.poolInfo,
    gaugeControllerAddress: addresses.gaugeController,
    minterAddress: addresses.minter,
    diaAddress: addresses.diaOracle,
  }
}
