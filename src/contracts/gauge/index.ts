import { BigNumber, BytesLike, providers, Signer } from 'ethers'
import { WORST_APR_RATIO } from 'src/constants'
import { LiquidityGauge, StakingData } from 'src/models/gauge'
import {
  BigNumberJs,
  BN_ZERO,
  normalizeBn,
  product,
  SECONDS_PER_YEAR,
} from 'src/utils/number'
import {
  IMultiCallService,
  MultiCallData,
  MultiCallService,
} from '../multiCall'
import { GaugeContoller__factory } from '../__generated__/factories/GaugeContoller__factory'
import { LiquidityGaugeV3__factory } from '../__generated__/factories/LiquidityGaugeV3__factory'
import {
  GaugeContoller,
  GaugeContollerInterface,
} from '../__generated__/GaugeContoller'
import {
  LiquidityGaugeV3,
  LiquidityGaugeV3Interface,
} from '../__generated__/LiquidityGaugeV3'

type StakingDataResponse = {
  blockNumber: string
  data: StakingData
}

export type IGaugeService = {
  getStakingData: (owner: string) => Promise<StakingDataResponse>
  createGaugeMutilCallData: (address: string) => MultiCallData[]
  mapGaugeMutilCallResults: (
    gaugeInfo: { address: string; type: string },
    results: BytesLike[],
    startIndex: number,
    normalizedAprParameters: {
      rewardPrice: BigNumberJs.Value
      assetPrice: BigNumberJs.Value
      lpTokenVirtualPrice: BigNumberJs.Value
    },
  ) => { gauge: LiquidityGauge; nextIndex: number }
}

export class GaugeService implements IGaugeService {
  private constructor(
    readonly gaugeController: GaugeContoller,
    readonly iGauge: LiquidityGaugeV3Interface,
    readonly multiCall: IMultiCallService,
  ) {}

  static new = (params: {
    multiCallAddress: string
    gaugeControllerAddress: string
    signerOrProvider: Signer | providers.Provider
  }) =>
    new GaugeService(
      GaugeContoller__factory.connect(
        params.gaugeControllerAddress,
        params.signerOrProvider,
      ),
      LiquidityGaugeV3__factory.createInterface(),
      MultiCallService.new(params),
    )

  listGaugeData = async () => {
    const gaugeAddresses: string[] = []
    this.multiCall.callViewFunctionsByAddresses<LiquidityGaugeV3, any>({
      iContract: LiquidityGaugeV3__factory.createInterface(),
      targetAddresses: gaugeAddresses,
      viewFuntions: ['inflation_rate', 'working_supply'],
    })
    this.multiCall.callViewFunctionsByArgs({
      contract: this.gaugeController,
      viewFuntions: ['gauge_relative_weight(address)'],
      argsMaps: gaugeAddresses.map((address) => ({
        'gauge_relative_weight(address)': [address] as [string],
      })),
    })
  }

  createGaugeMutilCallData: IGaugeService['createGaugeMutilCallData'] = (
    address: string,
  ) =>
    [
      this.multiCall.createViewFunctionsCallDataByAddresses<LiquidityGaugeV3>({
        iContract: this.iGauge,
        targetAddresses: [address],
        viewFuntions: ['inflation_rate', 'working_supply'],
      }),
      this.multiCall.createViewFunctionsCallDataByArgs({
        contract: this.gaugeController,
        viewFuntions: ['gauge_relative_weight(address)'],
        argsMaps: [{ 'gauge_relative_weight(address)': [address] as [string] }],
      }),
    ].flat()

  mapGaugeMutilCallResults: IGaugeService['mapGaugeMutilCallResults'] = (
    gaugeInfo,
    results,
    startIndex,
    { rewardPrice, assetPrice, lpTokenVirtualPrice },
  ) => {
    const { inflationRate, workingSupply, relativeWeight } =
      gaugeMultiCallResultMapper(
        this.iGauge,
        this.gaugeController.interface,
        results,
        startIndex,
      )

    const annualProfitDenomiator = product(
      normalizeBn(workingSupply),
      assetPrice,
      lpTokenVirtualPrice,
    )
    const minAPR = annualProfitDenomiator.isZero()
      ? BN_ZERO
      : product(
          normalizeBn(inflationRate),
          normalizeBn(relativeWeight),
          rewardPrice,
          SECONDS_PER_YEAR,
          WORST_APR_RATIO,
        ).div(annualProfitDenomiator)

    const gauge = {
      ...gaugeInfo,
      inflationRate,
      workingSupply,
      relativeWeight,
      minAPR: minAPR.toString(),
      maxAPR: minAPR.div(WORST_APR_RATIO).toString(),
    }
    return {
      gauge,
      nextIndex: startIndex + 3,
    }
  }
  getStakingData: IGaugeService['getStakingData'] = async (owner: string) => {
    const { multiCall, gaugeController } = this
    const numOfGauges = (await gaugeController.n_gauges()).toNumber()
    const gaugesRes = await multiCall.callByIndex({
      contract: gaugeController,
      count: numOfGauges,
      functionName: 'gauges',
    })
    const gaugeAddresses = gaugesRes.data.flat()
    const gaugeRes = await multiCall.callViewFunctionsByAddresses({
      iContract: LiquidityGaugeV3__factory.createInterface(),
      targetAddresses: gaugeAddresses,
      viewFuntions: ['lp_token', 'balanceOf', 'claimable_tokens'],
      argMap: { balanceOf: [owner], claimable_tokens: [owner] },
    })
    const result = gaugeAddresses.reduce(
      (res, address) => {
        const response = gaugeRes.data[address] as {
          lp_token: string
          balanceOf: BigNumber
          claimable_tokens: BigNumber
        }
        return {
          stakedBalance: {
            ...res.stakedBalance,
            [response.lp_token]: response.balanceOf.toString(),
          },
          claimableAmounts: {
            ...res.claimableAmounts,
            [address]: response.claimable_tokens.toString(),
          },
          claimableAmount: response.claimable_tokens.add(res.claimableAmount),
        }
      },
      {
        stakedBalance: {},
        claimableAmounts: {},
        claimableAmount: BigNumber.from('0'),
      },
    )
    return {
      blockNumber: gaugeRes.blockNumber.toString(),
      data: {
        stakedBalance: result.stakedBalance,
        claimableAmounts: result.claimableAmounts,
        claimableAmount: result.claimableAmount.toString(),
      },
    }
  }
}

const gaugeMultiCallResultMapper = (
  iGauge: LiquidityGaugeV3Interface,
  iGaugeController: GaugeContollerInterface,
  results: BytesLike[],
  startIndex = 0,
) => ({
  inflationRate: iGauge
    .decodeFunctionResult('inflation_rate', results[startIndex])[0]
    .toString(),
  workingSupply: iGauge
    .decodeFunctionResult('working_supply', results[startIndex + 1])[0]
    .toString(),
  relativeWeight: iGaugeController
    .decodeFunctionResult(
      // @ts-ignore
      'gauge_relative_weight(address)',
      results[startIndex + 2],
    )[0]
    .toString(),
})
