import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../app.module';
import { PrismaService } from '../../common/services/prisma.service';
import { PrismaClient } from '@prisma/client';
import { mockDeep } from 'jest-mock-extended';
import { PasswordService } from '../../common/services/password.service';

describe('AuthController (e2e)', () => {
  let app: INestApplication;
  let prisma;
  let passwordService: PasswordService;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(PrismaService)
      .useValue(mockDeep<PrismaClient>())
      .compile();

    prisma = moduleFixture.get(PrismaService);
    passwordService = moduleFixture.get(PasswordService);
    app = moduleFixture.createNestApplication();
    await app.init();
  });

  it('/auth/login does not work without sufficient data', async () => {
    await request(app.getHttpServer()).post('/auth/login').expect(400);
    await request(app.getHttpServer())
      .post('/auth/login')
      .send({ login: 'hi' })
      .expect(400);
    await request(app.getHttpServer())
      .post('/auth/login')
      .send({ password: 'hi' })
      .expect(400);
  });

  it('/auth/login works with sufficient data', async () => {
    const mockUser = {
      login: 'hi',
      password: await passwordService.hash('hi'),
    };
    prisma.user.findUnique.mockResolvedValueOnce(mockUser);

    return request(app.getHttpServer())
      .post('/auth/login')
      .send({ login: 'hi', password: 'hi' })
      .expect(200);
  });

  it('/admin apis do not work without auth', async () => {
    await request(app.getHttpServer()).get('/admin/history').expect(401);
    await request(app.getHttpServer()).post('/admin/upload').expect(401);
    await request(app.getHttpServer()).post('/admin/upload/1').expect(401);
    await request(app.getHttpServer()).delete('/admin/version/1').expect(401);
    await request(app.getHttpServer()).delete('/admin/file/1').expect(401);
  });

  it('/admin/history works with auth', async () => {
    const mockUser = {
      login: 'test',
      password: await passwordService.hash('test'),
    };
    prisma.user.findUnique.mockResolvedValueOnce(mockUser);

    const req = await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        login: 'test',
        password: 'test',
      })
      .expect(200);

    const token = req.body.access_token;

    prisma.user.findUnique.mockResolvedValueOnce(mockUser);
    prisma.file.findMany.mockResolvedValueOnce('history mock');
    return request(app.getHttpServer())
      .get('/admin/history')
      .set('Authorization', `Bearer ${token}`)
      .expect(200)
      .expect('history mock');
  });
});
