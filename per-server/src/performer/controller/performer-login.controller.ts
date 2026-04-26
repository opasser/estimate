import { Body, Controller, Post } from '@nestjs/common';
import { PerformerService } from '../service/performer.service';
import { ILoginEntity } from '../../shared/entity.abstract.service';

@Controller('/performer-login')
export class PerformerLoginController {
  constructor(private performerService: PerformerService) {}

  @Post()
  async login(@Body() dto: ILoginEntity) {
    return this.performerService.login(dto);
  }
}
