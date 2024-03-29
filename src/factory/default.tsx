import { FallbackProvider, JsonRpcProvider } from '@ethersproject/providers'
import { getKGLPrice } from 'src/api/arthswap'
import { ChainId, getProtocolConfig } from 'src/config'
import { AddressProviderService } from 'src/contracts/addressProvider'
import { ERC20MultiCallService } from 'src/contracts/erc20'
import { GaugeService, IGaugeService } from 'src/contracts/gauge'
import { MinterService } from 'src/contracts/minter'
import { MultiCallService } from 'src/contracts/multiCall'
import { IPoolInfoService, PoolInfoService } from 'src/contracts/poolInfo'
import { RegistryService } from 'src/contracts/registry'
import { StatsService } from 'src/storage/Stats'
import { diaAndArthSwapPriceService } from './price'

export const poolInfoService = (chainId?: ChainId): IPoolInfoService => {
  const params = defaultParameters(chainId)

  const addressProvider = AddressProviderService.new(params)
  const erc20MultiCall = ERC20MultiCallService.new(params)
  const multiCall = MultiCallService.new(params)
  const registry = RegistryService.new(params, {
    addressProvider,
    erc20MultiCall,
    multiCall,
  })

  const service = PoolInfoService.new(params, {
    registry,
    gauge: GaugeService.new(params),
    stats: StatsService.new(params),
    price: priceService(),
    erc20MultiCall,
    multiCall,
    kglPrice: () =>
      minterService(chainId)
        .getKGLToken()
        .then(({ address }) => getKGLPrice(address, chainId)),
  })
  return service
}

export const gaugeService = (chainId?: ChainId): IGaugeService => {
  const params = defaultParameters(chainId)
  return GaugeService.new(params)
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

export const minterService = (chainId?: ChainId) => {
  const params = defaultParameters(chainId)
  return MinterService.new(params, {
    erc20: ERC20MultiCallService.new(params),
  })
}
export const priceService = (chainId?: ChainId) =>
  diaAndArthSwapPriceService(chainId)

export const defaultParameters = (chainId?: ChainId) => {
  const { addresses, storageEndpoint } = getProtocolConfig(chainId)
  return {
    signerOrProvider: defaultProvider(chainId),
    storageEndpoint,
    multiCallAddress: addresses.multiCall,
    addressProviderAddress: addresses.addressProvider,
    poolInfoAddress: addresses.poolInfo,
    gaugeControllerAddress: addresses.gaugeController,
    minterAddress: addresses.minter,
    diaAddress: addresses.diaOracle,
  }
}

export const defaultProvider = (chainId?: ChainId) => {
  const { rpcUrls, privateRpcUrl } = getProtocolConfig(chainId)
  return privateRpcUrl
    ? new JsonRpcProvider(privateRpcUrl)
    : new FallbackProvider(rpcUrls.map((url) => new JsonRpcProvider(url)))
}
