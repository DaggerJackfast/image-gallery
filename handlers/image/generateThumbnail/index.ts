export const generateThumbnail = {
  generateThumbnail: {
    handler: 'handlers/image/generateThumbnail/handler.generateThumbnail',
    events: [
      {
        s3: {
          bucket: '${self:custom.FILE_BUCKET_NAME}',
          event: 's3:ObjectCreated:*',
          existing: true,
          rules: [
            {prefix: 'uploads/'}
          ]
        }
      }
    ]
  }
};
