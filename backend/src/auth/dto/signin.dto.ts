import { IsString, Length } from 'class-validator';

export class SigninDto {
  @IsString()
  @Length(2, 30)
  username: string;

  @IsString()
  @Length(6, 100)
  password: string;
}
