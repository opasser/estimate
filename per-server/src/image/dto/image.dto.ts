import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber } from 'class-validator';

export class CreateImageDto {
  performerId: number;
  thumbnailPath: string;
  imagePath: string;
  order: number;
  thumbH: number;
  thumbW: number;
  imgH: number;
  imgW: number;
}

export class ChangeImageOrderDto {
  @ApiProperty({ type: 'number', description: 'image id' })
  @IsNotEmpty()
  @IsNumber()
  id: number;

  @ApiProperty({ type: 'number', description: 'performer id' })
  @IsNotEmpty()
  @IsNumber()
  performerId: number;

  @ApiProperty({ type: 'number', description: 'image order' })
  @IsNotEmpty()
  @IsNumber()
  order: number;
}
