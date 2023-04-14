import {join, parse} from 'path';
import {deleteDirectory, getFileObject, getSignedGetUrl, IGetUrl, uploadFile} from './s3';
import sharp from 'sharp';
import {THUMBNAIL_WIDTH, THUMBNAILS_PREFIX} from './constants';
import {sendQueueMessage} from './sqs';

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
  const thumbnailName = `thumbnail_${THUMBNAIL_WIDTH}_px${extension}`;
  const thumbnailDirectory = getThumbnailDirectory(filename);
  return join(thumbnailDirectory, thumbnailName);
};

export const getThumbnailDirectory = (filename: string): string => {
  const name = parse(filename).name;
  return join(THUMBNAILS_PREFIX, name);
};

export const getThumbnailUrl = async(filename: string): Promise<IGetUrl> => {
  const thumbnailFile = getThumbnailFilename(filename);
  return await getSignedGetUrl(thumbnailFile);
};

export const sendDeleteThumbnailTask = async(filename: string): Promise<void> => {
  const deleteTask = {filename};
  await sendQueueMessage(deleteTask);
};

export const deleteThumbnails = async (filename: string): Promise<void> => {
  const thumbnailDirectory = getThumbnailDirectory(filename);
  await deleteDirectory(thumbnailDirectory);
};
