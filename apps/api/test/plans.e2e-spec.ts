import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import cookieParser from 'cookie-parser';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';
import { HttpExceptionFilter } from '../src/common/filters/http-exception.filter';
import { ActivityCategory, PacingType } from '@prisma/client';

describe('Life Plans & Trajectory Engine (E2E)', () => {
  let app: INestApplication;
  let prisma: PrismaService;

  const userAEmail = `plans-user-a-${Date.now()}@yester.app`;
  const userBEmail = `plans-user-b-${Date.now()}@yester.app`;
  const password = 'SovereignSecureP@ss2026!';

  let tokenA: string;
  let userIdA: string;

  let tokenB: string;
  let userIdB: string;

  let planAId: string;
  const clientMintedPlanId = 'a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c99';
  let dailyRecordAId: string;
  let entryAId: string;

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

  describe('POST /api/v1/plans', () => {
    it('should reject unauthenticated creation with 401', async () => {
      await request(app.getHttpServer())
        .post('/api/v1/plans')
        .send({
          title: 'Unauthenticated plan',
          category: ActivityCategory.PROJECT,
          targetValue: 50,
          startDate: '2026-11-01',
          targetDate: '2026-12-31',
        })
        .expect(401);
    });

    it('should reject creation when targetDate precedes startDate (400 Bad Request)', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/v1/plans')
        .set('Authorization', `Bearer ${tokenA}`)
        .send({
          title: 'Impossible Timeline',
          category: ActivityCategory.PROJECT,
          targetValue: 100,
          startDate: '2026-12-31',
          targetDate: '2026-11-01',
        })
        .expect(400);

      expect(response.body.status).toBe(400);
      expect(response.body.detail).toContain('targetDate cannot precede startDate');
    });

    it('should create plan with client UUID, milestones, and initial revision 1', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/v1/plans')
        .set('Authorization', `Bearer ${tokenA}`)
        .send({
          id: clientMintedPlanId,
          title: 'Ship Core Offline Architecture',
          statement: 'Build zero-dependency local storage sync',
          category: ActivityCategory.PROJECT,
          targetValue: 100,
          unitLabel: 'Hours',
          startDate: '2026-11-01',
          targetDate: '2026-11-30',
          pacingType: PacingType.LINEAR,
          milestones: [
            { title: '25% Foundation', targetPercent: 25 },
            { title: '50% Core Engine', targetPercent: 50 },
            { title: '100% Launch', targetPercent: 100 },
          ],
        })
        .expect(201);

      expect(response.body.id).toBe(clientMintedPlanId);
      planAId = response.body.id;
      expect(response.body.title).toBe('Ship Core Offline Architecture');
      expect(response.body.targetValue).toBe(100);
      expect(response.body.startDate).toBe('2026-11-01');
      expect(response.body.targetDate).toBe('2026-11-30');
      expect(response.body.revision).toBe(1);
      expect(response.body.milestones.length).toBe(3);
    });

    it('should reject duplicate client-minted UUID with 409 Conflict', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/v1/plans')
        .set('Authorization', `Bearer ${tokenA}`)
        .send({
          id: clientMintedPlanId, // Duplicate!
          title: 'Duplicate Plan Attempt',
          category: ActivityCategory.PROJECT,
          targetValue: 50,
          startDate: '2026-11-01',
          targetDate: '2026-11-30',
        })
        .expect(409);

      expect(response.body.status).toBe(409);
    });
  });

  describe('GET /api/v1/plans & Tenant Isolation', () => {
    it('should list plans for User A with dynamically derived progress', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/v1/plans')
        .set('Authorization', `Bearer ${tokenA}`)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBe(1);
      const plan = response.body[0];
      expect(plan.id).toBe(planAId);
      expect(plan.currentValue).toBe(0);
      expect(plan.progressPercent).toBe(0);
      expect(plan.expectedValue).toBeDefined();
      expect(plan.paceStatus).toBeDefined();
    });

    it('should return empty list for User B (tenant isolation)', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/v1/plans')
        .set('Authorization', `Bearer ${tokenB}`)
        .expect(200);

      expect(response.body).toEqual([]);
    });
  });

  describe('GET /api/v1/plans/:id & Dynamic Trajectory Linking', () => {
    it('should enforce tenant isolation: User B receives 404 for User A plan', async () => {
      await request(app.getHttpServer())
        .get(`/api/v1/plans/${planAId}`)
        .set('Authorization', `Bearer ${tokenB}`)
        .expect(404);
    });

    it('should dynamically reflect linked journal entries and milestone completion', async () => {
      // 1. Create a daily record for User A on 2026-11-10
      const recordRes = await request(app.getHttpServer())
        .put('/api/v1/daily-records/2026-11-10')
        .set('Authorization', `Bearer ${tokenA}`)
        .send({ headline: 'Milestone sprint day' })
        .expect(200);
      dailyRecordAId = recordRes.body.id;

      // 2. Create an entry contributing 30 hours to the plan
      const entryRes = await request(app.getHttpServer())
        .post('/api/v1/entries')
        .set('Authorization', `Bearer ${tokenA}`)
        .send({
          dailyRecordId: dailyRecordAId,
          category: ActivityCategory.PROJECT,
          title: 'Offline queue implementation',
          planId: planAId,
          planContribution: 30, // Exceeds 25% milestone
        })
        .expect(201);
      entryAId = entryRes.body.id;

      // 3. Query plan trajectory as of 2026-11-15
      const planRes = await request(app.getHttpServer())
        .get(`/api/v1/plans/${planAId}?asOfDate=2026-11-15`)
        .set('Authorization', `Bearer ${tokenA}`)
        .expect(200);

      expect(planRes.body.trajectory).toBeDefined();
      expect(planRes.body.trajectory.actualValue).toBe(30);
      expect(planRes.body.trajectory.actualPercent).toBe(30);

      // Verify milestone 1 (25%) is dynamically marked reached
      const m1 = planRes.body.trajectory.milestones.find((m: any) => m.targetPercent === 25);
      expect(m1.isReached).toBe(true);
      expect(m1.reachedDate).toBe('2026-11-10');
      expect(m1.reachedValue).toBe(30);

      // Verify milestone 2 (50%) is not reached
      const m2 = planRes.body.trajectory.milestones.find((m: any) => m.targetPercent === 50);
      expect(m2.isReached).toBe(false);

      // Verify daily chart series includes all 30 days of November
      expect(planRes.body.trajectory.chartData.length).toBe(30);
    });
  });

  describe('PATCH /api/v1/plans/:id & Concurrency Control', () => {
    it('should atomically update plan when expectedRevision matches', async () => {
      const response = await request(app.getHttpServer())
        .patch(`/api/v1/plans/${planAId}`)
        .set('Authorization', `Bearer ${tokenA}`)
        .send({
          title: 'Ship Core Offline Architecture (Expanded)',
          targetValue: 120,
          expectedRevision: 1,
        })
        .expect(200);

      expect(response.body.title).toBe('Ship Core Offline Architecture (Expanded)');
      expect(response.body.targetValue).toBe(120);
      expect(response.body.revision).toBe(2);
    });

    it('should reject stale update with 409 Conflict when expectedRevision mismatches', async () => {
      const response = await request(app.getHttpServer())
        .patch(`/api/v1/plans/${planAId}`)
        .set('Authorization', `Bearer ${tokenA}`)
        .send({
          title: 'Concurrent edit attempt',
          expectedRevision: 1, // Current is 2
        })
        .expect(409);

      expect(response.body.status).toBe(409);
      expect(response.body.detail).toContain('Conflict');
      expect(response.body.detail).toContain('current revision: 2');
    });

    it('should enforce tenant isolation: User B cannot modify User A plan', async () => {
      await request(app.getHttpServer())
        .patch(`/api/v1/plans/${planAId}`)
        .set('Authorization', `Bearer ${tokenB}`)
        .send({
          title: 'Malicious modification',
          expectedRevision: 2,
        })
        .expect(404);
    });
  });

  describe('DELETE /api/v1/plans/:id & Soft Deletion Integrity', () => {
    it('should soft-delete plan without deleting linked journal entries', async () => {
      const deleteRes = await request(app.getHttpServer())
        .delete(`/api/v1/plans/${planAId}?expectedRevision=2`)
        .set('Authorization', `Bearer ${tokenA}`)
        .expect(200);

      expect(deleteRes.body.message).toContain('soft-deleted');

      // 1. Direct query to plan returns 404
      await request(app.getHttpServer())
        .get(`/api/v1/plans/${planAId}`)
        .set('Authorization', `Bearer ${tokenA}`)
        .expect(404);

      // 2. Plan is omitted from list of active plans
      const listRes = await request(app.getHttpServer())
        .get('/api/v1/plans')
        .set('Authorization', `Bearer ${tokenA}`)
        .expect(200);
      expect(listRes.body.some((p: any) => p.id === planAId)).toBe(false);

      // 3. Crucial Invariant: Linked entry in daily record STILL exists with planId intact!
      const entryCheck = await request(app.getHttpServer())
        .get(`/api/v1/entries/${entryAId}`)
        .set('Authorization', `Bearer ${tokenA}`)
        .expect(200);

      expect(entryCheck.body.id).toBe(entryAId);
      expect(entryCheck.body.planId).toBe(planAId); // History preserved!
    });
  });
});
