import { poolInfoService } from 'src/factory'
import { asHandler } from 'src/utils/api'

/**
 * @swagger
 * /api/kagla/pools:
 *   get:
 *     tags:
 *       - Kagla
 *     description: Returns list of Pool Outline
 *     responses:
 *       200:
 *         description: Pools
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 blockNumber:
 *                   type: string
 *                 pools:
 *                  type: array
 *                  items:
 *                    $ref: '#/components/schemas/PoolOutline'
 *               required:
 *                 - blockNumber
 *                 - pools
 *       500:
 *         description: Unexpected error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
const handler = asHandler(poolInfoService().listPools)

export default handler
