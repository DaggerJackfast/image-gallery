import {imageSchema} from './create';
import {uploadSchema} from './getUploadUrl';
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
  getImage: {
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

export const getUploadUrl = {
  getUploadUrl: {
    handler: 'handlers/image/getUploadUrl.getUploadUrl',
    events: [
      {
        http: {
          method: 'post',
          path: 'images-upload-url/',
          authorizer: 'auth',
          cors: true,
          request: {
            schemas: {
              'application/json': uploadSchema
            }
          }
        }
      }
    ]
  }
};

export const generateThumbnail = {
  generateThumbnail: {
    handler: 'handlers/image/generateThumbnail.generateThumbnail',
    events: [
      {
        s3: {
          bucket: '${self:custom.FILE_BUCKET_NAME}',
          event: 's3:ObjectCreated:*',
          existing: true,
          rules: [
            {prefix: 'uploads/'}
          ]
        }
      }
    ]
  }
};

export default {
  ...createImage,
  ...getImages,
  ...getImage,
  ...updateImage,
  ...deleteImage,
  ...getUploadUrl,
  ...healthcheckImage,
  ...generateThumbnail
};
