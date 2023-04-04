import {imageSchema} from './create';
export const healthcheckImage = {
  healthCheckImage: {
    handler: 'handlers/image/healthcheck.healthcheck',
    events:[
      {
        http: {
          method: 'get',
          path: 'images-healthcheck',
          cors: true,
        }
      }
    ]
  }};

export const createImage = {
  createImage: {
    handler: 'handlers/image/create.create',
    events:[
      {
        http: {
          method: 'post',
          path: 'images',
          cors: true,
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

export const getImage = {
  getImages: {
    handler: 'handlers/image/getAll.getAll',
    events:[
      {
        http: {
          method: 'get',
          path: '/images',
          cors: true
        }
      }
    ]
  }
};

export const updateImage = {
  updateImage: {
    handler: 'handlers/image/update.update',
    events:[
      {
        http: {
          method: 'patch',
          path: 'images/{id}',
          cors: true
        }
      }
    ]
  },
};

export const deleteImage = {
  deleteImage: {
    handler: 'handlers/image/destroy.destroy',
    events:[
      {
        http: {
          method: 'delete',
          path: 'images/{id}',
          cors: true
        }
      }
    ]
  }
};
