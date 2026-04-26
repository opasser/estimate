import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsNumber, IsOptional, IsEnum } from 'class-validator';

export class FinishStreamDto {
  @ApiProperty({ example: 'abc12345', description: 'Unique identifier for the stream' })
  @IsString()
  @IsNotEmpty()
  streamId: string;

  @ApiProperty({ example: 101, description: 'ID of the performer associated with the stream' })
  @IsNumber()
  @IsNotEmpty()
  performerId: number;
}

export class StreamDto extends FinishStreamDto{
  @ApiProperty({ example: 'public', enum: ['public', 'private'], description: 'Privacy setting for the stream' })
  @IsNotEmpty()
  @IsEnum(['public', 'private'])
  privacy: 'public' | 'private';

  @ApiProperty({ example: 123, description: 'ID of the member associated with the stream, optional', required: false })
  @IsOptional()
  @IsNumber()
  privateWith?: number;
}
