import { Role, RoleGuard } from '../../shared/role.guard';
import { Controller, Delete, Get, Param, ParseIntPipe, Query, UseGuards } from '@nestjs/common';
import { MemberService } from '../../member/service/member.service';

@Role('admin')
@UseGuards(RoleGuard)
@Controller('/admin')
export class MemberTableController {

  constructor(
    private memberService: MemberService,
  ) {}

  @Get('/members')
  async members(
    @Query('subStr') subStr: string,
    @Query('page') page: number,
    @Query('limit') limit: number,
  ) {
    return await this.memberService.getAllOrSearch(subStr, page, limit);
  }

  @Delete('/members/:id/delete')
  async deleteMember(@Param('id', ParseIntPipe) id: number) {
    return await this.memberService.delete(id);
  }
}
