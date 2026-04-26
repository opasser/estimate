import { Module } from '@nestjs/common';
import { CryptService } from './crypt.service';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModuleOptions } from '@nestjs/jwt';

@Module({
  imports: [
    JwtModule.registerAsync({
      global: true,
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_ACCESS_TOKEN_SECRET'),
         signOptions: {
        expiresIn: configService.get<string>('JWT_ACCESS_TOKEN_EXPIRATION_TIME') as JwtModuleOptions['signOptions']['expiresIn'],
        },
      }),
    }),
  ],
  providers: [CryptService],
  exports: [CryptService],
})
export class CryptModule {}
