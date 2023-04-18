import { ORIGIN } from '../../../lib/constants';

export const deleteImage = {
  deleteImage: {
    handler: 'handlers/image/destroy/handler.destroy',
    events:[
      {
        http: {
          method: 'delete',
          path: 'images/{id}',
          authorizer: 'auth',
          cors: {
            origin: ORIGIN,
            allowCredentials: true,
          }
        }
      }
    ]
  }
};
