import { poolInfoService } from 'src/factory'
import { asHandler, cacheControl } from 'src/utils/api'

/**
 * @swagger
 * /api/kagla/market/overview:
 *   get:
 *     tags:
 *       - Kagla
 *     description: Returns Market Overview
 *     responses:
 *       200:
 *         description: MarketOverview
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 blockNumber:
 *                   type: string
 *                 market:
 *                   $ref: '#/components/schemas/MarketOverview'
 *               required:
 *                 - blockNumber
 *                 - market
 *       500:
 *         description: Unexpected error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
const handler = asHandler(poolInfoService().getMarketOverView, {
  headers: {
    'Cache-Control': cacheControl(300, 600),
  },
})

export default handler
