import { poolInfoService } from 'src/factory'
import { isAddress } from 'src/utils/address'
import { asHandler, RequestValidator } from 'src/utils/api'

/**
 * @swagger
 * /api/kagla/pools/{address}/market:
 *   get:
 *     tags:
 *       - Kagla
 *     description: Returns list of Pool
 *     parameters:
 *       - in: path
 *         name: address
 *         schema:
 *           type: string
 *         required: true
 *
 *     responses:
 *       200:
 *         description: Pool
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 blockNumber:
 *                   type: string
 *                 pool:
 *                   $ref: '#/components/schemas/PoolMarketData'
 *               required:
 *                 - blockNumber
 *                 - pool
 *       500:
 *         description: Unexpected error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
type Parameters = {
  address: string
}
const validator: RequestValidator<Parameters> = (request) => {
  const {
    query: { address },
  } = request
  if (!isAddress(address)) return { error: '"address" must be hex strings.' }
  return { address }
}
const handler = asHandler(
  ({ parameters: { address } }) => poolInfoService().getPoolMarketData(address),
  {
    validator,
    headers: {
      'Cache-Control': 's-maxage=5, stale-while-revalidate=45',
    },
  },
)

export default handler
