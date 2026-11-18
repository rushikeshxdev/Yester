import {
  ConflictException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../prisma/prisma.service';
import { Argon2Service } from './argon2.service';
import { TokenService } from './token.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: {
    id: string;
    email: string;
    createdAt: Date;
  };
}

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly argon2Service: Argon2Service,
    private readonly tokenService: TokenService,
    private readonly configService: ConfigService,
  ) {}

  /**
   * Registers a new sovereign user with Argon2id hashed password and initializes
   * default user preferences and an active multi-device auth session.
   */
  async register(
    dto: RegisterDto,
    ipAddress?: string,
    userAgent?: string,
  ): Promise<AuthResponse> {
    const normalizedEmail = dto.email.toLowerCase().trim();

    const existingUser = await this.prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (existingUser) {
      throw new ConflictException('Email address is already registered');
    }

    const passwordHash = await this.argon2Service.hashPassword(dto.password);

    const user = await this.prisma.user.create({
      data: {
        email: normalizedEmail,
        passwordHash,
        preference: {
          create: {
            theme: 'system',
            settings: {},
          },
        },
      },
      select: {
        id: true,
        email: true,
        createdAt: true,
      },
    });

    const accessToken = await this.tokenService.generateAccessToken(user.id, user.email);
    const { token: refreshToken, hash: refreshTokenHash } = this.tokenService.generateRefreshToken();

    const refreshExpiresInDays =
      this.configService.get<number>('jwt.refreshExpiresInDays') || 30;
    const expiresAt = new Date(Date.now() + refreshExpiresInDays * 24 * 60 * 60 * 1000);

    await this.prisma.authSession.create({
      data: {
        userId: user.id,
        refreshTokenHash,
        ipAddress,
        userAgent,
        expiresAt,
      },
    });

    return {
      accessToken,
      refreshToken,
      user,
    };
  }

  /**
   * Authenticates user credentials using Argon2id verification and mints
   * a fresh access JWT and hashed refresh session.
   */
  async login(
    dto: LoginDto,
    ipAddress?: string,
    userAgent?: string,
  ): Promise<AuthResponse> {
    const normalizedEmail = dto.email.toLowerCase().trim();

    const user = await this.prisma.user.findUnique({
      where: { email: normalizedEmail, deletedAt: null },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const isPasswordValid = await this.argon2Service.verifyPassword(
      user.passwordHash,
      dto.password,
    );

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const accessToken = await this.tokenService.generateAccessToken(user.id, user.email);
    const { token: refreshToken, hash: refreshTokenHash } = this.tokenService.generateRefreshToken();

    const refreshExpiresInDays =
      this.configService.get<number>('jwt.refreshExpiresInDays') || 30;
    const expiresAt = new Date(Date.now() + refreshExpiresInDays * 24 * 60 * 60 * 1000);

    await this.prisma.authSession.create({
      data: {
        userId: user.id,
        refreshTokenHash,
        ipAddress,
        userAgent,
        expiresAt,
      },
    });

    return {
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        email: user.email,
        createdAt: user.createdAt,
      },
    };
  }

  /**
   * Rotates refresh token and issues a new access token.
   * Crucial Security Invariant: Detects token reuse attacks and immediately
   * invalidates ALL sessions for that user if a revoked token is presented.
   */
  async refreshTokens(
    refreshTokenStr: string,
    ipAddress?: string,
    userAgent?: string,
  ): Promise<{ accessToken: string; refreshToken: string; user: { id: string; email: string } }> {
    if (!refreshTokenStr) {
      throw new UnauthorizedException('Refresh token is required');
    }

    const hash = this.argon2Service.hashRefreshToken(refreshTokenStr);

    const session = await this.prisma.authSession.findFirst({
      where: { refreshTokenHash: hash },
      include: { user: true },
    });

    if (!session) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    // Reuse detection: If token was already revoked, someone may have intercepted it!
    if (session.isRevoked) {
      await this.prisma.authSession.updateMany({
        where: { userId: session.userId, isRevoked: false },
        data: { isRevoked: true },
      });
      throw new UnauthorizedException(
        'Token reuse detected. All active sessions have been revoked for your security.',
      );
    }

    if (session.expiresAt < new Date()) {
      await this.prisma.authSession.update({
        where: { id: session.id },
        data: { isRevoked: true },
      });
      throw new UnauthorizedException('Refresh token has expired');
    }

    if (session.user.deletedAt !== null) {
      throw new UnauthorizedException('User account has been deactivated');
    }

    // Atomically rotate: revoke the used token
    await this.prisma.authSession.update({
      where: { id: session.id },
      data: { isRevoked: true },
    });

    // Mint new pair
    const accessToken = await this.tokenService.generateAccessToken(
      session.user.id,
      session.user.email,
    );
    const { token: newRefreshToken, hash: newRefreshTokenHash } =
      this.tokenService.generateRefreshToken();

    const refreshExpiresInDays =
      this.configService.get<number>('jwt.refreshExpiresInDays') || 30;
    const expiresAt = new Date(Date.now() + refreshExpiresInDays * 24 * 60 * 60 * 1000);

    await this.prisma.authSession.create({
      data: {
        userId: session.user.id,
        familyId: session.familyId,
        refreshTokenHash: newRefreshTokenHash,
        ipAddress: ipAddress || session.ipAddress,
        userAgent: userAgent || session.userAgent,
        expiresAt,
      },
    });

    return {
      accessToken,
      refreshToken: newRefreshToken,
      user: {
        id: session.user.id,
        email: session.user.email,
      },
    };
  }

  /**
   * Logs out the user by revoking the specific session or all user sessions.
   */
  async logout(userId: string, refreshTokenStr?: string): Promise<{ success: boolean }> {
    if (refreshTokenStr) {
      const hash = this.argon2Service.hashRefreshToken(refreshTokenStr);
      await this.prisma.authSession.updateMany({
        where: {
          userId,
          refreshTokenHash: hash,
          isRevoked: false,
        },
        data: { isRevoked: true },
      });
    } else {
      await this.prisma.authSession.updateMany({
        where: { userId, isRevoked: false },
        data: { isRevoked: true },
      });
    }

    return { success: true };
  }

  /**
   * Fetches the authenticated user's profile.
   */
  async getMe(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId, deletedAt: null },
      select: {
        id: true,
        email: true,
        createdAt: true,
        updatedAt: true,
        preference: {
          select: {
            theme: true,
            settings: true,
          },
        },
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }
}
