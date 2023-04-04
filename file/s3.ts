import AWS from 'aws-sdk';

export const BUCKET_NAME = process.env.FILE_BUCKET_NAME || '';
export const REGION = process.env.REGION;
console.log('AWS REGION ========> : ', REGION);
export const s3 = new AWS.S3({
  s3ForcePathStyle: true,
  accessKeyId: 'S3RVER', // This specific key is required when working offline
  secretAccessKey: 'S3RVER',
  endpoint: new AWS.Endpoint('http://localhost:4569'),
});
