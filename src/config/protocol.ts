import { ChainId, CHAIN_ID, DEFAULT_CHAIN_ID } from './chain'

export const getProtocolConfig = (chainId: number = DEFAULT_CHAIN_ID) =>
  PROTOCOL_CONFIG[chainId as ChainId] || PROTOCOL_CONFIG[DEFAULT_CHAIN_ID]

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
}

export const PROTOCOL_CONFIG: Record<ChainId, ProtocolConfig> = {
  [CHAIN_ID.astar]: {
    addresses: {
      addressProvider: '0x5a0ad8337E5C6895b3893E80c8333859DAcf7c01',
      poolInfo: '0xC843E83b4130d80A323959E7111bCD50a9a2B15e',
      gaugeController: '0x1f857fB3bCb72F03cB210f62602fD45eE1caeBdf',
      minter: '0x210c5BE93182d02A666392996f62244001e6E04d',
      multiCall: '0x7D6046156df81EF335E7e765d3bc714960B73207',
    },
    rpcUrls: ['https://evm.astar.network'],
    storageEndpoint: 'https://kagla-stats-astar.s3.amazonaws.com',
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
    rpcUrls: ['https://shiden.api.onfinality.io/public'],
    storageEndpoint: 'https://kagla-stats-shiden.s3.amazonaws.com',
  },
}
