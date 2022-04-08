import { gaugeService } from 'src/factory'
import { asHandler } from 'src/utils/api'

/**
 * @swagger
 * /api/kagla/gauges/allocations/next:
 *   get:
 *     tags:
 *       - Kagla
 *     description: Returns next gauge allocation
 *     responses:
 *       200:
 *         description: gauge allocation
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 blockNumber:
 *                   type: string
 *                 data:
 *                   $ref: '#/components/schemas/GaugeAllocation'
 *               required:
 *                 - blockNumber
 *                 - data
 *       500:
 *         description: Unexpected error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
const handler = asHandler(gaugeService().getNextAllocation, {
  headers: {
    'Cache-Control': 's-maxage=5, stale-while-revalidate=45',
  },
})

export default handler
