import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  subtitle?: string;
  children: React.ReactNode;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '4xl';
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  subtitle,
  children,
  maxWidth = 'lg',
}) => {
  const { reducedMotion } = useTheme();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const maxWidthClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    '2xl': 'max-w-2xl',
    '4xl': 'max-w-4xl',
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: reducedMotion ? 0.05 : 0.15 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm"
          />

          {/* Modal Container */}
          <motion.div
            initial={reducedMotion ? { opacity: 0 } : { opacity: 0, scale: 0.98, y: 8 }}
            animate={reducedMotion ? { opacity: 1 } : { opacity: 1, scale: 1, y: 0 }}
            exit={reducedMotion ? { opacity: 0 } : { opacity: 0, scale: 0.98, y: 8 }}
            transition={{ duration: reducedMotion ? 0.05 : 0.18, ease: [0.16, 1, 0.3, 1] }}
            className={`relative w-full ${maxWidthClasses[maxWidth]} bg-[#0E0E0E] dark:bg-[#0E0E0E] light:bg-[#FCFCFC] border border-[#222222] dark:border-[#222222] light:border-neutral-200 rounded-xl shadow-modal overflow-hidden z-10 flex flex-col max-h-[90vh]`}
          >
            {/* Header */}
            {(title || subtitle) && (
              <div className="flex items-start justify-between p-5 border-b border-[#1C1C1C] dark:border-[#1C1C1C] light:border-neutral-100 shrink-0">
                <div>
                  {title && (
                    <h3 className="text-lg font-serif font-normal tracking-tight text-white dark:text-white light:text-neutral-900">
                      {title}
                    </h3>
                  )}
                  {subtitle && (
                    <p className="text-xs font-mono text-neutral-400 dark:text-neutral-500 light:text-neutral-500 mt-1">
                      {subtitle}
                    </p>
                  )}
                </div>
                <button
                  onClick={onClose}
                  className="p-1.5 -mr-1.5 -mt-1.5 text-neutral-400 hover:text-white dark:hover:text-white light:text-neutral-500 light:hover:text-black transition-colors rounded-md hover:bg-[#1A1A1A] dark:hover:bg-[#1A1A1A] light:hover:bg-neutral-100"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}

            {/* Content Body */}
            <div className="p-5 overflow-y-auto flex-1">{children}</div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
