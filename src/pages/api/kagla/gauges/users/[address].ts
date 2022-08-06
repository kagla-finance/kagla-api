import { gaugeService } from 'src/factory'
import { isAddress } from 'src/utils/address'
import { asHandler, RequestValidator } from 'src/utils/api'

/**
 * @swagger
 * /api/kagla/gauges/users/{address}:
 *   get:
 *     tags:
 *       - Kagla
 *     description: Returns User's Gauge Info
 *     parameters:
 *       - in: path
 *         name: address
 *         schema:
 *           type: string
 *         required: true
 *
 *     responses:
 *       200:
 *         description: User's Gauge Info
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 blockNumber:
 *                   type: string
 *                 data:
 *                   $ref: '#/components/schemas/UserGaugeInfo'
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
  ({ parameters: { address } }) => gaugeService().getUserGaugeData(address),
  { validator },
)

export default handler
