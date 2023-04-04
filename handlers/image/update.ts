import {APIGatewayProxyEvent, APIGatewayProxyResult} from 'aws-lambda';
import {connectToDatabase} from '../../database/connector';

export const update = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  try {
    const {Image} = await connectToDatabase();
    const imageId = event.pathParameters?.id;
    const input = JSON.parse(event?.body || '{}');
    await Image.update(input, {where: {id: imageId}});
    const image = await Image.findByPk(imageId);
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
