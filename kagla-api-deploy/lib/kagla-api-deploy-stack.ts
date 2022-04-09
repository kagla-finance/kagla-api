import {
  CloudFrontWebDistribution,
  OriginProtocolPolicy,
} from '@aws-cdk/aws-cloudfront'
import { ContainerImage } from '@aws-cdk/aws-ecs'
import { ApplicationLoadBalancedFargateService } from '@aws-cdk/aws-ecs-patterns'
import { Construct, Duration, Stack, StackProps } from '@aws-cdk/core'
import { appName, Network } from './config'

type KaglaApiDeployStackProps = {
  nw: Network
  chainId: number
}
export class KaglaApiDeployStack extends Stack {
  constructor(
    scope: Construct,
    id: string,
    { nw, chainId, ...props }: StackProps & KaglaApiDeployStackProps,
  ) {
    super(scope, id, props)
    const service = new ApplicationLoadBalancedFargateService(
      this,
      `${appName}-${nw}-service`,
      {
        memoryLimitMiB: 1024,
        desiredCount: 1,
        cpu: 512,
        taskImageOptions: {
          image: ContainerImage.fromAsset('../'),
          containerPort: 3000,
          environment: { CHAIN_ID: `${chainId}` },
        },
      },
    )
    const autoScaling = service.service.autoScaleTaskCount({ maxCapacity: 3 })
    autoScaling.scaleOnCpuUtilization('scale-on-cpu-utilization', {
      targetUtilizationPercent: 80,
      scaleInCooldown: Duration.minutes(1),
      scaleOutCooldown: Duration.minutes(1),
    })
    new CloudFrontWebDistribution(this, `web-distribution-${appName}-${nw}`, {
      defaultRootObject: '',
      originConfigs: [
        {
          customOriginSource: {
            domainName: service.loadBalancer.loadBalancerDnsName,
            originProtocolPolicy: OriginProtocolPolicy.HTTP_ONLY,
            originKeepaliveTimeout: Duration.minutes(1),
          },
          behaviors: [{ isDefaultBehavior: true, compress: true }],
        },
      ],
    })
  }
}
