import { BigNumber, ethers } from 'ethers'
import { equals } from './address'

export const addressOr = (address: string, defaultValue?: string) =>
  equals(address, ethers.constants.AddressZero) ? defaultValue : address

export const bigNumberOr = (num: BigNumber, defaultValue?: BigNumber) =>
  num.isZero() ? defaultValue : num
