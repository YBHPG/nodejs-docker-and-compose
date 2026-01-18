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
import { WishlistsService } from './wishlists.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CreateWishlistDto } from './dto/create-wishlist.dto';
import { UpdateWishlistDto } from './dto/update-wishlist.dto';
import { Request } from 'express';

@UseGuards(JwtAuthGuard)
@Controller('wishlists')
export class WishlistsController {
  constructor(private readonly wishlistsService: WishlistsService) {}

  /**
   * Получить все списки желаний пользователя
   * GET /wishlists
   */
  @Get()
  async findAll(@Req() req: Request) {
    return this.wishlistsService.findAll(req.user['id']);
  }

  /**
   * Создать новый список желаний
   * POST /wishlists
   */
  @Post()
  async create(@Req() req: Request, @Body() dto: CreateWishlistDto) {
    return this.wishlistsService.create(req.user['id'], dto);
  }

  /**
   * Получить конкретный список желаний по id
   * GET /wishlists/:id
   */
  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.wishlistsService.findOne(Number(id));
  }

  /**
   * Обновить список желаний
   * PATCH /wishlists/:id
   */
  @Patch(':id')
  async update(
    @Req() req: Request,
    @Param('id') id: string,
    @Body() dto: UpdateWishlistDto,
  ) {
    return this.wishlistsService.updateOneOwnerGuard(
      req.user['id'],
      Number(id),
      dto,
    );
  }

  /**
   * Удалить список желаний
   * DELETE /wishlists/:id
   */
  @Delete(':id')
  async remove(@Req() req: Request, @Param('id') id: string) {
    return this.wishlistsService.removeOneOwnerGuard(
      req.user['id'],
      Number(id),
    );
  }
}
