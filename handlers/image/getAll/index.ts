export const getAllImages = {
  getImages: {
    handler: 'handlers/image/getAll/handler.getAll',
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
