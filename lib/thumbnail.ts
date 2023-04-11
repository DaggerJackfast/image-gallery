import {join, parse} from 'path';
import {getFileObject, getSignedGetUrl, IGetUrl, uploadFile} from './s3';
import sharp from 'sharp';
import {THUMBNAIL_WIDTH, THUMBNAILS_PREFIX} from './constants';

export interface IThumbnailParams {
  filename: string;
  width: number;
  destination: string;
}


export const processThumbnail = async (params: IThumbnailParams): Promise<void> => {
  const {filename, width, destination} = params;
  const extension = parse(destination).ext;
  if(!extension) {
    throw new Error('Could not determine the image extension');
  }
  const allowedExtensions = ['.png', '.jpg', '.jpeg', '.webp'];
  if(!allowedExtensions.includes(extension.toLowerCase())){
    throw new Error(`Unsupported image type: ${extension}`);
  }
  const original = await getFileObject(filename);
  const contentType = original.ContentType as string;
  const bodyByteArray = await  original.Body?.transformToByteArray(); // TODO: has potential problem with memory limit
  const destinationBuffer = await sharp(bodyByteArray).resize(width).toBuffer();
  await uploadFile({filename: destination, body: destinationBuffer, contentType});
};

export const getThumbnailFilename = (filename: string): string => {
  const extension = parse(filename).ext;
  const name = parse(filename).name;
  const thumbnailName = `thumbnail_${THUMBNAIL_WIDTH}_px${extension}`;
  return join(THUMBNAILS_PREFIX, name, thumbnailName);
};

export const getThumbnailUrl = async(filename: string): Promise<IGetUrl> => {
  const thumbnailFile = getThumbnailFilename(filename);
  return await getSignedGetUrl(thumbnailFile);
};
