import { Module } from '@nestjs/common';
import { ImageService } from './service/image.service';
import { SequelizeModule } from '@nestjs/sequelize';
import { PerformerMod } from '../performer/model/performer.model';
import { ImageMod } from './model/image.model';
import { ImageController } from './controller/image.controller';

@Module({
  controllers: [ImageController],
  imports: [SequelizeModule.forFeature([PerformerMod, ImageMod])],
  providers: [ImageService],
  exports: [ImageService],
})
export class ImageModule {}
