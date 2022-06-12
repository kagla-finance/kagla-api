import { ChainId, CHAIN_ID, DEFAULT_CHAIN_ID, isSupportedChain } from './chain'
import { getEolGauges } from './eolGauges'

export const getProtocolConfig = (
  chainId: number = DEFAULT_CHAIN_ID,
): ProtocolConfig => {
  const supportedChainId = isSupportedChain(chainId)
    ? chainId
    : DEFAULT_CHAIN_ID
  const config = PROTOCOL_CONFIG[supportedChainId]
  return {
    ...config,
    eolGauges: getEolGauges(supportedChainId).concat(config.eolGauges || []),
  }
}
type ProtocolConfig = {
  rpcUrls: string[]
  storageEndpoint: string
  addresses: {
    multiCall: string
    addressProvider: string
    poolInfo: string
    gaugeController: string
    minter: string
    diaOracle?: string
  }
  eolGauges?: string[]
}

export const PROTOCOL_CONFIG: Record<ChainId, ProtocolConfig> = {
  [CHAIN_ID.astar]: {
    addresses: {
      addressProvider: '0x5a0ad8337E5C6895b3893E80c8333859DAcf7c01',
      poolInfo: '0x739523E332c0f2306896c530721271c9467575D9',
      gaugeController: '0x1f857fB3bCb72F03cB210f62602fD45eE1caeBdf',
      minter: '0x210c5BE93182d02A666392996f62244001e6E04d',
      multiCall: '0x7D6046156df81EF335E7e765d3bc714960B73207',
    },
    rpcUrls: ['https://astar.api.onfinality.io/public'],
    storageEndpoint: 'https://kagla-stats-astar.s3.amazonaws.com',
  },
  [CHAIN_ID.shiden]: {
    addresses: {
      addressProvider: '0xF86360a930590BaE72E42eFE03eba0aD61EAD6A9',
      poolInfo: '0x971112daF30D659f21Bd8371367423F64466C799',
      gaugeController: '0x7a1D9E204b09beC04F9036b409ffF15452974059',
      minter: '0x0Ac67947735a9642c8d15f3421Af346D3033B5dB',
      multiCall: '0xB6E580BF400d8DEb17dacDD67734d399367e7f94',
      diaOracle: '0xCe784F99f87dBa11E0906e2fE954b08a8cc9815d',
    },
    rpcUrls: ['https://shiden.public.blastapi.io'],
    storageEndpoint: 'https://kagla-stats-shiden.s3.amazonaws.com',
  },
}
