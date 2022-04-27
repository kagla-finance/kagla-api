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
 *           type: string
 *        maxAPR:
 *           type: string
 *      required:
 *        - address
 *        - type
 *        - inflationRate
 *        - workingSupply
 *        - relativeWeight
 *        - minAPR
 *        - maxAPR
 */
export type LiquidityGauge = {
  address: string
  type: string
  inflationRate: string
  workingSupply: string
  relativeWeight: string
  minAPR: string
  maxAPR: string
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
 *        claimableAmount:
 *          type: string
 *      required:
 *        - stakedBalance
 *        - claimableAmount
 */
export type StakingData = {
  stakedBalance: Balance
  claimableAmount: string
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
 *      required:
 *        - address
 *        - poolName
 *        - lpToken
 */
export type GaugeInfo = {
  address: string
  poolName: string
  lpToken: {
    address: string
    symbol: string
  }
}
