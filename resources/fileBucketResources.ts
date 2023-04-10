export default {
  Resources: {
    FileBucket: {
      Type: 'AWS::S3::Bucket',
      Properties: {
        BucketName: '${self:custom.FILE_BUCKET_NAME}'
      },
      AccessControl: 'Private',
    }
  }
};
