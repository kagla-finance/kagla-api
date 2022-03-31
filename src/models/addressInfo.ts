/**
 * @swagger
 * components:
 *  schemas:
 *    AddressInfo:
 *      type: object
 *      properties:
 *        address:
 *          type: string
 *        isActive:
 *          type: boolean
 *        description:
 *          type: string
 *      required:
 *        - address
 *        - isActive
 */
export interface AddressInfo {
  address: string
  isActive: boolean
  description: string
}
