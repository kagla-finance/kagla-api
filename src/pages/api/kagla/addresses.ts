import { getProtocolConfig } from 'src/config'
import { AddressProviderService } from 'src/contracts/addressProvider'
import { defaultProvider } from 'src/factory'
import { asHandler } from 'src/utils/api'
/**
 * @swagger
 * /api/kagla/addresses:
 *   get:
 *     tags:
 *       - Kagla
 *     description: Returns list of address info registered with Address Provider
 *     responses:
 *       200:
 *         description: AddressInfo
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/AddressInfo'
 *       500:
 *         description: Unexpected error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *
 */
const handler = asHandler(async () => {
  const { addresses } = getProtocolConfig()
  const service = AddressProviderService.new({
    addressProviderAddress: addresses.addressProvider,
    multiCallAddress: addresses.multiCall,
    signerOrProvider: defaultProvider(),
  })
  return service.listAddresses()
})

export default handler
