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
      addressProvider: '0x1aceb2849e249C5403Fe1331d63587ed43C78425',
      poolInfo: '0x8C288317cF2B79BB6d7c77fCd29d63167Bf1AcAA',
      gaugeController: '0xfe372d95BDFE7313435D539c87E68029A792997e',
      minter: '0xa6358181b2753DAC5d2Ade97519E7c1A766d9c87',
      multiCall: '0xB6E580BF400d8DEb17dacDD67734d399367e7f94',
      diaOracle: '0xCe784F99f87dBa11E0906e2fE954b08a8cc9815d',
    },
    rpcUrls: ['https://shiden.api.onfinality.io/public'],
    storageEndpoint: 'https://kagla-stats-shiden.s3.amazonaws.com',
  },
}
