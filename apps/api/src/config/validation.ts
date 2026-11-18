import 'reflect-metadata';
import { plainToInstance } from 'class-transformer';
import { IsEnum, IsNumber, IsOptional, IsString, validateSync } from 'class-validator';

export enum Environment {
  Development = 'development',
  Production = 'production',
  Test = 'test',
}

export class EnvironmentVariables {
  @IsEnum(Environment)
  @IsOptional()
  NODE_ENV: Environment = Environment.Development;

  @IsNumber()
  @IsOptional()
  PORT: number = 3001;

  @IsString()
  DATABASE_URL!: string;

  @IsString()
  @IsOptional()
  CORS_ORIGIN: string = 'http://localhost:5173';

  @IsString()
  @IsOptional()
  JWT_SECRET: string = 'yester-super-secret-dev-jwt-key-2026';
}

export function validate(config: Record<string, unknown>): EnvironmentVariables {
  const validatedConfig = plainToInstance(EnvironmentVariables, config, {
    enableImplicitConversion: true,
  });

  const errors = validateSync(validatedConfig, {
    skipMissingProperties: false,
  });

  if (errors.length > 0) {
    const messages = errors
      .map((err) => {
        const constraints = err.constraints ? Object.values(err.constraints).join(', ') : 'unknown error';
        return `Environment variable "${err.property}" is invalid: ${constraints}`;
      })
      .join('\n');
    throw new Error(`Environment validation failed:\n${messages}`);
  }

  return validatedConfig;
}
