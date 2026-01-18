import { IsEmail, IsOptional, IsString, Length, IsUrl } from 'class-validator';

export class CreateUserDto {
  @IsEmail()
  email: string;

  @IsString()
  @Length(2, 30)
  username: string;

  @IsString()
  @Length(6, 100)
  password: string;

  @IsOptional()
  @IsString()
  @Length(2, 200)
  about?: string;

  @IsOptional()
  @IsUrl()
  avatar?: string;
}
