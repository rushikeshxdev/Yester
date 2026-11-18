import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import cookieParser from 'cookie-parser';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';
import { HttpExceptionFilter } from '../src/common/filters/http-exception.filter';

describe('Auth Endpoints (E2E)', () => {
  let app: INestApplication;
  let prisma: PrismaService;

  const extractCookie = (cookies: string | string[] | undefined): string => {
    if (!cookies) return '';
    const list = Array.isArray(cookies) ? cookies : [cookies];
    return list.find((c) => c.startsWith('refreshToken=')) || '';
  };

  const testUserEmail = `e2e-test-${Date.now()}@yester.app`;
  const testPassword = 'SovereignSecureP@ss2026';
  let accessToken: string;
  let refreshTokenCookie: string;
  let userId: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.use(cookieParser());
    app.setGlobalPrefix('api/v1');
    app.useGlobalFilters(new HttpExceptionFilter());
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );

    await app.init();
    prisma = app.get(PrismaService);
  });

  afterAll(async () => {
    // Cleanup created test user and cascades (sessions, preference)
    if (userId) {
      await prisma.user.deleteMany({
        where: { id: userId },
      });
    }
    await app.close();
  });

  describe('POST /api/v1/auth/register', () => {
    it('should register a new user, return access token, and set HttpOnly refresh cookie', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/v1/auth/register')
        .send({
          email: testUserEmail,
          password: testPassword,
        })
        .expect(201);

      expect(response.body).toHaveProperty('accessToken');
      expect(response.body).toHaveProperty('user');
      expect(response.body.user.email).toBe(testUserEmail.toLowerCase());
      expect(response.body.user).toHaveProperty('id');
      userId = response.body.user.id;
      accessToken = response.body.accessToken;

      // Verify Set-Cookie header contains refreshToken
      const rawCookies = response.headers['set-cookie'];
      expect(rawCookies).toBeDefined();
      refreshTokenCookie = extractCookie(rawCookies);
      expect(refreshTokenCookie).toContain('refreshToken=');
      expect(refreshTokenCookie).toContain('HttpOnly');
    });

    it('should reject registration with duplicate email (409 Conflict)', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/v1/auth/register')
        .send({
          email: testUserEmail,
          password: testPassword,
        })
        .expect(409);

      expect(response.body).toHaveProperty('status', 409);
      expect(response.body).toHaveProperty('detail');
    });

    it('should reject registration with invalid password (400 Bad Request)', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/v1/auth/register')
        .send({
          email: 'invalid-pass@yester.app',
          password: 'short', // less than 8 chars
        })
        .expect(400);

      expect(response.body).toHaveProperty('status', 400);
    });
  });

  describe('POST /api/v1/auth/login', () => {
    it('should authenticate user and return access token + refresh cookie', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/v1/auth/login')
        .send({
          email: testUserEmail,
          password: testPassword,
        })
        .expect(200);

      expect(response.body).toHaveProperty('accessToken');
      expect(response.body.user.email).toBe(testUserEmail.toLowerCase());

      const cookies = response.headers['set-cookie'];
      expect(cookies).toBeDefined();
      refreshTokenCookie = extractCookie(cookies);
    });

    it('should reject login with wrong password (401 Unauthorized)', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/v1/auth/login')
        .send({
          email: testUserEmail,
          password: 'WrongPassword!2026',
        })
        .expect(401);

      expect(response.body).toHaveProperty('status', 401);
    });
  });

  describe('GET /api/v1/auth/me', () => {
    it('should reject access without Bearer token (401 Unauthorized)', async () => {
      await request(app.getHttpServer())
        .get('/api/v1/auth/me')
        .expect(401);
    });

    it('should return user profile when authenticated with valid Bearer token', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/v1/auth/me')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      expect(response.body.id).toBe(userId);
      expect(response.body.email).toBe(testUserEmail.toLowerCase());
      expect(response.body).toHaveProperty('preference');
    });
  });

  describe('POST /api/v1/auth/refresh & Token Reuse Detection', () => {
    let staleRevokedCookie: string;

    it('should rotate refresh token and issue new access token', async () => {
      // Save current cookie as the stale one that will be rotated
      staleRevokedCookie = refreshTokenCookie;

      const response = await request(app.getHttpServer())
        .post('/api/v1/auth/refresh')
        .set('Cookie', [refreshTokenCookie])
        .expect(200);

      expect(response.body).toHaveProperty('accessToken');
      expect(typeof response.body.accessToken).toBe('string');

      // Update with the rotated cookie
      const cookies = response.headers['set-cookie'];
      expect(cookies).toBeDefined();
      refreshTokenCookie = extractCookie(cookies);
      expect(refreshTokenCookie).not.toEqual(staleRevokedCookie);
    });

    it('should detect token reuse when stale revoked cookie is presented and revoke all sessions', async () => {
      // Attempt to refresh using the already-rotated stale token
      const response = await request(app.getHttpServer())
        .post('/api/v1/auth/refresh')
        .set('Cookie', [staleRevokedCookie])
        .expect(401);

      expect(response.body.detail).toContain('Token reuse detected');

      // Verify in DB that all active sessions for userId are now revoked
      const activeSessions = await prisma.authSession.findMany({
        where: { userId, isRevoked: false },
      });
      expect(activeSessions.length).toBe(0);
    });
  });

  describe('POST /api/v1/auth/logout', () => {
    it('should logout user, revoke active session, and clear cookie', async () => {
      // First login again to get an active session
      const loginRes = await request(app.getHttpServer())
        .post('/api/v1/auth/login')
        .send({
          email: testUserEmail,
          password: testPassword,
        })
        .expect(200);

      const newAccessToken = loginRes.body.accessToken;
      const cookies = loginRes.headers['set-cookie'];

      const response = await request(app.getHttpServer())
        .post('/api/v1/auth/logout')
        .set('Authorization', `Bearer ${newAccessToken}`)
        .set('Cookie', cookies)
        .expect(200);

      expect(response.body).toEqual({ message: 'Successfully logged out' });

      // Verify Set-Cookie clears refreshToken
      const clearCookies = response.headers['set-cookie'];
      expect(clearCookies).toBeDefined();
      const clearStr = Array.isArray(clearCookies) ? clearCookies.join(';') : clearCookies;
      expect(clearStr).toContain('refreshToken=;');
    });
  });
});
