import { ethers } from 'ethers'
import { SelfAPICallService } from 'src/api/self'
import { getProtocolConfig } from 'src/config'
import { ERC20MultiCallService } from 'src/contracts/erc20'
import { defaultProvider } from 'src/factory'
import { isAddress } from 'src/utils/address'
import { asHandler, cacheControl, RequestValidator } from 'src/utils/api'
/**
 * @swagger
 * /api/kagla/balances/{owner}/wallet:
 *   get:
 *     tags:
 *       - Kagla
 *     description: Returns balances of tokens in registry or request
 *     parameters:
 *       - in: path
 *         name: owner
 *         schema:
 *           type: string
 *         required: true
 *       - in: query
 *         name: tokenAddresses
 *         schema:
 *           type: array
 *           items:
 *             type: string
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
 *                 balances:
 *                   $ref: '#/components/schemas/Balance'
 *               required:
 *                 - blockNumber
 *                 - balances
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
  tokenAddresses?: string[]
}
const validator: RequestValidator<Parameters> = (request) => {
  const {
    query: { owner, tokenAddresses },
  } = request
  if (!isAddress(owner)) return { error: '"owner" must be hex strings.' }
  if (!tokenAddresses) return { owner }
  if (Array.isArray(tokenAddresses)) {
    if (!tokenAddresses.some((addr) => ethers.utils.isAddress(addr)))
      return { error: '"tokenAddresses" must be hex string or array thereof.' }
    return { owner, tokenAddresses }
  }
  if (!isAddress(tokenAddresses))
    return { error: '"tokenAddresses" must be hex string or array thereof.' }
  return { owner, tokenAddresses: [tokenAddresses] }
}

const handler = asHandler(
  async ({ parameters }) => {
    const { addresses } = getProtocolConfig()
    const service = ERC20MultiCallService.new({
      multiCallAddress: addresses.multiCall,
      signerOrProvider: defaultProvider(),
    })
    if (parameters.tokenAddresses)
      return service.balances(parameters.owner, parameters.tokenAddresses)

    const tokenAddresses = await SelfAPICallService.new().listAllAssets()
    return service.balances(
      parameters.owner,
      tokenAddresses.map(({ address }) => address),
    )
  },
  {
    validator,
    headers: {
      'Cache-Control': cacheControl(5, 45),
    },
  },
)

export default handler
