import {APIGatewayProxyEvent, APIGatewayProxyResult} from 'aws-lambda';
import {connectToDatabase} from '../../database/connector';

export const destroy = async(event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  const {Image} = await connectToDatabase();
  const imageId = event.pathParameters?.id;
  const userId = event.requestContext.authorizer?.principalId;
  const image = await Image.findOne({where: {id: imageId, user: userId}});
  await image?.destroy();
  return { statusCode: 204, body: '' };
};


