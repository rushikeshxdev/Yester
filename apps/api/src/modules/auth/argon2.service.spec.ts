import { Argon2Service } from './argon2.service';

describe('Argon2Service', () => {
  let service: Argon2Service;

  beforeEach(() => {
    service = new Argon2Service();
  });

  it('should hash a password and verify it correctly', async () => {
    const password = 'SuperSecretPassword!2026';
    const hash = await service.hashPassword(password);

    expect(hash).toBeDefined();
    expect(hash).not.toEqual(password);
    expect(hash.startsWith('$argon2id$')).toBe(true);

    const isValid = await service.verifyPassword(hash, password);
    expect(isValid).toBe(true);
  });

  it('should return false when verifying an incorrect password', async () => {
    const password = 'SuperSecretPassword!2026';
    const wrongPassword = 'IncorrectPassword!2026';
    const hash = await service.hashPassword(password);

    const isValid = await service.verifyPassword(hash, wrongPassword);
    expect(isValid).toBe(false);
  });

  it('should generate a 40-byte hex random token', () => {
    const token = service.generateRandomToken();
    expect(token).toBeDefined();
    expect(typeof token).toBe('string');
    // 40 bytes = 80 hex characters
    expect(token.length).toBe(80);
  });

  it('should compute SHA-256 hash of refresh token deterministically', () => {
    const token = 'sample-random-refresh-token-123456';
    const hash1 = service.hashRefreshToken(token);
    const hash2 = service.hashRefreshToken(token);

    expect(hash1).toBeDefined();
    expect(hash1).toEqual(hash2);
    // SHA-256 hex output is 64 characters
    expect(hash1.length).toBe(64);
  });
});
