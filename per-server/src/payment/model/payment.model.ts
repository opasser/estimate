import {
  BelongsTo,
  Column,
  DataType,
  ForeignKey,
  Model,
  Table,
} from 'sequelize-typescript';
import { PerformerMod } from '../../performer/model/performer.model';
import { MemberMod } from '../../member/model/member.model';
import { StreamMod } from '../../performer/model/stream.model';
import { PayoutMod } from './payout.mod';

export interface PaymentCreationAttr {
  type: 'tips' | 'c2c' | 'stream';
  performerId: number | null;
  memberId: number | null;
  streamId: string | null;
  amount: number;
  performerRate: number;
}

@Table({ tableName: 'payments', timestamps: true })
export class PaymentMod extends Model<PaymentMod, PaymentCreationAttr> {
  @Column({ type: DataType.INTEGER, autoIncrement: true, primaryKey: true })
  id: number;

  @Column({ type: DataType.ENUM('tips', 'c2c', 'stream'), allowNull: false })
  type: 'tips' | 'c2c' | 'stream';

  @ForeignKey(() => PerformerMod)
  @Column({ type: DataType.INTEGER, onDelete: 'SET NULL' })
  performerId: number | null;

  @BelongsTo(() => PerformerMod)
  performer: PerformerMod;

  @ForeignKey(() => MemberMod)
  @Column({ type: DataType.INTEGER, onDelete: 'SET NULL' })
  memberId: number | null;

  @BelongsTo(() => MemberMod)
  member: MemberMod;

  @ForeignKey(() => StreamMod)
  @Column({ type: DataType.STRING, onDelete: 'SET NULL' })
  streamId: string | null;

  @BelongsTo(() => StreamMod)
  stream: StreamMod;

  @Column({ type: DataType.FLOAT, allowNull: false })
  amount: number;

  @Column({ type: DataType.FLOAT, allowNull: false })
  performerRate: number;

  @ForeignKey(() => PayoutMod)
  @Column({ type: DataType.INTEGER, onDelete: 'SET NULL' })
  payoutId: number | null;

  @BelongsTo(() => PayoutMod)
  payout: PayoutMod;
}
