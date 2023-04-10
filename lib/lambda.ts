import httpJsonBodyParser from '@middy/http-json-body-parser';
import middy, {MiddyfiedHandler} from '@middy/core';

export const middyfy = (handler: MiddyfiedHandler) => {
  return middy(handler)
    .use(httpJsonBodyParser());
  // .use(httpErrorHandler());
};
