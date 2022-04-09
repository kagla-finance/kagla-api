export const appName = 'kagla-api'

export const NETWORK = ['astar', 'shiden'] as const

export type Network = typeof NETWORK[number]

export const isValidNetwork = (arg: any): arg is Network =>
  NETWORK.includes(arg)

type EnvVars = {
  chainId: number
  rootDomainName?: string
  alias?: {
    domainName: string
    certificateArnParameterName: string
  }
}

export const ENV_CONFIG: Record<Network, EnvVars> = {
  astar: {
    chainId: 592,
    rootDomainName: 'kagla.finance',
    alias: {
      domainName: 'api.kagla.finance',
      certificateArnParameterName: '/kagla/certificate/api',
    },
  },
  shiden: {
    chainId: 336,
  },
}
