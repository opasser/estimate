import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { SequelizeModule } from '@nestjs/sequelize';
import { AdminMod } from '../admin/model/admin.model';
import { PerformerMod } from '../performer/model/performer.model';
import { UserRoleMod } from '../roles/model/user-roles.model';
import { RoleMod } from '../roles/model/roles.model';
import { StreamMod } from '../performer/model/stream.model';
import { MemberMod } from '../member/model/member.model';
import { MessageMod } from '../chat/model/message.model';
import { ImageMod } from '../image/model/image.model';
import { PaymentMod } from '../payment/model/payment.model';
import { PayoutMod } from '../payment/model/payout.mod';
import { CategoryMod } from '../category/model/category.model';
import { CategoryPerformerModel } from '../category/model/category-performer.model';
import { TagMod } from '../tag/model/tag.model';
import { TagPerformerModel } from '../tag/model/tag-performer.model';
import { BannerMod } from '../banners/model/banner.model';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: `.${process.env.NODE_ENV}.env`,
      isGlobal: true,
    }),
    SequelizeModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        dialect: 'postgres',
        host: configService.get<string>('POSTGRES_HOST'),
        port: configService.get<number>('POSTGRES_PORT'),
        username: configService.get<string>('POSTGRES_USER'),
        password: configService.get<string>('POSTGRES_PASSWORD'),
        database: configService.get<string>('POSTGRES_DB'),
        schema: configService.get<string>('SCHEMA'),
        models: [
          AdminMod,
          PerformerMod,
          UserRoleMod,
          RoleMod,
          StreamMod,
          MemberMod,
          MessageMod,
          ImageMod,
          PaymentMod,
          PayoutMod,
          CategoryMod,
          CategoryPerformerModel,
          TagMod,
          TagPerformerModel,
          BannerMod
        ],
        // autoLoadModels: true,
        // synchronize: true,
        // sync: { alter: true },
        logging: false,
      }),
    }),
  ],
})
export class DatabaseModule {
  constructor() {}
}
