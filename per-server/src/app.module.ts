import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ServeStaticModule } from '@nestjs/serve-static';
import { AdminModule } from './admin/admin.module';
import { CryptModule } from './crypt/crypt.module';
import { PerformerModule } from './performer/performer.module';
import { DatabaseModule } from './database/database.module';
import { RolesModule } from './roles/roles.module';
import { SeedersModule } from './seeders/seeders.module';
import { MemberModule } from './member/member.module';
import { ChatModule } from './chat/chat.module';
import { ConfigModule } from '@nestjs/config';
import { join } from 'path';
import { ImageModule } from './image/image.module';
import { VisionModule } from './vision/vision.module';
import { PaymentModule } from './payment/payment.module';
import * as process from 'node:process';
import { TokenRefreshGuard } from './shared/token-refresh-guard/token-refresh.guard';
import { APP_GUARD } from '@nestjs/core';
import { CategoryModule } from './category/category.module';
import { TagModule } from './tag/tag.module';
import { BannersModule } from './banners/banners.module';

@Module({
  imports: [
    ServeStaticModule.forRoot(
      {
        rootPath: join(process.cwd(), 'assets'),
        serveRoot: '/assets',
      },
      {
        rootPath: join(process.cwd(), '..', 'per-client/client/browser'),
        serveRoot: '/',
      },
      {
        rootPath: join(process.cwd(), '..', 'per-client/public'),
        serveRoot: '/',
      },
    ),
    ConfigModule.forRoot({
      envFilePath: `.${process.env.NODE_ENV}.env`,
      isGlobal: true,
    }),
    AdminModule,
    CryptModule,
    PerformerModule,
    DatabaseModule,
    RolesModule,
    SeedersModule,
    MemberModule,
    ChatModule,
    ImageModule,
    PaymentModule,
    VisionModule,
    CategoryModule,
    TagModule,
    BannersModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: TokenRefreshGuard,
    },
  ],
})
export class AppModule {}
