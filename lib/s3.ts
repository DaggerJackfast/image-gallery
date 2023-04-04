import {PutObjectRequest} from 'aws-sdk/clients/s3';
import {BUCKET_NAME, REGION, s3} from '../file/s3';

interface ISendParams {
  base64Url: string;
  filename: string;
  contentType: string;
}

export const sendBase64ToS3 = async (sendParams: ISendParams): Promise<string> => {
  const {base64Url, filename, contentType} = sendParams;
  const decodedFile = Buffer.from(base64Url.replace(/^data:image\/\w+;base64,/, ''), 'base64');
  const params: PutObjectRequest = {
    Bucket: BUCKET_NAME,
    Key: filename,
    Body: decodedFile,
    ContentType: contentType
  };
  const uploadResult = await s3.upload(params).promise();
  return uploadResult.Location;
};
interface IUploadParams {
  filename: string;
  contentType: string;
}

interface IUpload {
  filename: string;
  url: string;
  uploadUrl: string;
  expires: Date;
}
export const getUploadUrl = async (uploadParams: IUploadParams): Promise<IUpload> => {
  const expires = 600; // 10 minutes;
  const {filename, contentType} = uploadParams;
  const s3Params = {
    Bucket: BUCKET_NAME,
    Key: filename,
    // ACL: event.body.isPublic ? 'public-read' : null,
    ContentType: contentType,
    Expires: expires
  };
  const uploadUrl = s3.getSignedUrl('putObject', s3Params);
  const expiresDate = new Date();
  expiresDate.setSeconds(expiresDate.getSeconds() + expires);
  const url = `https://${BUCKET_NAME}.s3.${REGION}.amazonaws.com/${filename}`;
  return {
    uploadUrl: uploadUrl,
    filename: filename,
    url: url,
    expires: expiresDate
  };
};
