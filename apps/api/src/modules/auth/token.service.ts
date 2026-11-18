import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Argon2Service } from './argon2.service';

export interface TokenPayload {
  sub: string;
  email: string;
}

export interface GeneratedRefreshToken {
  token: string;
  hash: string;
}

@Injectable()
export class TokenService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly argon2Service: Argon2Service,
  ) {}

  /**
   * Generates a short-lived access JWT (default 15 minutes).
   * Kept in client memory, never persisted in localStorage.
   */
  async generateAccessToken(userId: string, email: string): Promise<string> {
    const payload: TokenPayload = { sub: userId, email };
    const expiresIn = this.configService.get<string>('jwt.expiresIn') || '15m';

    return this.jwtService.signAsync(payload, { expiresIn });
  }

  /**
   * Generates a high-entropy cryptographically random refresh token
   * and computes its SHA-256 hash for database storage.
   */
  generateRefreshToken(): GeneratedRefreshToken {
    const token = this.argon2Service.generateRandomToken();
    const hash = this.argon2Service.hashRefreshToken(token);
    return { token, hash };
  }
}
