import { ORIGIN } from '../../../lib/constants';

export const updateImage = {
  updateImage: {
    handler: 'handlers/image/update/handler.update',
    events:[
      {
        http: {
          method: 'patch',
          path: 'images/{id}',
          authorizer: 'auth',
          cors: {
            origin: ORIGIN,
            allowCredentials: true,
          },
        }
      }
    ]
  },
};
