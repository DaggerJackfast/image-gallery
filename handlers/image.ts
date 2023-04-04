import {connectToDatabase} from '../database/connector';
import {APIGatewayProxyEvent, APIGatewayProxyResult} from 'aws-lambda';
import { BUCKET_NAME, s3 } from '../file/s3';
import {PutObjectRequest} from 'aws-sdk/clients/s3';

// const HTTPError = (statusCode: number, message: string) => {
//   const error = new Error(message);
//   // eslint-disable-next-line @typescript-eslint/ban-ts-comment
//   // @ts-ignore
//   error.statusCode = statusCode;
//   return error;
// };

class HTTPError extends Error {
  public readonly statusCode: number;
  constructor(statusCode: number, message: string) {
    super(message);
    this.statusCode = statusCode;
  }
}


export const healthcheck = async () => {
  console.log('healthcheck started.');
  await connectToDatabase();
  console.log('Connection successful.');
  return {
    statusCode: 200,
    body: JSON.stringify({ message: 'Connection successful.' })
  };
};

export const create = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  try {
    const { Image } = await connectToDatabase();
    const body = event.body || '{}';
    const { url: base64Url, filename, contentType, ...rest } = JSON.parse(body);
    const decodedFile = Buffer.from(base64Url.replace(/^data:image\/\w+;base64,/, ''), 'base64');
    const params: PutObjectRequest = {
      Bucket: BUCKET_NAME,
      Key: filename,
      Body: decodedFile,
      ContentType: contentType
    };
    const uploadResult = await s3.upload(params).promise();
    const imageInput = {...rest, url: uploadResult.Location};
    const image = await Image.create(imageInput);
    return {
      statusCode: 201,
      body: JSON.stringify(image)
    };
  } catch (err) {
    return {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      statusCode: err.statusCode || '500',
      headers: { 'Content-Type': 'text/plain' },
      body: 'Could not create the image.'
    };
  }
};

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


export const getOne = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  try {
    const {Image} = await connectToDatabase();
    const imageId = event.pathParameters?.id;
    const image = await Image.findByPk(imageId);
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

export const destroy = async(event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  const {Image} = await connectToDatabase();
  const imageId = event.pathParameters?.id;
  const image = await Image.findByPk(imageId);
  await image?.destroy();
  return { statusCode: 204, body: '' };
};


export const healthcheckImage = {healthCheckImage: {
  handler: 'handlers/image.healthcheck',
  events:[
    {
      http: {
        method: 'get',
        path: 'images-healthcheck',
        // cors: true,
      }
    }
  ]
}};
