import { ORIGIN } from '../../../lib/constants';

export const getImagesCount = {
  getImagesCount: {
    handler: 'handlers/image/getCount/handler.getCount',
    events:[
      {
        http: {
          method: 'get',
          path: '/images-count',
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
