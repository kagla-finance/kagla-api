import BigNumberJs from 'bignumber.js'

export { BigNumberJs }

BigNumberJs.config({ EXPONENTIAL_AT: 1e9 })

export const BN_ZERO = new BigNumberJs('0')
export const BN_ONE = new BigNumberJs('1')

export const SECONDS_PER_WEEK = 60 * 60 * 24 * 7
export const SECONDS_PER_YEAR = 60 * 60 * 24 * 365

export const bigNumberJsOrZero = (value: any) => {
  if (!value) return BN_ZERO
  const num = new BigNumberJs(value)
  return num.isNaN() ? BN_ZERO : num
}

export const normalizeBn = (num: BigNumberJs.Value, decimals: number = 18) =>
  bigNumberJsOrZero(num).shiftedBy(-decimals)

export const product = (...nums: BigNumberJs.Value[]) =>
  nums.reduce<BigNumberJs>((res, num) => res.times(num), BN_ONE)
