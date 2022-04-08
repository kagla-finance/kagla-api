import { SynthUtils } from '@aws-cdk/assert'
import * as cdk from '@aws-cdk/core'
import { network } from '../lib/config'
import { KaglaApiDeployStack } from '../lib/kagla-api-deploy-stack'

// example test. To run these tests, uncomment this file along with the
// example resource in lib/kagla-api-deploy-stack.ts
test('SQS Queue Created', () => {
  const app = new cdk.App()
  // WHEN
  const stack = new KaglaApiDeployStack(app, 'TestStack', network.ASTAR)
  expect(SynthUtils.toCloudFormation(stack)).toMatchSnapshot()
})
