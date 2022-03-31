import { ethers } from 'ethers'

export const equals = (
  a: string | null | undefined,
  b: string | null | undefined,
) => (a && b ? a.toLowerCase() === b.toLowerCase() : false)

export const isAddress = (arg: any): arg is string =>
  ethers.utils.isAddress(arg)
