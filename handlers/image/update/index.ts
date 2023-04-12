export const updateImage = {
  updateImage: {
    handler: 'handlers/image/update/handler.update',
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
