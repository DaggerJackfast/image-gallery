import type { AWS } from '@serverless/typescript';
import secrets from './.secrets.json';
import rdsResources from './resources/rdsResources';
import vpcResources from './resources/vpcResources';
import routingResources from './resources/routingResources';
import rdsProxyResources from './resources/rdsProxyResources';

const postgresSqlRDSInstance = {
  DependsOn: 'ServerlessVPCGA',
  Type: 'AWS::RDS::DBInstance',
  Properties: {
    MasterUsername: '${self:custom.USERNAME}',
    MasterUserPassword: '${self:custom.PASSWORD}',
    AllocatedStorage: 20,
    DBName: '${self:custom.DB_NAME}',
    DBInstanceClass: 'db.t4g.small',
    VPCSecurityGroups: ['!GetAtt ServerlessSecurityGroup.GroupId'],
    DBSubnetGroupName: {
      Ref: 'ServerlessSubnetGroup'
    },
    Engine: 'postgres',
    PubliclyAccessible: true
  }
};

// console.log('secrets: ', secrets);

const serverlessConfiguration: AWS = {
  org: 'jackfast',
  app: 'image-gallery',
  service: 'image-gallery',
  frameworkVersion: '3',
  provider: {
    name: 'aws',
    runtime: 'nodejs18.x',
    region: 'us-east-1',
    vpc: {
      securityGroupIds: ['!Ref LambdaSecurityGroup'],
      subnetIds: ['!Ref SubnetA', '!Ref SubnetB']
    },
    environment: {
      NODE_ENV: '${opt:stage, \'dev\'}',
      DB_NAME: '${self:custom.DB_NAME}_${opt:stage, \'dev\'}',
      DB_USER: '${self:custom.DB_USERNAME}',
      DB_PASS: '${self:custom.DB_PASSWORD}',
      DB_PORT: '${self:custom.DB_PORT}',
      DB_HOST: '${self:custom.PROXY_ENDPOINT}',
    }
  },
  custom: {
    esbuild: {
      config: '.esbuild.config.js',
      exclude: ['aws-sdk'],
      target: 'node18',
      define: { 'require.resolve': undefined },
      platform: 'node',
      concurrency: 10,
    },
    DB_NAME: secrets.databaseName,
    DB_USERNAME: secrets.databaseUser,
    DB_PASSWORD: secrets.databasePassword,
    // DB_PORT: secrets.databasePort, // !GetAtt RDSInstance.Endpoint.Port
    DB_PORT: '!GetAtt RDSInstance.Endpoint.Port',
    // PROXY_ENDPOINT: secrets.databaseEndpoint, //!GetAtt RDSProxy.Endpoint
    PROXY_ENDPOINT: '!GetAtt RDSProxy.Endpoint',
    VPC_CIDR: 10,
    PROXY_NAME: 'image-gallery-rds-proxy-${opt:stage, \'dev\'}'
  },
  plugins: [
    'serverless-esbuild',
    'serverless-offline'
  ],
  package: { individually: true },
  resources: {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    //@ts-ignore
    Resources: {
      ...vpcResources.Resources,
      ...routingResources.Resources,
      ...rdsResources.Resources,
      ...rdsProxyResources.Resources,
    }
  },
  functions: {
    index: {
      handler: 'index.handler',
      events: [
        {
          http: {
            method: 'get',
            path: '/'
          }
        }
      ]
    },
    // proxyHealthCheck: {
    //   handler: 'handlers/proxyHealthCheck.handler',
    //   events: [
    //     {
    //       http: {
    //         path: 'proxy-healthcheck',
    //         method: 'get'
    //       }
    //     }
    //   ]
    // }
  },
};

module.exports = serverlessConfiguration;

// export default serverlessConfiguration;
