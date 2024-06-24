import { Module } from '@nestjs/common';
import { UserService } from './services/user.service';
import { PrismaService } from './services/prisma.service';
import { PasswordService } from './services/password.service';

@Module({
  providers: [PrismaService, UserService, PasswordService],
  exports: [PrismaService, UserService, PasswordService],
})
export class CommonModule {}
