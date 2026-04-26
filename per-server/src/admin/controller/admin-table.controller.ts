import { Role, RoleGuard } from '../../shared/role.guard';
import { Body, Controller, Delete, Get, Param, ParseIntPipe, Post, Put, Query, UseGuards } from '@nestjs/common';
import { AdminService } from '../service/admin.service';
import { UpdateAdminDto } from '../dto/update-admin.dto';
import { AdminDto } from '../dto/admin.dto';

@Role('admin')
@UseGuards(RoleGuard)
@Controller('/admin')
export class AdminTableController {
  constructor(
    private adminService: AdminService,
  ) {}

  @Get('/admins')
  getAllAdmins(
    @Query('subStr') subStr: string,
    @Query('page') page: number,
    @Query('limit') limit: number,
  ) {
    return this.adminService.getAllOrSearch(subStr, page, limit);
  }

  @Get('/admins/:id')
  getAdminById(@Param('id', ParseIntPipe) id: number) {
    return this.adminService.getById(id);
  }

  @Put('/admins/:id/edit')
  editAdmin(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateAdminDto) {
    return this.adminService.editEntity(id, dto);
  }

  @Post('/admins/registration')
  registrationAdmin(@Body() dto: AdminDto) {
    return this.adminService.registration(dto);
  }

  @Delete('/admins/:id/delete')
  deleteAdmin(@Param('id', ParseIntPipe) id: number) {
    return this.adminService.delete(id);
  }
}
