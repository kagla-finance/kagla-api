const APYS_PATH = '/raw-stats/apys.json'

type PoolName = string

type APYResponse = {
  apy: {
    day: Partial<Record<PoolName, number>>
    week: Partial<Record<PoolName, number>>
    month: Partial<Record<PoolName, number>>
    total: Partial<Record<PoolName, number>>
  }
  volume: Partial<Record<PoolName, number>>
}

export type IStatsService = {
  getAPY: () => Promise<APYResponse | undefined>
}

export class StatsService implements IStatsService {
  constructor(readonly storageEndpoint: string) {}

  static new = (params: { storageEndpoint: string }) =>
    new StatsService(params.storageEndpoint)

  getAPY = async () =>
    this.fetch<APYResponse>(APYS_PATH).catch((e) => {
      console.error(e)
      return undefined
    })

  private fetch = async <T>(path: string): Promise<T> =>
    fetch(`${this.storageEndpoint}${path}`).then((res) => res.json())
}
