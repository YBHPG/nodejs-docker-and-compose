import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WishesService } from './wishes.service';
import { WishesController } from './wishes.controller';
import { Wish } from './entities/wish.entity';
import { Offer } from '../offers/entities/offers.entity';
import { User } from '../users/entities/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Wish, Offer, User])],
  controllers: [WishesController],
  providers: [WishesService],
  exports: [WishesService, TypeOrmModule],
})
export class WishesModule {}
