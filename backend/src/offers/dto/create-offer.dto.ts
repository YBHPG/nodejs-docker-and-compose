import { IsInt, Min, IsOptional, IsBoolean } from 'class-validator';

export class CreateOfferDto {
  @IsInt()
  itemId: number;

  @Min(0.01)
  amount: number;

  @IsOptional()
  @IsBoolean()
  hidden?: boolean;
}
