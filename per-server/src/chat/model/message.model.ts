import {
  Table,
  Column,
  Model,
  DataType,
  ForeignKey,
} from 'sequelize-typescript';
import { StreamMod } from '../../performer/model/stream.model';

export interface MessageCreationAttr {
  message: string;
  streamId: string;
  participantId: number;
  nickName: string;
  role:  'member'| 'performer' | 'tips-action';
  privacy: 'private' | 'public';
  privateTo: string;
}

export type RequestMessages = Pick<
  MessageCreationAttr,
  'streamId' | 'participantId' | 'role' | 'nickName'
>;

@Table({ tableName: 'messages', timestamps: true })
export class MessageMod extends Model<MessageMod, MessageCreationAttr> {
  @ForeignKey(() => StreamMod)
  @Column({
    type: DataType.STRING,
    allowNull: false,
    onDelete: 'CASCADE',
  })
  streamId: string;

  @Column({ type: DataType.TEXT, allowNull: false })
  message: string;

  @Column({ type: DataType.INTEGER, allowNull: false })
  participantId: number;

  @Column({ type: DataType.STRING, allowNull: false })
  nickName: string;

  @Column({ type: DataType.ENUM('member', 'performer', 'tips-action'), allowNull: false })
  role: 'member'| 'performer' | 'tips-action';

  @Column({ type: DataType.STRING })
  privateTo: string;

  @Column({ type: DataType.ENUM('private', 'public'), allowNull: false })
  privacy: 'private' | 'public';
}
