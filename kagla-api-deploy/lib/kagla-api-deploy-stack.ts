import {
  CloudFrontWebDistribution,
  OriginProtocolPolicy,
} from '@aws-cdk/aws-cloudfront'
import { ContainerImage } from '@aws-cdk/aws-ecs'
import { ApplicationLoadBalancedFargateService } from '@aws-cdk/aws-ecs-patterns'
import { Construct, Duration, Stack, StackProps } from '@aws-cdk/core'
import { appName, network } from './config'

export class KaglaApiDeployStack extends Stack {
  constructor(scope: Construct, id: string, nw: network, props?: StackProps) {
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
          containerPort: 3001,
        },
      },
    )
    new CloudFrontWebDistribution(this, `web-distribution-${appName}-${nw}`, {
      defaultRootObject: '',
      originConfigs: [
        {
          customOriginSource: {
            domainName: service.loadBalancer.loadBalancerDnsName,
            originProtocolPolicy: OriginProtocolPolicy.HTTP_ONLY,
            originKeepaliveTimeout: Duration.minutes(1),
          },
          behaviors: [
            {
              isDefaultBehavior: true,
              compress: true,
            },
          ],
        },
      ],
    })
  }
}
