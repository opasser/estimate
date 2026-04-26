import { PartialType } from '@nestjs/swagger';
import { BannerDto } from './create-banner.dto';

export class UpdateBannerDto extends PartialType(BannerDto) {
  id: number
}
