export default {
  Resources: {
    RDSInstance: {
      DependsOn: 'VPCGA',
      Type: 'AWS::RDS::DBInstance',
      Properties: {
        DBName: '${self:custom.DB_NAME}',
        MasterUsername: '${self:custom.DB_USERNAME}',
        MasterUserPassword: '${self:custom.DB_PASSWORD}',
        Engine: 'postgres',
        EngineVersion: '14.7',
        DBInstanceClass: 'db.t2.micro',
        AllocatedStorage: '20',
        PubliclyAccessible: true,
        DBSubnetGroupName: '!Ref RDSSubnetGroup',
        VPCSecurityGroups: [
          '!GetAtt RDSSecurityGroup.GroupId'
        ]
      }
    },
    RDSSubnetGroup: {
      Type: 'AWS::RDS::DBSubnetGroup',
      Properties: {
        DBSubnetGroupDescription: 'RDS subnet group',
        SubnetIds: [
          '!Ref SubnetA',
          '!Ref SubnetB'
        ],
        Tags: [
          {
            Key: 'Name',
            Value: 'RDSSubnetGroup'
          }
        ]
      }
    }
  }
};
