import { ApiProperty } from '@nestjs/swagger';
import {
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';

export class MessageDto {
  @ApiProperty({
    example: 'Hello, world!',
    description: 'The message content',
  })
  @IsString()
  @IsNotEmpty()
  message: string;

  @ApiProperty({
    example: 'stream123',
    description: 'The ID of the stream',
  })
  @IsString()
  @IsNotEmpty()
  streamId: string;

  @ApiProperty({
    example: 42,
    description: 'The participant ID',
  })
  @IsNumber()
  @IsNotEmpty()
  participantId: number;

  @ApiProperty({
    example: 'JohnDoe',
    description: 'The nickname of the participant',
  })
  @IsString()
  @IsNotEmpty()
  nickName: string;

  @ApiProperty({
    example: 'member',
    description: 'The role of the participant in the stream',
  })
  @IsString()
  @IsNotEmpty()
  role: 'member' | 'performer' | 'tips-action';

  @ApiProperty({
    example: 'private',
    description: 'The privacy level of the chat',
    enum: ['private', 'public'],
  })
  @IsEnum(['private', 'public'], {
    message: 'Privacy must be either "private" or "public"',
  })
  @IsNotEmpty()
  privacy: 'private' | 'public';

  @ApiProperty({
    example: 'JaneDoe',
    description:
      'The nickname of the participant with whom the message is private (optional)',
    required: false,
  })
  @IsString()
  @IsOptional()
  privateTo: string;
}
