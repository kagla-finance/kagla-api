import { minterService } from 'src/factory'
import { asHandler } from 'src/utils/api'
/**
 * @swagger
 * /api/kagla/kglToken:
 *   get:
 *     tags:
 *       - Kagla
 *     description: Returns KGL Token Info
 *     responses:
 *       200:
 *         description: KGL Token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Coin'
 *       500:
 *         description: Unexpected error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *
 */
const handler = asHandler(minterService().getKGLToken)

export default handler
