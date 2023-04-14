import {createImage} from './create';
import {deleteImage} from './destroy';
import {getImagesCount} from './getCount';
import {getAllImages} from './getAll';
import {getOneImage} from './getOne';
import {generateThumbnail} from './generateThumbnail';
import {getUploadUrl} from './getUploadUrl';
import {healthcheckImage} from './healthcheck';
import {updateImage} from './update';
import {deleteThumbnail} from './deleteThumbnail';

export default {
  ...createImage,
  ...deleteImage,
  ...deleteThumbnail,
  ...getImagesCount,
  ...getAllImages,
  ...getOneImage,
  ...getUploadUrl,
  ...generateThumbnail,
  ...healthcheckImage,
  ...updateImage
};
