import { BelongsTo, Column, DataType, ForeignKey, Model, Table } from 'sequelize-typescript';
import { PerformerMod } from '../../performer/model/performer.model';
import { CategoryMod } from './category.model';

export interface CategoryPerformerCreationAttr {
  id: number;
  performerId: number;
  categoryId: number;
}

@Table({ tableName: 'category-performer' })
export class CategoryPerformerModel extends Model<CategoryPerformerModel, CategoryPerformerCreationAttr> {
  @Column({
    type: DataType.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  })
  id: number;

  @ForeignKey(() => PerformerMod)
  @Column({ type: DataType.INTEGER, onDelete: 'CASCADE' })
  performerId: number;

  @ForeignKey(() => CategoryMod)
  @Column({ type: DataType.INTEGER, onDelete: 'CASCADE' })
  categoryId: number;

  @BelongsTo(() => PerformerMod)
  performer: PerformerMod;

  @BelongsTo(() => CategoryMod)
  category: CategoryMod;
}
