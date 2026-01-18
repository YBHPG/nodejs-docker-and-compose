import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  Req,
  UseGuards,
} from '@nestjs/common';
import { WishesService } from './wishes.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CreateWishDto } from './dto/create-wish.dto';
import { UpdateWishDto } from './dto/update-wish.dto';
import { Request } from 'express';

@UseGuards(JwtAuthGuard)
@Controller('wishes')
export class WishesController {
  constructor(private readonly wishesService: WishesService) {}

  /**
   * Создать новое желание
   * POST /wishes
   */
  @Post()
  async create(@Req() req: Request, @Body() dto: CreateWishDto) {
    return this.wishesService.create(req.user['id'], dto);
  }

  /**
   * Получить последнее добавленные желания
   * GET /wishes/last
   */
  @Get('last')
  async findLast() {
    return this.wishesService.findLast();
  }

  /**
   * Получить самые популярные желания
   * GET /wishes/top
   */
  @Get('top')
  async findTop() {
    return this.wishesService.findTop();
  }

  /**
   * Получить желание по ID (требует авторизацию)
   * GET /wishes/:id
   */
  @UseGuards(JwtAuthGuard)
  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.wishesService.findOne({ id: Number(id) });
  }

  /**
   * Обновить желание
   * PATCH /wishes/:id
   */
  @Patch(':id')
  async update(
    @Req() req: Request,
    @Param('id') id: string,
    @Body() dto: UpdateWishDto,
  ) {
    return this.wishesService.updateOneOwnerGuard(
      req.user['id'],
      Number(id),
      dto,
    );
  }

  /**
   * Удалить желание
   * DELETE /wishes/:id
   */
  @Delete(':id')
  async remove(@Req() req: Request, @Param('id') id: string) {
    return this.wishesService.removeOneOwnerGuard(req.user['id'], Number(id));
  }

  /**
   * Скопировать чужое желание к себе
   * POST /wishes/:id/copy
   */
  @Post(':id/copy')
  async copy(@Req() req: Request, @Param('id') id: string) {
    return this.wishesService.copy(Number(id), req.user['id']);
  }
}
