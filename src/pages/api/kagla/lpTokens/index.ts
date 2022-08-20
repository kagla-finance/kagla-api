import { registryService } from 'src/factory'
import { asHandler, cacheControl } from 'src/utils/api'
/**
 * @swagger
 * /api/kagla/lpTokens:
 *   get:
 *     tags:
 *       - Kagla
 *     description: Returns ERC20 LPTokens
 *     responses:
 *       200:
 *         description: LPTokens
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Coin'
 *       500:
 *         description: Unexpected error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
const handler = asHandler(registryService().listLPTokens, {
  headers: {
    'Cache-Control': cacheControl(30, 60),
  },
})

export default handler
