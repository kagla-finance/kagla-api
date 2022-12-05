import { getProtocolConfig } from 'src/config'
import { GaugeService } from 'src/contracts/gauge'
import { defaultProvider } from 'src/factory'
import { isAddress } from 'src/utils/address'
import { asHandler, cacheControl, RequestValidator } from 'src/utils/api'
/**
 * @swagger
 * /api/kagla/balances/{owner}/staking:
 *   get:
 *     tags:
 *       - Kagla
 *     description: Returns balances of staked tokens and the claimable amount
 *     parameters:
 *       - in: path
 *         name: owner
 *         schema:
 *           type: string
 *         required: true
 *     responses:
 *       200:
 *         description: Success
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 blockNumber:
 *                   type: string
 *                 data:
 *                   $ref: '#/components/schemas/StakingData'
 *               required:
 *                 - blockNumber
 *                 - data
 *       400:
 *         description: Bad request
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Unexpected error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
type Parameters = {
  owner: string
}
const validator: RequestValidator<Parameters> = (request) => {
  const {
    query: { owner },
  } = request
  if (!isAddress(owner)) return { error: '"owner" must be hex strings.' }
  return { owner }
}

const handler = asHandler(
  async ({ parameters }) => {
    const { addresses } = getProtocolConfig()
    const service = GaugeService.new({
      multiCallAddress: addresses.multiCall,
      gaugeControllerAddress: addresses.gaugeController,
      signerOrProvider: defaultProvider(),
    })
    return service.getStakingData(parameters.owner)
  },
  {
    validator,
    headers: {
      'Cache-Control': cacheControl(5, 45),
    },
  },
)

export default handler
