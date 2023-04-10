import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../database/database.config';

interface ImageAttributes {
  id?: string;
  url: string;
  description?: string;
  user?: string; // TODO: change to required field
}

type ImageInput = Optional<ImageAttributes, 'id' | 'description' | 'user'>
type ImageOutput = Required<ImageAttributes>


// TODO: add autocalculated presignedUrl;
class Image extends Model<ImageAttributes, ImageInput> implements ImageAttributes {
  public id!: string;
  public url!: string;
  public description!: string;
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
  url: DataTypes.TEXT,
  description: { type: DataTypes.TEXT, defaultValue: ''},
  user: { type: DataTypes.STRING }
}, {
  timestamps: true,
  tableName: 'images',
  sequelize,
});


export default Image;
