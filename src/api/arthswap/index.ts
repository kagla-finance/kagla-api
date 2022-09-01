import { GraphQLClient } from 'graphql-request'
import { ChainId, getProtocolConfig } from 'src/config'
import { KGL_PRICE_IN_USD } from 'src/constants'
import { BigNumberJs } from 'src/utils/number'
import { getSdk } from './__generated__/graphql'

const graphqlClient = (endpoint: string) => getSdk(new GraphQLClient(endpoint))

export const getKGLPrice = async (
  kglTokenAddress: string,
  chainId?: ChainId,
) => {
  const { arthswapDataProvider } = getProtocolConfig(chainId)
  if (!arthswapDataProvider) return KGL_PRICE_IN_USD
  const client = graphqlClient(arthswapDataProvider.endpoint)
  const res = await client.ListPrices({
    input: {
      quoteToken: arthswapDataProvider.quoteTokenAddress,
      tokens: [kglTokenAddress],
    },
  })
  const priceInQuoteToken = res.getPrices.prices[0]?.priceInQuoteToken
  const quoteTokenPriceInUSD = res.getPrices.quoteTokenPriceInUSD
  if (!priceInQuoteToken || !quoteTokenPriceInUSD)
    throw new Error('$KGL Price not found.')
  return new BigNumberJs(priceInQuoteToken)
    .times(quoteTokenPriceInUSD)
    .toNumber()
}

export const getPrices = async (
  tokenAddresses: string[],
  chainId?: ChainId,
): Promise<Partial<Record<string, string>>> => {
  const { arthswapDataProvider } = getProtocolConfig(chainId)
  if (!arthswapDataProvider) return {}
  const client = graphqlClient(arthswapDataProvider.endpoint)
  const res = await client.ListPrices({
    input: {
      quoteToken: arthswapDataProvider.quoteTokenAddress,
      tokens: tokenAddresses,
    },
  })
  const quoteTokenPriceInUSD = res.getPrices.quoteTokenPriceInUSD
  if (!quoteTokenPriceInUSD) throw new Error('Price not found.')
  return res.getPrices.prices.reduce((res, price) => {
    if (!price.priceInQuoteToken) return res
    return {
      ...res,
      [price.token]: new BigNumberJs(price.priceInQuoteToken)
        .times(quoteTokenPriceInUSD)
        .toString(),
    }
  }, {})
}
