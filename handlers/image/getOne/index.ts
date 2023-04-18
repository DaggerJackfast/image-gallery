import { ORIGIN } from '../../../lib/constants';

export const getOneImage = {
  getImage: {
    handler: 'handlers/image/getOne/handler.getOne',
    events:[
      {
        http: {
          method: 'get',
          path: '/images/{id}',
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
