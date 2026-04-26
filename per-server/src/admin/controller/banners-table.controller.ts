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
  UseGuards, UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { BannersService } from '../../banners/banners.service';
import { ImageService } from '../../image/service/image.service';
import { BannerDto } from '../../banners/dto/create-banner.dto';
import { UpdateBannerDto } from '../../banners/dto/update-banner.dto';


@Role('admin')
@UseGuards(RoleGuard)
@Controller('/admin')
export class BannersTableController {
  constructor(
    private bannerService: BannersService,
    private imageService: ImageService,
  ) {}

  @Get('/banners')
  getAllPerformers(
    @Query('subStr') subStr: string,
    @Query('page') page: number,
    @Query('limit') limit: number,
  ) {
    return this.bannerService.getAllOrSearch(subStr, page, limit);
  }

  @Get('/banners/:id')
  getBannerById(@Param('id', ParseIntPipe) id: number) {
    return this.bannerService.geForEdit(id);
  }

  @Post('/banners/registration')
  async registrationBanner(@Body() dto: BannerDto) {
    return this.bannerService.registration(dto);
  }

  @Put('/banners/:id/edit')
  async editBanner(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateBannerDto) {
    return this.bannerService.edit(id, dto);
  }

  @Delete('/banners/:id/delete')
  async deleteBanner(@Param('id', ParseIntPipe) id: number) {
    const { imgPath } = await this.bannerService.geForEdit(id);

    if (imgPath) {
     await this.imageService.deleteAssetsImg(imgPath);
    }

    return this.bannerService.delete(id);
  }

  @Post('/banners/:id/save-image')
  @UseInterceptors(FileInterceptor('image', { storage: memoryStorage() }))
  async saveImage(
    @Param('id', ParseIntPipe) id: number,
    @UploadedFile() file: Express.Multer.File,
  ) {
    const imageMeta = await this.imageService.saveBannerImg(id, file);

    return this.bannerService.edit(id, { id, ...imageMeta });
  }
}
