import { Body, Controller, Post } from '@nestjs/common';
import { AdminService } from '../service/admin.service';
import { ILoginEntity } from '../../shared/entity.abstract.service';

@Controller('/admin-login')
export class AdminLoginController {
  constructor(private adminService: AdminService) {}

  @Post()
  async login(@Body() dto: ILoginEntity) {
    return this.adminService.login(dto);
  }
}
