import { BadRequestException } from '@nestjs/common';
import { formatCalendarDate, parseCalendarDate } from './date.util';

describe('date.util', () => {
  describe('parseCalendarDate', () => {
    it('should parse valid YYYY-MM-DD into UTC midnight Date', () => {
      const date = parseCalendarDate('2026-11-18');
      expect(date.getUTCFullYear()).toBe(2026);
      expect(date.getUTCMonth()).toBe(10); // 0-indexed November
      expect(date.getUTCDate()).toBe(18);
      expect(date.getUTCHours()).toBe(0);
      expect(date.getUTCMinutes()).toBe(0);
      expect(date.getUTCSeconds()).toBe(0);
    });

    it('should correctly handle leap year dates (Feb 29 on leap year)', () => {
      const leapDate = parseCalendarDate('2024-02-29');
      expect(leapDate.getUTCDate()).toBe(29);
      expect(leapDate.getUTCMonth()).toBe(1); // February
    });

    it('should reject Feb 29 on non-leap year', () => {
      expect(() => parseCalendarDate('2025-02-29')).toThrow(BadRequestException);
    });

    it('should reject invalid calendar formats', () => {
      expect(() => parseCalendarDate('18-11-2026')).toThrow(BadRequestException);
      expect(() => parseCalendarDate('2026/11/18')).toThrow(BadRequestException);
      expect(() => parseCalendarDate('invalid-date')).toThrow(BadRequestException);
      expect(() => parseCalendarDate('')).toThrow(BadRequestException);
    });

    it('should reject out-of-range months and days', () => {
      expect(() => parseCalendarDate('2026-13-01')).toThrow(BadRequestException);
      expect(() => parseCalendarDate('2026-00-10')).toThrow(BadRequestException);
      expect(() => parseCalendarDate('2026-04-31')).toThrow(BadRequestException); // April has 30 days
      expect(() => parseCalendarDate('2026-01-32')).toThrow(BadRequestException);
    });
  });

  describe('formatCalendarDate', () => {
    it('should format Date object into YYYY-MM-DD string strictly', () => {
      const date = new Date(Date.UTC(2026, 10, 18, 0, 0, 0));
      expect(formatCalendarDate(date)).toBe('2026-11-18');
    });
  });
});
