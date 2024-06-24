import { Logger, Module, ValidationPipe } from '@nestjs/common';
import { CommonModule } from '../common/common.module';
import { ConfigModule } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { AuthController } from './controllers/auth.controller';
import { AdminController } from './controllers/admin.controller';
import { DownloadController } from './controllers/download.controller';
import { CreateTestUserCommand } from './commands/create-test-user.command';
import { AuthService } from './services/auth.service';
import FileService from './services/file.service';
import { FileSystemService } from './services/file-system.service';
import { APP_PIPE } from '@nestjs/core';

@Module({
  imports: [
    CommonModule,
    ConfigModule.forRoot({
      isGlobal: true,
      // ignoreEnvFile: true, TODO for prod
    }),
    JwtModule.register({
      global: true,
      signOptions: { expiresIn: '60m' },
    }),
  ],
  controllers: [AdminController, AuthController, DownloadController],
  providers: [
    CreateTestUserCommand,
    AuthService,
    FileService,
    FileSystemService,
    Logger,
    {
      provide: APP_PIPE,
      useClass: ValidationPipe,
    },
  ],
  exports: [CreateTestUserCommand],
})
export class AppModule {}
