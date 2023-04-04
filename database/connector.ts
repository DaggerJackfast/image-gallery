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
// TODO: add using pool


// module.exports.handler = async function (event, callback) {
//   // re-use the sequelize instance across invocations to improve performance
//   if (!sequelize) {
//     sequelize = await loadSequelize();
//   } else {
//     // restart connection pool to ensure connections are not re-used across invocations
//     sequelize.connectionManager.initPools();
//
//     // restore `getConnection()` if it has been overwritten by `close()`
//     if (sequelize.connectionManager.hasOwnProperty("getConnection")) {
//       delete sequelize.connectionManager.getConnection;
//     }
//   }
//
//   try {
//     return await doSomethingWithSequelize(sequelize);
//   } finally {
//     // close any opened connections during the invocation
//     // this will wait for any in-progress queries to finish before closing the connections
//     await sequelize.connectionManager.close();
//   }
// };
