import React, { useRef, useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, ChevronUp, ChevronDown } from 'lucide-react';
import { useLifeOS } from '../../context/LifeOSContext';
import { useTheme } from '../../context/ThemeContext';
import { ThemeToggle } from '../common/ThemeToggle';
import { getDynamicYearRange } from '../../services/calendarService';
import { Button } from '../common/Button';

export const YearSelector: React.FC = () => {
  const { year, selectYear, hasSampleData, loadSampleData, clearSampleData } = useLifeOS();
  const { reducedMotion } = useTheme();

  const [activeYear, setActiveYear] = useState<number>(year);
  const containerRef = useRef<HTMLDivElement>(null);
  const scrollRafRef = useRef<number | null>(null);

  // Dynamic range centered around current year (15 years past, 10 years future)
  const currentYearNow = new Date().getFullYear();
  const years = getDynamicYearRange(currentYearNow, 12);

  // Scroll to active year on initial mount
  useEffect(() => {
    const el = document.getElementById(`year-node-${activeYear}`);
    if (el && containerRef.current) {
      el.scrollIntoView({ behavior: 'auto', block: 'center' });
    }
  }, []);

  // Handle scroll: dynamic highlight of the year closest to the vertical center
  const handleScroll = () => {
    if (scrollRafRef.current) {
      cancelAnimationFrame(scrollRafRef.current);
    }
    scrollRafRef.current = requestAnimationFrame(() => {
      const container = containerRef.current;
      if (!container) return;

      const containerRect = container.getBoundingClientRect();
      const centerY = containerRect.top + containerRect.height / 2;

      let closestYear = activeYear;
      let minDistance = Infinity;

      for (const y of years) {
        const node = document.getElementById(`year-node-${y}`);
        if (node) {
          const nodeRect = node.getBoundingClientRect();
          const nodeCenterY = nodeRect.top + nodeRect.height / 2;
          const distance = Math.abs(centerY - nodeCenterY);
          if (distance < minDistance) {
            minDistance = distance;
            closestYear = y;
          }
        }
      }

      if (closestYear !== activeYear) {
        setActiveYear(closestYear);
      }
    });
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowUp') {
        e.preventDefault();
        const next = Math.max(years[0], activeYear - 1);
        setActiveYear(next);
        const el = document.getElementById(`year-node-${next}`);
        el?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        const next = Math.min(years[years.length - 1], activeYear + 1);
        setActiveYear(next);
        const el = document.getElementById(`year-node-${next}`);
        el?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      } else if (e.key === 'Enter') {
        e.preventDefault();
        selectYear(activeYear);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeYear, selectYear, years]);

  // Click on any year immediately navigates forward!
  const handleYearClick = (y: number) => {
    selectYear(y);
  };

  const handleNext = () => {
    selectYear(activeYear);
  };

  const handleChevronMove = (delta: number) => {
    const next = delta < 0
      ? Math.max(years[0], activeYear - 1)
      : Math.min(years[years.length - 1], activeYear + 1);
    setActiveYear(next);
    const el = document.getElementById(`year-node-${next}`);
    el?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  };

  return (
    <div className="relative min-h-screen w-full flex flex-col justify-between items-center bg-[#0B0B0B] dark:bg-[#0B0B0B] text-white overflow-hidden select-none px-6 py-8">
      {/* Subtle background grid pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#161616_1px,transparent_1px),linear-gradient(to_bottom,#161616_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] opacity-40 pointer-events-none" />

      {/* Top Header Bar */}
      <header className="relative z-10 w-full max-w-5xl flex items-center justify-between">
        <div className="flex flex-col">
          <span className="text-xs uppercase font-mono tracking-widest text-[#A0A0A0]">
            LIFE OS
          </span>
          <span className="text-[11px] text-neutral-500 font-mono tracking-wide mt-0.5">
            Temporal Growth Kernel
          </span>
        </div>

        <div className="flex items-center gap-3">
          {hasSampleData ? (
            <button
              onClick={clearSampleData}
              className="text-[11px] font-mono text-neutral-500 hover:text-red-400 border border-neutral-800 px-2.5 py-1 rounded transition-colors"
            >
              Clear Demo Data
            </button>
          ) : (
            <button
              onClick={loadSampleData}
              className="text-[11px] font-mono text-neutral-500 hover:text-white border border-neutral-800 px-2.5 py-1 rounded transition-colors"
            >
              Load Demo Data
            </button>
          )}
          <ThemeToggle />
        </div>
      </header>

      {/* Center: Vertical Year Roller */}
      <div className="relative z-10 flex flex-col items-center justify-center my-auto w-full max-w-lg">
        {/* Navigation indicator up */}
        <button
          onClick={() => handleChevronMove(-1)}
          className="p-2 text-neutral-600 hover:text-white transition-colors mb-2 rounded-full hover:bg-[#1A1A1A]"
          aria-label="Previous year"
        >
          <ChevronUp className="w-5 h-5" />
        </button>

        {/* Scrollable Year Container with center-highlight listener */}
        <div
          ref={containerRef}
          onScroll={handleScroll}
          className="h-[380px] w-full overflow-y-scroll snap-y-mandatory no-scrollbar flex flex-col items-center py-[134px] relative"
        >
          {years.map((y) => {
            const isSelected = y === activeYear;
            const diff = Math.abs(y - activeYear);

            return (
              <div
                key={y}
                id={`year-node-${y}`}
                onClick={() => handleYearClick(y)}
                className="snap-center h-28 flex flex-col items-center justify-center cursor-pointer transition-all duration-200 group"
                title={`Click to enter ${y}`}
              >
                <motion.span
                  animate={{
                    scale: isSelected ? 1.08 : diff === 1 ? 0.78 : 0.58,
                    opacity: isSelected ? 1 : diff === 1 ? 0.35 : 0.15,
                  }}
                  transition={{ duration: reducedMotion ? 0.05 : 0.15 }}
                  className={`font-mono tracking-tighter select-none transition-colors group-hover:text-white ${
                    isSelected
                      ? 'text-7xl sm:text-8xl font-bold text-white tracking-tight drop-shadow-sm'
                      : 'text-4xl sm:text-5xl font-medium text-neutral-400'
                  }`}
                >
                  {y}
                </motion.span>
                {isSelected && (
                  <span className="text-[10px] font-mono uppercase tracking-widest text-neutral-400 mt-1 opacity-80 group-hover:opacity-100 flex items-center gap-1">
                    <span>Click to enter</span>
                    <ArrowRight className="w-3 h-3" />
                  </span>
                )}
              </div>
            );
          })}
        </div>

        {/* Navigation indicator down */}
        <button
          onClick={() => handleChevronMove(1)}
          className="p-2 text-neutral-600 hover:text-white transition-colors mt-2 rounded-full hover:bg-[#1A1A1A]"
          aria-label="Next year"
        >
          <ChevronDown className="w-5 h-5" />
        </button>

        {/* Subtitle / Philosophy */}
        <p className="text-center text-xs font-mono text-neutral-500 max-w-sm mt-4 leading-relaxed">
          Every year contains months. Every month contains days. Select a year to open its journey.
        </p>

        {/* Next Button */}
        <div className="mt-6 flex items-center gap-3">
          <Button
            size="lg"
            variant="primary"
            onClick={handleNext}
            icon={<ArrowRight className="w-4 h-4" />}
            className="px-8 py-3 rounded-full font-mono text-sm tracking-wide cursor-pointer"
          >
            Enter {activeYear}
          </Button>
        </div>

        <span className="text-[11px] font-mono text-neutral-600 mt-3">
          Scroll to change &bull; Click year or press Enter to advance
        </span>
      </div>

      {/* Footer Info */}
      <footer className="relative z-10 w-full max-w-5xl flex items-center justify-between text-[11px] font-mono text-neutral-500 pt-4 border-t border-[#1C1C1C]">
        <span>LIFE OS &bull; TIME FIRST ARCHITECTURE</span>
        <span>YEAR &rarr; MONTH &rarr; DATE &rarr; RECORDS</span>
      </footer>
    </div>
  );
};
