import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsString,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class MemberDto {
  @ApiProperty({
    example: 1,
    description: 'ID of the provider',
  })
  @IsNumber()
  @IsNotEmpty()
  providerId: number;

  @ApiProperty({
    example: 'user@example.com',
    description: 'Unique email of the member',
  })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({
    example: 'John Doe',
    description: 'Name of the member',
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    example: 'free',
    description: 'Subscription status of the member',
    enum: ['free', 'premium'],
  })
  @IsEnum(['free', 'premium'], {
    message: 'Status must be either "free" or "premium"',
  })
  @IsNotEmpty()
  status: 'free' | 'premium';

  @ApiProperty({
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
    description: 'The last token issued to the member',
  })
  @IsString()
  @IsNotEmpty()
  lastToken: string;

  @IsNumber()
  balance: number;

  @IsString()
  lang: string;
}
