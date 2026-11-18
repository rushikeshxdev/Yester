import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class PreferencesService {
  constructor(private readonly prisma: PrismaService) {}

  async findByUserId(userId: string) {
    const preference = await this.prisma.userPreference.findUnique({
      where: { userId },
    });

    if (!preference) {
      return {
        userId,
        theme: 'system',
        settings: {},
      };
    }

    return preference;
  }
}
