import { ORIGIN } from '../../../lib/constants';

export const getAllImages = {
  getImages: {
    handler: 'handlers/image/getAll/handler.getAll',
    events:[
      {
        http: {
          method: 'get',
          path: '/images',
          cors: {
            origin: ORIGIN,
            allowCredentials: true,
          },
          authorizer: 'auth',
        }
      }
    ]
  }
};
