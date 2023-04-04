import type { AWS } from '@serverless/typescript';
import secrets from './.secrets.json'; // TODO: usage serverless-dotenv-plugin
import fileBucketResources from './resources/fileBucketResources';


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
        '${self:custom.SUBNET4_ID}'
      ]
    },
    // TODO: can use serverless-iam-roles-per-function
    iamRoleStatements: [
      {
        Effect: 'Allow',
        Action: ['s3:Get*', 's3:Put*', 's3:DeleteObject'],
        Resource: 'arn:aws:s3:::${self:custom.FILE_BUCKET_NAME}/*'
      },
    ],
    environment: {
      NODE_ENV: '${opt:stage, \'dev\'}',
      // DB_NAME: '${self:custom.DB_NAME}_${opt:stage, \'dev\'}',
      DB_NAME: '${self:custom.DB_NAME}',
      DB_USERNAME: '${self:custom.DB_USERNAME}',
      DB_PASSWORD: '${self:custom.DB_PASSWORD}',
      DB_PORT: '${self:custom.DB_PORT}',
      DB_HOST: '${self:custom.DB_HOST}',
      FILE_BUCKET_NAME: '${self:custom.FILE_BUCKET_NAME}'
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
    DB_PORT: secrets.databasePort,
    DB_HOST: secrets.databaseHost,
    SECURITY_GROUP_ID: secrets.securityGroupId,
    SUBNET1_ID: secrets.subnet1Id,
    SUBNET2_ID: secrets.subnet2Id,
    SUBNET3_ID: secrets.subnet3Id,
    SUBNET4_ID: secrets.subnet4Id,
    FILE_BUCKET_NAME: 'image-gallery-files-${opt:stage, \'dev\'}',
    s3: { // TODO: delete for prod
      host: 'localhost',
      directory: '/tmp'
    }
  },
  plugins: [
    'serverless-esbuild',
    'serverless-offline',
    'serverless-s3-local' // TODO: delete for prod
  ],
  package: { individually: true },
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
      ],
    },
    healthCheckImage: {
      handler: 'handlers/image.healthcheck',
      events:[
        {
          http: {
            method: 'get',
            path: 'images-healthcheck',
            // cors: true,
          }
        }
      ]
    },
    // ...healthcheckImage,
    createImage: {
      handler: 'handlers/image.create',
      events:[
        {
          http: {
            method: 'post',
            path: 'images',
            // cors: true,
          }
        }
      ]
    },
    getImages: {
      handler: 'handlers/image.getAll',
      events:[
        {
          http: {
            method: 'get',
            path: '/images',
            // cors: true
          }
        }
      ]
    },
    getImage: {
      handler: 'handlers/image.getOne',
      events:[
        {
          http: {
            method: 'get',
            path: '/images/{id}',
            // cors: true
          }
        }
      ]
    },
    updateImage: {
      handler: 'handlers/image.update',
      events:[
        {
          http: {
            method: 'patch',
            path: 'images/{id}',
            // cors: true
          }
        }
      ]
    },
    deleteImage: {
      handler: 'handlers/image.destroy',
      events:[
        {
          http: {
            method: 'delete',
            path: 'images/{id}',
            // cors: true
          }
        }
      ]
    }
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
          BucketName: '${self:custom.FILE_BUCKET_NAME}'
        },
        // AccessControl: 'Private',
      }
    }

  }
};

module.exports = serverlessConfiguration;

// export default serverlessConfiguration;
