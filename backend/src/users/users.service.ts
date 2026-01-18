import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, ILike } from 'typeorm';
import { User } from './entities/user.entity';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
  ) {}

  /**
   * Найти пользователя по параметрам
   */
  async findOne(where: Partial<User>): Promise<User | null> {
    return this.usersRepository.findOne({
      where,
      relations: ['wishes', 'offers', 'wishlists'],
    });
  }

  /**
   * Обновить данные пользователя, если он является владельцем
   */
  async updateOneIfOwner(userId: number, updateData: UpdateUserDto) {
    const user = await this.usersRepository.findOneBy({ id: userId });
    if (!user) {
      throw new Error('User not found');
    }

    Object.assign(user, updateData);
    return this.usersRepository.save(user);
  }

  /**
   * Найти пользователей по username или email
   * (используется для POST /users/find)
   */
  async searchByLoginOrEmail(query: string): Promise<User[]> {
    return this.usersRepository.find({
      where: [
        { username: ILike(`%${query}%`) },
        { email: ILike(`%${query}%`) },
      ],
      relations: ['wishes', 'offers', 'wishlists'],
    });
  }

  async create(data: Partial<User>): Promise<User> {
    const user = this.usersRepository.create(data);
    return this.usersRepository.save(user);
  }
}
