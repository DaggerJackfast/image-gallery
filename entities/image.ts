import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../database/database.config';

interface ImageAttributes {
  id?: string;
  filename: string;
  // url?: string;
  description?: string;
  user?: string; // TODO: change to required field
}

type ImageInput = Optional<ImageAttributes, 'id' | 'description' | 'user'>
type ImageOutput = Required<ImageAttributes>


// TODO: add autocalculated presignedUrl;
class Image extends Model<ImageAttributes, ImageInput> implements ImageAttributes {
  public id!: string;
  public filename!: string;
  public description!: string;
  // public url!: string;
  public user!: string;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Image.init({
  id: {
    allowNull: false,
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  filename: DataTypes.TEXT,
  description: { type: DataTypes.TEXT, defaultValue: ''},
  user: { type: DataTypes.STRING },
  // url: {
  //   type: DataTypes.VIRTUAL,
  //   async get() {
  //     return await getSignedGetUrl(this.filename);
  //   },
  //   set() {
  //     throw new Error('Do not try to set the `url` value!');
  //   }
  // }
}, {
  timestamps: true,
  tableName: 'images',
  sequelize,
});


export default Image;
