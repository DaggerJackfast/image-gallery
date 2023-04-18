import { ORIGIN } from '../../../lib/constants';

export const healthcheckImage = {
  healthCheckImage: {
    handler: 'handlers/image/healthcheck/handler.healthcheck',
    events: [
      {
        http: {
          method: 'get',
          path: 'images-healthcheck',
          cors: {
            origin: ORIGIN,
            allowCredentials: true,
          },
        }
      }
    ]
  }
};
