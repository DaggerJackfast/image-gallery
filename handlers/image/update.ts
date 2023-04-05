import {APIGatewayProxyEvent, APIGatewayProxyResult} from 'aws-lambda';
import {connectToDatabase} from '../../database/connector';

export const update = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  try {
    const {Image} = await connectToDatabase();
    const imageId = event.pathParameters?.id;
    const input = JSON.parse(event?.body || '{}');
    const userId = event.requestContext.authorizer?.principalId;
    await Image.update(input, {where: {id: imageId, user: userId}});
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
