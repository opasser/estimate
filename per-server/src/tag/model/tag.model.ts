import { BelongsToMany, Column, DataType, Model, Table } from 'sequelize-typescript';
import { PerformerMod } from '../../performer/model/performer.model';
import { TagPerformerModel } from './tag-performer.model';

export interface TagCreationAttr {
  name: string,
  title: string,
  description: string,
  seoTitle: string,
  seoDescription: string,
  seoKeywords: string,
  seoH1: string,
}

@Table({ tableName: 'tags', timestamps: true })
export class TagMod extends Model<TagMod, TagCreationAttr> {
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
  seoTitle: string;

  @Column({ type: DataType.TEXT, unique: false })
  seoDescription: string;

  @Column({ type: DataType.STRING, unique: false })
  seoKeywords: string;

  @Column({ type: DataType.STRING, unique: false })
  seoH1: string;

  @BelongsToMany(() => PerformerMod, () => TagPerformerModel)
  performers: PerformerMod[];
}
