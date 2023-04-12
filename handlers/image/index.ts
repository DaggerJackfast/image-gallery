import {createImage} from './create';
import {deleteImage} from './destroy';
import {generateThumbnail} from './generateThumbnail';
import {getAllImages} from './getAll';
import {getOneImage} from './getOne';
import {getUploadUrl} from './getUploadUrl';
import {healthcheckImage} from './healthcheck';
import {updateImage} from './update';

export default {
  ...createImage,
  ...deleteImage,
  ...generateThumbnail,
  ...getAllImages,
  ...getOneImage,
  ...getUploadUrl,
  ...healthcheckImage,
  ...updateImage
};
