import {APIGatewayProxyEvent, APIGatewayProxyResult} from 'aws-lambda';
import {connectToDatabase} from '../../../database/connector';

export const getCount = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
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
