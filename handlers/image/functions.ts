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

export const getImages = {
  getImages: {
    handler: 'handlers/image/getAll.getAll',
    events:[
      {
        http: {
          method: 'get',
          path: '/images',
          cors: true,
          authorizer: 'auth',
        }
      }
    ]
  }
};
export const getImage = {
  getImages: {
    handler: 'handlers/image/getOne.getOne',
    events:[
      {
        http: {
          method: 'get',
          path: '/images/{id}',
          cors: true,
          authorizer: 'auth',
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
          authorizer: 'auth',
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
          authorizer: 'auth',
          cors: true
        }
      }
    ]
  }
};
