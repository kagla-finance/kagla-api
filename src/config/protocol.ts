import { AssetType, AssetTypeValue } from 'src/models/pool'
import { CHAIN_ID, ChainId, DEFAULT_CHAIN_ID, isSupportedChain } from './chain'
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
    assets: Partial<Record<AssetTypeValue, string>>
  }
  eolGauges?: string[]
  privateRpcUrl?: string
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
    rpcUrls: ['https://astar.public.blastapi.io'],
    privateRpcUrl:
      'https://astar.blastapi.io/6240b1c0-5128-42dc-b371-318e288106ed',
    arthswapDataProvider: {
      endpoint: 'https://arthswap-graphql.starlay.finance/api/graphql',
      quoteTokenAddress: '0xAeaaf0e2c81Af264101B9129C00F4440cCF0F720',
      assets: {
        [AssetType.KGL]: '0x257f1a047948f73158DaDd03eB84b34498bCDc60',
        [AssetType.LAY]: '0xc4335B1b76fA6d52877b3046ECA68F6E708a27dd',
      },
    },
    storageEndpoint: 'https://kagla-statistics.s3.amazonaws.com',
  },
  [CHAIN_ID.shiden]: {
    addresses: {
      addressProvider: '0x762b149eA23070d6F021F70CB8877d2248278855',
      poolInfo: '0x64Aa34dec0eB81B21e4869Ac942A60bd21BebE87',
      gaugeController: '0xBEDcfA1EB6cf39dd829207147692C0eaeCe32065',
      minter: '0x5dE0CF708F7753F176F1d23229c0EE50a23872f7',
      multiCall: '0xB6E580BF400d8DEb17dacDD67734d399367e7f94',
      diaOracle: '0xCe784F99f87dBa11E0906e2fE954b08a8cc9815d',
    },
    rpcUrls: ['https://shiden.public.blastapi.io'],
    storageEndpoint: 'https://kagla-stats-shiden.s3.amazonaws.com',
  },
}
