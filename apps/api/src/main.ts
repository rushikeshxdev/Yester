import { Logger, ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import cookieParser from 'cookie-parser';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  const app = await NestFactory.create(AppModule);

  app.use(cookieParser());

  const configService = app.get(ConfigService);
  const port = configService.get<number>('port') || 3001;
  const corsOrigin = configService.get<string>('corsOrigin') || 'http://localhost:5173';

  // Global prefix for API versioning
  app.setGlobalPrefix('api/v1');

  // Centralized RFC 7807 error formatting filter
  app.useGlobalFilters(new HttpExceptionFilter());

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  // CORS configuration
  app.enableCors({
    origin: [corsOrigin, 'http://localhost:5173', 'http://localhost:5174'],
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    credentials: true,
  });

  // Enable graceful shutdown hooks for clean database disconnection
  app.enableShutdownHooks();

  // Swagger / OpenAPI documentation setup
  const swaggerConfig = new DocumentBuilder()
    .setTitle('Yester API')
    .setDescription('Sovereign Personal Life OS & Long-Term Archive API')
    .setVersion('1.0.0')
    .addTag('Health', 'Liveness and database readiness probes')
    .addTag('Users', 'User accounts & sovereign identity')
    .addTag('Daily Records', 'Journal day records envelope and calendar queries')
    .addTag('Entries', 'Granular daily entries for work, fitness, learning, projects, personal')
    .addTag('Plans', 'Long-term trajectory life plans and dynamic milestones')
    .addTag('Analytics', 'Personal archive summary and statistics')
    .addTag('Preferences', 'User settings and UI layout preferences')
    .build();

  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('api/docs', app, document);

  await app.listen(port);
  logger.log(`Yester API running on: http://localhost:${port}/api/v1`);
  logger.log(`Swagger OpenAPI docs available at: http://localhost:${port}/api/docs`);
}

bootstrap();
