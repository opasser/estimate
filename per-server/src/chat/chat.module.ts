import { Module } from '@nestjs/common';
import { ChatController } from './controller/chat.controller';
import { SequelizeModule } from '@nestjs/sequelize';
import { MessageMod } from './model/message.model';
import { ChatService } from './service/chat.service';
import { StreamMod } from '../performer/model/stream.model';

@Module({
  imports: [SequelizeModule.forFeature([MessageMod, StreamMod])],
  controllers: [ChatController],
  providers: [ChatService],
  exports: [ChatService],
})
export class ChatModule {}
