/**
 * @swagger
 * components:
 *  schemas:
 *    MarketOverview:
 *      type: object
 *      properties:
 *        pools:
 *          type: array
 *          items:
 *            type: object
 *            properties:
 *              address:
 *                type: string
 *              apy:
 *                type: string
 *              gauges:
 *                type: array
 *                items:
 *                  type: object
 *                  properties:
 *                    address:
 *                      type: string
 *                    type:
 *                      type: string
 *                    minAPR:
 *                      type: string
 *                    maxAPR:
 *                      type: string
 *                  required:
 *                     - address
 *                     - type
 *                     - minAPR
 *                     - maxAPR
 *            required:
 *              - address
 *              - gauges
 *      required:
 *        - pools
 */
export type MarketOverview = {
  pools: {
    address: string
    apy?: string
    gauges: {
      address: string
      type: string
      minAPR: string
      maxAPR: string
    }[]
  }[]
}
