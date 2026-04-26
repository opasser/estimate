import { ApiProperty } from '@nestjs/swagger';
import {
  IsEnum,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  IsNotEmpty,
} from 'class-validator';

export class PaymentDto {
  @ApiProperty({
    example: 1,
    description: 'Unique identifier for the payment record',
  })
  @IsInt()
  @IsNotEmpty()
  id: number;

  @ApiProperty({
    example: 'tips',
    description: 'Type of payment, can be "tips", "c2c" or "stream"',
    enum: ['tips', 'c2c', 'stream'],
  })
  @IsEnum(['tips', 'c2c', 'stream'])
  @IsNotEmpty()
  type: 'tips' | 'c2c' | 'stream';

  @ApiProperty({
    example: 123,
    description: 'ID of the performer associated with the payment',
    required: false,
  })
  @IsOptional()
  @IsInt()
  performerId: number | null;

  @ApiProperty({
    example: 456,
    description: 'ID of the member associated with the payment',
    required: false,
  })
  @IsOptional()
  @IsInt()
  memberId: number | null;

  @ApiProperty({
    example: 'abc12345',
    description: 'ID of the stream associated with the payment',
    required: false,
  })
  @IsOptional()
  @IsString()
  streamId: string | null;

  @ApiProperty({
    example: 100.5,
    description: 'Amount of the payment',
  })
  @IsNumber()
  @IsNotEmpty()
  amount: number;

  @ApiProperty({
    example: 90.45,
    description: 'Rate paid to the performer',
  })
  @IsNumber()
  @IsNotEmpty()
  performerRate: number;
}
