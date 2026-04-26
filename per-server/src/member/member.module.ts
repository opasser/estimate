import { Module } from '@nestjs/common';
import { MemberController } from './controller/member.controller';
import { MemberMod } from './model/member.model';
import { SequelizeModule } from '@nestjs/sequelize';
import { RoleMod } from '../roles/model/roles.model';
import { UserRoleMod } from '../roles/model/user-roles.model';
import { HttpModule } from '@nestjs/axios';
import { MemberService } from './service/member.service';
import { CryptModule } from '../crypt/crypt.module';
import { RolesModule } from '../roles/roles.module';

@Module({
  controllers: [MemberController],
  imports: [
    SequelizeModule.forFeature([MemberMod, RoleMod, UserRoleMod]),
    HttpModule,
    CryptModule,
    RolesModule,
  ],
  providers: [MemberService],
  exports: [MemberService],
})
export class MemberModule {}
