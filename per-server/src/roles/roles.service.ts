import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { UserRoleMod } from './model/user-roles.model';
import { RoleMod } from './model/roles.model';

@Injectable()
export class RolesService {
  constructor(
    @InjectModel(RoleMod) private roleRepository: typeof RoleMod,
    @InjectModel(UserRoleMod) private userRoleRepository: typeof UserRoleMod,
  ) {}

  async getRoleByValue(value: string) {
    return await this.roleRepository.findOne({ where: { value } });
  }

  async saveUserRole(entityId: number, role: RoleMod) {
    const userRoleValue = {} as UserRoleMod;

    try {
      userRoleValue[`${role.value}Id`] = Number(entityId);

      userRoleValue.role = role.value;
      userRoleValue.roleId = role.id;

      await this.userRoleRepository.upsert(userRoleValue);
    } catch (error) {
      console.error('SAVE_ROLE_ERROR', error);
    }
  }
}
