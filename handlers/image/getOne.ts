import {APIGatewayProxyEvent, APIGatewayProxyResult} from 'aws-lambda';
import {connectToDatabase} from '../../database/connector';
import {HTTPError} from '../../lib/errors';

export const getOne = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  try {
    const {Image} = await connectToDatabase();
    const imageId = event.pathParameters?.id;
    const userId = event.requestContext.authorizer?.principalId;
    const image = await Image.findOne({where: {id: imageId, user: userId}});
    if(!image) {
      throw new HTTPError(404, `Image with id: ${image} not found`);
    }
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
