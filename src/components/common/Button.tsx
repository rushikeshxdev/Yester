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
    'inline-flex items-center justify-center font-medium transition-all duration-150 focus:outline-none focus:ring-1 focus:ring-offset-1 focus:ring-[#555555] disabled:opacity-40 disabled:cursor-not-allowed select-none tracking-tight';

  const sizeClasses = {
    sm: 'text-xs px-2.5 py-1.5 gap-1.5 rounded',
    md: 'text-sm px-3.5 py-2 gap-2 rounded-md',
    lg: 'text-base px-5 py-2.5 gap-2.5 rounded-md font-semibold',
  };

  const variantClasses = {
    primary:
      'bg-white text-black hover:bg-neutral-200 dark:bg-white dark:text-black dark:hover:bg-neutral-200 border border-transparent shadow-sm',
    secondary:
      'bg-neutral-100 text-neutral-900 hover:bg-neutral-200 border border-neutral-300 dark:bg-[#141414] dark:text-neutral-200 dark:hover:bg-[#1E1E1E] dark:hover:text-white dark:border-[#292929]',
    ghost:
      'bg-transparent text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 dark:text-neutral-400 dark:hover:text-white dark:hover:bg-[#1B1B1B]',
    danger:
      'bg-transparent text-neutral-600 hover:text-red-500 border border-neutral-200 hover:border-red-500/40 dark:text-neutral-400 dark:hover:text-red-400 dark:border-[#292929] dark:hover:border-red-500/40',
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

