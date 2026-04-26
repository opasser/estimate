import { Table, Column, Model, DataType } from 'sequelize-typescript';

interface MembersCreationAttrs {
  provider_id: number;
  email: string;
  name: string;
  status: 'free' | 'premium';
  lang: string;
}

@Table({ tableName: 'members', timestamps: true })
export class MemberMod extends Model<MemberMod, MembersCreationAttrs> {
  @Column({
    type: DataType.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  })
  id: number;

  @Column({ type: DataType.INTEGER, allowNull: false })
  providerId: number;

  @Column({ type: DataType.STRING, allowNull: false, unique: true })
  email: string;

  @Column({ type: DataType.STRING, allowNull: false })
  name: string;

  @Column({ type: DataType.ENUM('free', 'premium'), allowNull: false })
  status: 'free' | 'premium';

  @Column({ type: DataType.TEXT, allowNull: false })
  lastToken: string;

  @Column({ type: DataType.FLOAT(8, 2), allowNull: false, defaultValue: 0 })
  balance: number;

  @Column({ type: DataType.STRING })
  lang: string;
}
