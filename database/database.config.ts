import {Sequelize} from 'sequelize';
import pg from 'pg';

const CURRENT_LAMBDA_FUNCTION_TIMEOUT = 5000;


export const loadSequelize = (): Sequelize => {
  const dbName = process.env.DB_NAME;
  const dbUsername = process.env.DB_USERNAME;
  const dbPassword = process.env.DB_PASSWORD;
  const dbHost = process.env.DB_HOST;
  const dbPort = parseInt(process.env.DB_PORT || '5432');
  return new Sequelize({
    database: dbName,
    dialect: 'postgres',
    dialectModule: pg,
    username: dbUsername,
    password: dbPassword,
    host: dbHost,
    port: dbPort,
    pool: {
      max: 2,
      min: 0,
      idle: 0,
      acquire: 3000,
      evict: CURRENT_LAMBDA_FUNCTION_TIMEOUT
    }
  });
};

const sequelize = loadSequelize();


export default sequelize;

