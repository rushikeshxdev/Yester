import React from 'react';
import { cn } from '../../utils/cn';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'active' | 'muted' | 'outline';
  className?: string;
  size?: 'sm' | 'md';
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'default',
  size = 'sm',
  className,
}) => {
  const sizeClasses = {
    sm: 'text-[9px] px-1.5 py-0.5 tracking-wider uppercase font-mono font-medium',
    md: 'text-[11px] px-2 py-0.5 tracking-wide uppercase font-mono font-medium',
  };

  const variantClasses = {
    default:
      'bg-neutral-100 text-neutral-800 dark:bg-[#151515] dark:text-neutral-300 border border-neutral-200 dark:border-[#222222]',
    active:
      'bg-black text-white dark:bg-white dark:text-black font-semibold shadow-sm',
    muted:
      'bg-transparent text-neutral-500 dark:text-neutral-500 border border-dashed border-neutral-300 dark:border-[#2A2A2A]',
    outline:
      'bg-transparent text-neutral-700 dark:text-neutral-400 border border-neutral-300 dark:border-[#252525]',
  };

  return (
    <span className={cn('inline-flex items-center justify-center rounded', sizeClasses[size], variantClasses[variant], className)}>
      {children}
    </span>
  );
};
