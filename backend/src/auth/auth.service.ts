import {
  Injectable,
  UnauthorizedException,
  ConflictException,
} from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import { HashService } from '../hash/hash.service';
import { User } from '../users/entities/user.entity';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly hashService: HashService,
  ) {}

  async signup(data: Partial<User>): Promise<User> {
    const existing = await this.usersService.findOne({ email: data.email });
    if (existing) {
      throw new ConflictException('User with this email already exists');
    }

    const hashedPassword = await this.hashService.hash(data.password);
    const newUser = await this.usersService.create({
      ...data,
      password: hashedPassword,
    });

    delete newUser.password;
    return newUser;
  }

  async validateUser(username: string, password: string): Promise<User> {
    const user = await this.usersService.findOne({ username });
    if (!user) throw new UnauthorizedException('User not found');

    const isValid = await this.hashService.compare(password, user.password);
    if (!isValid) throw new UnauthorizedException('Invalid password');

    return user;
  }

  async signin(user: User): Promise<{ access_token: string }> {
    const payload = { username: user.username, sub: user.id };
    return {
      access_token: this.jwtService.sign(payload),
    };
  }
}
