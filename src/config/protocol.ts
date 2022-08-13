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
    diaOracle: string
  }
  arthswapDataProvider?: {
    endpoint: string
    quoteTokenAddress: string
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
      diaOracle: '0x35490A8AC7cD0Df5C4d7Ab4243A6B517133BcDB1',
    },
    rpcUrls: ['https://astar.api.onfinality.io/public'],
    arthswapDataProvider: {
      endpoint: 'https://arthswap-apr-api.vercel.app/api/graphql',
      quoteTokenAddress: '0xAeaaf0e2c81Af264101B9129C00F4440cCF0F720',
    },
    storageEndpoint: 'https://kagla-stats-astar.s3.amazonaws.com',
  },
  [CHAIN_ID.shiden]: {
    addresses: {
      addressProvider: '0x54BabC496c70510ad85722BD98dab1757e291C67',
      poolInfo: '0xC3E9167907F22a3E6302F4Fa5e43A18e71F02AE7',
      gaugeController: '0x914d6C71f5E781d62C2CA94793FAC11a3a60E874',
      minter: '0xb359c05953D2b00400cE6741B7da005Bbb9A058E',
      multiCall: '0xB6E580BF400d8DEb17dacDD67734d399367e7f94',
      diaOracle: '0xCe784F99f87dBa11E0906e2fE954b08a8cc9815d',
    },
    rpcUrls: ['https://shiden.api.onfinality.io/public'],
    storageEndpoint: 'https://kagla-stats-shiden.s3.amazonaws.com',
  },
}
