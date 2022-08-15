/**
 * @swagger
 * components:
 *  schemas:
 *    Balance:
 *      type: object
 *      additionalProperties:
 *        type: string
 */
export type Balance = Record<string, string>

/**
 * @swagger
 * components:
 *  schemas:
 *    PoolBalance:
 *      type: array
 *      items:
 *        type: string
 */
export type PoolBalance = string[]
