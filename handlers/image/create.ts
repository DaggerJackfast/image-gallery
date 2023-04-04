import {connectToDatabase} from '../../database/connector';
import {MiddyfiedHandler} from '@middy/core';
import {ValidatedEventAPIGatewayProxyEvent} from '../../lib/apiGateway';
import {FromSchema} from 'json-schema-to-ts';
import {middyfy} from '../../lib/lambda';
import {sendBase64ToS3} from '../../lib/s3';

export const imageSchema = {
  type: 'object',
  required: ['url', 'filename', 'contentType'],
  properties: {
    url: {
      type: 'string'
    },
    filename: {
      type: 'string',
    },
    contentType: {
      type: 'string'
    },
    description: {
      type: 'string'
    }
  }
} as const;

type ImageParams = FromSchema<typeof imageSchema>;

const handler: ValidatedEventAPIGatewayProxyEvent<ImageParams> = async (event) => {
  try {
    const {Image} = await connectToDatabase();
    const body = event.body;
    const {url: base64Url, filename, contentType, ...rest} = body;
    const location = await sendBase64ToS3({base64Url, filename, contentType});
    const imageInput = {...rest, url: location};
    const image = await Image.create(imageInput);
    return {
      statusCode: 201,
      body: JSON.stringify(image)
    };
  } catch (err) {
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


