import { NestFactory } from '@nestjs/core';
import { AppModule } from './app/app.module';
import { Logger, ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Config } from './app/contants';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const port = app.get(ConfigService<Config>).get('PORT') || 3000;

  const config = new DocumentBuilder()
    .addBearerAuth()
    .setTitle('Uploader')
    .setDescription('Uploader API description')
    .setVersion('1.0')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  const logger = app.get(Logger);
  await app.listen(port);
  logger.log('Application listening on port ' + port);
}
bootstrap();
