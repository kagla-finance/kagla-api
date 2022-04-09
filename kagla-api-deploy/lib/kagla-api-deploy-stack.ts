import { Certificate } from '@aws-cdk/aws-certificatemanager'
import {
  CloudFrontWebDistribution,
  OriginProtocolPolicy,
  ViewerCertificate,
} from '@aws-cdk/aws-cloudfront'
import { ContainerImage } from '@aws-cdk/aws-ecs'
import { ApplicationLoadBalancedFargateService } from '@aws-cdk/aws-ecs-patterns'
import { Construct, Duration, Stack, StackProps } from '@aws-cdk/core'
import { appName, Network } from './config'

type KaglaApiDeployStackProps = {
  nw: Network
  chainId: number
  alias?: {
    domainName: string
    certificateArn: string
  }
}
export class KaglaApiDeployStack extends Stack {
  constructor(
    scope: Construct,
    id: string,
    { nw, chainId, alias, ...props }: StackProps & KaglaApiDeployStackProps,
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
      viewerCertificate: alias && viewerCertificate(this, alias),
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

const viewerCertificate = (
  stack: Stack,
  alias: { domainName: string; certificateArn: string },
) =>
  ViewerCertificate.fromAcmCertificate(
    Certificate.fromCertificateArn(
      stack,
      `cloudfront-certificate`,
      alias.certificateArn,
    ),
    { aliases: [alias.domainName] },
  )
