import httpJsonBodyParser from '@middy/http-json-body-parser';
import middy, {MiddyfiedHandler} from '@middy/core';
import cors from '@middy/http-cors';

export const middyfy = (handler: MiddyfiedHandler) => {
  return middy(handler)
    .use(httpJsonBodyParser())
    .use(cors());
  // .use(httpErrorHandler());
};
