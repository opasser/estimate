import { Role, RoleGuard } from '../../shared/role.guard';
import {
  Body,
  Controller, Delete,
  Get,
  HttpException,
  HttpStatus,
  Param,
  ParseIntPipe,
  Post, Put,
  Query, UploadedFile, UploadedFiles,
  UseGuards, UseInterceptors,
} from '@nestjs/common';
import { PerformerService } from '../../performer/service/performer.service';
import { PerformerDto } from '../../performer/dto/performer.dto';
import { UpdatePerformerDto } from '../../performer/dto/update-performer.dto';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { ChangeImageOrderDto } from '../../image/dto/image.dto';
import { ImageService } from '../../image/service/image.service';
import { CategoryService } from '../../category/category.service';
import { TagService } from '../../tag/tag.service';

@Role('admin')
@UseGuards(RoleGuard)
@Controller('/admin')
export class PerformerTableController {
  constructor(
    private performersService: PerformerService,
    private imageService: ImageService,
    private categoryService: CategoryService,
    private tagService: TagService
  ) {}

  @Get('/performers')
  getAllPerformers(
    @Query('subStr') subStr: string,
    @Query('page') page: number,
    @Query('limit') limit: number,
  ) {
    return this.performersService.getAllOrSearch(subStr, page, limit);
  }

  @Get('/performers/:id')
  getPerformerById(@Param('id', ParseIntPipe) id: number) {
    return this.performersService.getPerformerForEdit(id);
  }

  @Put('/performers/:id/edit')
  async editPerformer(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdatePerformerDto) {
    await this.categoryService.setFeature(id, dto.category);

    await this.tagService.setFeature(id, dto.tag);

    return this.performersService.editEntity(id, dto);
  }

  @Post('/performers/registration')
  async registrationPerformer(@Body() dto: PerformerDto) {
    try {
      const result = await this.performersService.registration(dto);
      await this.categoryService.setFeature(result.id, dto.category);
      return result;
    }
    catch (error) {
      console.error('registrationPerformer =>', error);
      throw new HttpException(error.response, HttpStatus.BAD_REQUEST);
    }
  }

  @Delete('/performers/:id/delete')
  async deletePerformer(@Param('id', ParseIntPipe) id: number) {
    await this.imageService.deletePerformerAssets(id);

    return this.performersService.delete(id);
  }

  @Post('/performers/:id/save-avatar')
  @UseInterceptors(FileInterceptor('image', { storage: memoryStorage() }))
  async saveAvatar(
    @Param('id', ParseIntPipe) id: number,
    @UploadedFile() file: Express.Multer.File,
  ) {
    const imageUrl = await this.imageService.saveImage(id, file, 'avatar');

    return this.performersService.addAvatarUrl(id, imageUrl.path);
  }

  @Post('/performers/:id/save-portfolio')
  @UseInterceptors(FilesInterceptor('images', 25, { storage: memoryStorage() }))
  async savePortfolio(
    @Param('id', ParseIntPipe) id: number,
    @UploadedFiles() files: Express.Multer.File[],
    @Body('order') order: string[],
  ) {
    const orderMap = this.imageService.parseToMap(order);

    return await this.imageService.savePortfolio(id, files, orderMap);
  }

  @Delete('/performers/:id/portfolio/:imgId')
  async deleteImage(
    @Param('id', ParseIntPipe) performerId: number,
    @Param('imgId', ParseIntPipe) pictureId: number,
  ) {
    return this.imageService.deleteImageById(performerId, pictureId);
  }

  @Get('/performers/:id/portfolio')
  async getPortfolio(@Param('id', ParseIntPipe) id: number) {
    return await this.imageService.getGalleryById(id);
  }

  @Post('/performers/:id/portfolio/order')
  async changePortfolioOrder(
    @Param('id', ParseIntPipe) id: number,
    @Body('order') newImgOrder: ChangeImageOrderDto[],
  ) {
    return await this.imageService.updatePortfolioOrder(id, newImgOrder);
  }

}
