import {
  IsString,
  Length,
  IsUrl,
  IsOptional,
  IsArray,
  ArrayNotEmpty,
  IsInt,
} from 'class-validator';

export class CreateWishlistDto {
  @IsString()
  @Length(1, 250)
  name: string;

  @IsOptional()
  @IsString()
  @Length(0, 1500)
  description?: string;

  @IsOptional()
  @IsUrl()
  image?: string;

  @IsOptional()
  @IsArray()
  @IsInt({ each: true })
  items?: number[]; // массив id подарков
}
