import { ENV_CHAIN_ID } from 'src/utils/env'
import { ValueOf } from 'type-fest'

export const CHAIN_ID = {
  astar: 592,
  shiden: 336,
} as const

export type ChainId = ValueOf<typeof CHAIN_ID>

export const isChainId = (arg: any): arg is ChainId =>
  Object.values(CHAIN_ID).includes(arg)

const chainIdOr = <T>(chainId: any, defaultValue: T): ChainId | T =>
  chainId && isChainId(+chainId) ? chainId : defaultValue

const FALLBACK_CHAIN_ID: ChainId = CHAIN_ID.astar

export const DEFAULT_CHAIN_ID = chainIdOr(ENV_CHAIN_ID, FALLBACK_CHAIN_ID)
