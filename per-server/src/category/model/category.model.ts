import { BelongsToMany, Column, DataType, Model, Table } from 'sequelize-typescript';
import { PerformerMod } from '../../performer/model/performer.model';
import { CategoryPerformerModel } from './category-performer.model';

export interface CategoryCreationAttr {
  name: string,
  url: string,
  title: string,
  description: string,
  thumbnail: string,
  seoTitle: string,
  seoDescription: string,
  seoKeywords: string,
  seoH1: string,
}

@Table({ tableName: 'categories', timestamps: true })
export class CategoryMod extends Model<CategoryMod, CategoryCreationAttr> {
  @Column({
    type: DataType.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  })
  id: number;

  @Column({ type: DataType.STRING, unique: true,  allowNull: false })
  name: string;

  @Column({ type: DataType.STRING, unique: true })
  url: string;

  @Column({ type: DataType.STRING, unique: false })
  title: string;

  @Column({ type: DataType.TEXT, unique: false })
  description: string;

  @Column({ type: DataType.STRING, unique: false })
  thumbnail: string;

  @Column({ type: DataType.STRING, unique: false })
  seoTitle: string;

  @Column({ type: DataType.TEXT, unique: false })
  seoDescription: string;

  @Column({ type: DataType.STRING, unique: false })
  seoKeywords: string;

  @Column({ type: DataType.STRING, unique: false })
  seoH1: string;

  @BelongsToMany(() => PerformerMod, () => CategoryPerformerModel)
  performers: PerformerMod[];
}
