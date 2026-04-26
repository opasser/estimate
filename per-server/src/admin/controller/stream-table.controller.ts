import {
  Controller,
  Delete,
  Get,
  Param, ParseIntPipe,
  Query,
  UseGuards,
} from '@nestjs/common';
import { StreamService } from '../../performer/service/stream.service';
import { Role, RoleGuard } from '../../shared/role.guard';
import { ChatService } from '../../chat/service/chat.service';

@Role('admin')
@UseGuards(RoleGuard)
@Controller('/admin')
export class StreamTableController {
  constructor(
    private streamService: StreamService,
    private chatService: ChatService
  ) {}

  @Get('/active-streams')
  async activeStreams(
    @Query('subStr') subStr: string,
    @Query('page') page: number,
    @Query('limit') limit: number,
  ) {
    return await this.streamService.getAllOrSearch(subStr, page, limit);
  }

  @Delete('/active-streams/:id/delete')
  async deleteStream(@Param('id', ParseIntPipe) id: number) {
    return await this.streamService.delete(id);
  }
  @Get('/message-list')
  getMessagesListByStreamId(
    @Query('subStr') subStr: string,
    @Query('page') page: number,
    @Query('limit') limit: number,
    @Query('listId') listId: string,
  ) {
    return this.chatService.getAllOrSearch(subStr, page, limit, listId);
  }
}
