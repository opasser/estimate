import { forwardRef, Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { PaymentService } from './payment.service';
import { PaymentMod } from './model/payment.model';
import { PerformerMod } from '../performer/model/performer.model';
import { MemberMod } from '../member/model/member.model';
import { StreamMod } from '../performer/model/stream.model';
import { PaymentController } from './controller/payment.controller';
import { MemberModule } from '../member/member.module';
import { PerformerModule } from '../performer/performer.module';
import { CryptModule } from '../crypt/crypt.module';
import { PayoutMod } from './model/payout.mod';
import { HttpModule } from '@nestjs/axios';

@Module({
  controllers: [PaymentController],
  imports: [
    SequelizeModule.forFeature([
      PaymentMod,
      PerformerMod,
      MemberMod,
      StreamMod,
      PayoutMod
    ]),
    MemberModule,
    forwardRef(() => PerformerModule),
    CryptModule,
    HttpModule,
  ],
  providers: [PaymentService],
  exports: [PaymentService],
})
export class PaymentModule {}
