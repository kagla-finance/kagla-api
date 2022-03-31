import { providers, Signer } from 'ethers'
import { Coin } from 'src/models/coin'
import { IERC20MultiCallService } from '../erc20'
import { Minter__factory } from '../__generated__/factories/Minter__factory'
import { Minter } from '../__generated__/Minter'

export type IMinterService = {
  getKGLToken: () => Promise<Coin>
}

export class MinterService implements IMinterService {
  private constructor(
    readonly minter: Minter,
    readonly erc20: IERC20MultiCallService,
  ) {}

  static new = (
    params: {
      minterAddress: string
      signerOrProvider: Signer | providers.Provider
    },
    dependencies: {
      erc20: IERC20MultiCallService
    },
  ) =>
    new MinterService(
      Minter__factory.connect(params.minterAddress, params.signerOrProvider),
      dependencies.erc20,
    )

  getKGLToken: IMinterService['getKGLToken'] = async () => {
    const { minter, erc20 } = this
    const kglTokenAddress = await minter.token()
    const { data } = await erc20.view(
      [kglTokenAddress],
      ['name', 'symbol', 'decimals'],
    )
    const [kglToken] = Object.entries(data).map(([address, coin]) => ({
      address,
      ...coin,
    }))
    return kglToken
  }
}
