import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { Argon2Service } from './argon2.service';
import { TokenService } from './token.service';
import { JwtStrategy } from './jwt.strategy';
import { JwtAuthGuard } from './guards/jwt-auth.guard';

@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('jwt.secret') || 'yester-super-secret-dev-jwt-key-2026',
        signOptions: {
          expiresIn: configService.get<string>('jwt.expiresIn') || '15m',
        },
      }),
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, TokenService, Argon2Service, JwtStrategy, JwtAuthGuard],
  exports: [AuthService, TokenService, Argon2Service, JwtAuthGuard, JwtModule, PassportModule],
})
export class AuthModule {}
