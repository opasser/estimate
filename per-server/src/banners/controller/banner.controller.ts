import { Controller, Get, Query } from '@nestjs/common';
import { BannersService } from '../banners.service';

@Controller('/banners')
export class BannerController {
  constructor(private readonly bannerService: BannersService) {}

  @Get('/all')
  getBanners( @Query('section') section: string[]) {

    return this.bannerService.getAll(Array.isArray(section) ? section : [section]);
  }
}
