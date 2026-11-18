import { Environment, validate } from './validation';

describe('Environment Validation (Unit)', () => {
  it('should accept valid configuration with all required fields', () => {
    const validConfig = {
      NODE_ENV: 'development',
      PORT: '3001',
      DATABASE_URL: 'postgresql://postgres:postgres@localhost:5432/yester_db?schema=public',
      CORS_ORIGIN: 'http://localhost:5173',
    };

    const result = validate(validConfig);
    expect(result).toBeDefined();
    expect(result.NODE_ENV).toBe(Environment.Development);
    expect(result.PORT).toBe(3001);
    expect(result.DATABASE_URL).toBe(validConfig.DATABASE_URL);
  });

  it('should throw an error when DATABASE_URL is missing', () => {
    const invalidConfig = {
      NODE_ENV: 'development',
      PORT: '3001',
    };

    expect(() => validate(invalidConfig)).toThrow('Environment variable "DATABASE_URL" is invalid');
  });

  it('should throw an error when NODE_ENV is not an allowed enum value', () => {
    const invalidConfig = {
      NODE_ENV: 'staging',
      DATABASE_URL: 'postgresql://localhost:5432/db',
    };

    expect(() => validate(invalidConfig)).toThrow('Environment variable "NODE_ENV" is invalid');
  });

  it('should convert numeric string PORT to number automatically', () => {
    const configWithPort = {
      PORT: '8080',
      DATABASE_URL: 'postgresql://localhost:5432/db',
    };

    const result = validate(configWithPort);
    expect(typeof result.PORT).toBe('number');
    expect(result.PORT).toBe(8080);
  });
});
