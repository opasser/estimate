import {
  BelongsTo,
  Column,
  DataType,
  ForeignKey,
  Model,
  Table,
} from 'sequelize-typescript';
import { PerformerMod } from './performer.model';
import { MemberMod } from '../../member/model/member.model';

export interface StreamCreationAttr {
  performerId: number;
  streamId: string;
  status: 'active' | 'finished';
  startTime: Date;
  endTime?: Date;
  maxViewers: number | null;
  currentViewers: number | null;
  privateWith?: number,
  privacy: 'public' | 'private';
}

@Table({ tableName: 'streams', timestamps: false })
export class StreamMod extends Model<StreamMod, StreamCreationAttr> {
  @Column({
    type: DataType.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  })
  id: number;

  @ForeignKey(() => PerformerMod)
  @Column({ type: DataType.INTEGER, allowNull: false, onDelete: 'CASCADE' })
  performerId: number;

  @Column({ unique: true, type: DataType.STRING, allowNull: false })
  streamId: string;

  @Column({ type: DataType.ENUM('active', 'finished'), allowNull: false })
  status: 'active' | 'finished';

  @Column({ type: DataType.DATE, allowNull: false })
  startTime: Date;

  @Column({ type: DataType.DATE })
  endTime: Date;

  @Column({ type: DataType.INTEGER })
  currentViewers: number;

  @Column({ type: DataType.INTEGER })
  maxViewers: number;

  @Column({ type: DataType.ENUM('public', 'private'), allowNull: false })
  privacy: 'public' | 'private';

  @ForeignKey(() => MemberMod)
  @Column({ type: DataType.INTEGER, onDelete: 'CASCADE' })
  privateWith: number;

  @BelongsTo(() => PerformerMod)
  performer: PerformerMod;

  @BelongsTo(() => MemberMod)
  member: MemberMod;
}
