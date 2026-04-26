import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { VisionService } from '../service/vision.service';

@Controller('vision')
export class VisionController {

  constructor(private visionService: VisionService) {}

  @Post('/login')
  async login(@Body() authData: Vision.IAuthBody) {
    return await this.visionService.login(authData)
  }

  @Get('/rooms')
  async getRooms() {
    return this.visionService.getRoomsForShowcase()
  }

  @Get('/performer/:name')
  async getPerformerContentByName(@Param('name') name: string) {
    return this.visionService.getPerformerContentByName(name)
  }
}

