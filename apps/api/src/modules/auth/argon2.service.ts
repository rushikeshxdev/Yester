import { Injectable } from '@nestjs/common';
import * as argon2 from 'argon2';
import * as crypto from 'crypto';

@Injectable()
export class Argon2Service {
  /**
   * Hashes a password using Argon2id with OWASP recommended memory parameters.
   */
  async hashPassword(password: string): Promise<string> {
    return argon2.hash(password, {
      type: argon2.argon2id,
      memoryCost: 65536,
      timeCost: 3,
    });
  }

  /**
   * Verifies a plaintext password against an Argon2id hash.
   */
  async verifyPassword(hash: string, plain: string): Promise<boolean> {
    try {
      return await argon2.verify(hash, plain);
    } catch {
      return false;
    }
  }

  /**
   * Cryptographically hashes a refresh token using SHA-256 before database storage.
   * Never store plaintext refresh tokens.
   */
  hashRefreshToken(token: string): string {
    return crypto.createHash('sha256').update(token).digest('hex');
  }

  /**
   * Generates a high-entropy cryptographically random refresh token.
   */
  generateRandomToken(): string {
    return crypto.randomBytes(40).toString('hex');
  }
}
