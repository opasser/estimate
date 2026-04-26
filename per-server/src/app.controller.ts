import { Controller, Get, Res } from '@nestjs/common';
import { AppService } from './app.service';
import { Response } from 'express';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getAppPage(@Res() res: Response): void {
    const filePath = this.appService.getAppPath();
    res.sendFile(filePath);
  }
}
