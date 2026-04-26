import { Controller, Get, Param, ParseIntPipe } from '@nestjs/common';
import { ImageService } from '../service/image.service';

@Controller('/gallery')
export class ImageController {
  constructor(private readonly imageService: ImageService) {}

  @Get('/:id/portfolio')
  async getPortfolio(@Param('id', ParseIntPipe) id: number) {
    return await this.imageService.getGalleryById(id);
  }
}
