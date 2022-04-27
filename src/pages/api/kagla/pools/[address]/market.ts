import { SelfAPICallService } from 'src/api/self'
import { poolInfoService } from 'src/factory'
import { equals, isAddress } from 'src/utils/address'
import { asHandler, cacheControl, RequestValidator } from 'src/utils/api'

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
  async ({ parameters: { address } }) => {
    const { pools } = await SelfAPICallService.new().listPools()
    const pool = pools.find((pool) => equals(address, pool.address))
    return poolInfoService().getPoolMarketData(address, pool?.basePool)
  },
  {
    validator,
    headers: {
      'Cache-Control': cacheControl(5, 45),
    },
  },
)

export default handler
