import type { AWS } from '@serverless/typescript';
import imageFunctions from './handlers/image';


const serverlessConfiguration: AWS = {
  org: 'jackfast',
  app: 'image-gallery',
  service: 'image-gallery',
  frameworkVersion: '3',
  useDotenv: true,
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
    DB_NAME: '${env:DB_NAME}',
    DB_USERNAME: '${env:DB_USERNAME}',
    DB_PASSWORD: '${env:DB_PASSWORD}',
    DB_PORT: '${env:DB_PORT}',
    DB_HOST: '${env:DB_HOST}',
    SECURITY_GROUP_ID: '${env:SECURITY_GROUP_ID}',
    SUBNET1_ID:'${env:SUBNET1_ID}',
    SUBNET2_ID:'${env:SUBNET2_ID}',
    SUBNET3_ID: '${env:SUBNET3_ID}',
    SUBNET4_ID: '${env:SUBNET4_ID}',
    SUBNET5_ID: '${env:SUBNET5_ID}',
    SUBNET6_ID: '${env:SUBNET6_ID}',
    AUTH0_DOMAIN: '${env:AUTH0_DOMAIN}',
    AUTH0_API_ID: '${env:AUTH0_API_ID}',
    AUTH0_PUBLIC_PEM: '${env:AUTH0_PUBLIC_PEM}',
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
    'serverless-dotenv-plugin',
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
