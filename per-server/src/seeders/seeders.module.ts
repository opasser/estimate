import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { AdminMod } from '../admin/model/admin.model';
import { CryptModule } from '../crypt/crypt.module';
import { DatabaseModule } from '../database/database.module';
import { AdminSeeder } from './admin.seeder';
import { RoleSeeder } from './roles.seeder';
import { RoleMod } from '../roles/model/roles.model';
import { PerformerMod } from '../performer/model/performer.model';
import { PerformerSeeder } from './performer.seeder';

@Module({
  imports: [
    SequelizeModule.forFeature([AdminMod, RoleMod, PerformerMod]),
    CryptModule,
    DatabaseModule,
  ],
  providers: [AdminSeeder, RoleSeeder, PerformerSeeder],
  exports: [AdminSeeder, RoleSeeder, PerformerSeeder],
})
export class SeedersModule {}
