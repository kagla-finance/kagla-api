import * as cdk from '@aws-cdk/core'
import 'source-map-support/register'
import { network } from '../lib/config'
import { KaglaApiDeployStack } from '../lib/kagla-api-deploy-stack'

const app = new cdk.App()
const nw: network = app.node.tryGetContext('network') as network
if (!nw) {
  throw new Error(`invalid network: ${nw}`)
}
new KaglaApiDeployStack(app, `KaglaApiDeployStack-${nw}`, nw, {})
