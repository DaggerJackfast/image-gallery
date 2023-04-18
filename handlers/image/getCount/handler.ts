import {APIGatewayProxyEvent, APIGatewayProxyHandler, APIGatewayProxyResult} from 'aws-lambda';
import {connectToDatabase} from '../../../database/connector';
import {middyfy} from '../../../lib/lambda';
import { MiddyfiedHandler } from '@middy/core';

const handler:APIGatewayProxyHandler  = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  try {
    const {Image} = await connectToDatabase();
    const userId = event.requestContext.authorizer?.principalId;
    const count = await Image.count({where: {user: userId}});
    return {
      statusCode: 200,
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({count})
    };
  } catch (err) {
    console.log('getCount error: ', err);
    return {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      statusCode: err?.statusCode || '500',
      headers: {'Content-Type': 'text/plain'},
      body: 'Could not get images.'
    };
  }
};

export const getCount = middyfy(handler as MiddyfiedHandler);

