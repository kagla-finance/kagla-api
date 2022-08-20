import { registryService } from 'src/factory'
import { asHandler, cacheControl } from 'src/utils/api'
/**
 * @swagger
 * /api/kagla/coins:
 *   get:
 *     tags:
 *       - Kagla
 *     description: Returns ERC20 Coins
 *     responses:
 *       200:
 *         description: Coins
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
const handler = asHandler(registryService().listCoins, {
  headers: {
    'Cache-Control': cacheControl(30, 60),
  },
})

export default handler
