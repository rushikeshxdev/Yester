export interface CategoryStyle {
  label: string;
  color: string;
  bgColor: string;
  borderColor: string;
}

export const CATEGORY_THEME: Record<string, CategoryStyle> = {
  work: {
    label: 'Work',
    color: '#FF7138', // Signal Orange
    bgColor: 'rgba(255, 113, 56, 0.12)',
    borderColor: 'rgba(255, 113, 56, 0.3)',
  },
  WORK: {
    label: 'Work',
    color: '#FF7138',
    bgColor: 'rgba(255, 113, 56, 0.12)',
    borderColor: 'rgba(255, 113, 56, 0.3)',
  },
  fitness: {
    label: 'Fitness',
    color: '#4A72B2', // Slate Blue
    bgColor: 'rgba(74, 114, 178, 0.12)',
    borderColor: 'rgba(74, 114, 178, 0.3)',
  },
  FITNESS: {
    label: 'Fitness',
    color: '#4A72B2',
    bgColor: 'rgba(74, 114, 178, 0.12)',
    borderColor: 'rgba(74, 114, 178, 0.3)',
  },
  learning: {
    label: 'Learning',
    color: '#3FB950', // Emerald Green
    bgColor: 'rgba(63, 185, 80, 0.12)',
    borderColor: 'rgba(63, 185, 80, 0.3)',
  },
  LEARNING: {
    label: 'Learning',
    color: '#3FB950',
    bgColor: 'rgba(63, 185, 80, 0.12)',
    borderColor: 'rgba(63, 185, 80, 0.3)',
  },
  personal: {
    label: 'Personal',
    color: '#E5A84B', // Warm Amber
    bgColor: 'rgba(229, 168, 75, 0.12)',
    borderColor: 'rgba(229, 168, 75, 0.3)',
  },
  PERSONAL: {
    label: 'Personal',
    color: '#E5A84B',
    bgColor: 'rgba(229, 168, 75, 0.12)',
    borderColor: 'rgba(229, 168, 75, 0.3)',
  },
  project: {
    label: 'Projects',
    color: '#A371F7', // Amethyst Purple
    bgColor: 'rgba(163, 113, 247, 0.12)',
    borderColor: 'rgba(163, 113, 247, 0.3)',
  },
  PROJECT: {
    label: 'Projects',
    color: '#A371F7',
    bgColor: 'rgba(163, 113, 247, 0.12)',
    borderColor: 'rgba(163, 113, 247, 0.3)',
  },
  health: {
    label: 'Health',
    color: '#E25950', // Coral Crimson
    bgColor: 'rgba(226, 89, 80, 0.12)',
    borderColor: 'rgba(226, 89, 80, 0.3)',
  },
  HEALTH: {
    label: 'Health',
    color: '#E25950',
    bgColor: 'rgba(226, 89, 80, 0.12)',
    borderColor: 'rgba(226, 89, 80, 0.3)',
  },
};

export function getCategoryColor(categoryKey: string): string {
  return CATEGORY_THEME[categoryKey]?.color || '#8B949E';
}

export function getCategoryLabel(categoryKey: string): string {
  return CATEGORY_THEME[categoryKey]?.label || categoryKey;
}
