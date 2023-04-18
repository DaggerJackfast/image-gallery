import {APIGatewayProxyEvent, APIGatewayProxyHandler, APIGatewayProxyResult} from 'aws-lambda';
import {connectToDatabase} from '../../../database/connector';
import {getSignedGetUrl} from '../../../lib/s3';
import {getThumbnailUrl} from '../../../lib/thumbnail';
import { middyfy } from '../../../lib/lambda';
import { MiddyfiedHandler } from '@middy/core';

const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  try {
    const {Image} = await connectToDatabase();
    const userId = event.requestContext.authorizer?.principalId;
    const images = await Image.findAll({where: { user: userId }});
    const imagesWithUrl = await Promise.all(images.map(async(image) => {
      const url = await getSignedGetUrl(image.filename);
      const thumbnail = await getThumbnailUrl(image.filename);
      return {
        ...image.dataValues,
        url,
        thumbnail,
      };
    }));
    return {
      statusCode: 200,
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify(imagesWithUrl)
    };
  } catch(err) {
    console.log('getAll error: ', err);
    return {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      statusCode: err?.statusCode || '500',
      headers: { 'Content-Type': 'text/plain' },
      body: 'Could not get images.'
    };
  }
};

export const getAll = middyfy(handler as MiddyfiedHandler);