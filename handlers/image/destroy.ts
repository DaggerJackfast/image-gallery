import {APIGatewayProxyEvent, APIGatewayProxyResult} from 'aws-lambda';
import {connectToDatabase} from '../../database/connector';

export const destroy = async(event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  const {Image} = await connectToDatabase();
  const imageId = event.pathParameters?.id;
  const image = await Image.findByPk(imageId);
  await image?.destroy();
  return { statusCode: 204, body: '' };
};


