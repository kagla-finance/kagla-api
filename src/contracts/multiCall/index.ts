import assignDeep from 'assign-deep'
import { BaseContract, BigNumber, BytesLike, providers, Signer } from 'ethers'
import { Interface, Result } from 'ethers/lib/utils'
import { mapWithIndex } from 'src/utils/array'
import { PartialDeep, StringKeyOf } from 'type-fest'
import { Multicall, Multicall__factory } from '../__generated__'

export type FunctionName<C extends BaseContract> = StringKeyOf<C['functions']>

export type FunctionArgs<
  C extends BaseContract,
  F extends FunctionName<C>,
> = Parameters<C['functions'][F]>

export type FunctionResult<
  C extends BaseContract,
  F extends FunctionName<C> = FunctionName<C>,
> = Awaited<ReturnType<C['functions'][F]>>

export type FunctionResultsMapper<
  C extends BaseContract,
  F extends FunctionName<C>,
  R,
> = (
  res: FunctionResult<C>,
  functionName: F,
  current: PartialDeep<R> | undefined,
) => PartialDeep<R>

export type FunctionResultMapper<
  C extends BaseContract,
  F extends FunctionName<C>,
  R,
> = (res: FunctionResult<C, F>, current?: PartialDeep<R>) => PartialDeep<R>

export type MultiCallResponse<R> = {
  blockNumber: BigNumber
  data: R
}

export type MultiCallData = {
  target: string
  callData: BytesLike
}
export type IMultiCallService = {
  call: (
    params: { target: string; callData: BytesLike }[],
  ) => Promise<
    [BigNumber, string[]] & { blockNumber: BigNumber; returnData: string[] }
  >
  callByIndex: <
    C extends BaseContract,
    F extends FunctionName<C>,
    R extends FunctionResult<C, F>,
  >(params: {
    contract: C
    functionName: F
    count: number
    from?: number
  }) => Promise<MultiCallResponse<R[]>>

  callViewFunctionsByArgs: <
    C extends BaseContract,
    F extends FunctionName<C>,
    R = Record<F, FunctionResult<C, F>>,
  >(params: {
    contract: C
    viewFuntions: F[]
    resultsMapper?: FunctionResultsMapper<C, F, R>
    argsMaps: Record<F, FunctionArgs<C, F>>[]
  }) => Promise<MultiCallResponse<Record<string, R>>>

  callViewFunctionsByAddresses: <
    C extends BaseContract,
    R,
    F extends FunctionName<C> = FunctionName<C>,
  >(params: {
    iContract: C['interface']
    viewFuntions: F[]
    targetAddresses: string[]
    argMap?: Partial<Record<F, FunctionArgs<C, F>>>
    resultsMapper?: FunctionResultsMapper<C, F, R>
  }) => Promise<MultiCallResponse<Record<string, R>>>

  createViewFunctionsCallDataByArgs: <
    C extends BaseContract,
    F extends FunctionName<C>,
  >(params: {
    contract: C
    viewFuntions: F[]
    argsMaps: Record<F, FunctionArgs<C, F>>[]
  }) => MultiCallData[]

  createViewFunctionsCallDataByAddresses: <
    C extends BaseContract,
    F extends FunctionName<C> = FunctionName<C>,
  >(params: {
    iContract: C['interface']
    viewFuntions: F[]
    targetAddresses: string[]
    argMap?: Partial<Record<F, FunctionArgs<C, F>>>
  }) => MultiCallData[]
}

export class MultiCallService implements IMultiCallService {
  private constructor(readonly multiCall: Multicall) {}

  static new = (params: {
    multiCallAddress: string
    signerOrProvider: Signer | providers.Provider
  }) =>
    new MultiCallService(
      Multicall__factory.connect(
        params.multiCallAddress,
        params.signerOrProvider,
      ),
    )

  call: IMultiCallService['call'] = async (callData) =>
    this.multiCall.callStatic.aggregate(callData)

