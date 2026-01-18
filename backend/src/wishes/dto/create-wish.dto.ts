import {
  IsString,
  Length,
  IsUrl,
  IsNumber,
  Min,
  MaxLength,
  IsOptional,
} from 'class-validator';

export class CreateWishDto {
  @IsString()
  @Length(1, 250)
  name: string;

  @IsUrl()
  link: string;

  @IsUrl()
  image: string;

  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  price: number;

  @IsString()
  @Length(1, 1024)
  description: string;
}
