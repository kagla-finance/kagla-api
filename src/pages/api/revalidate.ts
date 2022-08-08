import { asHandler } from 'src/utils/api'

/**
 * @swagger
 * /api/revalidate:
 *   post:
 *     description: Revalidate specified path
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               path:
 *                 type: string
 *             required:
 *               - path
 *     responses:
 *       200:
 *         description: revalidate
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 revalidated:
 *                   type: boolean
 *               required:
 *                 - revalidated
 *       500:
 *         description: Unexpected error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
const handler = asHandler(async ({ request, response }) => {
  await response.revalidate(request.body.path)
  return { revalidated: true }
})

export default handler
