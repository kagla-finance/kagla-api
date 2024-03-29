import { priceService } from 'src/factory'
import { asHandler } from 'src/utils/api'

/**
 * @swagger
 * /api/kagla/prices:
 *   get:
 *     tags:
 *       - Kagla
 *     description: Returns asset prices in USD used in the TVL calculation.
 *     responses:
 *       200:
 *         description: Asset Prices
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AssetPrices'
 *       500:
 *         description: Unexpected error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *
 */
const handler = asHandler(priceService().getAssetPricesInUSD)

export default handler
