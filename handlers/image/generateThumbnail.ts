import {getFileObject, THUMBNAILS_PREFIX, uploadFile} from '../../lib/s3';
import {S3Event} from 'aws-lambda';
import {join, parse} from 'path';
import sharp from 'sharp';

interface IThumbnailParams {
  filename: string;
  width: number;
  destination: string;
}

const processThumbnail = async (params: IThumbnailParams): Promise<void> => {
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

const handler = async (event: S3Event) => {
  try {
    const filename = decodeURIComponent(event.Records[0].s3.object.key.replace(/\+/g, ' '));
    const width = 200;
    const extension = parse(filename).ext;
    const name = parse(filename).name;
    const thumbnailName = `thumbnail_${width}_px${extension}`;
    const destination = join(THUMBNAILS_PREFIX, name, thumbnailName);
    await processThumbnail({
      filename,
      width,
      destination,
    });
    return destination;
  } catch(err) {
    console.log('generate err: ', err);
    throw err;
  }
};

export const generateThumbnail = handler;
