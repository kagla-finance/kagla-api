import { poolInfoService } from 'src/factory'
import { asHandler } from 'src/utils/api'

/**
 * @swagger
 * /api/kagla/gauges:
 *   get:
 *     tags:
 *       - Kagla
 *     description: Returns list of Liquidity Gauges
 *     responses:
 *       200:
 *         description: Gauges
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 blockNumber:
 *                   type: string
 *                 gauges:
 *                  type: array
 *                  items:
 *                    $ref: '#/components/schemas/GaugeInfo'
 *               required:
 *                 - blockNumber
 *                 - gauges
 *       500:
 *         description: Unexpected error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
const handler = asHandler(async () => {
  const { blockNumber, pools } = await poolInfoService().listPools(true)
  return {
    blockNumber,
    gauges: pools.flatMap((p) =>
      p.gauges.map((g) => ({
        address: g.address,
        poolName: p.name,
        lpToken: {
          address: p.lpToken.address,
          symbol: p.lpToken.symbol,
        },
        extraRewards: g.extraRewards,
      })),
    ),
  }
})

export default handler
