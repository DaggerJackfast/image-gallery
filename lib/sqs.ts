import {GetQueueUrlCommand, SendMessageCommand, SendMessageCommandOutput, SQSClient, SQSClientConfig} from '@aws-sdk/client-sqs';

const buildSQSClient = (): SQSClient => {
  let config: SQSClientConfig = {
    region: process.env.RUNTIME_REGION
  };
  if(process.env.NODE_ENV === 'dev') {
    config = {
      region: process.env.RUNTIME_REGION,
      credentials: {
        accessKeyId: 'root',
        secretAccessKey: 'root',
      },
      endpoint: 'http://localhost:9324',
      apiVersion: '2012-11-05'
    };
  }
  return new SQSClient(config);
};

export const sqs = buildSQSClient();

export const getQueueUrl = async () => {
  const sqsParams = {
    QueueName: process.env.QUEUE_NAME
  };
  const command = new GetQueueUrlCommand(sqsParams);
  return await sqs.send(command);
};

export const sendQueueMessage = async (message: object): Promise<SendMessageCommandOutput> => {
  const queueUrl = process.env.QUEUE_URL;
  const sqsParams = {
    DelaySeconds: 5,
    MessageBody: JSON.stringify(message),
    QueueUrl: queueUrl
  };
  const command = new SendMessageCommand(sqsParams);
  return await sqs.send(command);
};

