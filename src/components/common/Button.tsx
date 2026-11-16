import React from 'react';
import { cn } from '../../utils/cn';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'orange';
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
    'inline-flex items-center justify-center font-medium transition-all duration-150 focus:outline-none focus:ring-1 focus:ring-[#FF7138] disabled:opacity-35 disabled:cursor-not-allowed select-none tracking-tight';

  const sizeClasses = {
    sm: 'text-xs px-2.5 py-1.5 gap-1.5 rounded-md',
    md: 'text-xs px-3.5 py-2 gap-2 rounded-lg',
    lg: 'text-sm px-5 py-2.5 gap-2 rounded-full font-medium',
  };

  const variantClasses = {
    primary:
      'bg-[#FF7138] hover:bg-[#FF8555] active:bg-[#E85A27] text-white font-medium shadow-orange-sm active:scale-[0.98] border border-transparent',
    orange:
      'bg-[#FF7138] hover:bg-[#FF8555] active:bg-[#E85A27] text-white font-medium shadow-orange-sm active:scale-[0.98] border border-transparent',
    secondary:
      'bg-[#13161A] hover:bg-[#191D23] text-[#F5F4F0] border border-[#242930] hover:border-[#303740] dark:bg-[#13161A] dark:hover:bg-[#191D23] dark:text-[#F5F4F0] dark:border-[#242930] light:bg-[#FFFFFF] light:hover:bg-[#F8F7F4] light:text-[#191B20] light:border-[#E5E3DC] light:hover:border-[#D7D5CE]',
    ghost:
      'bg-transparent text-[#A2A6AE] hover:text-white hover:bg-[#191D23] dark:text-[#A2A6AE] dark:hover:text-white dark:hover:bg-[#191D23] light:text-[#626872] light:hover:text-black light:hover:bg-neutral-100',
    danger:
      'bg-transparent text-neutral-400 hover:text-red-400 border border-[#242930] hover:border-red-500/40 dark:border-[#242930] dark:hover:border-red-500/40',
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
