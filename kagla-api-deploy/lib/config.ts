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
    certificateArn: string
  }
}

export const ENV_CONFIG: Record<Network, EnvVars> = {
  astar: {
    chainId: 592,
    rootDomainName: 'kagla.finance',
    alias: {
      domainName: 'api.kagla.finance',
      certificateArn:
        'arn:aws:acm:us-east-1:495476032358:certificate/bbe42d2e-a784-4742-8612-557818096901',
    },
  },
  shiden: {
    chainId: 336,
  },
}
