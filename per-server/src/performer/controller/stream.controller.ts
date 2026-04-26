import { Body, Controller, Get, Param, ParseIntPipe, Post, Query, UseGuards } from '@nestjs/common';
import { StreamService } from '../service/stream.service';
import { FinishStreamDto, StreamDto } from '../dto/stream.dto';
import { Role, RoleGuard } from '../../shared/role.guard';

export interface IViewers {
  streamId: string;
  viewers: number;
}

export interface IPrivateRoomPayload {
  streamId: string;
  role: string;
  participantId: number;
}

@Controller()
export class StreamController {
  constructor(private readonly streamService: StreamService) {}

  @Role('performer')
  @UseGuards(RoleGuard)
  @Post('/performer/register-stream')
  registerStream(@Body() dto: StreamDto) {
    return this.streamService.createStream(dto);
  }

  @Role('performer', 'member')
  @UseGuards(RoleGuard)
  @Post('/performer/finish-stream')
  finishStream(@Body() dto: FinishStreamDto) {
    return this.streamService.setStreamFinished(dto.streamId);
  }

  @Get('/rooms/:category')
  getRoomsByCategory(@Param('category') category: string) {
    return this.streamService.getRoomsByCategory$(category);
  }

  @Get('/performers/rooms')
  getRooms() {
    return this.streamService.getRooms$();
  }

  @Get('/performers/:nickName')
  getPerformerRoomData(@Param('nickName') nickName: string) {
    return this.streamService.getPerformerRoomData$(nickName);
  }

  @Get('/private-stream')
  GetPrivateStream(@Query() payload: IPrivateRoomPayload){
    return this.streamService.getPrivateStreamData(payload)
  }

  @Get('/performers/:id/active')
  getActiveStream(@Param('id', ParseIntPipe) id: number) {
    return this.streamService.getStreamByPerformerId(id);
  }

  @Post('stream/viewers-counter')
  async updateMembersCounter(@Body() body: IViewers) {
    return this.streamService.updateViewers(body.streamId, body.viewers)
  }
}
