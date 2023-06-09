export default {
  Resources: {
    VPC: {
      Type: 'AWS::EC2::VPC',
      Properties: {
        CidrBlock: '${self:custom.VPC_CIDR}.0.0.0/16',
        EnableDnsSupport: true,
        EnableDnsHostnames: true,
        Tags: [
          {
            Key: 'Name',
            Value: 'VPC'
          }
        ]
      }
    },
    SubnetA: {
      Type: 'AWS::EC2::Subnet',
      Properties: {
        VpcId: '!Ref VPC',
        AvailabilityZone: '${self:provider.region}a',
        CidrBlock: '${self:custom.VPC_CIDR}.0.0.0/24',
        Tags: [
          {
            Key: 'Name',
            Value: 'SubnetA'
          }
        ]
      }
    },
    SubnetB: {
      Type: 'AWS::EC2::Subnet',
      Properties: {
        VpcId: '!Ref VPC',
        AvailabilityZone: '${self:provider.region}b',
        CidrBlock: '${self:custom.VPC_CIDR}.0.1.0/24',
        Tags: [
          {
            Key: 'Name',
            Value: 'SubnetB'
          }
        ]
      }
    },
    LambdaSecurityGroup: {
      Type: 'AWS::EC2::SecurityGroup',
      Properties: {
        VpcId: '!Ref VPC',
        GroupDescription: 'Security group for Lambdas',
        Tags: [
          {
            Key: 'Name',
            Value: 'LambdaSecurityGroup'
          }
        ]
      }
    },
    RDSSecurityGroup: {
      Type: 'AWS::EC2::SecurityGroup',
      Properties: {
        GroupDescription: 'Security group for RDS',
        VpcId: '!Ref VPC',
        SecurityGroupIngress: [
          {
            IpProtocol: 'tcp',
            FromPort: 0,
            ToPort: 65535,
            CidrIp: '0.0.0.0/0'
          }
        ],
        Tags: [
          {
            Key: 'Name',
            Value: 'RDSSecurityGroup'
          }
        ]
      }
    },
    InternetGateway: {
      Type: 'AWS::EC2::InternetGateway',
      Properties: {
        Tags: [
          {
            Key: 'Name',
            Value: 'InternetGateway'
          }
        ]
      }
    },
    VPCGA: {
      Type: 'AWS::EC2::VPCGatewayAttachment',
      Properties: {
        VpcId: '!Ref VPC',
        InternetGatewayId: '!Ref InternetGateway'
      }
    }
  }
};
