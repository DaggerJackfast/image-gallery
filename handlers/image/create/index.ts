import {imageSchema} from './schema';

export const createImage = {
  createImage: {
    handler: 'handlers/image/create/handler.create',
    events:[
      {
        http: {
          method: 'post',
          path: 'images',
          cors: true,
          authorizer: 'auth',
          request: {
            schemas: {
              'application/json': imageSchema
            }
          }
        }
      }
    ]
  }
};
