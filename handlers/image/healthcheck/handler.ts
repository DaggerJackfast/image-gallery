import { APIGatewayProxyHandler } from 'aws-lambda';
import {connectToDatabase} from '../../../database/connector';
import { middyfy } from '../../../lib/lambda';
import { MiddyfiedHandler } from '@middy/core';

const handler:APIGatewayProxyHandler  = async () => {
  await connectToDatabase();
  return {
    statusCode: 200,
    body: JSON.stringify({ message: 'Connection successful.' })
  };
};
export const healthcheck = middyfy(handler as MiddyfiedHandler);

