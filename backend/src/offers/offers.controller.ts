import {
  Controller,
  Get,
  Post,
  Param,
  Body,
  Req,
  UseGuards,
} from '@nestjs/common';
import { OffersService } from './offers.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CreateOfferDto } from './dto/create-offer.dto';
import { Request } from 'express';

@UseGuards(JwtAuthGuard)
@Controller('offers')
export class OffersController {
  constructor(private readonly offersService: OffersService) {}

  /**
   * Создать новое предложение
   * POST /offers
   */
  @Post()
  async create(@Req() req: Request, @Body() dto: CreateOfferDto) {
    return this.offersService.create(req.user['id'], dto);
  }

  /**
   * Получить все предложения
   * GET /offers
   */
  @Get()
  async findAll() {
    return this.offersService.findMany({});
  }

  /**
   * Получить конкретное предложение по ID
   * GET /offers/:id
   */
  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.offersService.findOne({ id: Number(id) });
  }
}
