import { NestFactory } from '@nestjs/core';
import { AppModule } from './app/app.module';
import { CommandFactory } from 'nest-commander';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);
  await CommandFactory.run(AppModule, ['log', 'warn', 'error']);
  await app.close();
}
bootstrap();
