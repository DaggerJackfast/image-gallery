export const getImagesCount = {
  getImagesCount: {
    handler: 'handlers/image/getCount/handler.getCount',
    events:[
      {
        http: {
          method: 'get',
          path: '/images-count',
          cors: true,
          authorizer: 'auth',
        }
      }
    ]
  }
};
