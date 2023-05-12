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
      securityGroupIds: ['${self:custom.SECURITY_GROUP_ID}'],
      subnetIds: [
        '${self:custom.SUBNET1_ID}',
        '${self:custom.SUBNET2_ID}',
        '${self:custom.SUBNET3_ID}',
        '${self:custom.SUBNET4_ID}',
        '${self:custom.SUBNET5_ID}',
        '${self:custom.SUBNET6_ID}',
      ],
    },
    iam: {
      role: {
        statements: [
          {
            Effect: 'Allow',
            Action: ['s3:Get*', 's3:Put*', 's3:DeleteObject'],
            Resource: 'arn:aws:s3:::${self:custom.FILE_BUCKET_NAME}/*',
          },
          {
            Effect: 'Allow',
            Action: ['sqs:SendMessage', 'sqs:GetQueueUrl'],
            Resource: [
              {
                'Fn::GetAtt': ['ImageQueue', 'Arn'],
              },
            ],
          },
        ]
      }
    },
    environment: {
      NODE_ENV: '${opt:stage, \'dev\'}',
      DB_NAME: '${self:custom.DB_NAME}',
      DB_USERNAME: '${self:custom.DB_USERNAME}',
      DB_PASSWORD: '${self:custom.DB_PASSWORD}',
      DB_PORT: '${self:custom.DB_PORT}',
      DB_HOST: '${self:custom.DB_HOST}',
      FILE_BUCKET_NAME: '${self:custom.FILE_BUCKET_NAME}',
      QUEUE_NAME: '${self:custom.QUEUE_NAME}',
      QUEUE_URL: { Ref: 'ImageQueue' },
      RUNTIME_REGION: 'us-east-1',
      AUTH0_DOMAIN: '${self:custom.AUTH0_DOMAIN}',
      AUTH0_JWKS_URI: '${self:custom.AUTH0_DOMAIN}.well-known/jwks.json',
      AUTH0_API_ID: '${self:custom.AUTH0_API_ID}',
      AUTH0_PUBLIC_PEM: '${self:custom.AUTH0_PUBLIC_PEM}',
      SQS_ARN: { 'Fn::GetAtt': ['ImageQueue', 'Arn'] },
      CORS_ALLOW_ORIGIN: '${self:custom.CORS_ALLOW_ORIGIN}',
    },
  },
  custom: {
    runTimeStage: '${opt:stage, self:provider.stage, \'dev\'}',
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
    SUBNET1_ID: '${env:SUBNET1_ID}',
    SUBNET2_ID: '${env:SUBNET2_ID}',
    SUBNET3_ID: '${env:SUBNET3_ID}',
    SUBNET4_ID: '${env:SUBNET4_ID}',
    SUBNET5_ID: '${env:SUBNET5_ID}',
    SUBNET6_ID: '${env:SUBNET6_ID}',
    AUTH0_DOMAIN: '${env:AUTH0_DOMAIN}',
    AUTH0_API_ID: '${env:AUTH0_API_ID}',
    AUTH0_PUBLIC_PEM: '${env:AUTH0_PUBLIC_PEM}',
    FILE_BUCKET_NAME: 'image-gallery-files-${opt:stage, \'dev\'}',
    QUEUE_NAME: 'image-gallery-queue-${opt:stage, \'dev\'}',
    CORS_ALLOW_ORIGIN: '${env:CORS_ALLOW_ORIGIN}',
    serverlessIfElse: [
      {
        If: '"${self:custom.runTimeStage}" == "production"',
        Exclude: [
          'provider.custom.s3',
          'provider.custom.serverless-offline-sqs',
        ],
      },
      {
        If: '"${self:custom.runTimeStage}" == "dev"',
        Set: {
          'provider.environment.QUEUE_URL': 'http://localhost:9324/queue/${self:custom.QUEUE_NAME}'
        }
      }
    ],

    s3: {
      host: 'localhost',
      directory: './.Trashes',
    },
    'serverless-offline-sqs': {
      autoCreate: true,
      apiVersion: '2012-11-05',
      endpoint: 'http://0.0.0.0:9324',
      region: 'us-east-1',
      accessKeyId: 'root',
      secretAccessKey: 'root',
      skipCacheInvalidation: false,
    },
  },
  plugins: [
    'serverless-plugin-ifelse',
    'serverless-offline-sqs',
    'serverless-offline',
    'serverless-esbuild',
    'serverless-cloudside-plugin',
    'serverless-s3-local',
    'serverless-dotenv-plugin',
  ],
  package: { individually: true },
  functions: {
    ...handlers
  },
  resources: {
    Resources: {
      FileBucket: {
        Type: 'AWS::S3::Bucket',
        Properties: {
          BucketName: '${self:custom.FILE_BUCKET_NAME}',
          AccessControl: 'Private',
          CorsConfiguration:{
            CorsRules: [
              {
                AllowedOrigins: ['${self:custom.CORS_ALLOW_ORIGIN}'],
                AllowedHeaders: ['*'],
                AllowedMethods: ['PUT', 'HEAD'],
                MaxAge: 3600,
                Id: 'CORSRuleId1'
              }
            ]}
        },
      },
      ImageQueue: {
        Type: 'AWS::SQS::Queue',
        Properties: {
          QueueName: '${self:custom.QUEUE_NAME}'
        },
      },
      GatewayResponse: {
        Type: 'AWS::ApiGateway::GatewayResponse',
        Properties: {
          ResponseParameters: {
            'gatewayresponse.header.Access-Control-Allow-Origin': '\'*\'',
            'gatewayresponse.header.Access-Control-Allow-Headers': '\'*\'',
          },
          ResponseType: 'EXPIRED_TOKEN',
          RestApiId: {
            Ref: 'ApiGatewayRestApi',
          },
          StatusCode: '401',
        },
      },
      AuthFailureGatewayResponse: {
        Type: 'AWS::ApiGateway::GatewayResponse',
        Properties: {
          ResponseParameters: {
            'gatewayresponse.header.Access-Control-Allow-Origin': '\'*\'',
            'gatewayresponse.header.Access-Control-Allow-Headers': '\'*\'',
          },
          ResponseType: 'UNAUTHORIZED',
          RestApiId: {
            Ref: 'ApiGatewayRestApi',
          },
          StatusCode: '401',
        },
      },
    },
  },
};

module.exports = serverlessConfiguration;

// export default serverlessConfiguration;
