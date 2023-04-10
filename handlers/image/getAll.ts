import {APIGatewayProxyEvent, APIGatewayProxyResult} from 'aws-lambda';
import {connectToDatabase} from '../../database/connector';
import {getSignedGetUrl} from '../../lib/s3';

export const getAll = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  try {
    const {Image} = await connectToDatabase();
    const userId = event.requestContext.authorizer?.principalId;
    const images = await Image.findAll({where: { user: userId }});
    const imagesWithUrl = await Promise.all(images.map(async(image) => {
      const url = await getSignedGetUrl(image.filename);
      return {
        ...image.dataValues,
        url
      };
    }));
    return {
      statusCode: 200,
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify(imagesWithUrl)
    };
  } catch(err) {
    console.log('getAll error: ', err);
    return {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      statusCode: err?.statusCode || '500',
      headers: { 'Content-Type': 'text/plain' },
      body: 'Could not get images.'
    };
  }
};
