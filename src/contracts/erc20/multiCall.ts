import { ethers, Signer } from 'ethers'
import { NATIVE_ASSET_DUMMY_ADDRESS } from 'src/constants'
import { Balance } from 'src/models/balance'
import { Coin } from 'src/models/coin'
import { isNativeAsset, notNativeAsset } from 'src/utils/address'
import {
  FunctionResult,
  IMultiCallService,
  MultiCallResponse,
  MultiCallService,
} from '../multiCall'
import { IERC20, IERC20__factory } from '../__generated__'
import { IERC20Interface } from '../__generated__/IERC20'
import { ERC20ViewFunction } from './types'

export type IERC20MultiCallService = {
  view: <T extends ERC20ViewFunction[]>(
    erc20Addresses: string[],
    fields: T,
  ) => Promise<MultiCallResponse<Record<string, Omit<Coin, 'address'>>>>
  balances: (
    owner: string,
    tokenAddresses: string[],
  ) => Promise<{ blockNumber: string; balances: Balance }>
}

export class ERC20MultiCallService implements IERC20MultiCallService {
  private constructor(
    readonly multiCall: IMultiCallService,
    readonly iERC20: IERC20Interface,
    readonly signerOrProvider: Signer | ethers.providers.Provider,
  ) {}

  static new = (params: {
    multiCallAddress: string
    signerOrProvider: Signer | ethers.providers.Provider
  }) =>
    new ERC20MultiCallService(
      MultiCallService.new(params),
      IERC20__factory.createInterface(),
      params.signerOrProvider,
    )

  view: IERC20MultiCallService['view'] = async (erc20Addresses, fields) => {
    const { multiCall, iERC20 } = this
    const erc20MCRes = await multiCall.callViewFunctionsByAddresses<
      IERC20,
      Coin
    >({
      targetAddresses: erc20Addresses,
      iContract: iERC20,
      viewFuntions: fields,
      resultsMapper: (res: any, fn) => ({ [fn]: res[0] }),
    })
    return erc20MCRes
  }

  balances: IERC20MultiCallService['balances'] = async (
    owner: string,
    tokenAddresses: string[],
  ) => {
    const { multiCall, iERC20, signerOrProvider } = this
    const { blockNumber, data: balances } =
      await multiCall.callViewFunctionsByAddresses<IERC20, string>({
        targetAddresses: tokenAddresses.filter(notNativeAsset),
        iContract: iERC20,
        viewFuntions: ['balanceOf'],
        argMap: { balanceOf: [owner] },
        resultsMapper: (res) =>
          (res as FunctionResult<IERC20, 'balanceOf'>)[0].toString(),
      })
    if (tokenAddresses.some(isNativeAsset))
      balances[NATIVE_ASSET_DUMMY_ADDRESS] = (
        await signerOrProvider.getBalance(owner)
      ).toString()

    return {
      blockNumber: blockNumber.toString(),
      balances,
    }
  }
}
