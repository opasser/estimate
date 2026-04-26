import { Module } from '@nestjs/common';
import { TagService } from './tag.service';
import { SequelizeModule } from '@nestjs/sequelize';
import { TagMod } from './model/tag.model';
import { TagPerformerModel } from './model/tag-performer.model';
import { TagController } from './controller/tag.controller';

@Module({
  controllers: [ TagController ],
  providers: [ TagService ],
  imports: [ SequelizeModule.forFeature([ TagMod, TagPerformerModel]) ],
  exports: [ TagService ]
})
export class TagModule {}
