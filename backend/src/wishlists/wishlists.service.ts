import {
  Injectable,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindOptionsWhere } from 'typeorm';
import { In } from 'typeorm';
import { Wishlist } from './entities/wishlist.entity';
import { User } from '../users/entities/user.entity';
import { Wish } from '../wishes/entities/wish.entity';
import { CreateWishlistDto } from './dto/create-wishlist.dto';
import { UpdateWishlistDto } from './dto/update-wishlist.dto';

@Injectable()
export class WishlistsService {
  constructor(
    @InjectRepository(Wishlist)
    private readonly wishlistsRepository: Repository<Wishlist>,
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
    @InjectRepository(Wish)
    private readonly wishesRepository: Repository<Wish>,
  ) {}

  async create(ownerId: number, data: CreateWishlistDto): Promise<Wishlist> {
    const owner = await this.usersRepository.findOne({
      where: { id: ownerId },
    });
    if (!owner) throw new NotFoundException('Owner not found');

    // items — массив id подарков
    let items: Wish[] | undefined = undefined;
    if (Array.isArray((data as any).items)) {
      items = await this.wishesRepository.findBy({ id: In(data.items) });
    }

    const list = this.wishlistsRepository.create({
      name: data.name,
      description: data.description,
      image: data.image,
      owner,
      items,
    });
    return this.wishlistsRepository.save(list);
  }

  async findMany(query: FindOptionsWhere<Wishlist>): Promise<Wishlist[]> {
    return this.wishlistsRepository.find({
      where: query,
      relations: ['owner', 'items'],
    });
  }

  async updateOneOwnerGuard(
    userId: number,
    id: number,
    updateDto: UpdateWishlistDto,
  ) {
    const list = await this.findOne(id);
    if (!list) {
      throw new Error('Wishlist not found');
    }
    if (list.owner.id !== userId) {
      throw new Error('Access denied');
    }

    Object.assign(list, updateDto);
    return this.wishlistsRepository.save(list);
  }

  async removeOneOwnerGuard(userId: number, id: number) {
    const list = await this.findOne(id);
    if (!list) {
      throw new Error('Wishlist not found');
    }
    if (list.owner.id !== userId) {
      throw new Error('Access denied');
    }

    return this.wishlistsRepository.remove(list);
  }

  async findAll(userId: number) {
    return this.wishlistsRepository.find({
      where: { owner: { id: userId } },
      relations: ['owner', 'items'],
    });
  }

  /**
   * Получить один список по ID
   */
  async findOne(id: number) {
    return this.wishlistsRepository.findOne({
      where: { id },
      relations: ['owner', 'items'],
    });
  }
}
