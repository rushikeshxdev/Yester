import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

export const ThemeToggle: React.FC<{ className?: string }> = ({ className = '' }) => {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      type="button"
      aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
      className={`p-1.5 rounded-md border transition-all duration-200 ${
        theme === 'dark'
          ? 'bg-[#121212] hover:bg-[#1A1A1A] text-neutral-400 hover:text-white border-[#222222]'
          : 'bg-[#F5F5F3] hover:bg-[#ECECE9] text-neutral-600 hover:text-black border-[#E2E2DF]'
      } ${className}`}
    >
      {theme === 'dark' ? (
        <Sun className="w-3.5 h-3.5" />
      ) : (
        <Moon className="w-3.5 h-3.5" />
      )}
    </button>
  );
};
