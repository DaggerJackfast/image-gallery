import {APIGatewayProxyEvent, APIGatewayProxyResult} from 'aws-lambda';
import {connectToDatabase} from '../../database/connector';

export const getAll = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  try {
    console.log('event: ', event);
    const {Image} = await connectToDatabase();
    const image = await Image.findAll();
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
