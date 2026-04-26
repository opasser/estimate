import {
  BelongsToMany,
  Column,
  DataType,
  Model,
  Table,
} from 'sequelize-typescript';
import { UserRoleMod } from './user-roles.model';
import { PerformerMod } from '../../performer/model/performer.model';
import { AdminMod } from '../../admin/model/admin.model';
import { MemberMod } from '../../member/model/member.model';

interface RoleCreationAttrs {
  value: string;
}

@Table({ tableName: 'roles' })
export class RoleMod extends Model<RoleMod, RoleCreationAttrs> {
  @Column({
    type: DataType.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  })
  id: number;

  @Column({
    type: DataType.ENUM('admin', 'performer', 'member'),
    allowNull: false,
  })
  value: 'admin' | 'performer' | 'member';

  @BelongsToMany(() => AdminMod, () => UserRoleMod)
  admins: AdminMod[];

  @BelongsToMany(() => PerformerMod, () => UserRoleMod)
  performers: PerformerMod[];

  @BelongsToMany(() => MemberMod, () => UserRoleMod)
  members: MemberMod[];
}
