import { IERC20 } from '../__generated__'

export type ERC20Function = keyof IERC20['functions']
export type ERC20ViewFunction = Exclude<
  ERC20Function,
  'approve' | 'transfer' | 'transferFrom'
>
