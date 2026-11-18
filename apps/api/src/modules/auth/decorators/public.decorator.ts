import { SetMetadata } from '@nestjs/common';

export const IS_PUBLIC_KEY = 'isPublic';

/**
 * Decorator to bypass global JwtAuthGuard for public endpoints
 * (e.g., register, login, refresh, health).
 */
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);
