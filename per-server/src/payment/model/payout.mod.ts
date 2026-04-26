import { BelongsTo, Column, DataType, ForeignKey, Model, Table } from 'sequelize-typescript';
import { PerformerMod } from '../../performer/model/performer.model';

export interface PayoutCreationAttr {
  performerId: number | null;
  comment: string | null;
  amount: number;
  date: Date;
}

@Table({ tableName: 'payouts', createdAt: true, updatedAt: false })
export class PayoutMod extends Model<PayoutMod, PayoutCreationAttr> {
  @Column({
    type: DataType.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  })
  id: number;

  @ForeignKey(() => PerformerMod)
  @Column({ type: DataType.INTEGER, onDelete: 'SET NULL' })
  performerId: number | null;

  @BelongsTo(() => PerformerMod)
  performer: PerformerMod;

  @Column({ type: DataType.STRING })
  comment: string;

  @Column({ type: DataType.DECIMAL(8, 2), allowNull: false })
  amount: number;
}
