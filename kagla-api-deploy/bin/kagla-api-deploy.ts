import * as cdk from '@aws-cdk/core'
import 'source-map-support/register'
import { ENV_CONFIG, isValidNetwork, Network } from '../lib/config'
import { KaglaApiDeployStack } from '../lib/kagla-api-deploy-stack'

const app = new cdk.App()
const nw: Network = app.node.tryGetContext('network')
if (!isValidNetwork(nw)) {
  throw new Error(`invalid network: ${nw}`)
}
new KaglaApiDeployStack(app, `KaglaApiDeployStack-${nw}`, {
  nw,
  chainId,
})
