import { BigNumber, ethers, providers, Signer } from 'ethers'
import { IERC20, IERC20__factory } from '../__generated__'

export class ERC20Service {
  private constructor(readonly contract: IERC20) {}

  static new = (params: {
    tokenAddress: string
    signerOrProvider: Signer | providers.Provider
  }) =>
    new ERC20Service(
      IERC20__factory.connect(params.tokenAddress, params.signerOrProvider),
    )

  approve = async (params: {
    owner: string
    amount: BigNumber
    spender: string
  }) => {
    const allowance = await this.contract.allowance(
      params.owner,
      params.spender,
    )
    if (params.amount.gte(allowance)) return
    return this.contract.populateTransaction.approve(
      params.spender,
      ethers.constants.MaxUint256,
    )
  }
}
