import sequelize from './database.config';
import Image from '../entities/image';

const connection = { isConnected: false };
export const connectToDatabase = async () => {
  const Models = {
    Image,
  };
  if(connection.isConnected) {
    console.log('Using existing connection');
    return Models;
  }
  await sequelize.sync();
  await sequelize.authenticate();
  connection.isConnected = true;
  return Models;
};
