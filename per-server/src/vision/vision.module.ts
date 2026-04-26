import { Module } from '@nestjs/common';
import { VisionService } from './service/vision.service';
import { VisionController } from './controller/vision.controller';
import { HttpModule } from '@nestjs/axios';
import { CacheModule } from '@nestjs/cache-manager';

@Module({
  imports: [ CacheModule.register({
    ttl: 21600000
  }), HttpModule ],
  providers: [VisionService],
  controllers: [VisionController]
})
export class VisionModule {}
