import { BelongsTo, Column, DataType, ForeignKey, Model, Table } from 'sequelize-typescript';
import { PerformerMod } from '../../performer/model/performer.model';
import { TagMod } from './tag.model';

export interface TagPerformerCreationAttr {
  id: number;
  performerId: number;
  tagId: number;
}

@Table({ tableName: 'tag-performer' })
export class TagPerformerModel extends Model<TagPerformerModel, TagPerformerCreationAttr> {
  @Column({
    type: DataType.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  })
  id: number;

  @ForeignKey(() => PerformerMod)
  @Column({ type: DataType.INTEGER, onDelete: 'CASCADE' })
  performerId: number;

  @ForeignKey(() => TagMod)
  @Column({ type: DataType.INTEGER, onDelete: 'CASCADE' })
  tagId: number;

  @BelongsTo(() => PerformerMod)
  performer: PerformerMod;

  @BelongsTo(() => TagMod)
  tag: TagMod;
}
