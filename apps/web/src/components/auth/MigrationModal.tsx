import React, { useState, useEffect } from 'react';
import {
  CloudUpload,
  CheckCircle2,
  AlertTriangle,
  X,
  Loader2,
  ShieldCheck,
  Database,
  ArrowRight,
} from 'lucide-react';
import {
  inspectLocalArchive,
  executeLocalMigration,
  MigrationReport,
} from '../../services/migration';

interface MigrationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete?: () => void;
}

export const MigrationModal: React.FC<MigrationModalProps> = ({
  isOpen,
  onClose,
  onComplete,
}) => {
  const [stage, setStage] = useState<'prompt' | 'migrating' | 'results'>('prompt');
  const [counts, setCounts] = useState({ plansCount: 0, recordsCount: 0, entriesCount: 0 });
  const [progress, setProgress] = useState({
    phase: 'plans' as 'plans' | 'records' | 'entries',
    current: 0,
    total: 0,
    title: '',
  });
  const [report, setReport] = useState<MigrationReport | null>(null);

  useEffect(() => {
    if (isOpen) {
      setCounts(inspectLocalArchive());
      setStage('prompt');
      setReport(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleStartMigration = async () => {
    setStage('migrating');
    try {
      const result = await executeLocalMigration((phase, current, total, title) => {
        setProgress({ phase, current, total, title });
      });
      setReport(result);
      setStage('results');
      onComplete?.();
    } catch (e: any) {
      console.error('Migration execution failed', e);
      setStage('results');
    }
  };

  const totalDiscovered = counts.plansCount + counts.recordsCount + counts.entriesCount;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div
        className="w-full max-w-lg bg-[#0F1216] border border-[#232934] rounded-2xl shadow-2xl overflow-hidden p-6 relative text-slate-100"
        role="dialog"
        aria-modal="true"
        aria-labelledby="migration-modal-title"
      >
        {/* Close Button */}
        {stage !== 'migrating' && (
          <button
            onClick={onClose}
            className="absolute top-5 right-5 text-neutral-400 hover:text-white p-1 rounded-lg hover:bg-white/5 transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        )}

        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-[#1A1F29] border border-[#2B3242] flex items-center justify-center text-[#FF7138]">
            <CloudUpload className="w-5 h-5" />
          </div>
          <div>
            <h2 id="migration-modal-title" className="text-lg font-serif font-bold text-white tracking-tight">
              Sovereign Cloud Migration
            </h2>
            <p className="text-xs font-mono text-neutral-400">
              Lossless transfer of your local chronicle into PostgreSQL
            </p>
          </div>
        </div>

        {/* STAGE 1: Explicit Consent Prompt */}
        {stage === 'prompt' && (
          <div className="space-y-5">
            {totalDiscovered > 0 ? (
              <>
                <div className="p-4 rounded-xl bg-[#161B22] border border-[#232934] space-y-3">
                  <div className="flex items-center justify-between text-xs font-mono text-neutral-400 pb-2 border-b border-[#232934]">
                    <span>Local Data Discovered</span>
                    <span className="text-[#FF7138] font-bold">{totalDiscovered} total items</span>
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-center">
                    <div className="p-2.5 rounded-lg bg-[#0F1216] border border-[#232934]">
                      <div className="text-base font-serif font-bold text-white">{counts.plansCount}</div>
                      <div className="text-[10px] font-mono text-neutral-400">Life Plans</div>
                    </div>
                    <div className="p-2.5 rounded-lg bg-[#0F1216] border border-[#232934]">
                      <div className="text-base font-serif font-bold text-white">{counts.recordsCount}</div>
                      <div className="text-[10px] font-mono text-neutral-400">Day Records</div>
                    </div>
                    <div className="p-2.5 rounded-lg bg-[#0F1216] border border-[#232934]">
                      <div className="text-base font-serif font-bold text-white">{counts.entriesCount}</div>
                      <div className="text-[10px] font-mono text-neutral-400">Chronicle Entries</div>
                    </div>
                  </div>
                </div>

                {/* Guarantees Box */}
                <div className="p-3.5 rounded-xl bg-emerald-950/20 border border-emerald-900/40 text-xs text-neutral-300 space-y-2">
                  <div className="flex items-center gap-2 text-emerald-400 font-medium">
                    <ShieldCheck className="w-4 h-4 shrink-0" />
                    <span>Data Integrity & Safety Guarantees</span>
                  </div>
                  <ul className="text-[11px] text-neutral-400 space-y-1 list-disc pl-4 font-mono">
                    <li>Original timestamps (<span className="text-neutral-300">createdAt</span>) and UUIDs are strictly preserved.</li>
                    <li>Plans are migrated prior to entries to maintain relationships.</li>
                    <li><strong className="text-emerald-300">Local data is never deleted</strong> — you keep a local browser backup.</li>
                    <li>Idempotent execution: duplicate items are safely skipped.</li>
                  </ul>
                </div>

                <div className="flex items-center gap-3 pt-2">
                  <button
                    onClick={onClose}
                    className="flex-1 py-2.5 px-4 rounded-xl border border-[#232934] text-xs font-sans text-neutral-400 hover:text-white hover:bg-white/5 transition-all cursor-pointer"
                  >
                    Keep Local Only
                  </button>
                  <button
                    onClick={handleStartMigration}
                    className="flex-1 py-2.5 px-4 rounded-xl bg-[#FF7138] hover:bg-[#ff8555] text-white text-xs font-medium transition-all shadow-md flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <span>Import to Sovereign Cloud</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </>
            ) : (
              <div className="text-center py-6 space-y-3">
                <Database className="w-8 h-8 text-neutral-500 mx-auto" />
                <p className="text-sm font-sans text-neutral-300">No local unmigrated records found.</p>
                <button
                  onClick={onClose}
                  className="py-2 px-4 rounded-xl bg-[#161B22] border border-[#232934] text-xs text-neutral-300 hover:text-white transition-colors cursor-pointer"
                >
                  Close
                </button>
              </div>
            )}
          </div>
        )}

        {/* STAGE 2: Migration In Progress */}
        {stage === 'migrating' && (
          <div className="py-8 space-y-6 text-center">
            <Loader2 className="w-8 h-8 animate-spin text-[#FF7138] mx-auto" />
            <div className="space-y-1">
              <h3 className="text-sm font-serif font-medium text-white">
                Migrating {progress.phase.toUpperCase()}...
              </h3>
              <p className="text-xs font-mono text-neutral-400 truncate max-w-xs mx-auto">
                {progress.title || 'Processing items...'}
              </p>
              <p className="text-[11px] font-mono text-[#FF7138]">
                {progress.current} of {progress.total}
              </p>
            </div>
            {/* Progress bar */}
            <div className="w-full bg-[#161B22] rounded-full h-2 overflow-hidden border border-[#232934]">
              <div
                className="bg-[#FF7138] h-full transition-all duration-300"
                style={{
                  width: `${progress.total > 0 ? (progress.current / progress.total) * 100 : 0}%`,
                }}
              />
            </div>
            <p className="text-[11px] font-mono text-neutral-500">
              Please keep this tab open while your archive is uploaded.
            </p>
          </div>
        )}

        {/* STAGE 3: Full Audit Report */}
        {stage === 'results' && report && (
          <div className="space-y-5">
            <div className="flex items-center gap-2 p-3 rounded-xl bg-emerald-950/30 border border-emerald-900/50 text-emerald-300 text-xs">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
              <span>
                Migration completed successfully! Your chronicle is persisted in your sovereign vault.
              </span>
            </div>

            {/* Verification Table */}
            <div className="rounded-xl border border-[#232934] overflow-hidden text-xs font-mono">
              <table className="w-full text-left">
                <thead className="bg-[#161B22] text-neutral-400 text-[10px] uppercase">
                  <tr>
                    <th className="py-2 px-3">Entity</th>
                    <th className="py-2 px-2 text-center">Discovered</th>
                    <th className="py-2 px-2 text-center">Imported</th>
                    <th className="py-2 px-2 text-center">Existing</th>
                    <th className="py-2 px-2 text-center">Failed</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#232934] text-neutral-300">
                  <tr>
                    <td className="py-2 px-3 font-sans">Life Plans</td>
                    <td className="py-2 px-2 text-center">{report.plans.discovered}</td>
                    <td className="py-2 px-2 text-center text-emerald-400">{report.plans.imported}</td>
                    <td className="py-2 px-2 text-center text-neutral-500">{report.plans.existing}</td>
                    <td className="py-2 px-2 text-center text-red-400">{report.plans.failed}</td>
                  </tr>
                  <tr>
                    <td className="py-2 px-3 font-sans">Daily Records</td>
                    <td className="py-2 px-2 text-center">{report.records.discovered}</td>
                    <td className="py-2 px-2 text-center text-emerald-400">{report.records.imported}</td>
                    <td className="py-2 px-2 text-center text-neutral-500">{report.records.existing}</td>
                    <td className="py-2 px-2 text-center text-red-400">{report.records.failed}</td>
                  </tr>
                  <tr>
                    <td className="py-2 px-3 font-sans">Entries</td>
                    <td className="py-2 px-2 text-center">{report.entries.discovered}</td>
                    <td className="py-2 px-2 text-center text-emerald-400">{report.entries.imported}</td>
                    <td className="py-2 px-2 text-center text-neutral-500">{report.entries.existing}</td>
                    <td className="py-2 px-2 text-center text-red-400">{report.entries.failed}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Error Details if any */}
            {(report.plans.errors.length > 0 ||
              report.records.errors.length > 0 ||
              report.entries.errors.length > 0) && (
              <div className="p-3 rounded-xl bg-red-950/30 border border-red-900/50 text-xs space-y-1">
                <div className="flex items-center gap-1.5 text-red-400 font-medium">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  <span>Import Failures Detected:</span>
                </div>
                <ul className="text-[10px] font-mono text-red-300 max-h-24 overflow-y-auto space-y-0.5">
                  {[
                    ...report.plans.errors,
                    ...report.records.errors,
                    ...report.entries.errors,
                  ].map((err, idx) => (
                    <li key={idx}>
                      [{err.id}]: {err.error}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <button
              onClick={onClose}
              className="w-full py-2.5 px-4 rounded-xl bg-[#FF7138] hover:bg-[#ff8555] text-white text-xs font-medium transition-all shadow-md cursor-pointer"
            >
              Continue to Chronicle
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
