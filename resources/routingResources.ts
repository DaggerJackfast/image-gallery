export default {
  Resources: {
    RouteTablePublic: {
      DependsOn: 'VPCGA',
      Type: 'AWS::EC2::RouteTable',
      Properties: {
        VpcId: '!Ref VPC',
        Tags: [
          {
            Key: 'Name',
            Value: 'RouteTablePublic'
          }
        ]
      }
    },
    RoutePublic: {
      Type: 'AWS::EC2::Route',
      Properties: {
        DestinationCidrBlock: '0.0.0.0/0',
        GatewayId: '!Ref InternetGateway',
        RouteTableId: '!Ref RouteTablePublic'
      }
    },
    RouteTableAssociationSubnetA: {
      Type: 'AWS::EC2::SubnetRouteTableAssociation',
      Properties: {
        RouteTableId: '!Ref RouteTablePublic',
        SubnetId: '!Ref SubnetA'
      }
    },
    RouteTableAssociationSubnetB: {
      Type: 'AWS::EC2::SubnetRouteTableAssociation',
      Properties: {
        RouteTableId: '!Ref RouteTablePublic',
        SubnetId: '!Ref SubnetB'
      }
    }
  }
};