  callByIndex: IMultiCallService['callByIndex'] = async (params) => {
    const { from = 0, count, functionName, contract } = params
    const iContract = contract.interface
    const callData = mapWithIndex(
      (idx) => iContract.encodeFunctionData(functionName, [idx]),
      count,
    ).slice(from, count)
    const multiCallResponse = await this.call(
      callData.map((callDatum) => ({
        target: contract.address,
        callData: callDatum,
      })),
    )
    const data = multiCallResponse.returnData.map((data) =>
      iContract.decodeFunctionResult(functionName, data),
    )

    return {
      blockNumber: multiCallResponse.blockNumber,
      data,
    }
  }

  callViewFunctionsByArgs: IMultiCallService['callViewFunctionsByArgs'] =
    async ({ viewFuntions, contract, argsMaps, resultsMapper }) => {
      const iContract = contract.interface
      const callData = argsMaps.flatMap((argsMap) =>
        viewFuntions.map((name) => ({
          target: contract.address,
          callData: iContract.encodeFunctionData(name, argsMap[name]),
        })),
      )

      const response = await this.call(callData)

      return {
        blockNumber: response.blockNumber,
        data: await mapMultiCallResult(response.returnData, {
          iContract,
          viewFuntions,
          // @ts-ignore
          resultsMapper,
        }),
      }
    }

  callViewFunctionsByAddresses: IMultiCallService['callViewFunctionsByAddresses'] =
    async ({
      viewFuntions,
      iContract,
      targetAddresses,
      argMap,
      resultsMapper,
    }) => {
      const callData = targetAddresses.flatMap((target) =>
        viewFuntions.map((fn) => ({
          target,
          callData: iContract.encodeFunctionData(
            fn,
            argMap ? argMap[fn] : undefined,
          ),
        })),
      )

      const response = await this.call(callData)
      return {
        blockNumber: response.blockNumber,
        data: await mapMultiCallResult(response.returnData, {
          viewFuntions,
          iContract,
          keyGenerator: (index) => targetAddresses[index],
          // @ts-ignore
          resultsMapper,
        }),
      }
    }

  createViewFunctionsCallDataByArgs: IMultiCallService['createViewFunctionsCallDataByArgs'] =
    ({ viewFuntions, contract, argsMaps }) =>
      argsMaps.flatMap((argsMap) =>
        viewFuntions.map((name) => ({
          target: contract.address,
          callData: contract.interface.encodeFunctionData(name, argsMap[name]),
        })),
      )

  createViewFunctionsCallDataByAddresses: IMultiCallService['createViewFunctionsCallDataByAddresses'] =
    ({ viewFuntions, iContract, targetAddresses, argMap }) =>
      targetAddresses.flatMap((target) =>
        viewFuntions.map((fn) => ({
          target,
          callData: iContract.encodeFunctionData(
            fn,
            argMap ? argMap[fn] : undefined,
          ),
        })),
      )
}

export const mapMultiCallResult = <T extends BytesLike>(
  result: T[],
  params: {
    viewFuntions: string[]
    iContract: Interface
    keyGenerator?: (itemIndex: number) => string
    resultsMapper?: (fnRes: Result, fn: string, current?: any) => any
  },
) => {
  const {
    iContract,
    viewFuntions,
    keyGenerator = defaultKeyGenerator,
    resultsMapper = defaultResultsMapper,
  } = params
  return result.reduce((res, fnResult, idx) => {
    const itemIndex = Math.floor(idx / viewFuntions.length)
    const key = keyGenerator(itemIndex)
    const fnIndex = idx % viewFuntions.length
    const fn = viewFuntions[fnIndex]
    const decodedFnResult = iContract.decodeFunctionResult(fn, fnResult)
    return assignDeep(res, {
      [key]: resultsMapper(
        decodedFnResult,
        fn,
        // @ts-ignore
        res[key],
      ),
    })
  }, {})
}

const defaultKeyGenerator = (index: number) => `${index}`
export const defaultResultsMapper = (fnRes: Result, fn: string) => ({
  [fn]: fnRes,
})
