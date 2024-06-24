import { Prisma, User } from '@prisma/client';
import { Injectable } from '@nestjs/common';
import { PrismaService } from './prisma.service';
import { PasswordService } from './password.service';

@Injectable()
export class UserService {
  constructor(
    private db: PrismaService,
    private passwordService: PasswordService,
  ) {}

  async createUser(userData: Prisma.UserCreateInput) {
    return this.db.user.create({
      data: {
        ...userData,
        password: await this.passwordService.hash(userData.password),
      },
    });
  }

  async findByLogin(login: string): Promise<User | undefined> {
    return this.db.user.findUnique({ where: { login } });
  }
}
