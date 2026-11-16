import React from 'react';
import { cn } from '../../utils/cn';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  icon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'secondary',
  size = 'md',
  icon,
  className,
  disabled,
  ...props
}) => {
  const baseClasses =
    'inline-flex items-center justify-center font-medium transition-all duration-150 focus:outline-none focus:ring-1 focus:ring-neutral-400 disabled:opacity-30 disabled:cursor-not-allowed select-none tracking-tight';

  const sizeClasses = {
    sm: 'text-xs px-2.5 py-1.5 gap-1.5 rounded',
    md: 'text-xs px-3.5 py-2 gap-2 rounded-md',
    lg: 'text-sm px-5 py-2.5 gap-2 rounded-full font-medium',
  };

  const variantClasses = {
    primary:
      'bg-white text-black hover:bg-neutral-200 dark:bg-white dark:text-black dark:hover:bg-neutral-100 border border-neutral-200/20 shadow-sm active:scale-[0.98]',
    secondary:
      'bg-neutral-100 text-neutral-900 hover:bg-neutral-200 border border-neutral-300 dark:bg-[#121212] dark:text-neutral-200 dark:hover:bg-[#1A1A1A] dark:hover:text-white dark:border-[#222222]',
    ghost:
      'bg-transparent text-neutral-600 hover:text-black hover:bg-neutral-100 dark:text-neutral-400 dark:hover:text-white dark:hover:bg-[#161616]',
    danger:
      'bg-transparent text-neutral-500 hover:text-red-500 border border-neutral-200 hover:border-red-500/30 dark:text-neutral-400 dark:hover:text-red-400 dark:border-[#222222] dark:hover:border-red-500/40',
  };

  return (
    <button
      className={cn(baseClasses, sizeClasses[size], variantClasses[variant], className)}
      disabled={disabled}
      {...props}
    >
      {icon && <span className="shrink-0">{icon}</span>}
      {children}
    </button>
  );
};
