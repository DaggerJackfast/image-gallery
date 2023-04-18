export const deleteThumbnail = {
  deleteThumbnail: {
    handler: 'handlers/image/deleteThumbnail/handler.deleteThumbnail',
    events: [
      {
        sqs: {
          enabled: true,
          // queueName: '${self:custom.QUEUE_NAME}',
          arn: {
            'Fn::GetAtt': ['ImageQueue', 'Arn']
          }
        }
      }
    ]
  }
};
