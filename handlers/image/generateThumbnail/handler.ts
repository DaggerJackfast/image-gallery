import {S3Event} from 'aws-lambda';
import {getThumbnailFilename, processThumbnail} from '../../../lib/thumbnail';
import {THUMBNAIL_WIDTH} from '../../../lib/constants';


const handler = async (event: S3Event) => {
  try {
    const filename = decodeURIComponent(event.Records[0].s3.object.key.replace(/\+/g, ' '));
    const destination = getThumbnailFilename(filename);
    await processThumbnail({
      filename,
      width: THUMBNAIL_WIDTH,
      destination,
    });
    return destination;
  } catch(err) {
    console.log('generate err: ', err);
    throw err;
  }
};

export const generateThumbnail = handler;
