import { Module } from '@nestjs/common';
import { BannersService } from './banners.service';
import { SequelizeModule } from '@nestjs/sequelize';
import { BannerMod } from './model/banner.model';
import { BannerController } from './controller/banner.controller';

@Module({
  controllers: [BannerController],
  providers: [BannersService],
  imports: [
    SequelizeModule.forFeature([BannerMod])
  ],
  exports: [BannersService]
})
export class BannersModule {}
