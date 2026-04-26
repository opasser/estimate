import { Module } from '@nestjs/common';
import { RolesService } from './roles.service';
import { SequelizeModule } from '@nestjs/sequelize';

import { AdminMod } from '../admin/model/admin.model';
import { PerformerMod } from '../performer/model/performer.model';
import { UserRoleMod } from './model/user-roles.model';
import { RoleMod } from './model/roles.model';

@Module({
  providers: [RolesService],
  imports: [
    SequelizeModule.forFeature([AdminMod, PerformerMod, UserRoleMod, RoleMod]),
  ],
  exports: [RolesService],
})
export class RolesModule {}
