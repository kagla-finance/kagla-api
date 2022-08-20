import { Balance } from './balance'

/**
 * @swagger
 * components:
 *  schemas:
 *    LiquidityGauge:
 *      type: object
 *      properties:
 *        address:
 *          type: string
 *        type:
 *          type: string
 *        inflationRate:
 *          type: string
 *        workingSupply:
 *          type: string
 *        relativeWeight:
 *          type: string
 *        minAPR:
 *          type: string
 *        maxAPR:
 *          type: string
 *        extraRewards:
 *          type: array
 *          items:
 *            type: string
 *      required:
 *        - address
 *        - type
 *        - inflationRate
 *        - workingSupply
 *        - relativeWeight
 *        - minAPR
 *        - maxAPR
 *        - extraRewards
 */
export type LiquidityGauge = {
  address: string
  type: string
  inflationRate: string
  workingSupply: string
  relativeWeight: string
  minAPR: string
  maxAPR: string
  extraRewards: string[]
}

/**
 * @swagger
 * components:
 *  schemas:
 *    StakingData:
 *      type: object
 *      properties:
 *        stakedBalance:
 *          description: map of lp token address and staked balance
 *          $ref: '#/components/schemas/Balance'
 *        claimableAmounts:
 *          description: map of gauge address and claimable amount
 *          $ref: '#/components/schemas/Balance'
 *        claimableAmount:
 *          description: sum of claimable amounts
 *          type: string
 *      required:
 *        - stakedBalance
 *        - claimableAmounts
 *        - claimableAmount
 */
export type StakingData = {
  stakedBalance: Balance
  claimableAmounts: Balance
  claimableAmount: string
}

/**
 * @swagger
 * components:
 *  schemas:
 *    GaugeAllocation:
 *      type: object
 *      properties:
 *        total:
 *          type: string
 *        allocation:
 *          type: array
 *          items:
 *            type: object
 *            properties:
 *              gauge:
 *                type: string
 *              ratio:
 *                type: number
 *            required:
 *              - gauge
 *              - weight
 *      required:
 *        - total
 *        - allocation
 */
export type GaugeAllocation = {
  total: string
  allocation: {
    gauge: string
    ratio: number
  }[]
}

/**
 * @swagger
 * components:
 *  schemas:
 *    UserGaugeInfo:
 *      type: object
 *      properties:
 *        address:
 *          type: string
 *        originalBalance:
 *          type: string
 *        originalSupply:
 *          type: string
 *        workingBalance:
 *          type: string
 *        workingSupply:
 *          type: string
 *        voted:
 *          type: string
 *      required:
 *        - address
 *        - originalBalance
 *        - originalSupply
 *        - workingBalance
 *        - workingSupply
 *        - voted
 */
export type UserGaugeInfo = {
  address: string
  originalBalance: string
  originalSupply: string
  workingBalance: string
  workingSupply: string
  voted: string
}

/**
 * @swagger
 * components:
 *  schemas:
 *    GaugeInfo:
 *      type: object
 *      properties:
 *        address:
 *          type: string
 *        poolName:
 *          type: string
 *        lpToken:
 *          type: object
 *          properties:
 *            address:
 *              type: string
 *            symbol:
 *              type: string
 *          required:
 *            - address
 *            - symbol
 *        extraRewards:
 *          type: array
 *          items:
 *            type: string
 *      required:
 *        - address
 *        - poolName
 *        - lpToken
 *        - extraRewards
 */
export type GaugeInfo = {
  address: string
  poolName: string
  lpToken: {
    address: string
    symbol: string
  }
  extraRewards: string[]
}
