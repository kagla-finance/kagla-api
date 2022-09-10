import { AssetType } from 'src/models/pool'
import { BigNumberJs } from 'src/utils/number'
import { ValueOf } from 'type-fest'

/**
 * @swagger
 * components:
 *  schemas:
 *    AssetPrices:
 *      type: object
 *      properties:
 *        "0":
 *          description: USD
 *          type: string
 *        "1":
 *          description: BTC
 *          type: string
 *        "2":
 *          description: ETH
 *          type: string
 *        "3":
 *          description: Other by Token address
 *          type: object
 *          additionalProperties:
 *               type: string
 *        "4":
 *          description: Crypto by Token address
 *          type: object
 *          additionalProperties:
 *            type: string
 *        "5":
 *          description: ASTR
 *          type: string
 *        "6":
 *          description: KGL
 *          type: string
 *        "7":
 *          description: LAY
 *          type: string
 *      required:
 *        - "0"
 *        - "1"
 *        - "2"
 *        - "3"
 *        - "4"
 *        - "5"
 *        - "6"
 *        - "7"
 */
export type AssetPrices = Record<
  Exclude<
    ValueOf<typeof AssetType>,
    typeof AssetType['OTHER'] | typeof AssetType['CRYPTO']
  >,
  BigNumberJs
> &
  Record<
    Extract<
      ValueOf<typeof AssetType>,
      typeof AssetType['OTHER'] | typeof AssetType['CRYPTO']
    >,
    Partial<Record<string, BigNumberJs>>
  >
