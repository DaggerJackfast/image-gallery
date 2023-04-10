import {connectToDatabase} from '../../database/connector';
import {ValidatedEventAPIGatewayProxyEvent} from '../../lib/apiGateway';
import {FromSchema} from 'json-schema-to-ts';
import {middyfy} from '../../lib/lambda';
import {MiddyfiedHandler} from '@middy/core';

export const updateImageSchema = {
  type: 'object',
  required: ['filename'],
  properties: {
    filename: {
      type: 'string',
    },
    description: {
      type: 'string'
    }
  }
} as const;

type UpdateImageParams = FromSchema<typeof updateImageSchema>

// TODO: add replace image when update
const handler: ValidatedEventAPIGatewayProxyEvent<UpdateImageParams> = async (event) => {
  try {
    const {Image} = await connectToDatabase();
    const imageId = event.pathParameters?.id;
    const body = event.body;
    const userId = event.requestContext.authorizer?.principalId;
    await Image.update(body, {where: {id: imageId, user: userId}});
    const image = await Image.findOne({where: {id: imageId, user: userId}});
    return {
      statusCode: 200,
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify(image)
    };
  } catch(err) {
    return {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      statusCode: err?.statusCode || '500',
      headers: { 'Content-Type': 'text/plain' },
      body: 'Could not create the note.'
    };
  }
};
export const update = middyfy(handler as MiddyfiedHandler);


