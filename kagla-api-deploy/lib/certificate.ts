import { CfnCertificate } from '@aws-cdk/aws-certificatemanager'
import { Construct, Stack, StackProps } from '@aws-cdk/core'

export class KaglaApiCertificateStack extends Stack {
  constructor(
    scope: Construct,
    id: string,
    { domainName, ...props }: StackProps & { domainName: string },
  ) {
    super(scope, id, props)

    new CfnCertificate(this, 'Certificate', {
      domainName,
      subjectAlternativeNames: [`*.${domainName}`],
      validationMethod: 'DNS',
    })
  }
}
