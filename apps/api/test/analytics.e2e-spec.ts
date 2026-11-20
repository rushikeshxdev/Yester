import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import cookieParser from 'cookie-parser';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';
import { HttpExceptionFilter } from '../src/common/filters/http-exception.filter';
import { ActivityCategory, PacingType } from '@prisma/client';

describe('Analytics Engine & Modular Visualization Endpoints (E2E)', () => {
  let app: INestApplication;
  let prisma: PrismaService;

  const userAEmail = `analytics-user-a-${Date.now()}@yester.app`;
  const userBEmail = `analytics-user-b-${Date.now()}@yester.app`;
  const password = 'SovereignSecureP@ss2026!';

  let tokenA: string;
  let userIdA: string;

  let tokenB: string;
  let userIdB: string;

  let planAId: string;

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

    // Seed User A Life Plan
    const planRes = await request(app.getHttpServer())
      .post('/api/v1/plans')
      .set('Authorization', `Bearer ${tokenA}`)
      .send({
        title: 'Deep Engineering Masterclass',
        category: ActivityCategory.LEARNING,
        targetValue: 60,
        unitLabel: 'Hours',
        startDate: '2026-11-01',
        targetDate: '2026-12-31',
        pacingType: PacingType.LINEAR,
      })
      .expect(201);
    planAId = planRes.body.id;

    // Seed Daily Records and Entries for User A
    // Day 1: 2026-11-18 (2 entries, one contributing to plan)
    const rec1Res = await request(app.getHttpServer())
      .put('/api/v1/daily-records/2026-11-18')
      .set('Authorization', `Bearer ${tokenA}`)
      .send({ headline: 'Architecture Day' })
      .expect(200);

    await request(app.getHttpServer())
      .post('/api/v1/entries')
      .set('Authorization', `Bearer ${tokenA}`)
      .send({
        dailyRecordId: rec1Res.body.id,
        category: ActivityCategory.LEARNING,
        title: 'System Design Module',
        planId: planAId,
        planContribution: 4,
      })
      .expect(201);

    await request(app.getHttpServer())
      .post('/api/v1/entries')
      .set('Authorization', `Bearer ${tokenA}`)
      .send({
        dailyRecordId: rec1Res.body.id,
        category: ActivityCategory.WORK,
        title: 'API Gateway refactoring',
      })
      .expect(201);

    // Day 2: 2026-11-19 (1 entry, contributing to plan)
    const rec2Res = await request(app.getHttpServer())
      .put('/api/v1/daily-records/2026-11-19')
      .set('Authorization', `Bearer ${tokenA}`)
      .send({ headline: 'Implementation Sprint' })
      .expect(200);

    await request(app.getHttpServer())
      .post('/api/v1/entries')
      .set('Authorization', `Bearer ${tokenA}`)
      .send({
        dailyRecordId: rec2Res.body.id,
        category: ActivityCategory.FITNESS,
        title: '5km Run',
      })
      .expect(201);

    // Seed an entry for User B to test tenant isolation
    const recBRes = await request(app.getHttpServer())
      .put('/api/v1/daily-records/2026-11-18')
      .set('Authorization', `Bearer ${tokenB}`)
      .send({ headline: 'User B Confidential Record' })
      .expect(200);

    await request(app.getHttpServer())
      .post('/api/v1/entries')
      .set('Authorization', `Bearer ${tokenB}`)
      .send({
        dailyRecordId: recBRes.body.id,
        category: ActivityCategory.PERSONAL,
        title: 'User B private diary entry',
      })
      .expect(201);
  });

  afterAll(async () => {
    // Cleanup users (cascades to records, entries, plans)
    if (userIdA) {
      await prisma.user.deleteMany({ where: { id: { in: [userIdA, userIdB] } } });
    }
    await app.close();
  });

  describe('GET /api/v1/analytics/overview', () => {
    it('should reject unauthenticated request with 401', async () => {
      await request(app.getHttpServer()).get('/api/v1/analytics/overview').expect(401);
    });

    it('should return overview KPIs strictly scoped to authenticated user A', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/v1/analytics/overview')
        .query({ year: 2026, month: 11 })
        .set('Authorization', `Bearer ${tokenA}`)
        .expect(200);

      expect(res.body.period).toEqual({ year: 2026, month: 11 });
      expect(res.body.kpis.totalEntries).toBe(3); // 2 on Nov 18 + 1 on Nov 19
      expect(res.body.kpis.recordedDays).toBe(2);
      expect(res.body.kpis.activePlansCount).toBe(1);
      expect(res.body.kpis.consistencyRate).toBeGreaterThan(0);
      expect(res.body.deltas).toBeDefined();
    });

    it('should maintain strict tenant isolation for User B', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/v1/analytics/overview')
        .query({ year: 2026, month: 11 })
        .set('Authorization', `Bearer ${tokenB}`)
        .expect(200);

      expect(res.body.kpis.totalEntries).toBe(1); // User B only has 1 entry
      expect(res.body.kpis.recordedDays).toBe(1);
      expect(res.body.kpis.activePlansCount).toBe(0);
    });
  });

  describe('GET /api/v1/analytics/activity-series', () => {
    it('should reject requests with invalid date formats', async () => {
      await request(app.getHttpServer())
        .get('/api/v1/analytics/activity-series')
        .query({ startDate: 'invalid-date', endDate: '2026-11-20' })
        .set('Authorization', `Bearer ${tokenA}`)
        .expect(400);
    });

    it('should return zero-filled daily time series for User A', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/v1/analytics/activity-series')
        .query({ startDate: '2026-11-17', endDate: '2026-11-20', granularity: 'daily' })
        .set('Authorization', `Bearer ${tokenA}`)
        .expect(200);

      expect(res.body.granularity).toBe('daily');
      expect(res.body.totalEntries).toBe(3);
      expect(res.body.dataPoints.length).toBe(4); // Nov 17, 18, 19, 20

      const nov17 = res.body.dataPoints.find((p: any) => p.date === '2026-11-17');
      expect(nov17.total).toBe(0);

      const nov18 = res.body.dataPoints.find((p: any) => p.date === '2026-11-18');
      expect(nov18.total).toBe(2);
      expect(nov18.categories.LEARNING).toBe(1);
      expect(nov18.categories.WORK).toBe(1);

      const nov19 = res.body.dataPoints.find((p: any) => p.date === '2026-11-19');
      expect(nov19.total).toBe(1);
      expect(nov19.categories.FITNESS).toBe(1);
    });

    it('should support weekly granularity aggregation', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/v1/analytics/activity-series')
        .query({ startDate: '2026-11-01', endDate: '2026-11-30', granularity: 'weekly' })
        .set('Authorization', `Bearer ${tokenA}`)
        .expect(200);

      expect(res.body.granularity).toBe('weekly');
      expect(res.body.totalEntries).toBe(3);
      expect(res.body.dataPoints.length).toBeGreaterThan(0);
    });
  });

  describe('GET /api/v1/analytics/calendar-heatmap', () => {
    it('should return 365 days for 2026 with correct intensity values', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/v1/analytics/calendar-heatmap')
        .query({ year: 2026 })
        .set('Authorization', `Bearer ${tokenA}`)
        .expect(200);

      expect(res.body.year).toBe(2026);
      expect(res.body.totalDays).toBe(365);
      expect(res.body.activeDays).toBe(2);
      expect(res.body.maxDayEntries).toBe(2);
      expect(res.body.startWeekday).toBe(4); // Thursday
      expect(res.body.totalWeeks).toBe(53);

      const nov18Day = res.body.heatmap.find((d: any) => d.date === '2026-11-18');
      expect(nov18Day).toBeDefined();
      expect(nov18Day.count).toBe(2);
      expect(nov18Day.intensity).toBe(1); // 2 entries -> level 1
      expect(nov18Day.categories.LEARNING).toBe(1);
    });
  });

  describe('GET /api/v1/analytics/categories', () => {
    it('should return distribution without hardcoded colors', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/v1/analytics/categories')
        .query({ year: 2026 })
        .set('Authorization', `Bearer ${tokenA}`)
        .expect(200);

      expect(res.body.totalEntries).toBe(3);
      expect(res.body.distribution.length).toBe(5);

      const learning = res.body.distribution.find((d: any) => d.category === 'LEARNING');
      expect(learning.count).toBe(1);
      expect(learning.percentage).toBe(33.3);
      expect(learning.color).toBeUndefined(); // API independence: no hardcoded colors!

      expect(res.body.monthlyComparison.length).toBe(1);
      expect(res.body.monthlyComparison[0].month).toBe('2026-11');
      expect(res.body.monthlyComparison[0].total).toBe(3);
    });
  });

  describe('GET /api/v1/analytics/plans', () => {
    it('should return life plan progress with dated time-series data', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/v1/analytics/plans')
        .set('Authorization', `Bearer ${tokenA}`)
        .expect(200);

      expect(res.body.plansCount).toBe(1);
      const plan = res.body.plans[0];
      expect(plan.id).toBe(planAId);
      expect(plan.title).toBe('Deep Engineering Masterclass');
      expect(plan.currentValue).toBe(4); // 4 hours logged on Nov 18
      expect(plan.targetValue).toBe(60);
      expect(plan.progressPercent).toBe(6.7); // 4 / 60 * 100 = 6.67%
      expect(plan.timeSeries).toBeDefined();
      expect(plan.timeSeries.length).toBeGreaterThanOrEqual(1);

      const nov18Point = plan.timeSeries.find((p: any) => p.date === '2026-11-18');
      expect(nov18Point).toBeDefined();
      expect(nov18Point.actualCumulative).toBe(4);
      expect(nov18Point.dailyContribution).toBe(4);
      expect(nov18Point.targetValue).toBe(60);
    });
  });
});
