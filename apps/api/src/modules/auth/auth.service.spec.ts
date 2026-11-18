import { ConflictException, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AuthService } from './auth.service';
import { PrismaService } from '../../prisma/prisma.service';
import { Argon2Service } from './argon2.service';
import { TokenService } from './token.service';

describe('AuthService', () => {
  let authService: AuthService;
  let mockPrisma: any;
  let mockArgon2: any;
  let mockTokenService: any;
  let mockConfigService: any;

  beforeEach(() => {
    mockPrisma = {
      user: {
        findUnique: jest.fn(),
        create: jest.fn(),
      },
      authSession: {
        create: jest.fn(),
        findFirst: jest.fn(),
        update: jest.fn(),
        updateMany: jest.fn(),
      },
    };

    mockArgon2 = {
      hashPassword: jest.fn().mockResolvedValue('mock-password-hash'),
      verifyPassword: jest.fn().mockResolvedValue(true),
      generateRandomToken: jest.fn().mockReturnValue('mock-raw-refresh-token'),
      hashRefreshToken: jest.fn().mockReturnValue('mock-refresh-token-hash'),
    };

    mockTokenService = {
      generateAccessToken: jest.fn().mockResolvedValue('mock-access-token'),
      generateRefreshToken: jest.fn().mockReturnValue({
        token: 'mock-raw-refresh-token',
        hash: 'mock-refresh-token-hash',
      }),
    };

    mockConfigService = {
      get: jest.fn((key: string) => {
        if (key === 'jwt.refreshExpiresInDays') return 30;
        return undefined;
      }),
    };

    authService = new AuthService(
      mockPrisma as unknown as PrismaService,
      mockArgon2 as unknown as Argon2Service,
      mockTokenService as unknown as TokenService,
      mockConfigService as unknown as ConfigService,
    );
  });

  describe('register', () => {
    it('should register a new user successfully and return tokens', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null);
      mockPrisma.user.create.mockResolvedValue({
        id: 'u-123',
        email: 'user@example.com',
        createdAt: new Date(),
      });
      mockPrisma.authSession.create.mockResolvedValue({ id: 's-123' });

      const result = await authService.register(
        { email: 'User@Example.com', password: 'Password!123' },
        '127.0.0.1',
        'Jest-Agent',
      );

      expect(mockPrisma.user.findUnique).toHaveBeenCalledWith({ where: { email: 'user@example.com' } });
      expect(mockArgon2.hashPassword).toHaveBeenCalledWith('Password!123');
      expect(mockPrisma.authSession.create).toHaveBeenCalled();
      expect(result.accessToken).toBe('mock-access-token');
      expect(result.refreshToken).toBe('mock-raw-refresh-token');
      expect(result.user.id).toBe('u-123');
    });

    it('should throw ConflictException if email is already registered', async () => {
      mockPrisma.user.findUnique.mockResolvedValue({ id: 'existing' });

      await expect(
        authService.register({ email: 'existing@example.com', password: 'Password!123' }),
      ).rejects.toThrow(ConflictException);
    });
  });

  describe('login', () => {
    it('should login with valid credentials', async () => {
      mockPrisma.user.findUnique.mockResolvedValue({
        id: 'u-123',
        email: 'user@example.com',
        passwordHash: 'stored-hash',
        deletedAt: null,
        createdAt: new Date(),
      });
      mockArgon2.verifyPassword.mockResolvedValue(true);
      mockPrisma.authSession.create.mockResolvedValue({ id: 's-123' });

      const result = await authService.login(
        { email: 'user@example.com', password: 'Password!123' },
        '127.0.0.1',
      );

      expect(result.accessToken).toBe('mock-access-token');
      expect(result.refreshToken).toBe('mock-raw-refresh-token');
      expect(result.user.id).toBe('u-123');
    });

    it('should throw UnauthorizedException on invalid password', async () => {
      mockPrisma.user.findUnique.mockResolvedValue({
        id: 'u-123',
        email: 'user@example.com',
        passwordHash: 'stored-hash',
        deletedAt: null,
      });
      mockArgon2.verifyPassword.mockResolvedValue(false);

      await expect(
        authService.login({ email: 'user@example.com', password: 'WrongPassword' }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException if user does not exist', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null);

      await expect(
        authService.login({ email: 'unknown@example.com', password: 'WrongPassword' }),
      ).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('refreshTokens', () => {
    it('should rotate tokens for a valid active session', async () => {
      const activeSession = {
        id: 's-old',
        userId: 'u-123',
        isRevoked: false,
        expiresAt: new Date(Date.now() + 100000),
        user: { id: 'u-123', email: 'user@example.com', deletedAt: null },
      };

      mockPrisma.authSession.findFirst.mockResolvedValue(activeSession);
      mockPrisma.authSession.update.mockResolvedValue({ id: 's-old', isRevoked: true });
      mockPrisma.authSession.create.mockResolvedValue({ id: 's-new' });

      const result = await authService.refreshTokens('mock-raw-refresh-token');

      expect(mockPrisma.authSession.update).toHaveBeenCalledWith({
        where: { id: 's-old' },
        data: { isRevoked: true },
      });
      expect(mockPrisma.authSession.create).toHaveBeenCalled();
      expect(result.accessToken).toBe('mock-access-token');
      expect(result.refreshToken).toBe('mock-raw-refresh-token');
    });

    it('should detect token reuse attack, revoke all user sessions, and throw UnauthorizedException', async () => {
      const reusedRevokedSession = {
        id: 's-compromised',
        userId: 'u-123',
        isRevoked: true,
        expiresAt: new Date(Date.now() + 100000),
        user: { id: 'u-123', email: 'user@example.com', deletedAt: null },
      };

      mockPrisma.authSession.findFirst.mockResolvedValue(reusedRevokedSession);

      await expect(authService.refreshTokens('compromised-token')).rejects.toThrow(
        UnauthorizedException,
      );

      expect(mockPrisma.authSession.updateMany).toHaveBeenCalledWith({
        where: { userId: 'u-123', isRevoked: false },
        data: { isRevoked: true },
      });
    });

    it('should throw UnauthorizedException if refresh token is expired', async () => {
      const expiredSession = {
        id: 's-expired',
        userId: 'u-123',
        isRevoked: false,
        expiresAt: new Date(Date.now() - 10000),
        user: { id: 'u-123', email: 'user@example.com', deletedAt: null },
      };

      mockPrisma.authSession.findFirst.mockResolvedValue(expiredSession);

      await expect(authService.refreshTokens('expired-token')).rejects.toThrow(
        UnauthorizedException,
      );
      expect(mockPrisma.authSession.update).toHaveBeenCalledWith({
        where: { id: 's-expired' },
        data: { isRevoked: true },
      });
    });
  });

  describe('logout', () => {
    it('should revoke matching session when refreshToken is provided', async () => {
      mockPrisma.authSession.updateMany.mockResolvedValue({ count: 1 });

      const result = await authService.logout('u-123', 'raw-token');

      expect(mockPrisma.authSession.updateMany).toHaveBeenCalledWith({
        where: { userId: 'u-123', refreshTokenHash: 'mock-refresh-token-hash', isRevoked: false },
        data: { isRevoked: true },
      });
      expect(result).toEqual({ success: true });
    });
  });

  describe('getMe', () => {
    it('should return user profile if found', async () => {
      mockPrisma.user.findUnique.mockResolvedValue({
        id: 'u-123',
        email: 'user@example.com',
        preference: { theme: 'system' },
      });

      const result = await authService.getMe('u-123');
      expect(result.id).toBe('u-123');
      expect(result.email).toBe('user@example.com');
    });

    it('should throw NotFoundException if user is not found', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null);

      await expect(authService.getMe('u-nonexistent')).rejects.toThrow(NotFoundException);
    });
  });
});
