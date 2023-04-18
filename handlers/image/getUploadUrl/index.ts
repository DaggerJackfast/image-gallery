import { ORIGIN } from '../../../lib/constants';
import {uploadSchema} from './schema';

export const getUploadUrl = {
  getUploadUrl: {
    handler: 'handlers/image/getUploadUrl/handler.getUploadUrl',
    events: [
      {
        http: {
          method: 'post',
          path: 'images-upload-url/',
          authorizer: 'auth',
          cors: {
            origin: ORIGIN,
            allowCredentials: true,
          },
          request: {
            schemas: {
              'application/json': uploadSchema
            }
          }
        }
      }
    ]
  }
};
