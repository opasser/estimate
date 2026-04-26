import { Role, RoleGuard } from '../../shared/role.guard';
import {
  Body,
  Controller, Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Put,
  Query, UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { CategoryService } from '../../category/category.service';
import { CreateCategoryDto } from '../../category/dto/create-category.dto';
import { UpdateCategoryDto } from '../../category/dto/update-category.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { ImageService } from '../../image/service/image.service';

@Role('admin')
@UseGuards(RoleGuard)
@Controller('/admin/categories')
export class CategoriesTableController {

  constructor(
    private categoryService: CategoryService,
    private imageService: ImageService,
  ) {}

  @Get('')
  getAllCategories(
    @Query('subStr') subStr: string,
    @Query('page') page: number,
    @Query('limit') limit: number,
  ) {
    return this.categoryService.getAllOrSearch(subStr, page, limit);
  }

  @Post('/registration')
  create(@Body() createCategoryDto: CreateCategoryDto) {
    return this.categoryService.addFeature(createCategoryDto);
  }


  @Get('/:id')
  getCategoryById(@Param('id', ParseIntPipe) id: number) {
    return this.categoryService.getForEdit(id);
  }

  @Put('/:id/edit')
  async editCategory(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateCategoryDto) {
    return this.categoryService.edit(id, dto);
  }

  @Post('/:id/save-image')
  @UseInterceptors(FileInterceptor('image', { storage: memoryStorage() }))
  async saveAvatar(
    @Param('id', ParseIntPipe) id: number,
    @UploadedFile() file: Express.Multer.File,
  ) {
    const imageUrl = await this.imageService.saveCategoryImage(id, file);

    return this.categoryService.addCategoryThumbnail(id, imageUrl.path);
  }

  @Delete('/:id/delete')
  async deleteCategory(@Param('id', ParseIntPipe) id: number) {
    const category = await this.categoryService.getById(id);

    if (category.thumbnail) {
      await this.imageService.deleteAssetsImg(category.thumbnail);
    }
    return this.categoryService.delete(id);
  }
}
