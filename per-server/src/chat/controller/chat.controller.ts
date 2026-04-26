import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { MessageDto } from '../dto/chat.dto';
import { ChatService } from '../service/chat.service';
import { RequestMessages } from '../model/message.model';

@Controller()
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Post('/chat-message')
  registerMessage(@Body() message: MessageDto) {
    return this.chatService.registerMessage(message);
  }

  @Get('/chat-message')
  getMessages(@Query() streamData: RequestMessages) {
    return this.chatService.getMessages(streamData);
  }
}
