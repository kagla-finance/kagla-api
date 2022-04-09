import { SynthUtils } from '@aws-cdk/assert'
import * as cdk from '@aws-cdk/core'
import { KaglaApiCertificateStack } from '../lib/certificate'
import { ENV_CONFIG } from '../lib/config'
import { KaglaApiDeployStack } from '../lib/kagla-api-deploy-stack'

describe('kagla-api-deploy', () => {
  const nw = 'astar'
  const env = ENV_CONFIG[nw]
  test('Api', () => {
    const app = new cdk.App()
    // WHEN
    const stack = new KaglaApiDeployStack(app, 'TestStack', { nw, ...env })
    expect(SynthUtils.toCloudFormation(stack)).toMatchSnapshot()
  })
  test('Certificate', () => {
    const app = new cdk.App()
    // WHEN
    const stack = new KaglaApiCertificateStack(app, 'TestCertificateStack', {
      domainName: 'test.example.com',
    })
    expect(SynthUtils.toCloudFormation(stack)).toMatchSnapshot()
  })
})
