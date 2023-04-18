import {APIGatewayProxyEvent, APIGatewayProxyHandler, APIGatewayProxyResult} from 'aws-lambda';
import {connectToDatabase} from '../../../database/connector';
import {deleteFile} from '../../../lib/s3';
import {sendDeleteThumbnailTask} from '../../../lib/thumbnail';
import { middyfy } from '../../../lib/lambda';
import { MiddyfiedHandler } from '@middy/core';

const handler: APIGatewayProxyHandler = async(event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  const {Image} = await connectToDatabase();
  const imageId = event.pathParameters?.id;
  const userId = event.requestContext.authorizer?.principalId;
  const image = await Image.findOne({where: {id: imageId, user: userId}});
  if(!image) {
    return { statusCode: 404, body: 'Not Found'};
  }
  await image?.destroy();
  await deleteFile(image.filename);
  await sendDeleteThumbnailTask(image.filename);
  return { statusCode: 204, body: '' };
};

export const destroy = middyfy(handler as MiddyfiedHandler);
