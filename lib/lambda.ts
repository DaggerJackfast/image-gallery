import httpJsonBodyParser from '@middy/http-json-body-parser';
import httpErrorHandler from '@middy/http-error-handler';
import middy, {MiddyfiedHandler} from '@middy/core';

export const middyfy = (handler: MiddyfiedHandler) => {
  return middy(handler)
    .use(httpJsonBodyParser())
    .use(httpErrorHandler());
};
