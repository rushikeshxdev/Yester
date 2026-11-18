// Safe, timezone-resilient date utilities strictly working with YYYY-MM-DD strings

export const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
] as const;

export const MONTH_SHORT_NAMES = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
] as const;

export const WEEKDAY_NAMES_MONDAY_FIRST = [
  'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'
] as const;

export const WEEKDAY_SHORT_MONDAY_FIRST = [
  'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'
] as const;

export const WEEKDAY_SHORT_SUNDAY_FIRST = [
  'Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'
] as const;

export function isLeapYear(year: number): boolean {
  return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
}

export function getDaysInMonth(year: number, month: number): number {
  // month: 1 - 12
  switch (month) {
    case 2:
      return isLeapYear(year) ? 29 : 28;
    case 4:
    case 6:
    case 9:
    case 11:
      return 30;
    default:
      return 31;
  }
}

export function padZero(num: number): string {
  return num < 10 ? `0${num}` : `${num}`;
}

export function formatDateKey(year: number, month: number, day: number): string {
  return `${year}-${padZero(month)}-${padZero(day)}`;
}

export function parseDateKey(dateKey: string): { year: number; month: number; day: number } {
  const parts = dateKey.split('-').map(Number);
  if (parts.length !== 3 || isNaN(parts[0]) || isNaN(parts[1]) || isNaN(parts[2])) {
    const now = new Date();
    return {
      year: now.getFullYear(),
      month: now.getMonth() + 1,
      day: now.getDate(),
    };
  }
  return {
    year: parts[0],
    month: parts[1],
    day: parts[2],
  };
}

export function getTodayDateKey(): string {
  const now = new Date();
  return formatDateKey(now.getFullYear(), now.getMonth() + 1, now.getDate());
}

/**
 * Returns index 0-6 based on firstDayOfWeek (1 = Monday-first, 0 = Sunday-first)
 */
export function getFirstWeekdayOfMonth(year: number, month: number, firstDayOfWeek: 0 | 1 = 1): number {
  const date = new Date(year, month - 1, 1);
  const sundayZeroDay = date.getDay();
  if (firstDayOfWeek === 0) {
    return sundayZeroDay;
  }
  return sundayZeroDay === 0 ? 6 : sundayZeroDay - 1;
}

/**
 * Returns index 0-6 where 0 = Monday, 1 = Tuesday, ..., 6 = Sunday
 */
export function getFirstWeekdayOfMonthMondayFirst(year: number, month: number): number {
  return getFirstWeekdayOfMonth(year, month, 1);
}

export function getMonthName(month: number): string {
  const idx = Math.max(1, Math.min(12, month)) - 1;
  return MONTH_NAMES[idx];
}

export function getShortMonthName(month: number): string {
  const idx = Math.max(1, Math.min(12, month)) - 1;
  return MONTH_SHORT_NAMES[idx];
}

export function formatDisplayDate(dateKey: string): {
  dayOfWeek: string;
  dayNumber: number;
  monthName: string;
  year: number;
  fullDateString: string;
} {
  const { year, month, day } = parseDateKey(dateKey);
  const dateObj = new Date(year, month - 1, day);
  const sundayZeroDay = dateObj.getDay();
  const mondayZeroIndex = sundayZeroDay === 0 ? 6 : sundayZeroDay - 1;
  const dayOfWeek = WEEKDAY_NAMES_MONDAY_FIRST[mondayZeroIndex];
  const monthName = getMonthName(month);

  return {
    dayOfWeek,
    dayNumber: day,
    monthName,
    year,
    fullDateString: `${dayOfWeek}, ${monthName} ${day}, ${year}`,
  };
}

export function getPreviousMonth(year: number, month: number): { year: number; month: number } {
  if (month === 1) {
    return { year: year - 1, month: 12 };
  }
  return { year, month: month - 1 };
}

export function getNextMonth(year: number, month: number): { year: number; month: number } {
  if (month === 12) {
    return { year: year + 1, month: 1 };
  }
  return { year, month: month + 1 };
}

