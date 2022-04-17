import { IPoolInfoService } from 'src/contracts/poolInfo'
import { Coin } from 'src/models/coin'
import { SELF_ENDPOINT } from 'src/utils/env'

const KAGLA_BASE_PATH = '/api/kagla'

export type ISelfAPICallService = {
  listAllAssets: () => Promise<Coin[]>
  listPools: () => ReturnType<IPoolInfoService['listPools']>
}

export class SelfAPICallService implements ISelfAPICallService {
  constructor(readonly endpoint: string) {}

  static new = (params?: { endpoint: string }) =>
    new SelfAPICallService(params?.endpoint || SELF_ENDPOINT)

  listAllAssets = async () => {
    const coinPromise = this.fetch<Coin[]>('/coins')
    const lpTokenPromise = this.fetch<Coin[]>('/lpTokens')
    const kglTokenPromise = this.fetch<Coin>('/kglToken')
    const res = await Promise.all([
      coinPromise,
      lpTokenPromise,
      kglTokenPromise,
    ])
    return res.flat()
  }

  listPools = async () =>
    this.fetch<Awaited<ReturnType<IPoolInfoService['listPools']>>>('/pools')

  private fetch = async <T>(path: string): Promise<T> =>
    fetch(`${this.endpoint}${KAGLA_BASE_PATH}${path}`).then((res) => res.json())
}
