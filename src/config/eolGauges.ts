import dayjs, { Dayjs } from 'dayjs'
import { ChainId, CHAIN_ID } from './chain'

export const getEolGauges = (chainId: ChainId) => {
  const eolGauges = EOL_GAUGES[chainId]
  return eolGauges
    .filter(({ eolAt }) => dayjs().isAfter(eolAt))
    .flatMap(({ gauges }) => gauges)
}

type EolGauges = {
  eolAt: Dayjs
  gauges: string[]
}

const EOL_GAUGES: Record<ChainId, EolGauges[]> = {
  [CHAIN_ID.astar]: [
    {
      eolAt: dayjs('2022-04-28T00:00:00Z'),
      gauges: [
        '0xa480B71b5aFBe28df9658C253e1E18A5EeDA131E',
        '0x13EE6d778B41229a8dF6a2c6EB2dcf595faFc2f4',
        '0x940f388bb2f33C81840b70cDd72b3bC73d76232E',
      ],
    },
  ],
  [CHAIN_ID.shiden]: [
    {
      eolAt: dayjs('2022-04-27T17:01:00Z'),
      gauges: [
        '0xc020e5D53Af59b0Fd22970f9851AcB1a12A317c6',
        '0xdF180f31739284a1A8Ba3a110cDdaD58642F3DAF',
        '0xe806e841ca26fF5A82E58A7A9144B7032623E4FB',
      ],
    },
  ],
}
