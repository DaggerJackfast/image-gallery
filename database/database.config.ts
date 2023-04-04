import { Sequelize } from 'sequelize';
const CURRENT_LAMBDA_FUNCTION_TIMEOUT = 5000;


export const loadSequelize = (): Sequelize => {
  const dbName = process.env.DB_NAME;
  const dbUsername = process.env.DB_USERNAME;
  const dbPassword = process.env.DB_PASSWORD;
  const dbHost = process.env.DB_HOST;
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  const dbPort = parseInt(process.env.DB_PORT);
  const sequelize = new Sequelize({
    // TODO: database settings;
    database: dbName,
    dialect: 'postgres',
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
  return sequelize;
};

const sequelize = loadSequelize();


export default sequelize;

