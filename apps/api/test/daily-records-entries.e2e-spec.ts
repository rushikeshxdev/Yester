import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import cookieParser from 'cookie-parser';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';
import { HttpExceptionFilter } from '../src/common/filters/http-exception.filter';
import { ActivityCategory } from '@prisma/client';

describe('Daily Records & Entries CRUD (E2E)', () => {
  let app: INestApplication;
  let prisma: PrismaService;

  const userAEmail = `user-a-${Date.now()}@yester.app`;
  const userBEmail = `user-b-${Date.now()}@yester.app`;
  const password = 'SovereignP@ss2026!';

  let tokenA: string;
  let userIdA: string;

  let tokenB: string;
  let userIdB: string;

  let recordAId: string;
  let entryAId: string;
  const clientMintedEntryId = '550e8400-e29b-41d4-a716-446655440099';

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

    // Register User A
    const resA = await request(app.getHttpServer())
      .post('/api/v1/auth/register')
      .send({ email: userAEmail, password })
      .expect(201);
    tokenA = resA.body.accessToken;
    userIdA = resA.body.user.id;

    // Register User B
    const resB = await request(app.getHttpServer())
      .post('/api/v1/auth/register')
      .send({ email: userBEmail, password })
      .expect(201);
    tokenB = resB.body.accessToken;
    userIdB = resB.body.user.id;
  });

  afterAll(async () => {
    if (userIdA) {
      await prisma.user.deleteMany({ where: { id: userIdA } });
    }
    if (userIdB) {
      await prisma.user.deleteMany({ where: { id: userIdB } });
    }
    await app.close();
  });

  describe('Daily Records: PUT & GET /api/v1/daily-records/:date', () => {
    it('should reject unauthenticated request with 401', async () => {
      await request(app.getHttpServer())
        .get('/api/v1/daily-records/2026-11-18')
        .expect(401);
    });

    it('should reject invalid calendar date format with 400 Bad Request', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/v1/daily-records/not-a-valid-date')
        .set('Authorization', `Bearer ${tokenA}`)
        .expect(400);

      expect(response.body.status).toBe(400);
      expect(response.body.detail).toContain('Invalid date format');
    });

    it('should create a daily record with revision 1 when non-existent (PUT)', async () => {
      const response = await request(app.getHttpServer())
        .put('/api/v1/daily-records/2026-11-18')
        .set('Authorization', `Bearer ${tokenA}`)
        .send({
          headline: 'High-leverage engineering day',
          healthData: { sleepHours: 8, steps: 10500 },
          reflection: { mood: 'great', wins: ['Auth & CRUD delivered'] },
        })
        .expect(200);

      expect(response.body).toHaveProperty('id');
      recordAId = response.body.id;
      expect(response.body.date).toBe('2026-11-18');
      expect(response.body.headline).toBe('High-leverage engineering day');
      expect(response.body.revision).toBe(1);
      expect(response.body.entries).toEqual([]);
    });

    it('should fetch the created daily record for User A (GET)', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/v1/daily-records/2026-11-18')
        .set('Authorization', `Bearer ${tokenA}`)
        .expect(200);

      expect(response.body.id).toBe(recordAId);
      expect(response.body.date).toBe('2026-11-18');
      expect(response.body.revision).toBe(1);
    });

    it('should enforce tenant isolation: User B receives 404 for User A date', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/v1/daily-records/2026-11-18')
        .set('Authorization', `Bearer ${tokenB}`)
        .expect(404);

      expect(response.body.status).toBe(404);
    });

    it('should atomically update record when expectedRevision matches (PUT)', async () => {
      const response = await request(app.getHttpServer())
        .put('/api/v1/daily-records/2026-11-18')
        .set('Authorization', `Bearer ${tokenA}`)
        .send({
          headline: 'Updated headline after evening review',
          expectedRevision: 1,
        })
        .expect(200);

      expect(response.body.headline).toBe('Updated headline after evening review');
      expect(response.body.revision).toBe(2);
    });

    it('should reject stale update with 409 Conflict when expectedRevision mismatches', async () => {
      const response = await request(app.getHttpServer())
        .put('/api/v1/daily-records/2026-11-18')
        .set('Authorization', `Bearer ${tokenA}`)
        .send({
          headline: 'Concurrent edit attempt with stale revision',
          expectedRevision: 1, // Current revision is 2
        })
        .expect(409);

      expect(response.body.status).toBe(409);
      expect(response.body.detail).toContain('Conflict');
      expect(response.body.detail).toContain('current revision: 2');
    });

    it('should reject update without expectedRevision on existing record (400 Bad Request)', async () => {
      const response = await request(app.getHttpServer())
        .put('/api/v1/daily-records/2026-11-18')
        .set('Authorization', `Bearer ${tokenA}`)
        .send({
          headline: 'Missing revision',
        })
        .expect(400);

      expect(response.body.status).toBe(400);
      expect(response.body.detail).toContain('expectedRevision is required');
    });
  });

  describe('Entries CRUD & Tenant Isolation: POST, PATCH, DELETE /api/v1/entries', () => {
    it('should create an entry for User A linked to their daily record', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/v1/entries')
        .set('Authorization', `Bearer ${tokenA}`)
        .send({
          dailyRecordId: recordAId,
          category: ActivityCategory.WORK,
          title: 'Architecting atomic concurrency engine',
          planContribution: 2.5,
          payload: { focusScore: 9, tools: ['NestJS', 'PostgreSQL'] },
        })
        .expect(201);

      expect(response.body).toHaveProperty('id');
      entryAId = response.body.id;
      expect(response.body.title).toBe('Architecting atomic concurrency engine');
      expect(response.body.category).toBe(ActivityCategory.WORK);
      expect(response.body.revision).toBe(1);
    });

    it('should reject cross-tenant entry creation: User B cannot add entry to User A record (Rule #5)', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/v1/entries')
        .set('Authorization', `Bearer ${tokenB}`)
        .send({
          dailyRecordId: recordAId, // belongs to User A!
          category: ActivityCategory.WORK,
          title: 'Unauthorized injection',
        })
        .expect(400);

      expect(response.body.status).toBe(400);
      expect(response.body.detail).toContain('does not belong to user');
    });

    it('should accept client-minted UUID v4 (Rule #9)', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/v1/entries')
        .set('Authorization', `Bearer ${tokenA}`)
        .send({
          id: clientMintedEntryId,
          dailyRecordId: recordAId,
          category: ActivityCategory.FITNESS,
          title: 'Morning 5K run',
          payload: { distanceKm: 5.0, durationMinutes: 26 },
        })
        .expect(201);

      expect(response.body.id).toBe(clientMintedEntryId);
      expect(response.body.revision).toBe(1);
    });

    it('should reject duplicate client-minted UUID with 409 Conflict', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/v1/entries')
        .set('Authorization', `Bearer ${tokenA}`)
        .send({
          id: clientMintedEntryId, // already exists
          dailyRecordId: recordAId,
          category: ActivityCategory.FITNESS,
          title: 'Duplicate run attempt',
        })
        .expect(409);

      expect(response.body.status).toBe(409);
    });

    it('should atomically update entry when expectedRevision matches (PATCH)', async () => {
      const response = await request(app.getHttpServer())
        .patch(`/api/v1/entries/${entryAId}`)
        .set('Authorization', `Bearer ${tokenA}`)
        .send({
          title: 'Architecting atomic concurrency engine (Completed)',
          expectedRevision: 1,
        })
        .expect(200);

      expect(response.body.title).toBe('Architecting atomic concurrency engine (Completed)');
      expect(response.body.revision).toBe(2);
    });

    it('should reject stale entry update with 409 Conflict', async () => {
      const response = await request(app.getHttpServer())
        .patch(`/api/v1/entries/${entryAId}`)
        .set('Authorization', `Bearer ${tokenA}`)
        .send({
          title: 'Stale edit',
          expectedRevision: 1, // Current is 2
        })
        .expect(409);

      expect(response.body.status).toBe(409);
      expect(response.body.detail).toContain('current revision: 2');
    });

    it('should enforce tenant isolation on PATCH: User B cannot modify User A entry', async () => {
      const response = await request(app.getHttpServer())
        .patch(`/api/v1/entries/${entryAId}`)
        .set('Authorization', `Bearer ${tokenB}`)
        .send({
          title: 'Malicious modification',
          expectedRevision: 2,
        })
        .expect(404);

      expect(response.body.status).toBe(404);
    });

    it('should soft-delete an entry and exclude it from daily record queries', async () => {
      // 1. Verify daily record contains the entry before deletion
      const beforeRes = await request(app.getHttpServer())
        .get('/api/v1/daily-records/2026-11-18')
        .set('Authorization', `Bearer ${tokenA}`)
        .expect(200);

      const hasEntryBefore = beforeRes.body.entries.some((e: any) => e.id === entryAId);
      expect(hasEntryBefore).toBe(true);

      // 2. Soft-delete entry
      const deleteRes = await request(app.getHttpServer())
        .delete(`/api/v1/entries/${entryAId}`)
        .set('Authorization', `Bearer ${tokenA}`)
        .expect(200);

      expect(deleteRes.body.message).toContain('soft-deleted');

      // 3. Directly fetching the deleted entry returns 404
      await request(app.getHttpServer())
        .get(`/api/v1/entries/${entryAId}`)
        .set('Authorization', `Bearer ${tokenA}`)
        .expect(404);

      // 4. Daily record entries array excludes the soft-deleted entry
      const afterRes = await request(app.getHttpServer())
        .get('/api/v1/daily-records/2026-11-18')
        .set('Authorization', `Bearer ${tokenA}`)
        .expect(200);

      const hasEntryAfter = afterRes.body.entries.some((e: any) => e.id === entryAId);
      expect(hasEntryAfter).toBe(false);

      // Verify second entry (clientMintedEntryId) is still present and intact
      const hasClientEntry = afterRes.body.entries.some((e: any) => e.id === clientMintedEntryId);
      expect(hasClientEntry).toBe(true);
    });
  });
});
