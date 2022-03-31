import { diaPriceService } from 'src/factory/price'
import { asHandler } from 'src/utils/api'

/**
 * @swagger
 * /api/kagla/prices/dia:
 *   get:
 *     tags:
 *       - Kagla
 *     description: Returns asset prices in USD via DIA Oracle.
 *     responses:
 *       200:
 *         description: Asset Prices
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/AssetPrices'
 *       500:
 *         description: Unexpected error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *
 */
const handler = asHandler(async () => {
  const service = diaPriceService()
  if (!service) return
  return service.getAssetPricesInUSD()
})

export default handler
