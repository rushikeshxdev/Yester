import React from 'react';
import { Calendar, Sparkles, ArrowRight } from 'lucide-react';
import { useLifeOS } from '../../context/LifeOSContext';
import { ActivityCategory } from '../../types';

interface EmptyStateProps {
  title?: string;
  description?: string;
  actionText?: string;
  onAction?: () => void;
  category?: ActivityCategory;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title = 'No records yet',
  description = 'Start capturing your moments to see them here.',
  actionText = 'Add Your First Entry',
  onAction,
  category,
}) => {
  const { openQuickCapture, selectedDate } = useLifeOS();

  const handleAction = () => {
    if (onAction) {
      onAction();
    } else {
      openQuickCapture(category, selectedDate);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center text-center py-20 px-4 max-w-md mx-auto select-none">
      {/* Illuminated Icon Container */}
      <div className="relative mb-6 flex items-center justify-center">
        {/* Ambient Orange Glow */}
        <div className="absolute w-24 h-24 rounded-full bg-[#FF7138]/10 blur-xl pointer-events-none" />

        {/* Outer Icon Ring */}
        <div className="relative w-16 h-16 rounded-2xl bg-[#13161A] border border-[#232830] flex items-center justify-center shadow-lg group hover:border-[#FF7138]/40 transition-colors">
          <Calendar className="w-7 h-7 text-[#FF7138] stroke-[1.6]" />

          {/* Subtle Sparkle Accents */}
          <Sparkles className="w-3.5 h-3.5 text-[#FF7138]/70 absolute -top-1.5 -right-1.5 animate-pulse" />
        </div>
      </div>

      {/* Title */}
      <h3 className="text-2xl sm:text-3xl font-serif font-normal tracking-tight text-white dark:text-white light:text-neutral-900 mb-2.5">
        {title}
      </h3>

      {/* Description */}
      <p className="text-sm font-sans text-neutral-400 dark:text-neutral-400 light:text-neutral-600 mb-8 max-w-sm leading-relaxed">
        {description}
      </p>

      {/* CTA Button in Signal Orange */}
      <button
        onClick={handleAction}
        className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-[#FF7138] hover:bg-[#FF8352] text-white text-sm font-medium tracking-wide shadow-orange-sm hover:shadow-orange-md hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer"
      >
        <span>{actionText}</span>
        <ArrowRight className="w-4 h-4 stroke-[2]" />
      </button>
    </div>
  );
};
