import {connectToDatabase} from '../../../database/connector';

export const healthcheck = async () => {
  await connectToDatabase();
  return {
    statusCode: 200,
    body: JSON.stringify({ message: 'Connection successful.' })
  };
};

