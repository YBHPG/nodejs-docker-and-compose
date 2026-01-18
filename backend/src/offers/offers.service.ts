import {
  Injectable,
  BadRequestException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindOptionsWhere } from 'typeorm';
import { Offer } from './entities/offers.entity';
import { Wish } from '../wishes/entities/wish.entity';
import { User } from '../users/entities/user.entity';

@Injectable()
export class OffersService {
  constructor(
    @InjectRepository(Offer)
    private readonly offersRepository: Repository<Offer>,
    @InjectRepository(Wish)
    private readonly wishesRepository: Repository<Wish>,
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
  ) {}

  async create(
    userId: number,
    data: { itemId: number; amount: number; hidden?: boolean },
  ): Promise<Offer> {
    const user = await this.usersRepository.findOne({ where: { id: userId } });
    const wish = await this.wishesRepository.findOne({
      where: { id: data.itemId },
      relations: ['owner'],
    });
    if (!user) throw new NotFoundException('User not found');
    if (!wish) throw new NotFoundException('Wish not found');

    // Нельзя скидываться на свой подарок
    if (wish.owner.id === user.id) {
      throw new ForbiddenException('Cannot contribute to your own wish');
    }

    // Проверки по сумме
    const currentRaised = Number(wish.raised || 0);
    const price = Number(wish.price || 0);
    if (currentRaised >= price)
      throw new BadRequestException('Goal already reached');

    const amount = Number(data.amount);
    if (amount <= 0) throw new BadRequestException('Amount must be positive');

    if (currentRaised + amount > price) {
      throw new BadRequestException('Amount exceeds remaining goal');
    }

    // Создание оффера
    const offer = this.offersRepository.create({
      user,
      item: wish,
      amount,
      hidden: !!data.hidden,
    });
    await this.offersRepository.save(offer);

    // Обновить raised у подарка
    await this.wishesRepository.update(
      { id: wish.id },
      { raised: currentRaised + amount },
    );

    return offer;
  }

  async findOne(query: FindOptionsWhere<Offer>): Promise<Offer | null> {
    return this.offersRepository.findOne({
      where: query,
      relations: ['user', 'item'],
    });
  }

  async findMany(query: FindOptionsWhere<Offer>): Promise<Offer[]> {
    return this.offersRepository.find({
      where: query,
      relations: ['user', 'item'],
    });
  }

  // Специально НЕ реализуем update/remove — по ТЗ менять/удалять заявки нельзя
}
