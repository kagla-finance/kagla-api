/**
 * @swagger
 * components:
 *  schemas:
 *    Coin:
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
 *      required:
 *        - address
 *        - name
 *        - symbol
 *        - decimals
 */
export interface Coin {
  address: string
  name: string
  symbol: string
  decimals: number
}
