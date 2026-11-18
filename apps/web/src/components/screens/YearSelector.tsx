import React, { useEffect, useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, ChevronLeft, ChevronRight, Sparkles, User } from 'lucide-react';
import { useLifeOS } from '../../context/LifeOSContext';
import { useTheme } from '../../context/ThemeContext';
import { ThemeToggle } from '../common/ThemeToggle';
import { getDynamicYearRange } from '../../services/calendarService';

export const YearSelector: React.FC = () => {
  const {
    year,
    selectYear,
    hasSampleData,
    loadSampleData,
    clearSampleData,
    openSettings,
  } = useLifeOS();
  const { reducedMotion } = useTheme();

  const currentYearNow = new Date().getFullYear();
  const years = getDynamicYearRange(currentYearNow, 14);

  const [activeYear, setActiveYear] = useState<number>(year);
  const [direction, setDirection] = useState<number>(0);
  const wheelLockRef = useRef<boolean>(false);
  const touchStartXRef = useRef<number | null>(null);

  // Synchronize with context year
  useEffect(() => {
    setActiveYear(year);
  }, [year]);

  const changeYear = useCallback(
    (targetYear: number) => {
      const clamped = Math.max(years[0], Math.min(years[years.length - 1], targetYear));
      if (clamped !== activeYear) {
        setDirection(clamped > activeYear ? 1 : -1);
        setActiveYear(clamped);
      }
    },
    [activeYear, years]
  );

  const handleNextYear = useCallback(() => {
    changeYear(activeYear + 1);
  }, [activeYear, changeYear]);

  const handlePrevYear = useCallback(() => {
    changeYear(activeYear - 1);
  }, [activeYear, changeYear]);

  const handleEnterYear = useCallback(() => {
    selectYear(activeYear);
  }, [activeYear, selectYear]);

  // Keyboard navigation: Left/Right or Up/Down arrows to shift years, Enter to open
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
        e.preventDefault();
        handleNextYear();
      } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
        e.preventDefault();
        handlePrevYear();
      } else if (e.key === 'Enter') {
        e.preventDefault();
        handleEnterYear();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleNextYear, handlePrevYear, handleEnterYear]);

  // Wheel listener: ONLY horizontal trackpad/mouse scroll moves the year dial; vertical scroll is ignored
  const handleWheel = (e: React.WheelEvent) => {
    if (wheelLockRef.current) return;

    // Only listen to horizontal deltaX (ignore vertical deltaY completely)
    if (Math.abs(e.deltaX) > 25 && Math.abs(e.deltaX) > Math.abs(e.deltaY)) {
      wheelLockRef.current = true;
      if (e.deltaX > 0) {
        handleNextYear();
      } else {
        handlePrevYear();
      }
      setTimeout(() => {
        wheelLockRef.current = false;
      }, 260);
    }
  };

  // Touch gesture support: swipe left/right
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartXRef.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartXRef.current === null) return;
    const diff = e.changedTouches[0].clientX - touchStartXRef.current;
    if (Math.abs(diff) > 40) {
      if (diff > 0) {
        handlePrevYear();
      } else {
        handleNextYear();
      }
    }
    touchStartXRef.current = null;
  };

  // Visible carousel slots: [active - 2, active - 1, active, active + 1, active + 2]
  const prevYear2 = activeYear - 2;
  const prevYear1 = activeYear - 1;
  const nextYear1 = activeYear + 1;
  const nextYear2 = activeYear + 2;

  const minYear = years[0];
  const maxYear = years[years.length - 1];

  const hasPrev = activeYear > minYear;
  const hasNext = activeYear < maxYear;

  const isCurrentYear = activeYear === currentYearNow;
  const eraLabel = isCurrentYear
    ? 'PRESENT ERA • CURRENT JOURNEY'
    : activeYear < currentYearNow
    ? `ARCHIVE • ${currentYearNow - activeYear} ${currentYearNow - activeYear === 1 ? 'YEAR' : 'YEARS'} AGO`
    : `HORIZON • IN ${activeYear - currentYearNow} ${activeYear - currentYearNow === 1 ? 'YEAR' : 'YEARS'}`;

  return (
    <div
      onWheel={handleWheel}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      className="relative min-h-screen w-full flex flex-col justify-between items-center bg-[#07080A] dark:bg-[#07080A] light:bg-[#FAF8F5] text-white dark:text-white light:text-neutral-900 overflow-hidden select-none transition-colors duration-500"
    >
      {/* 1. Atmospheric Ambient Starfield / Particle Dust */}
      <div className="absolute inset-0 pointer-events-none opacity-40 dark:opacity-40 light:opacity-15">
        <div className="absolute top-[12%] left-[18%] w-1 h-1 rounded-full bg-white animate-pulse" style={{ animationDuration: '4s' }} />
        <div className="absolute top-[22%] right-[24%] w-1.5 h-1.5 rounded-full bg-amber-200/80 animate-pulse" style={{ animationDuration: '6s', animationDelay: '1s' }} />
        <div className="absolute top-[35%] left-[30%] w-1 h-1 rounded-full bg-white/70 animate-pulse" style={{ animationDuration: '5s', animationDelay: '2s' }} />
        <div className="absolute top-[18%] right-[40%] w-1 h-1 rounded-full bg-white/90 animate-pulse" style={{ animationDuration: '7s' }} />
        <div className="absolute top-[28%] left-[75%] w-1.5 h-1.5 rounded-full bg-orange-300/80 animate-pulse" style={{ animationDuration: '5.5s', animationDelay: '1.5s' }} />
        <div className="absolute top-[42%] right-[15%] w-1 h-1 rounded-full bg-white/60 animate-pulse" style={{ animationDuration: '4.5s', animationDelay: '0.5s' }} />
      </div>

      {/* 2. Top Header Navigation Bar (Matches Concept Screen 1) */}
      <header className="relative z-30 w-full max-w-6xl flex items-center justify-between px-6 sm:px-10 pt-6">
        {/* Brand Logo */}
        <div className="flex items-baseline gap-1 group cursor-default">
          <span className="text-2xl font-serif italic font-normal tracking-wide text-white dark:text-white light:text-neutral-900">
            Yester
          </span>
          <span className="text-xl font-serif font-bold text-[#FF7138]">.</span>
        </div>

        {/* Right Actions: Sample Data, Theme, Avatar/Settings */}
        <div className="flex items-center gap-3 sm:gap-4">
          {hasSampleData ? (
            <button
              onClick={clearSampleData}
              className="hidden sm:inline-flex text-[11px] font-mono text-neutral-400 hover:text-red-400 border border-[#242930] dark:border-[#242930] light:border-neutral-300 px-3 py-1.5 rounded-full transition-colors cursor-pointer bg-black/20 dark:bg-black/20 light:bg-white/60 backdrop-blur-sm"
              title="Reset records to empty state"
            >
              Clear Sample Data
            </button>
          ) : (
            <button
              onClick={loadSampleData}
              className="hidden sm:inline-flex text-[11px] font-mono text-neutral-300 hover:text-white light:text-neutral-600 light:hover:text-black border border-[#242930] dark:border-[#242930] light:border-neutral-300 px-3 py-1.5 rounded-full transition-colors items-center gap-1.5 cursor-pointer bg-black/20 dark:bg-black/20 light:bg-white/60 backdrop-blur-sm"
              title="Load rich life archive sample data"
            >
              <Sparkles className="w-3 h-3 text-[#FF7138]" />
              <span>Load Sample Data</span>
            </button>
          )}

          {/* Theme Toggle (Sun / Moon) */}
          <div className="bg-black/30 dark:bg-black/30 light:bg-neutral-200/60 backdrop-blur-sm rounded-full p-0.5 border border-white/5 dark:border-white/5 light:border-black/5">
            <ThemeToggle />
          </div>

          {/* User Avatar Button (Opens Settings) */}
          <button
            onClick={openSettings}
            className="w-9 h-9 rounded-full bg-neutral-800 dark:bg-neutral-800 light:bg-neutral-200 border border-neutral-700 dark:border-neutral-700 light:border-neutral-300 flex items-center justify-center text-neutral-300 dark:text-neutral-300 light:text-neutral-700 hover:border-[#FF7138] hover:text-white transition-all cursor-pointer overflow-hidden shadow-sm"
            title="Settings & Preferences"
            aria-label="Open Settings"
          >
            <User className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* 3. Hero Center Stage: Tagline & Majestic Horizontal Year Carousel */}
      <div className="relative z-20 flex-1 w-full max-w-5xl flex flex-col items-center justify-center px-4 py-8">
        {/* Poetic Tagline */}
        <motion.p
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: reducedMotion ? 0.05 : 0.8, ease: 'easeOut' }}
          className="font-serif italic text-xl sm:text-2xl md:text-3xl text-neutral-200 dark:text-neutral-200 light:text-neutral-700 font-light tracking-wide text-center mb-10 max-w-xl leading-relaxed"
        >
          Every yesterday shapes who you become tomorrow.
        </motion.p>

        {/* Temporal Horizontal Carousel */}
        <div className="relative w-full flex items-center justify-center py-4">
          {/* Subtle Chevron Left */}
          {hasPrev && (
            <button
              onClick={handlePrevYear}
              className="absolute left-2 sm:left-8 z-30 p-2 sm:p-3 text-neutral-500 hover:text-white dark:hover:text-white light:text-neutral-400 light:hover:text-black hover:bg-white/5 dark:hover:bg-white/5 light:hover:bg-black/5 rounded-full transition-all cursor-pointer backdrop-blur-sm"
              aria-label="Previous year"
              title={`Shift to ${activeYear - 1}`}
            >
              <ChevronLeft className="w-6 h-6 sm:w-7 sm:h-7" />
            </button>
          )}

          {/* The Horizontal Years Display */}
          <div className="flex items-center justify-center gap-6 sm:gap-12 md:gap-16 w-full max-w-3xl overflow-visible">
            {/* Year - 2 (Deep Horizon) */}
            {prevYear2 >= minYear && (
              <button
                onClick={() => changeYear(prevYear2)}
                className="hidden md:block opacity-15 hover:opacity-30 transition-opacity cursor-pointer font-serif text-3xl lg:text-4xl text-neutral-400 dark:text-neutral-500 light:text-neutral-400 select-none scale-75"
                title={`Jump to ${prevYear2}`}
              >
                {prevYear2}
              </button>
            )}

            {/* Year - 1 (Previous) */}
            {hasPrev && (
              <button
                onClick={handlePrevYear}
                className="opacity-35 hover:opacity-75 transition-all cursor-pointer font-serif text-4xl sm:text-5xl md:text-6xl text-neutral-300 dark:text-neutral-400 light:text-neutral-500 select-none scale-90 hover:scale-95"
                title={`Select ${prevYear1}`}
              >
                {prevYear1}
              </button>
            )}

            {/* Active Year (Colossal & Luminous) */}
            <div className="relative flex flex-col items-center">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeYear}
                  initial={{
                    opacity: 0,
                    x: direction * 45,
                    scale: 0.94,
                  }}
                  animate={{
                    opacity: 1,
                    x: 0,
                    scale: 1,
                  }}
                  exit={{
                    opacity: 0,
                    x: -direction * 45,
                    scale: 0.94,
                  }}
                  transition={{
                    type: 'spring',
                    stiffness: 380,
                    damping: 32,
                    duration: reducedMotion ? 0.05 : 0.28,
                  }}
                  className="flex flex-col items-center"
                >
                  <h1 className="font-serif text-7xl sm:text-8xl md:text-9xl lg:text-[130px] font-normal tracking-tight text-white dark:text-white light:text-neutral-900 select-none drop-shadow-[0_4px_30px_rgba(0,0,0,0.8)] dark:drop-shadow-[0_4px_30px_rgba(0,0,0,0.8)] light:drop-shadow-none leading-none">
                    {activeYear}
                  </h1>
                </motion.div>
              </AnimatePresence>

              {/* Era pill badge */}
              <div className="mt-2 text-[10px] font-mono tracking-widest text-[#FF7138] uppercase font-medium bg-[#FF7138]/10 dark:bg-[#FF7138]/10 light:bg-[#FF7138]/15 px-3 py-1 rounded-full border border-[#FF7138]/20">
                {eraLabel}
              </div>
            </div>

            {/* Year + 1 (Next) */}
            {hasNext && (
              <button
                onClick={handleNextYear}
                className="opacity-35 hover:opacity-75 transition-all cursor-pointer font-serif text-4xl sm:text-5xl md:text-6xl text-neutral-300 dark:text-neutral-400 light:text-neutral-500 select-none scale-90 hover:scale-95"
                title={`Select ${nextYear1}`}
              >
                {nextYear1}
              </button>
            )}

            {/* Year + 2 (Deep Horizon) */}
            {nextYear2 <= maxYear && (
              <button
                onClick={() => changeYear(nextYear2)}
                className="hidden md:block opacity-15 hover:opacity-30 transition-opacity cursor-pointer font-serif text-3xl lg:text-4xl text-neutral-400 dark:text-neutral-500 light:text-neutral-400 select-none scale-75"
                title={`Jump to ${nextYear2}`}
              >
                {nextYear2}
              </button>
            )}
          </div>

          {/* Subtle Chevron Right */}
          {hasNext && (
            <button
              onClick={handleNextYear}
              className="absolute right-2 sm:right-8 z-30 p-2 sm:p-3 text-neutral-500 hover:text-white dark:hover:text-white light:text-neutral-400 light:hover:text-black hover:bg-white/5 dark:hover:bg-white/5 light:hover:bg-black/5 rounded-full transition-all cursor-pointer backdrop-blur-sm"
              aria-label="Next year"
              title={`Shift to ${activeYear + 1}`}
            >
              <ChevronRight className="w-6 h-6 sm:w-7 sm:h-7" />
            </button>
          )}
        </div>

        {/* Enter CTA Button (Signal Orange Pill with Radiant Glow) */}
        <div className="mt-8 flex flex-col items-center gap-4">
          <motion.button
            onClick={handleEnterYear}
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.98 }}
            className="group relative inline-flex items-center gap-2.5 px-8 py-3.5 rounded-full bg-[#FF7138] hover:bg-[#FF814A] text-white font-sans text-sm sm:text-base font-medium tracking-wide shadow-[0_0_35px_rgba(255,113,56,0.42)] hover:shadow-[0_0_55px_rgba(255,113,56,0.65)] transition-all duration-300 cursor-pointer"
          >
            <span>Enter {activeYear}</span>
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </motion.button>

          {/* Dynamic exploration prompt */}
          <span className="text-[11px] font-mono tracking-widest text-neutral-400 dark:text-neutral-500 light:text-neutral-500 uppercase flex items-center gap-2 pt-1 opacity-80">
            <span>&larr; Swipe, use arrow keys, or click to explore &rarr;</span>
          </span>
        </div>
      </div>

      {/* 4. Cinematic Atmospheric Mountain Horizon & Warm Sunset/Dawn Glow */}
      <div className="relative w-full overflow-hidden pointer-events-none mt-auto">
        {/* Radiant Warm Horizon Glow (Centered at bottom behind mountain peaks) */}
        <div className="absolute inset-0 flex items-end justify-center pointer-events-none">
          {/* Intense core horizon radiance */}
          <div className="w-[850px] h-[280px] rounded-full bg-[#FF7138] dark:bg-[#FF7138] light:bg-[#FFA568] opacity-25 dark:opacity-25 light:opacity-20 blur-[90px] translate-y-1/3" />
          {/* Broad atmospheric ambient warmth */}
          <div className="absolute w-[1200px] h-[340px] rounded-full bg-[#FF9A52] dark:bg-[#FF9A52] light:bg-[#FFC488] opacity-15 dark:opacity-15 light:opacity-12 blur-[120px] translate-y-1/2" />
        </div>

        {/* Multi-layered Mountain Silhouette SVG */}
        <svg
          viewBox="0 0 1440 260"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          preserveAspectRatio="none"
          className="relative z-10 w-full h-[150px] sm:h-[190px] md:h-[220px] block"
        >
          <defs>
            {/* Distant mountain backlit rim gradient */}
            <linearGradient id="backRidgeDark" x1="720" y1="30" x2="720" y2="260" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#2A1B16" />
              <stop offset="60%" stopColor="#141113" />
              <stop offset="100%" stopColor="#0B0C0E" />
            </linearGradient>

            <linearGradient id="backRidgeLight" x1="720" y1="30" x2="720" y2="260" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#E2D2C2" />
              <stop offset="100%" stopColor="#D8C9B9" />
            </linearGradient>

            {/* Midground mountain silhouette gradient */}
            <linearGradient id="midRidgeDark" x1="720" y1="70" x2="720" y2="260" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#1C1412" />
              <stop offset="70%" stopColor="#0E0F12" />
              <stop offset="100%" stopColor="#07080A" />
            </linearGradient>

            {/* Foreground dark silhouette */}
            <linearGradient id="foreRidgeDark" x1="720" y1="120" x2="720" y2="260" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#0A0B0E" />
              <stop offset="100%" stopColor="#050607" />
            </linearGradient>

            {/* Water reflection horizon line */}
            <linearGradient id="waterGlow" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="transparent" />
              <stop offset="35%" stopColor="#FF7138" stopOpacity="0.15" />
              <stop offset="50%" stopColor="#FF8F50" stopOpacity="0.4" />
              <stop offset="65%" stopColor="#FF7138" stopOpacity="0.15" />
              <stop offset="100%" stopColor="transparent" />
            </linearGradient>
          </defs>

          {/* Layer 1: Distant Misty Mountain Peaks */}
          <path
            d="M0 160 L90 135 L190 148 L320 95 L440 130 L560 78 L680 115 L800 65 L920 110 L1040 82 L1160 128 L1290 90 L1380 132 L1440 150 L1440 260 L0 260 Z"
            className="fill-[url(#backRidgeDark)] dark:fill-[url(#backRidgeDark)] light:fill-[url(#backRidgeLight)] opacity-80"
          />

          {/* Layer 2: Midground Mountain Ridges */}
          <path
            d="M0 185 L120 152 L220 170 L340 135 L470 168 L600 120 L720 155 L850 112 L980 158 L1110 132 L1240 165 L1360 140 L1440 175 L1440 260 L0 260 Z"
            className="fill-[url(#midRidgeDark)] dark:fill-[url(#midRidgeDark)] light:fill-[#CEBFAD] opacity-90"
          />

          {/* Layer 3: Foreground Sharp Silhouettes & Deep Valleys */}
          <path
            d="M0 215 L80 190 L180 205 L290 175 L410 202 L520 165 L660 198 L780 160 L900 195 L1020 170 L1150 205 L1270 178 L1380 208 L1440 218 L1440 260 L0 260 Z"
            className="fill-[url(#foreRidgeDark)] dark:fill-[url(#foreRidgeDark)] light:fill-[#BFB09D]"
          />

          {/* Layer 4: Water Horizon Mist & Reflection Line at the very base */}
          <rect x="0" y="248" width="1440" height="12" fill="url(#waterGlow)" />
        </svg>

        {/* Ambient bottom footer text inside the mountain plane */}
        <div className="absolute bottom-2 inset-x-0 z-20 flex items-center justify-between px-6 sm:px-10 text-[10px] font-mono text-neutral-500 dark:text-neutral-500 light:text-neutral-600 uppercase tracking-widest">
          <span>Yester &bull; Living Chronicle</span>
          <span>YEAR &rarr; MONTH &rarr; DAY</span>
        </div>
      </div>
    </div>
  );
};
