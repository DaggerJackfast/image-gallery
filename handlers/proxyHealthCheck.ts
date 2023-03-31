import * as pg from 'pg';
import {APIGatewayProxyEvent, APIGatewayEventRequestContext, APIGatewayProxyResult} from 'aws-lambda';

export const handler = async (event: APIGatewayProxyEvent, context: APIGatewayEventRequestContext): Promise<APIGatewayProxyResult> => {
  console.log(JSON.stringify({ event, context }));

  console.log('Creating database client');
  const client = new pg.Client({
    database: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT ?? '5432'),
  });

  let response;
  try {
    console.log('Connecting to database');
    await client.connect();

    console.log('Quering the database');
    const { rowCount } = await client.query('SELECT $1::text AS message', ['Hello world!']);

    response = {
      statusCode: 200,
      body: JSON.stringify({
        serverTimestamp: new Date().toISOString(),
        db: rowCount === 1 ? 'Ok' : 'Fail'
      })
    };
  } catch (error) {
    console.error(error);
    response = {
      statusCode: 500,
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore // TODO: fix
      body: error?.message
    };
  } finally {
    console.log('Closing database connection');
    await client.end();
  }

  console.log(response);
  return response;
};
