import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import configuration from './config/configuration';
import { validate } from './config/validation';
import { PrismaModule } from './prisma/prisma.module';
import { HealthModule } from './modules/health/health.module';
import { UsersModule } from './modules/users/users.module';
import { DailyRecordsModule } from './modules/daily-records/daily-records.module';
import { EntriesModule } from './modules/entries/entries.module';
import { PlansModule } from './modules/plans/plans.module';
import { AnalyticsModule } from './modules/analytics/analytics.module';
import { PreferencesModule } from './modules/preferences/preferences.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
      validate,
    }),
    PrismaModule,
    HealthModule,
    UsersModule,
    DailyRecordsModule,
    EntriesModule,
    PlansModule,
    AnalyticsModule,
    PreferencesModule,
  ],
})
export class AppModule {}
