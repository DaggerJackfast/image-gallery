import type { AWS } from '@serverless/typescript';
import secrets from './.secrets.json'; // TODO: usage serverless-dotenv-plugin
import imageFunctions from './handlers/image';


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
      securityGroupIds: [
        '${self:custom.SECURITY_GROUP_ID}',
      ],
      subnetIds: [
        '${self:custom.SUBNET1_ID}',
        '${self:custom.SUBNET2_ID}',
        '${self:custom.SUBNET3_ID}',
        '${self:custom.SUBNET4_ID}',
        '${self:custom.SUBNET5_ID}',
        '${self:custom.SUBNET6_ID}',
      ]
    },
    // TODO: can use serverless-iam-roles-per-function
    iamRoleStatements: [
      {
        Effect: 'Allow',
        Action: ['s3:Get*', 's3:Put*', 's3:DeleteObject'],
        Resource: 'arn:aws:s3:::${self:custom.FILE_BUCKET_NAME}/*'
      },
      {
        Effect: 'Allow',
        Action: ['sqs:SendMessage', 'sqs:GetQueueUrl', ],
        Resource: [
          {
            'Fn::GetAtt': ['${self:custom.QUEUE_NAME}', 'Arn']
          }
        ]
      },
      {
        Effect: 'Allow',
        Action: ['sqs:ListQueues'],
        Resource: [
          {
            'Fn::GetAtt': ['${self:custom.QUEUE_NAME}', 'Arn']
          }
        ]
      }
    ],
    environment: {
      NODE_ENV: '${opt:stage, \'dev\'}',
      // DB_NAME: '${self:custom.DB_NAME}_${opt:stage, \'dev\'}',
      DB_NAME: '${self:custom.DB_NAME}',
      DB_USERNAME: '${self:custom.DB_USERNAME}',
      DB_PASSWORD: '${self:custom.DB_PASSWORD}',
      DB_PORT: '${self:custom.DB_PORT}',
      DB_HOST: '${self:custom.DB_HOST}',
      FILE_BUCKET_NAME: '${self:custom.FILE_BUCKET_NAME}',
      QUEUE_NAME: '${self:custom.QUEUE_NAME}',
      // QUEUE_URL: { Ref: '${self:custom.QUEUE_NAME}' }, // TODO: enable for prod
      QUEUE_URL: 'http://localhost:9324/queue/${self:custom.QUEUE_NAME}', // TODO delete for prod
      RUNTIME_REGION: 'us-east-1',
      AUTH0_DOMAIN: '${self:custom.AUTH0_DOMAIN}',
      AUTH0_JWKS_URI: '${self:custom.AUTH0_DOMAIN}.well-known/jwks.json',
      AUTH0_API_ID: '${self:custom.AUTH0_API_ID}',
      AUTH0_PUBLIC_PEM: '${self:custom.AUTH0_PUBLIC_PEM}',
      SQS_ARN: {
        'Fn::GetAtt': ['${self:custom.QUEUE_NAME}', 'Arn']
      }
    }
  },
  custom: {
    esbuild: {
      bundle: true,
      config: '.esbuild.config.js',
      external: ['pg'],
      target: 'node18',
      define: { 'require.resolve': undefined },
      platform: 'node',
      concurrency: 10,
    },
    DB_NAME: secrets.databaseName,
    DB_USERNAME: secrets.databaseUser,
    DB_PASSWORD: secrets.databasePassword,
    DB_PORT: secrets.databasePort,
    DB_HOST: secrets.databaseHost,
    SECURITY_GROUP_ID: secrets.securityGroupId,
    SUBNET1_ID: secrets.subnet1Id,
    SUBNET2_ID: secrets.subnet2Id,
    SUBNET3_ID: secrets.subnet3Id,
    SUBNET4_ID: secrets.subnet4Id,
    SUBNET5_ID: secrets.subnet5Id,
    SUBNET6_ID: secrets.subnet6Id,
    AUTH0_DOMAIN: secrets.auth0Domain,
    AUTH0_API_ID: secrets.auth0ApiId,
    AUTH0_PUBLIC_PEM: secrets.auth0PublicPem,
    FILE_BUCKET_NAME: 'image-gallery-files-${opt:stage, \'dev\'}',
    QUEUE_NAME: 'image-gallery-queue-${opt:stage, \'dev\'}',
    s3: { // TODO: delete for prod
      host: 'localhost',
      directory: './.Trashes'
    },
    'serverless-offline-sqs': { // TODO: delete for prod
      autoCreate: true,
      apiVersion: '2012-11-05',
      endpoint: 'http://0.0.0.0:9324',
      region: 'us-east-1',
      accessKeyId: 'root',
      secretAccessKey: 'root',
      skipCacheInvalidation: false,
    }
  },
  plugins: [
    'serverless-plugin-ifelse',
    'serverless-offline-sqs', // TODO: delete for prod
    'serverless-offline',
    'serverless-esbuild',
    'serverless-cloudside-plugin', // TODO: delete for prod
    'serverless-s3-local', // TODO: delete for prod
  ],
  package: { individually: true },
  functions: {
    auth: {
      handler: 'handlers/auth0/auth.auth',
      timeout: 30,
    },
    index: {
      handler: 'index.handler',
      events: [
        {
          http: {
            method: 'get',
            path: '/',
            cors: true,
          }
        }
      ],
    },
    ...imageFunctions
  },
  resources: {
    // // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // // @ts-ignore
    // Resources: {
    //   ...fileBucketResources.Resources,
    // }
    Resources: {
      FileBucket: {
        Type: 'AWS::S3::Bucket',
        Properties: {
          BucketName: '${self:custom.FILE_BUCKET_NAME}',
          AccessControl: 'Private',
        },
      },
      ImageQueue: {
        Type: 'AWS::SQS::Queue',
        Properties: {
          QueueName: '${self:custom.QUEUE_NAME}'
        }
      },
      GatewayResponse: {
        Type: 'AWS::ApiGateway::GatewayResponse',
        Properties: {
          ResponseParameters: {
            'gatewayresponse.header.Access-Control-Allow-Origin': '\'*\'',
            'gatewayresponse.header.Access-Control-Allow-Headers': '\'*\''
          },
          ResponseType: 'EXPIRED_TOKEN',
          RestApiId: {
            Ref: 'ApiGatewayRestApi'
          },
          StatusCode: '401'
        }
      },
      AuthFailureGatewayResponse: {
        Type: 'AWS::ApiGateway::GatewayResponse',
        Properties: {
          ResponseParameters: {
            'gatewayresponse.header.Access-Control-Allow-Origin': '\'*\'',
            'gatewayresponse.header.Access-Control-Allow-Headers': '\'*\''
          },
          ResponseType: 'UNAUTHORIZED',
          RestApiId: {
            Ref: 'ApiGatewayRestApi'
          },
          StatusCode: '401'
        }
      }
    }

  }
};

module.exports = serverlessConfiguration;

// export default serverlessConfiguration;
