import { ValueOf } from 'type-fest'
import { Balance } from './balance'
import { LiquidityGauge } from './gauge'

/**
 * @swagger
 * components:
 *  schemas:
 *    Pool:
 *      type: object
 *      properties:
 *        address:
 *          type: string
 *        isMeta:
 *          type: boolean
 *        name:
 *          type: string
 *        lpToken:
 *          $ref: '#/components/schemas/LPToken'
 *        basePool:
 *          type: string
 *        assetType:
 *          type: string
 *        coins:
 *          type: array
 *          items:
 *            $ref: '#/components/schemas/PoolCoin'
 *        underlyingCoins:
 *          type: array
 *          items:
 *            $ref: '#/components/schemas/PoolUnderlyingCoin'
 *        apy:
 *          type: string
 *        parameters:
 *          $ref: '#/components/schemas/PoolParameters'
 *        gauges:
 *          type: array
 *          items:
 *            $ref: '#/components/schemas/LiquidityGauge'
 *      required:
 *        - address
 *        - isMeta
 *        - name
 *        - lpToken
 *        - assetType
 *        - coins
 *        - underlyingCoins
 *        - parameters
 */
export type Pool = {
  address: string
  isMeta: boolean
  name: string
  lpToken: LPToken
  basePool?: string
  assetType: ValueOf<typeof AssetType>
  coins: PoolCoin[]
  underlyingCoins: PoolUnderlyingCoin[]
  apy?: string
  parameters: PoolParameters
  gauges: LiquidityGauge[]
}

/**
 * @swagger
 * components:
 *  schemas:
 *    PoolMarketData:
 *      type: object
 *      properties:
 *        address:
 *          type: string
 *        lpToken:
 *          $ref: '#/components/schemas/LPTokenMarketData'
 *        basePoolLPToken:
 *          $ref: '#/components/schemas/LPTokenMarketData'
 *        balances:
 *          $ref: '#/components/schemas/Balance'
 *        underlyingBalances:
 *          $ref: '#/components/schemas/Balance'
 *        apy:
 *          type: string
 *        parameters:
 *          $ref: '#/components/schemas/PoolParameters'
 *        gauges:
 *          type: array
 *          items:
 *            $ref: '#/components/schemas/LiquidityGauge'
 *      required:
 *        - address
 *        - lpToken
 *        - balances
 *        - underlyingBalances
 *        - parameters
 */
export type PoolMarketData = {
  address: string
  lpToken: LPTokenMarketData
  basePoolLPToken?: LPTokenMarketData
  balances: Balance
  underlyingBalances: Balance
  parameters: PoolParameters
  gauges: LiquidityGauge[]
  apy?: string
}

/**
 * @swagger
 * components:
 *  schemas:
 *    LPTokenMarketData:
 *      type: object
 *      properties:
 *        address:
 *          type: string
 *        totalSupply:
 *          type: string
 *        virtualPrice:
 *          type: string
 *      required:
 *        - address
 *        - totalSupply
 *        - virtualPrice
 */
export type LPTokenMarketData = {
  address: string
  symbol: string
  totalSupply: string
  virtualPrice: string
}

/**
 * @swagger
 * components:
 *  schemas:
 *    PoolOutline:
 *      type: object
 *      properties:
 *        address:
 *          type: string
 *        name:
 *          type: string
 *        assetType:
 *          type: string
 *        lpToken:
 *          $ref: '#/components/schemas/LPTokenMarketData'
 *        coins:
 *          type: array
 *          items:
 *            $ref: '#/components/schemas/PoolOutlineCoin'
 *        underlyingCoins:
 *          type: array
 *          items:
 *            $ref: '#/components/schemas/PoolOutlineCoin'
 *        balances:
 *          $ref: '#/components/schemas/Balance'
 *        underlyingBalances:
 *          $ref: '#/components/schemas/Balance'
 *        parameters:
 *          $ref: '#/components/schemas/PoolActiveParameters'
 *        isMeta:
 *          type: boolean
 *        basePool:
 *          type: string
 *        apy:
 *          type: string
 *        gauges:
 *          type: array
 *          items:
 *            $ref: '#/components/schemas/LiquidityGauge'
 *      required:
 *        - address
 *        - name
 *        - assetType
 *        - lpToken
 *        - coins
 *        - underlyingCoins
 *        - balances
 *        - underlyingBalances
 *        - parameters
 *        - isMeta
 */
