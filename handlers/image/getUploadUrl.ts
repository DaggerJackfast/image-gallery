import {getSignedUploadUrl} from '../../lib/s3';
import {ValidatedEventAPIGatewayProxyEvent} from '../../lib/apiGateway';
import {FromSchema} from 'json-schema-to-ts';
import {middyfy} from '../../lib/lambda';
import {MiddyfiedHandler} from '@middy/core';


export const uploadSchema = {
  type: 'object',
  required: ['filename', 'contentType'],
  properties: {
    filename: {
      type: 'string'
    },
    contentType: {
      type: 'string'
    }
  }
} as const;

type UploadParams = FromSchema<typeof uploadSchema>;
export const handler: ValidatedEventAPIGatewayProxyEvent<UploadParams> = async (event) => {
  try {
    const body = event.body;
    const uploadParams = {
      filename: body.filename,
      contentType: body.contentType,
    };
    const url = await getSignedUploadUrl(uploadParams);
    return {
      statusCode: 200,
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify(url)
    };
  } catch(err) {
    return {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      statusCode: err?.statusCode || '500',
      headers: { 'Content-Type': 'text/plain' },
      body: 'Could not generate upload url.'
    };
  }
};

export const getUploadUrl = middyfy(handler as MiddyfiedHandler);
