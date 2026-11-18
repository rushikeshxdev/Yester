import { BadRequestException } from '@nestjs/common';

const CALENDAR_DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/;

/**
 * Validates and parses a calendar date string (YYYY-MM-DD) into a UTC Date object
 * with time set to 00:00:00.000Z.
 * Ensures zero timezone drift regardless of server local timezone.
 */
export function parseCalendarDate(dateStr: string): Date {
  if (!dateStr || !CALENDAR_DATE_REGEX.test(dateStr)) {
    throw new BadRequestException(`Invalid date format '${dateStr}'. Expected YYYY-MM-DD`);
  }

  const [yearStr, monthStr, dayStr] = dateStr.split('-');
  const year = parseInt(yearStr, 10);
  const month = parseInt(monthStr, 10);
  const day = parseInt(dayStr, 10);

  if (month < 1 || month > 12) {
    throw new BadRequestException(`Invalid month '${monthStr}' in date '${dateStr}'`);
  }

  // Days in month check (including leap years)
  const daysInMonth = new Date(Date.UTC(year, month, 0)).getUTCDate();
  if (day < 1 || day > daysInMonth) {
    throw new BadRequestException(`Invalid day '${dayStr}' for month ${monthStr} in date '${dateStr}'`);
  }

  return new Date(Date.UTC(year, month - 1, day, 0, 0, 0, 0));
}

/**
 * Formats a Date object to a calendar date string (YYYY-MM-DD).
 */
export function formatCalendarDate(date: Date): string {
  return date.toISOString().slice(0, 10);
}
