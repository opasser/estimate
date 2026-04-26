import { IsInt, IsOptional, IsString, IsNumber } from 'class-validator';

export class CreatePayoutDto {
  @IsOptional()
  @IsInt()
  performerId: number | null;

  @IsOptional()
  @IsString()
  comment: string;

  @IsNumber()
  amount: number;
}
