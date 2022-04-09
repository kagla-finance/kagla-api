import { SynthUtils } from '@aws-cdk/assert'
import * as cdk from '@aws-cdk/core'
import { ENV_CONFIG } from '../lib/config'
import { KaglaApiDeployStack } from '../lib/kagla-api-deploy-stack'

// example test. To run these tests, uncomment this file along with the
// example resource in lib/kagla-api-deploy-stack.ts
test('SQS Queue Created', () => {
  const app = new cdk.App()
  // WHEN
  const nw = 'astar'
  const env = ENV_CONFIG[nw]
  const stack = new KaglaApiDeployStack(app, 'TestStack', { nw, ...env })
  expect(SynthUtils.toCloudFormation(stack)).toMatchSnapshot()
})
