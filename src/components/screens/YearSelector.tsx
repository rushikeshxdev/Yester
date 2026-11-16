import React, { useRef, useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, ChevronUp, ChevronDown, Sparkles } from 'lucide-react';
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

  const currentYearNow = new Date().getFullYear();
  const years = getDynamicYearRange(currentYearNow, 14);

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

  // Click on any year immediately navigates forward into Month selection
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

  const isCurrentYear = activeYear === currentYearNow;

  return (
    <div className="relative min-h-screen w-full flex flex-col justify-between items-center bg-[#070707] dark:bg-[#070707] light:bg-[#FCFCFC] text-white dark:text-white light:text-neutral-900 overflow-hidden select-none px-6 py-8 transition-colors duration-300">
      {/* Subtle architectural hairline grid background */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#141414_1px,transparent_1px),linear-gradient(to_bottom,#141414_1px,transparent_1px)] dark:bg-[linear-gradient(to_right,#141414_1px,transparent_1px),linear-gradient(to_bottom,#141414_1px,transparent_1px)] light:bg-[linear-gradient(to_right,#EAEAEA_1px,transparent_1px),linear-gradient(to_bottom,#EAEAEA_1px,transparent_1px)] bg-[size:5rem_5rem] [mask-image:radial-gradient(ellipse_70%_60%_at_50%_50%,#000_65%,transparent_100%)] opacity-35 pointer-events-none" />

      {/* Top Header Bar */}
      <header className="relative z-10 w-full max-w-5xl flex items-center justify-between pt-2">
        <div className="flex flex-col">
          <div className="flex items-baseline gap-2">
            <span className="text-xl font-serif italic tracking-wide font-normal text-white dark:text-white light:text-neutral-900">
              Yester
            </span>
            <span className="text-[10px] uppercase font-mono tracking-widest text-neutral-500 light:text-neutral-400">
              Personal Chronology
            </span>
          </div>
          <span className="text-xs font-serif italic text-neutral-400 dark:text-neutral-500 light:text-neutral-500 mt-0.5 tracking-wide">
            &ldquo;Every yesterday shapes who you become tomorrow.&rdquo;
          </span>
        </div>

        <div className="flex items-center gap-3">
          {hasSampleData ? (
            <button
              onClick={clearSampleData}
              className="text-[11px] font-mono text-neutral-500 hover:text-red-400 border border-[#222222] light:border-neutral-200 px-3 py-1 rounded transition-colors"
            >
              Clear Sample Data
            </button>
          ) : (
            <button
              onClick={loadSampleData}
              className="text-[11px] font-mono text-neutral-400 hover:text-white light:text-neutral-600 light:hover:text-black border border-[#222222] light:border-neutral-200 px-3 py-1 rounded transition-colors flex items-center gap-1.5"
            >
              <Sparkles className="w-3 h-3" />
              <span>Load Sample Data</span>
            </button>
          )}
          <ThemeToggle />
        </div>
      </header>

      {/* Center Stage: The Typographic Temporal Roller */}
      <div className="relative z-10 flex flex-col items-center justify-center my-auto w-full max-w-xl">
        {/* Navigation indicator up */}
        <button
          onClick={() => handleChevronMove(-1)}
          className="p-2 text-neutral-600 hover:text-white light:text-neutral-400 light:hover:text-black transition-colors mb-2 rounded-full hover:bg-neutral-900 dark:hover:bg-[#151515] light:hover:bg-neutral-200"
          aria-label="Previous year"
        >
          <ChevronUp className="w-5 h-5" />
        </button>

        {/* Framing Guides around the active middle year */}
        <div className="relative w-full flex items-center justify-center">
          {/* Hairline focus bracket lines */}
          <div className="absolute inset-x-8 sm:inset-x-14 top-1/2 -translate-y-1/2 h-28 pointer-events-none border-t border-b border-[#252525] dark:border-[#252525] light:border-[#E2E2DF] flex items-center justify-between px-2">
            <span className="text-[10px] font-mono uppercase tracking-widest text-neutral-600 dark:text-neutral-600 light:text-neutral-400 select-none">
              [ ERA ]
            </span>
            <span className="text-[10px] font-mono uppercase tracking-widest text-neutral-600 dark:text-neutral-600 light:text-neutral-400 select-none">
              {isCurrentYear ? 'PRESENT' : activeYear < currentYearNow ? 'ARCHIVE' : 'HORIZON'}
            </span>
          </div>

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
                  className="snap-center h-28 flex flex-col items-center justify-center cursor-pointer transition-all duration-200 group relative z-10"
                  title={`Open ${y}`}
                >
                  <motion.span
                    animate={{
                      scale: isSelected ? 1.05 : diff === 1 ? 0.76 : 0.55,
                      opacity: isSelected ? 1 : diff === 1 ? 0.35 : 0.12,
                    }}
                    transition={{ duration: reducedMotion ? 0.05 : 0.18 }}
                    className={`font-serif select-none transition-colors group-hover:text-white dark:group-hover:text-white light:group-hover:text-black ${
                      isSelected
                        ? 'text-7xl sm:text-8xl font-normal text-white dark:text-white light:text-neutral-900 tracking-tight drop-shadow-sm'
                        : 'text-4xl sm:text-5xl font-light text-neutral-500 dark:text-neutral-500 light:text-neutral-400'
                    }`}
                  >
                    {y}
                  </motion.span>

                  {isSelected && (
                    <span className="text-[10px] font-mono uppercase tracking-widest text-neutral-400 dark:text-neutral-400 light:text-neutral-500 mt-1 opacity-80 group-hover:opacity-100 flex items-center gap-1.5 transition-opacity">
                      <span>Click to enter {y}</span>
                      <ArrowRight className="w-3 h-3" />
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Navigation indicator down */}
        <button
          onClick={() => handleChevronMove(1)}
          className="p-2 text-neutral-600 hover:text-white light:text-neutral-400 light:hover:text-black transition-colors mt-2 rounded-full hover:bg-neutral-900 dark:hover:bg-[#151515] light:hover:bg-neutral-200"
          aria-label="Next year"
        >
          <ChevronDown className="w-5 h-5" />
        </button>

        {/* Subtitle / Philosophy */}
        <p className="text-center text-xs font-serif italic text-neutral-400 dark:text-neutral-500 light:text-neutral-500 max-w-md mt-4 leading-relaxed">
          &ldquo;Every year contains months. Every month contains days. Every day preserves your journey.&rdquo;
        </p>

        {/* Primary Enter Action */}
        <div className="mt-6 flex items-center gap-3">
          <Button
            size="lg"
            variant="primary"
            onClick={handleNext}
            icon={<ArrowRight className="w-4 h-4" />}
            className="px-8 py-3 rounded-full font-mono text-xs tracking-wider uppercase cursor-pointer"
          >
            Enter {activeYear} &bull; Open Year
          </Button>
        </div>

        <span className="text-[11px] font-mono text-neutral-500 dark:text-neutral-600 light:text-neutral-400 mt-3">
          Scroll to shift time &bull; Click year or press Enter to advance
        </span>
      </div>

      {/* Footer Info */}
      <footer className="relative z-10 w-full max-w-5xl flex items-center justify-between text-[11px] font-mono text-neutral-500 dark:text-neutral-600 light:text-neutral-400 pt-4 border-t border-[#1C1C1C] dark:border-[#1C1C1C] light:border-neutral-200">
        <span className="uppercase tracking-wider">Yester &bull; Living Chronicle</span>
        <span>YEAR &rarr; MONTH &rarr; CALENDAR &rarr; RECORD</span>
      </footer>
    </div>
  );
};
