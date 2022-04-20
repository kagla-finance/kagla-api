import { poolInfoService } from 'src/factory'
import { asHandler, cacheControl } from 'src/utils/api'

/**
 * @swagger
 * /api/kagla/tvl:
 *   get:
 *     tags:
 *       - Kagla
 *     description: Returns normalized TVL
 *     responses:
 *       200:
 *         description: normalized TVL
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 blockNumber:
 *                   type: string
 *                 tvl:
 *                   type: string
 *               required:
 *                 - blockNumber
 *                 - tvl
 *       500:
 *         description: Unexpected error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
const handler = asHandler(poolInfoService().getTVL, {
  headers: {
    'Cache-Control': cacheControl(5, 45),
  },
})

export default handler
