import { ApiProperty } from '@nestjs/swagger';
import {
  IsBoolean,
  IsEmail,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Matches,
  Max,
  Min,
  IsDateString,
  IsIn,
  IsArray,
} from 'class-validator';
import { Transform } from 'class-transformer';

export class UpdatePerformerDto {
  @ApiProperty({
    example: 'John Doe',
    description: 'Full name of the performer',
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    example: 'john_doe123',
    description:
      'Nickname of the performer, must be URL-safe (letters, numbers, dashes, underscores)',
  })
  @IsString()
  @IsNotEmpty()
  @Matches(/^[a-zA-Z0-9_-]+$/, {
    message:
      'Nickname can only contain letters, numbers, dashes, and underscores',
  })
  nickName: string;

  @ApiProperty({
    example: 'john.doe@example.com',
    description: 'Email of the performer',
  })
  @IsEmail({}, { message: 'Email must be a valid email address' })
  @IsNotEmpty({ message: 'Email should not be empty' })
  email: string;

  @ApiProperty({
    example: 'strongpassword123',
    description: 'Password for the performer',
  })
  @IsOptional()
  password: string;

  @IsOptional()
  avatarUrl?: string;

  @IsBoolean()
  isPublic: boolean;

  @IsNumber({ allowNaN: false }, { message: 'Payment rate must be a number' })
  @Min(1, { message: 'Payment rate must be at least 1' })
  @Max(100, { message: 'Payment rate must not exceed 100' })
  paymentRate: number;

  @Transform(({ value }) => parseFloat(value))
  @IsNumber(
    { allowNaN: false, maxDecimalPlaces: 2 },
    { message: 'c2c must be a number in the format 00.00' },
  )
  @Min(1, { message: 'c2c amount must be at least 1' })
  @Max(100, { message: 'c2c amount must not exceed 100' })
  c2cAmount: number;

  @IsOptional()
  category: string[];

  @IsOptional()
  tag: string[];

  @ApiProperty({
    example: 'About me text',
    description: 'Performer description',
  })
  @IsString()
  @IsOptional()
  about: string;

  @ApiProperty({
    example: '1990-01-01',
    description: "Performer's date of birth",
    required: false,
  })
  @IsOptional()
  @IsDateString()
  birthday?: Date;

  @ApiProperty({
    example: 'male',
    description: "Performer's gender",
    enum: ['male', 'female', 'trans'],
    required: false,
  })
  @IsOptional()
  @IsString()
  @IsIn(['male', 'female', 'trans'])
  gender?: string;

  @ApiProperty({
    example: 'athletic',
    description: "Performer's body type",
    required: false,
  })
  @IsOptional()
  @IsString()
  bodyType?: string;

  @ApiProperty({
    example: ['EN', 'ES'],
    description: 'Languages spoken by the performer',
    type: [String],
    required: false,
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  language?: string[];

  @ApiProperty({
    example: 'heterosexual',
    description: "Performer's sexual orientation",
    required: false,
  })
  @IsOptional()
  @IsString()
  sexualOrientation?: string;
}
