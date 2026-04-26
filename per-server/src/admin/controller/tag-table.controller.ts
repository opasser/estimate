import { Role, RoleGuard } from '../../shared/role.guard';
import {
  Body,
  Controller, Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { TagService } from '../../tag/tag.service';
import { CreateTagDto } from '../../tag/dto/create-tag.dto';
import { UpdateTagDto } from '../../tag/dto/update-tag.dto';

@Role('admin', 'performer')
@UseGuards(RoleGuard)
@Controller('/admin/tags')
export class TagsTableController {

  constructor(
    private tagService: TagService,
  ) {}

  @Get('')
  getAllTags(
    @Query('subStr') subStr: string,
    @Query('page') page: number,
    @Query('limit') limit: number,
  ) {
    return this.tagService.getAllOrSearch(subStr, page, limit);
  }

  @Post('/registration')
  create(@Body() createTagDto: CreateTagDto) {
    return this.tagService.addFeature(createTagDto);
  }


  @Get('/:id')
  getCategoryById(@Param('id', ParseIntPipe) id: number) {
    return this.tagService.getForEdit(id);
  }

  @Put('/:id/edit')
  async editTag(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateTagDto) {
    return this.tagService.edit(id, dto);
  }

  @Delete('/:id/delete')
  async deleteTag(@Param('id', ParseIntPipe) id: number) {
    return this.tagService.delete(id);
  }
}