export type PoolOutline = {
  address: string
  name: string
  assetType: ValueOf<typeof AssetType>
  lpToken: LPTokenMarketData
  coins: { address: string; decimals: number }[]
  underlyingCoins: { address: string; decimals: number }[]
  balances: Balance
  underlyingBalances: Balance
  parameters: PoolActiveParameters
  isMeta: boolean
  basePool?: string
  apy?: string
  gauges: LiquidityGauge[]
}

/**
 * @swagger
 * components:
 *  schemas:
 *    PoolCoin:
 *      type: object
 *      properties:
 *        index:
 *          type: number
 *        address:
 *          type: string
 *        name:
 *          type: string
 *        symbol:
 *          type: string
 *        decimals:
 *          type: number
 *        balance:
 *          type: string
 *        rate:
 *          type: string
 *      required:
 *        - index
 *        - address
 *        - name
 *        - symbol
 *        - decimals
 *        - balance
 *        - rate
 */
export type PoolCoin = {
  index: number
  name: string
  symbol: string
  address: string
  decimals: number
  balance: string
  rate: string
}

/**
 * @swagger
 * components:
 *  schemas:
 *    PoolUnderlyingCoin:
 *      type: object
 *      properties:
 *        address:
 *          type: string
 *        name:
 *          type: string
 *        symbol:
 *          type: string
 *        decimals:
 *          type: number
 *        balance:
 *          type: string
 *      required:
 *        - address
 *        - name
 *        - symbol
 *        - decimals
 *        - balance
 */
export type PoolUnderlyingCoin = Omit<PoolCoin, 'rate'>

/**
 * @swagger
 * components:
 *  schemas:
 *    PoolOutlineCoin:
 *      type: object
 *      properties:
 *        address:
 *          type: string
 *        decimals:
 *          type: number
 *      required:
 *        - address
 *        - decimals
 */
export type PoolOutlineCoin = Pick<PoolCoin, 'address' | 'decimals'>

/**
 * @swagger
 * components:
 *  schemas:
 *    LPToken:
 *      type: object
 *      properties:
 *        address:
 *          type: string
 *        symbol:
 *          type: string
 *        totalSupply:
 *          type: string
 *        virtualPrice:
 *          type: string
 *      required:
 *        - address
 *        - symbol
 *        - totalSupply
 *        - virtualPrice
 */
export type LPToken = {
  address: string
  symbol: string
  totalSupply: string
  virtualPrice: string
}

/**
 * @swagger
 * components:
 *  schemas:
 *    PoolActiveParameters:
 *      type: object
 *      properties:
 *        a:
 *          type: string
 *        fee:
 *          type: string
 *        adminFee:
 *          type: string
 *      required:
 *        - a
 *        - fee
 *        - adminFee
 */
export type PoolActiveParameters = {
  a: string
  fee: string
  adminFee: string
}

/**
 * @swagger
 * components:
 *  schemas:
 *    PoolParameters:
 *      type: object
 *      properties:
 *        a:
 *          type: string
 *        fee:
 *          type: string
 *        adminFee:
 *          type: string
 *        initialA:
 *          type: string
 *        initialATime:
 *          type: number
 *        futureA:
 *          type: string
 *        futureATime:
 *          type: number
 *        futureFee:
 *          type: string
 *        futureAdminFee:
 *          type: string
 *        furtureOwner:
 *          type: string
 *      required:
 *        - a
 *        - fee
 *        - adminFee
 */
export type PoolParameters = PoolActiveParameters & {
  a: string
  fee: string
  adminFee: string
  initialA: string
  initialATime: number
  futureA: string
  futureATime: number
  futureFee: string
  futureAdminFee: string
  futureOwner: string
}

export const AssetType = {
  USD: '0',
  BTC: '1',
  ETH: '2',
  OTHER: '3',
  CRYPTO: '4',
} as const
