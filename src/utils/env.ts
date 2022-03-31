export const ENV_CHAIN_ID = process.env.CHAIN_ID

export const SELF_ENDPOINT = process.env.VERCEL_URL
  ? `https://${process.env.VERCEL_URL}`
  : `http://localhost:3001`
