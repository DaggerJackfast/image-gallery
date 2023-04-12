import {connectToDatabase} from '../../../database/connector';
import {MiddyfiedHandler} from '@middy/core';
import {ValidatedEventAPIGatewayProxyEvent} from '../../../lib/apiGateway';
import {FromSchema} from 'json-schema-to-ts';
import {middyfy} from '../../../lib/lambda';
import { getSignedGetUrl } from '../../../lib/s3';
import {getThumbnailUrl} from '../../../lib/thumbnail';
import {imageSchema} from './schema';


type ImageParams = FromSchema<typeof imageSchema>;

const handler: ValidatedEventAPIGatewayProxyEvent<ImageParams> = async (event) => {
  try {
    const userId = event.requestContext.authorizer?.principalId;
    if(!userId) {
      throw 'No user';
    }
    const {Image} = await connectToDatabase();
    const body = event.body;
    const {filename, ...rest} = body;
    const imageInput = {...rest, filename, user: userId};
    const [url, thumbnail] = await Promise.all([
      getSignedGetUrl(filename),
      getThumbnailUrl(filename),
    ]);
    const image = await Image.create(imageInput);
    return {
      statusCode: 201,
      body: JSON.stringify({...image.dataValues, url, thumbnail})
    };
  } catch (err) {
    console.log('createImage error: ', err);
    return {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      statusCode: err.statusCode || '500',
      headers: {'Content-Type': 'text/plain'},
      body: 'Could not create the image.'
    };
  }
};

export const create = middyfy(handler as MiddyfiedHandler);


