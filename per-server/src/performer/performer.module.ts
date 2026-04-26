import { forwardRef, Module } from '@nestjs/common';
import { PerformerService } from './service/performer.service';
import { PerformerController } from './controller/performer.controller';
import { SequelizeModule } from '@nestjs/sequelize';
import { CryptModule } from '../crypt/crypt.module';
import { PerformerMod } from './model/performer.model';
import { RolesModule } from '../roles/roles.module';
import { PerformerLoginController } from './controller/performer-login.controller';
import { RoleMod } from '../roles/model/roles.model';
import { UserRoleMod } from '../roles/model/user-roles.model';
import { StreamMod } from './model/stream.model';
import { StreamService } from './service/stream.service';
import { StreamController } from './controller/stream.controller';
import { HttpModule } from '@nestjs/axios';
import { ScheduleModule } from '@nestjs/schedule';
import { ImageModule } from '../image/image.module';
import { PaymentModule } from '../payment/payment.module';
import { CategoryModule } from '../category/category.module';

@Module({
  controllers: [
    PerformerController,
    PerformerLoginController,
    StreamController,
  ],
  providers: [PerformerService, StreamService],
  imports: [
    SequelizeModule.forFeature([PerformerMod, RoleMod, UserRoleMod, StreamMod]),
    CryptModule,
    RolesModule,
    HttpModule,
    ImageModule,
    ScheduleModule.forRoot(),
    CategoryModule,
    forwardRef(() => PaymentModule),
  ],
  exports: [PerformerService, StreamService],
})
export class PerformerModule {}
