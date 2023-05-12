import imageFunctions from './image';

export default {
  auth: {
    handler: 'handlers/auth0/auth.auth',
    timeout: 30,
  },
  index: {
    handler: 'index.handler',
    events: [
      {
        http: {
          method: 'get',
          path: '/',
          cors: true,
        },
      },
    ],
  },
  ...imageFunctions,
};