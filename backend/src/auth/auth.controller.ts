import { Controller, Post, Body, UseGuards, Request } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { SigninDto } from './dto/signin.dto';
import { SignupDto } from './dto/signup.dto';

@Controller()
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  /**
   * Регистрация нового пользователя
   * POST /signup
   */
  @Post('signup')
  async signup(@Body() body: SignupDto) {
    return this.authService.signup(body);
  }

  /**
   * Авторизация пользователя
   * POST /signin
   * Использует LocalAuthGuard (стратегия "local")
   */
  @UseGuards(LocalAuthGuard)
  @Post('signin')
  async signin(@Request() req) {
    return this.authService.signin(req.user);
  }
}
