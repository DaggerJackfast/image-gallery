import {connectToDatabase} from '../../database/connector';
import {MiddyfiedHandler} from '@middy/core';
import {ValidatedEventAPIGatewayProxyEvent} from '../../lib/apiGateway';
import {FromSchema} from 'json-schema-to-ts';
import {middyfy} from '../../lib/lambda';
import {checkFileIsExists, getPresignedGetUrl, sendBase64ToS3} from '../../lib/s3';

// TODO: move to separate modules
export const imageSchema = {
  type: 'object',
  required: ['filename'],
  properties: {
    filename: {
      type: 'string'
    },
    // filename: {
    //   type: 'string',
    // },
    // contentType: {
    //   type: 'string'
    // },
    description: {
      type: 'string'
    }
  }
} as const;

type ImageParams = FromSchema<typeof imageSchema>;

const handler: ValidatedEventAPIGatewayProxyEvent<ImageParams> = async (event) => {
  try {
    const userId = event.requestContext.authorizer?.principalId;
    if(!userId) {
      throw 'No user';
    }
    const {Image} = await connectToDatabase();
    const body = event.body;
    // const {url: base64Url, filename, contentType, ...rest} = body;
    // TODO: check image is exists in s3 bucket;
    // const location = await sendBase64ToS3({base64Url, filename, contentType});
    const {filename, ...rest} = body;
    // const isExists = await checkFileIsExists(body.url);
    // if(!isExists) {
    //   throw 'file not found';
    // }
    console.log('pregetUrl');
    const presignedUrl = await getPresignedGetUrl(filename);
    console.log('presignedUrl: ', presignedUrl);
    const imageInput = {...rest, url: filename, user: userId};
    const image = await Image.create(imageInput);
    return {
      statusCode: 201,
      body: JSON.stringify({...image, url: presignedUrl})
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


