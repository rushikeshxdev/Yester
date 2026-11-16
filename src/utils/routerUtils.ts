import { ScreenMode } from '../types';
import { parseDateKey } from './dateUtils';

export interface RouteState {
  screen: ScreenMode;
  year?: number;
  month?: number;
  dateKey?: string;
}

/**
 * Parses window.location.hash into application routing state.
 * Supports:
 * - #/ or #/years -> year selector
 * - #/months/:year -> month folio for that year (e.g. #/months/2024)
 * - #/calendar/:year/:month -> monthly calendar (e.g. #/calendar/2024/06)
 * - #/journal/:date -> daily journal record (e.g. #/journal/2024-06-25)
 * - #/analytics -> analytics dashboard
 * - #/search -> search and filter
 */
export const parseHash = (rawHash: string): RouteState | null => {
  const hash = rawHash.replace(/^#\/?/, '').trim();
  if (!hash || hash === 'years' || hash === 'year') {
    return { screen: 'year' };
  }

  if (hash === 'analytics') {
    return { screen: 'analytics' };
  }

  if (hash === 'search') {
    return { screen: 'search' };
  }

  // #/months/:year (e.g. #/months/2024)
  const monthMatch = hash.match(/^months\/(\d{4})$/);
  if (monthMatch) {
    const year = parseInt(monthMatch[1], 10);
    return { screen: 'month', year };
  }

  // #/calendar/:year/:month (e.g. #/calendar/2024/06 or #/calendar/2024/6)
  const calendarMatch = hash.match(/^calendar\/(\d{4})\/(\d{1,2})$/);
  if (calendarMatch) {
    const year = parseInt(calendarMatch[1], 10);
    const month = parseInt(calendarMatch[2], 10);
    return { screen: 'calendar', year, month };
  }

  // #/journal/:date (e.g. #/journal/2024-06-25)
  const journalMatch = hash.match(/^journal\/(\d{4}-\d{2}-\d{2})$/);
  if (journalMatch) {
    const dateKey = journalMatch[1];
    const parts = parseDateKey(dateKey);
    return {
      screen: 'daily',
      year: parts.year,
      month: parts.month,
      dateKey,
    };
  }

  return null;
};

/**
 * Builds the canonical URL hash string for the current application state.
 */
export const buildHash = (state: {
  screen: ScreenMode;
  year: number;
  month: number;
  selectedDate: string;
}): string => {
  switch (state.screen) {
    case 'year':
      return '#/years';
    case 'month':
      return `#/months/${state.year}`;
    case 'calendar':
      return `#/calendar/${state.year}/${String(state.month).padStart(2, '0')}`;
    case 'daily':
      return `#/journal/${state.selectedDate}`;
    case 'analytics':
      return '#/analytics';
    case 'search':
      return '#/search';
    default:
      return '#/years';
  }
};
