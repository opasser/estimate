import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { RoleMod } from '../roles/model/roles.model';

@Injectable()
export class RoleSeeder {
  constructor(@InjectModel(RoleMod) private roleModel: typeof RoleMod) {}

  async run() {
    await this.createRoleIfNotExists('admin');
    await this.createRoleIfNotExists('performer');
    await this.createRoleIfNotExists('member');
  }

  private async createRoleIfNotExists(roleValue: string) {
    const [, created] = await this.roleModel.findOrCreate({
      where: { value: roleValue },
      defaults: { value: roleValue },
    });

    if (created) {
      console.log(`***seeding: Role ${roleValue} created.***`);
    } else {
      console.log(`***seeding: Role ${roleValue} already exists.***`);
    }
  }
}
