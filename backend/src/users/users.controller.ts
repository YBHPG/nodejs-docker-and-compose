import {
  Controller,
  Get,
  Post,
  Patch,
  Param,
  Body,
  Req,
  UseGuards,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { UpdateUserDto } from './dto/update-user.dto';
import { Request } from 'express';

@UseGuards(JwtAuthGuard)
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  /**
   * Получить информацию о текущем пользователе
   * GET /users/me
   */
  @Get('me')
  async getMe(@Req() req: Request) {
    return this.usersService.findOne({ id: req.user['id'] });
  }

  /**
   * Обновить информацию о текущем пользователе
   * PATCH /users/me
   */
  @Patch('me')
  async updateMe(@Req() req: Request, @Body() body: UpdateUserDto) {
    return this.usersService.updateOneIfOwner(req.user['id'], body);
  }

  /**
   * Получить собственные желания пользователя
   * GET /users/me/wishes
   */
  @Get('me/wishes')
  async getMyWishes(@Req() req: Request) {
    const me = await this.usersService.findOne({ id: req.user['id'] });
    return me?.wishes ?? [];
  }

  /**
   * Получить публичный профиль пользователя
   * GET /users/:username
   */
  @Get(':username')
  async getPublicByUsername(@Param('username') username: string) {
    const user = await this.usersService.findOne({ username });
    if (!user) return null;
    const { id, username: u, about, avatar, createdAt, updatedAt } = user;
    return { id, username: u, about, avatar, createdAt, updatedAt };
  }

  /**
   * Получить публичный список желаний пользователя
   * GET /users/:username/wishes
   */
  @Get(':username/wishes')
  async getUserWishes(@Param('username') username: string) {
    const user = await this.usersService.findOne({ username });
    return user?.wishes ?? [];
  }

  /**
   * Найти пользователей по email или username
   * POST /users/find
   */
  @Post('find')
  async findMany(@Body() body: { query: string }) {
    const q = body?.query?.trim();
    if (!q) return [];
    return this.usersService.searchByLoginOrEmail(q);
  }
}
