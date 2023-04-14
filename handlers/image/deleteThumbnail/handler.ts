import {deleteThumbnails} from '../../../lib/thumbnail';
import {SQSEvent} from 'aws-lambda';


const handler = async (event: SQSEvent) => {
  const body = JSON.parse(event.Records[0].body);
  const filename = body.filename;
  await deleteThumbnails(filename);
  return {
    statusCode: 200,
    body: JSON.stringify({message: 'Thumbnail successfully deleted'})
  };
};

export const deleteThumbnail = handler;
