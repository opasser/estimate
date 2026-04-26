import {
  Column,
  DataType,
  ForeignKey,
  Model,
  Table,
} from 'sequelize-typescript';
import { RoleMod } from './roles.model';
import { AdminMod } from '../../admin/model/admin.model';
import { PerformerMod } from '../../performer/model/performer.model';
import { MemberMod } from '../../member/model/member.model';

@Table({ tableName: 'user-roles', timestamps: true })
export class UserRoleMod extends Model<UserRoleMod> {
  @Column({
    type: DataType.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  })
  id: number;

  @ForeignKey(() => RoleMod)
  @Column({ type: DataType.INTEGER, unique: false, onDelete: 'CASCADE' })
  roleId: number;

  @ForeignKey(() => AdminMod)
  @Column({ type: DataType.INTEGER, unique: false, onDelete: 'CASCADE' })
  adminId: number;

  @ForeignKey(() => PerformerMod)
  @Column({ type: DataType.INTEGER, unique: false, onDelete: 'CASCADE' })
  performerId: number;

  @ForeignKey(() => MemberMod)
  @Column({ type: DataType.INTEGER, unique: false, onDelete: 'CASCADE' })
  memberId: number;

  @Column({
    type: DataType.ENUM('admin', 'performer', 'member'),
    allowNull: false,
  })
  role: 'admin' | 'performer' | 'member';
}
