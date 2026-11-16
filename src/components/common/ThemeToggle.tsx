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
      className={`p-2 rounded-md border transition-all duration-200 ${
        theme === 'dark'
          ? 'bg-[#141414] hover:bg-[#1B1B1B] text-[#A0A0A0] hover:text-white border-[#292929]'
          : 'bg-[#F7F7F7] hover:bg-[#EFEFEF] text-[#666666] hover:text-[#111111] border-[#E5E5E5]'
      } ${className}`}
    >
      {theme === 'dark' ? (
        <Sun className="w-4 h-4" />
      ) : (
        <Moon className="w-4 h-4" />
      )}
    </button>
  );
};

