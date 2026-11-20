import React from 'react';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';

interface KpiStatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ReactNode;
  delta?: number | null;
  deltaSuffix?: string;
  isPercentageDelta?: boolean;
}

export const KpiStatCard: React.FC<KpiStatCardProps> = ({
  title,
  value,
  subtitle,
  icon,
  delta,
  deltaSuffix = '',
  isPercentageDelta = true,
}) => {
  const renderDeltaBadge = () => {
    if (delta === null || delta === undefined) {
      return (
        <span className="inline-flex items-center text-[11px] font-mono text-neutral-400 bg-neutral-800/40 px-2 py-0.5 rounded-full border border-neutral-700/30">
          Baseline
        </span>
      );
    }
    if (delta > 0) {
      return (
        <span className="inline-flex items-center gap-0.5 text-[11px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
          <ArrowUpRight className="w-3 h-3" />
          <span>+{delta}{isPercentageDelta ? '%' : deltaSuffix}</span>
        </span>
      );
    }
    if (delta < 0) {
      return (
        <span className="inline-flex items-center gap-0.5 text-[11px] font-mono text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20">
          <ArrowDownRight className="w-3 h-3" />
          <span>{delta}{isPercentageDelta ? '%' : deltaSuffix}</span>
        </span>
      );
    }
    return (
      <span className="inline-flex items-center text-[11px] font-mono text-neutral-400 bg-neutral-800/40 px-2 py-0.5 rounded-full border border-neutral-700/30">
        0%
      </span>
    );
  };

  return (
    <div className="p-6 rounded-2xl bg-[#0F1216] dark:bg-[#0F1216] border border-[#1E232B] dark:border-[#1E232B] shadow-sm relative overflow-hidden group hover:border-[#2A313D] transition-all">
      <div className="flex items-center justify-between mb-4">
        <div className="w-10 h-10 rounded-xl bg-[#161A22] border border-[#232934] flex items-center justify-center text-[#FF7138]">
          {icon}
        </div>
        {renderDeltaBadge()}
      </div>
      <div className="space-y-0.5">
        <h3 className="text-3xl sm:text-4xl font-serif text-white tracking-tight">
          {value}
        </h3>
        <p className="text-xs font-sans text-neutral-400">
          {title}
        </p>
        {subtitle && (
          <p className="text-[11px] font-mono text-neutral-500 pt-1">
            {subtitle}
          </p>
        )}
      </div>
    </div>
  );
};
