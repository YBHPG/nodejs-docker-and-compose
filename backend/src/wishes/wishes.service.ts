import {
  Injectable,
  ForbiddenException,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindOptionsWhere } from 'typeorm';
import { Wish } from './entities/wish.entity';
import { User } from '../users/entities/user.entity';
import { Offer } from '../offers/entities/offers.entity';

@Injectable()
export class WishesService {
  constructor(
    @InjectRepository(Wish)
    private readonly wishesRepository: Repository<Wish>,
    @InjectRepository(Offer)
    private readonly offersRepository: Repository<Offer>,
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
  ) {}

  async create(ownerId: number, data: Partial<Wish>): Promise<Wish> {
    const owner = await this.usersRepository.findOne({
      where: { id: ownerId },
    });
    if (!owner) throw new NotFoundException('Owner not found');
    const wish = this.wishesRepository.create({
      ...data,
      owner,
      raised: 0,
      copied: 0,
    });
    return this.wishesRepository.save(wish);
  }

  async findOne(query: FindOptionsWhere<Wish>): Promise<Wish | null> {
    return this.wishesRepository.findOne({
      where: query,
      relations: ['owner', 'offers', 'offers.user', 'wishlists'],
    });
  }

  async findMany(query: FindOptionsWhere<Wish>): Promise<Wish[]> {
    return this.wishesRepository.find({ where: query });
  }

  async updateOneOwnerGuard(
    ownerId: number,
    wishId: number,
    update: Partial<Wish>,
  ): Promise<Wish> {
    const wish = await this.findOne({ id: wishId });
    if (!wish) throw new NotFoundException('Wish not found');
    if (wish.owner.id !== ownerId)
      throw new ForbiddenException('Cannot edit others wishes');

    // Запрет менять raised напрямую
    if (typeof (update as any).raised !== 'undefined') {
      throw new BadRequestException('raised is not editable');
    }

    // Запрет менять цену, если уже есть офферы
    const offersCount = await this.offersRepository.count({
      where: { item: { id: wish.id } },
    });
    if (typeof update.price !== 'undefined' && offersCount > 0) {
      throw new ForbiddenException(
        'Cannot change price: there are offers already',
      );
    }

    Object.assign(wish, update);
    return this.wishesRepository.save(wish);
  }

  async removeOneOwnerGuard(ownerId: number, wishId: number): Promise<boolean> {
    const wish = await this.findOne({ id: wishId });
    if (!wish) return false;
    if (wish.owner.id !== ownerId)
      throw new ForbiddenException('Cannot delete others wishes');
    await this.wishesRepository.remove(wish);
    return true;
  }

  // Главная: 40 последних
  async latest(): Promise<Wish[]> {
    return this.wishesRepository.find({
      order: { createdAt: 'DESC' },
      take: 40,
      relations: ['owner'],
    });
  }

  // Главная: 20 популярных
  async top(): Promise<Wish[]> {
    return this.wishesRepository.find({
      order: { copied: 'DESC' },
      take: 20,
      relations: ['owner'],
    });
  }

  // Копирование подарка
  async copy(wishId: number, userId: number): Promise<Wish> {
    const original = await this.findOne({ id: wishId });
    if (!original) throw new NotFoundException('Wish not found');

    const user = await this.usersRepository.findOne({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');

    const copy = this.wishesRepository.create({
      name: original.name,
      link: original.link,
      image: original.image,
      price: original.price,
      description: original.description,
      owner: user,
      raised: 0,
      copied: 0,
    });

    await this.wishesRepository.save(copy);

    // увеличить счётчик у оригинала
    await this.wishesRepository.update(
      { id: original.id },
      { copied: (original.copied || 0) + 1 },
    );

    return copy;
  }

  async findLast() {
    return this.wishesRepository.find({
      order: { createdAt: 'DESC' },
      take: 40,
      relations: ['owner', 'offers'],
    });
  }

  /**
   * Найти топ-желания (по количеству копий)
   */
  async findTop() {
    return this.wishesRepository.find({
      order: { copied: 'DESC' },
      take: 20,
      relations: ['owner', 'offers'],
    });
  }
}
