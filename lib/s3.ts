import {getSignedUrl} from '@aws-sdk/s3-request-presigner';
import {
  DeleteObjectCommand,
  DeleteObjectCommandOutput,
  GetObjectCommand,
  GetObjectCommandOutput,
  HeadObjectCommand,
  HeadObjectCommandOutput,
  ListObjectsCommand,
  PutObjectCommand,
  PutObjectCommandOutput,
  S3Client,
  S3ClientConfig
} from '@aws-sdk/client-s3';
import {join, parse} from 'path';
import {UPLOAD_PREFIX} from './constants';

const buildS3Client = (): S3Client => {
  let config: S3ClientConfig = {};
  if(process.env.NODE_ENV === 'dev') {
    config = {
      credentials: {
        accessKeyId: 'S3RVER', // This specific key is required when working offline
        secretAccessKey: 'S3RVER',
      },
      forcePathStyle: true,
      endpoint: 'http://localhost:4569'
    };
  }
  return new S3Client(config);
};

export const s3 = buildS3Client();

export interface ISendParams {
  base64Url: string;
  filename: string;
  contentType: string;
}

export interface IUploadParams {
  filename: string;
  contentType: string;
}

export interface IUploadUrl {
  filename: string;
  uploadUrl: string;
  expires: Date;
}

export interface IGetUrl {
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
  const command = new PutObjectCommand(params);
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


export const getSignedUploadUrl = async (uploadParams: IUploadParams): Promise<IUploadUrl> => {
  const expires = 600; // 10 minutes;
  const {filename, contentType } = uploadParams;
  const BUCKET_NAME = process.env.FILE_BUCKET_NAME || '';
  const uniqueFileName = getUniqueName(filename, new Date());
  const filenameKey = join(UPLOAD_PREFIX, uniqueFileName);
  const s3Params = {
    Bucket: BUCKET_NAME,
    Key: filenameKey,
    ContentType: contentType,
  };
  const command = new PutObjectCommand(s3Params);
  const uploadUrl = await getSignedUrl(s3, command, {expiresIn: expires});
  const expiresDate = new Date();
  expiresDate.setSeconds(expiresDate.getSeconds() + expires);
  return {
    uploadUrl: uploadUrl,
    filename: filenameKey,
    expires: expiresDate
  };
};

export const getSignedGetUrl = async (filename: string): Promise<IGetUrl> => {
  const expires = 600; // 10 minutes
  const BUCKET_NAME = process.env.FILE_BUCKET_NAME || '';
  const s3Params = {
    Bucket: BUCKET_NAME,
    Key: filename
  };
  const command = new GetObjectCommand(s3Params);
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
  const command = new HeadObjectCommand(s3Params);
  try {
    const metadata = await s3.send(command);
    return !!(metadata);
  } catch (e) {
    return false;
  }
};

export const getFileMetadata = async (filename: string): Promise<HeadObjectCommandOutput> => {
  const BUCKET_NAME = process.env.FILE_BUCKET_NAME || '';
  const s3Params = {
    Bucket: BUCKET_NAME,
    Key: filename,
  };
  const command = new HeadObjectCommand(s3Params);
  return await s3.send(command);
};

interface IUploadFile {
  filename: string;
  body: Buffer,
  contentType: string;
}

export const uploadFile = async (file: IUploadFile): Promise<PutObjectCommandOutput> => {
  const { filename, body, contentType } = file;
  const BUCKET_NAME = process.env.FILE_BUCKET_NAME || '';
  const s3Params = {
    Bucket: BUCKET_NAME,
    Key: filename,
    Body: body,
    ContentType: contentType
  };
  const command = new PutObjectCommand(s3Params);
  console.log('before command send ============== ');
  return await s3.send(command);
};

export const getFileObject = async(filename: string): Promise<GetObjectCommandOutput> => {
  const BUCKET_NAME = process.env.FILE_BUCKET_NAME || '';
  const s3Params = {
    Bucket: BUCKET_NAME,
    Key: filename,
  };
  const command = new GetObjectCommand(s3Params);
  return await s3.send(command);
};

export const deleteFile = async (filename: string): Promise<DeleteObjectCommandOutput> => {
  const BUCKET_NAME = process.env.FILE_BUCKET_NAME || '';
  const s3Params = {
    Bucket: BUCKET_NAME,
    Key: filename,
  };
  const command = new DeleteObjectCommand(s3Params);
  return await s3.send(command);
};

export const deleteDirectory = async (dirname: string): Promise<void> => {
  const BUCKET_NAME = process.env.FILE_BUCKET_NAME || '';
  const listObjectsParams = {
    Bucket: BUCKET_NAME,
    Prefix: dirname,
  };
  const listObjectsCommand = new ListObjectsCommand(listObjectsParams);
  const listObjects = await s3.send(listObjectsCommand);
  const { Contents: contents } = listObjects;

  if (!contents) return;

  const deletePromises: Promise<DeleteObjectCommandOutput>[] = [];
  contents.forEach(({ Key }) => {
    const deleteObjectParams = {
      Bucket: BUCKET_NAME,
      Key,
    };
    const deleteObjectCommand = new DeleteObjectCommand(deleteObjectParams);
    deletePromises.push(
      s3.send(deleteObjectCommand),
    );
  });

  await Promise.all(deletePromises);
};

