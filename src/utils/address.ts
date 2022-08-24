import { ethers } from 'ethers'
import { NATIVE_ASSET_DUMMY_ADDRESS } from 'src/constants'

export const equals = (
  a: string | null | undefined,
  b: string | null | undefined,
) => (a && b ? a.toLowerCase() === b.toLowerCase() : false)

export const isAddress = (arg: any): arg is string =>
  ethers.utils.isAddress(arg)

export const isNativeAsset = (arg: string | null | undefined) =>
  equals(arg, NATIVE_ASSET_DUMMY_ADDRESS)

export const notNativeAsset = (arg: string | null | undefined) =>
  !isNativeAsset(arg)

export const isValidAddress = (arg: any): arg is string =>
  isAddress(arg) && !equals(arg, ethers.constants.AddressZero)
