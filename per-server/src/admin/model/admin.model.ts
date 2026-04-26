import { Column, DataType, Table, Model } from 'sequelize-typescript';

export interface AdminCreationAttr {
  name: string;
  email: string;
  password: string;
}

@Table({ tableName: 'admins', timestamps: true })
export class AdminMod extends Model<AdminMod, AdminCreationAttr> {
  @Column({
    type: DataType.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  })
  id: number;

  @Column({ type: DataType.STRING, unique: true, allowNull: false })
  name: string;

  @Column({ type: DataType.STRING, unique: true, allowNull: false })
  email: string;

  @Column({ type: DataType.STRING, unique: false, allowNull: false })
  password: string;

  @Column({ type: DataType.DATE })
  lastLogin: Date;
}
