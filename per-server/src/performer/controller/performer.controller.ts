import {
  Controller,
  Post,
  Body,
  Param,
  UseGuards,
  Get,
  Put,
  UseInterceptors,
  UploadedFile,
  Delete,
  UploadedFiles, ParseIntPipe,
} from '@nestjs/common';

import { Role, RoleGuard } from '../../shared/role.guard';
import { PerformerService } from '../service/performer.service';
import { UpdatePerformerDto } from '../dto/update-performer.dto';
import { memoryStorage } from 'multer';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { ImageService } from '../../image/service/image.service';
import { ChangeImageOrderDto } from '../../image/dto/image.dto';
import { PerformerIdGuard } from '../performer-id.guard';
import { CategoryService } from '../../category/category.service';

@Role('performer')
@UseGuards(RoleGuard, PerformerIdGuard)
@Controller('/performer')
export class PerformerController {
  constructor(
    private performersService: PerformerService,
    private imageService: ImageService,
    private categoryService: CategoryService
  ) {}

  @Get('/profile/:id')
  getPerformerById(@Param('id', ParseIntPipe) id: number) {
    return this.performersService.getPerformerForEdit(id);
  }

  @Put('/profile/:id/edit')
  async editPerformer(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdatePerformerDto) {
    await this.categoryService.setFeature(id, dto.category);

    return this.performersService.editEntity(id, dto);
  }

  @Post('/profile/:id/save-avatar')
  @UseInterceptors(FileInterceptor('image', { storage: memoryStorage() }))
  async saveAvatar(
    @Param('id', ParseIntPipe) id: number,
    @UploadedFile() file: Express.Multer.File,
  ) {
    const imageUrl = await this.imageService.saveImage(id, file, 'avatar');

    return this.performersService.addAvatarUrl(id, imageUrl.path);
  }

  @Get('/:id/portfolio')
  async getPortfolio(@Param('id', ParseIntPipe) id: number) {
    return await this.imageService.getGalleryById(id);
  }

  @Post('/:id/portfolio/order')
  async changePortfolioOrder(
    @Param('id', ParseIntPipe) id: number,
    @Body('order') newImgOrder: ChangeImageOrderDto[],
  ) {
    return await this.imageService.updatePortfolioOrder(id, newImgOrder);
  }

  @Delete('/:id/portfolio/:imgId')
  async deleteImage(
    @Param('id', ParseIntPipe) performerId: number,
    @Param('imgId', ParseIntPipe) pictureId: number,
  ) {
    return this.imageService.deleteImageById(performerId, pictureId);
  }

  @Post('/:id/save-portfolio')
  @UseInterceptors(FilesInterceptor('images', 25, { storage: memoryStorage() }))
  async savePortfolio(
    @Param('id', ParseIntPipe) id: number,
    @UploadedFiles() files: Express.Multer.File[],
    @Body('order') order: string[],
  ) {
    const orderMap = this.imageService.parseToMap(order);
    return await this.imageService.savePortfolio(id, files, orderMap);
  }
}
