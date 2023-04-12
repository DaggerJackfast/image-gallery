import {APIGatewayProxyEvent, APIGatewayProxyResult} from 'aws-lambda';
import {connectToDatabase} from '../../../database/connector';
import {HTTPError} from '../../../lib/errors';
import {getThumbnailUrl} from '../../../lib/thumbnail';
import {getSignedGetUrl} from '../../../lib/s3';

export const getOne = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  try {
    const {Image} = await connectToDatabase();
    const imageId = event.pathParameters?.id;
    const userId = event.requestContext.authorizer?.principalId;
    const image = await Image.findOne({where: {id: imageId, user: userId}});
    if(!image) {
      throw new HTTPError(404, `Image with id: ${image} not found`);
    }
    const [url, thumbnail] = await Promise.all([
      getSignedGetUrl(image.filename),
      getThumbnailUrl(image.filename),
    ]);
    const imageWithUrls = {
      ...image,
      thumbnail,
      url,
    };
    return {
      statusCode: 200,
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify(imageWithUrls)
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
