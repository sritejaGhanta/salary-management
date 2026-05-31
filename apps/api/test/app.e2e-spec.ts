import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from './../src/app.module';

describe('App & Auth (e2e)', () => {
  let app: INestApplication<App>;
  let token: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix('api');
    app.useGlobalPipes(new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }));
    await app.init();
  });

  describe('GET /', () => {
    it('should return Hello World!', () => {
      return request(app.getHttpServer())
        .get('/api')
        .expect(200)
        .expect('Hello World!');
    });
  });

  describe('POST /api/auth/login (Correct Data vs Wrong Data)', () => {
    it('should return 200 and access_token with CORRECT data', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/auth/login')
        .send({
          email: 'admin@salary.com',
          password: 'Admin@123',
        })
        .expect(200);

      expect(response.body).toHaveProperty('access_token');
      expect(response.body).toHaveProperty('user');
      expect(response.body.user.email).toBe('admin@salary.com');
      token = response.body.access_token;
    });

    it('should return 401 Unauthorized with INCORRECT password', () => {
      return request(app.getHttpServer())
        .post('/api/auth/login')
        .send({
          email: 'admin@salary.com',
          password: 'wrong_password',
        })
        .expect(401);
    });

    it('should return 401 Unauthorized with NON-EXISTENT email', () => {
      return request(app.getHttpServer())
        .post('/api/auth/login')
        .send({
          email: 'nobody@salary.com',
          password: 'Admin@123',
        })
        .expect(401);
    });

    it('should return 400 Bad Request with MALFORMED email', () => {
      return request(app.getHttpServer())
        .post('/api/auth/login')
        .send({
          email: 'not-an-email',
          password: 'Admin@123',
        })
        .expect(400);
    });

    it('should return 400 Bad Request with SHORT password', () => {
      return request(app.getHttpServer())
        .post('/api/auth/login')
        .send({
          email: 'admin@salary.com',
          password: '123',
        })
        .expect(400);
    });
  });

  describe('GET /api/auth/me', () => {
    it('should return 401 Unauthorized without token', () => {
      return request(app.getHttpServer())
        .get('/api/auth/me')
        .expect(401);
    });

    it('should return 200 and user info with CORRECT token', () => {
      return request(app.getHttpServer())
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${token}`)
        .expect(200)
        .then((res) => {
          expect(res.body.email).toBe('admin@salary.com');
        });
    });
  });

  afterAll(async () => {
    await app.close();
  });
});
