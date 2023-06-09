export default {
  Resources: {
    RDSProxy: {
      Type: 'AWS::RDS::DBProxy',
      Properties: {
        DBProxyName: '${self:custom.PROXY_NAME}',
        EngineFamily: 'POSTGRESQL',
        RoleArn: '!GetAtt RDSProxyRole.Arn',
        Auth: [
          {
            AuthScheme: 'SECRETS',
            IAMAuth: 'DISABLED',
            SecretArn: '!Ref RDSSecret'
          }
        ],
        VpcSecurityGroupIds: [
          '!Ref RDSSecurityGroup'
        ],
        VpcSubnetIds: [
          '!Ref SubnetA',
          '!Ref SubnetB'
        ]
      }
    },
    RDSProxyTargetGroup: {
      Type: 'AWS::RDS::DBProxyTargetGroup',
      Properties: {
        TargetGroupName: 'default',
        DBProxyName: '!Ref RDSProxy',
        DBInstanceIdentifiers: [
          '!Ref RDSInstance'
        ]
      }
    },
    RDSSecret: {
      Type: 'AWS::SecretsManager::Secret',
      Properties: {
        SecretString: '{"username":"${self:custom.DB_USERNAME}", "password":"${self:custom.DB_PASSWORD}"}'
      }
    },
    RDSProxyRole: {
      Type: 'AWS::IAM::Role',
      Properties: {
        AssumeRolePolicyDocument: {
          Version: '2012-10-17',
          Statement: [
            {
              Effect: 'Allow',
              Action: 'sts:AssumeRole',
              Principal: {
                Service: 'rds.amazonaws.com'
              }
            }
          ]
        },
        Policies: [
          {
            PolicyName: 'RDSProxyPolicy',
            PolicyDocument: {
              Version: '2012-10-17',
              Statement: [
                {
                  Effect: 'Allow',
                  Action: 'secretsmanager:GetSecretValue',
                  Resource: '!Ref RDSSecret'
                },
                {
                  Effect: 'Allow',
                  Action: 'kms:Decrypt',
                  Resource: 'arn:aws:kms:${self:provider.region}:#{AWS::AccountId}:key/*',
                  Condition: {
                    StringEquals: {
                      'kms:ViaService': 'secretsmanager.${self:provider.region}.amazonaws.com'
                    }
                  }
                }
              ]
            }
          }
        ]
      }
    }
  }
};
