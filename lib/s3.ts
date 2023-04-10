import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import * as AWS from '@aws-sdk/client-s3';
import {parse} from 'path';
export const s3 = new AWS.S3({
  // s3ForcePathStyle: true,
  // accessKeyId: 'S3RVER', // This specific key is required when working offline
  // secretAccessKey: 'S3RVER',
  // signatureVersion: 'v4',
  // endpoint: new AWS.Endpoint('http://localhost:4569'),
});

interface ISendParams {
  base64Url: string;
  filename: string;
  contentType: string;
}

interface IUploadParams {
  filename: string;
  contentType: string;
}

interface IUploadUrl {
  filename: string;
  url: string;
  uploadUrl: string;
  expires: Date;
}

interface IGetUrl {
  filename: string;
  url: string;
  expires: Date;
}

export const sendBase64ToS3 = async (sendParams: ISendParams): Promise<string> => {
  const {base64Url, filename, contentType} = sendParams;
  const decodedFile = Buffer.from(base64Url.replace(/^data:image\/\w+;base64,/, ''), 'base64');

  const BUCKET_NAME = process.env.FILE_BUCKET_NAME || '';
  const params = {
    Bucket: BUCKET_NAME,
    Key: filename,
    Body: decodedFile,
    ContentType: contentType
  };
  const command = new AWS.PutObjectCommand(params);
  const uploadResult = await s3.send(command);
  console.log('uploadResult: ', JSON.stringify(uploadResult, null, 4));
  return filename; // TODO: change to uploadResult property
};

const getUniqueName = (fileName: string, datetime: Date, prefix = ''): string => {
  const extension = parse(fileName).ext;
  const name = parse(fileName).name;
  const timestamp = datetime.getTime().toString();
  return `${prefix}${name}_${timestamp}${extension}`;

};

export const getPresignedUploadUrl = async (uploadParams: IUploadParams): Promise<IUploadUrl> => {
  const expires = 600; // 10 minutes;
  const {filename, contentType} = uploadParams;
  const BUCKET_NAME = process.env.FILE_BUCKET_NAME || '';
  const REGION = process.env.RUNTIME_REGION;
  const uniqueFileName = getUniqueName(filename, new Date());
  const s3Params = {
    Bucket: BUCKET_NAME,
    Key: uniqueFileName,
    // ACL: event.body.isPublic ? 'public-read' : null,
    ContentType: contentType,
  };
  const command = new AWS.PutObjectCommand(s3Params);
  const uploadUrl = await getSignedUrl(s3,command, {expiresIn: expires});
  const expiresDate = new Date();
  expiresDate.setSeconds(expiresDate.getSeconds() + expires);
  const url = `https://${BUCKET_NAME}.s3.${REGION}.amazonaws.com/${uniqueFileName}`;
  return {
    uploadUrl: uploadUrl,
    filename: uniqueFileName,
    url: url,
    expires: expiresDate
  };
};

export const getPresignedGetUrl = async (filename: string): Promise<IGetUrl> => {
  const expires = 600; // 10 minutes
  const BUCKET_NAME = process.env.FILE_BUCKET_NAME || '';
  const s3Params = {
    Bucket: BUCKET_NAME,
    Key: filename
  };
  const command = new AWS.GetObjectCommand(s3Params);
  const getUrl = await getSignedUrl(s3, command, {expiresIn: expires});
  const expiresDate = new Date();
  expiresDate.setSeconds(expiresDate.getSeconds() + expires);
  return {
    filename,
    url: getUrl,
    expires: expiresDate
  };
};

export const checkFileIsExists = async (filename: string): Promise<boolean> => {
  const BUCKET_NAME = process.env.FILE_BUCKET_NAME || '';
  const s3Params = {
    Bucket: BUCKET_NAME,
    Key: filename,
  };
  const command = new AWS.HeadObjectCommand(s3Params);
  try {
    const metadata = await s3.send(command);
    return !!(metadata);
  }catch(e) {
    return false;
  }
};

export const getFileMetadata = async (filename: string): Promise<unknown> => {
  const BUCKET_NAME = process.env.FILE_BUCKET_NAME || '';
  const s3Params = {
    Bucket: BUCKET_NAME,
    Key: filename,
  };
  const command = new AWS.HeadObjectCommand(s3Params);
  return await s3.send(command);
};

