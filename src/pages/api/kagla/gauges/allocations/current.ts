import { gaugeService } from 'src/factory'
import { asHandler } from 'src/utils/api'

/**
 * @swagger
 * /api/kagla/gauges/allocations/current:
 *   get:
 *     tags:
 *       - Kagla
 *     description: Returns current gauge allocation
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
const handler = asHandler(gaugeService().getCurrentAllocation)

export default handler
