import {
  Table,
  Column,
  Model,
  DataType,
  ForeignKey,
  BelongsTo,
} from 'sequelize-typescript';
import { PerformerMod } from '../../performer/model/performer.model';

export interface ImageCreationAttr {
  performerId: number;
  thumbnailPath: string;
  imagePath: string;
  order: number;
  thumbH: number;
  thumbW: number;
  imgH: number;
  imgW: number;
}

@Table({
  tableName: 'images',
  timestamps: true,
})
export class ImageMod extends Model<ImageMod, ImageCreationAttr> {
  @Column({ type: DataType.INTEGER, primaryKey: true, autoIncrement: true })
  id: number;

  @ForeignKey(() => PerformerMod)
  @Column({ type: DataType.INTEGER, allowNull: false, onDelete: 'CASCADE' })
  performerId: number;

  @Column({ type: DataType.STRING, allowNull: false })
  thumbnailPath: string;

  @Column({ type: DataType.STRING, allowNull: false })
  imagePath: string;

  @Column({ type: DataType.INTEGER, allowNull: false })
  order: number;

  @Column({ type: DataType.INTEGER, allowNull: false })
  thumbH: number;

  @Column({ type: DataType.INTEGER, allowNull: false })
  thumbW: number;

  @Column({ type: DataType.INTEGER, allowNull: false })
  imgH: number;

  @Column({ type: DataType.INTEGER, allowNull: false })
  imgW: number;

  @BelongsTo(() => PerformerMod)
  performer: PerformerMod;
}
