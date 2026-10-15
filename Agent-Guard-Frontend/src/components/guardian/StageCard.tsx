import React from 'react';
import { motion } from 'motion/react';
import { CheckCircle2, AlertTriangle, XCircle, Loader2, ArrowRight } from 'lucide-react';
import { StageStatus } from '../../types';

interface StageCardProps {
  id: string;
  stepNumber: string;
  name: string;
  icon: React.ReactNode;
  status: StageStatus;
  summary?: string;
  metric?: string;
  subtitle?: string;
  details?: string[];
  isHighlighted?: boolean;
  accentColor?: 'cyan' | 'blue' | 'purple' | 'amber' | 'emerald' | 'rose';
  onActionClick?: () => void;
  actionLabel?: string;
  score?: number;
}

export const StageCard: React.FC<StageCardProps> = ({
  id,
  stepNumber,
  name,
  icon,
  status,
  summary,
  metric,
  subtitle,
  onActionClick,
  actionLabel,
  score,
}) => {
  const isSpecialist = stepNumber.startsWith('AGENT');
  const isPending = status === 'idle';
  const isRunning = status === 'running';
  const isDone = status === 'completed';
  const isFlagged = status === 'flagged';
  const isBlocked = status === 'blocked';

  // State-specific styling
  let borderClass = 'border-slate-800/80 bg-[#0B101E]/80';
  let iconBoxClass = 'border-slate-800 bg-slate-800/60 text-slate-400';
  let notchColor = 'border-slate-700 bg-slate-900';
  let statusBadge = (
    <span className="inline-flex items-center gap-1 text-[10px] text-slate-500 font-mono font-medium">
      <span className="h-1.5 w-1.5 rounded-full bg-slate-600" />
      IDLE
    </span>
  );

  if (isRunning) {
    borderClass = 'border-blue-500/80 bg-[#0F1C36] shadow-lg shadow-blue-500/20 ring-1 ring-blue-500/40';
    iconBoxClass = 'border-blue-400/50 bg-blue-500/20 text-blue-300';
    notchColor = 'border-blue-400 bg-blue-500 shadow-sm shadow-blue-400';
    statusBadge = (
      <span className="inline-flex items-center gap-1 text-[10px] text-blue-300 font-mono font-semibold bg-blue-500/15 border border-blue-500/35 px-1.5 py-0.5 rounded">
        <Loader2 className="h-3 w-3 animate-spin text-blue-400" />
        ANALYZING
      </span>
    );
  } else if (isDone) {
    borderClass = 'border-emerald-500/35 bg-[#091717]/70 hover:border-emerald-500/50';
    iconBoxClass = 'border-emerald-500/40 bg-emerald-500/15 text-emerald-400';
    notchColor = 'border-emerald-400 bg-emerald-500';
    statusBadge = (
      <span className="inline-flex items-center gap-1 text-[10px] text-emerald-300 font-mono font-semibold bg-emerald-500/15 border border-emerald-500/35 px-1.5 py-0.5 rounded">
        <CheckCircle2 className="h-3 w-3 text-emerald-400" />
        CLEARED
      </span>
    );
  } else if (isFlagged) {
    borderClass = 'border-amber-500/40 bg-[#1A1409]/70 hover:border-amber-500/55';
    iconBoxClass = 'border-amber-500/40 bg-amber-500/15 text-amber-400';
    notchColor = 'border-amber-400 bg-amber-500';
    statusBadge = (
      <span className="inline-flex items-center gap-1 text-[10px] text-amber-300 font-mono font-semibold bg-amber-500/15 border border-amber-500/35 px-1.5 py-0.5 rounded">
        <AlertTriangle className="h-3 w-3 text-amber-400" />
        FLAGGED
      </span>
    );
  } else if (isBlocked) {
    borderClass = 'border-rose-500/50 bg-[#1C0D12]/70 hover:border-rose-500/65';
    iconBoxClass = 'border-rose-500/40 bg-rose-500/15 text-rose-400';
    notchColor = 'border-rose-400 bg-rose-500';
    statusBadge = (
      <span className="inline-flex items-center gap-1 text-[10px] text-rose-300 font-mono font-semibold bg-rose-500/15 border border-rose-500/35 px-1.5 py-0.5 rounded">
        <XCircle className="h-3 w-3 text-rose-400" />
        BLOCKED
      </span>
    );
  }

  // Determine metric chip color
  let metricChipClass = 'text-slate-300 bg-slate-800/90 border-slate-700/70';
  if (metric?.includes('RISK') || metric?.includes('SCORE')) {
    if (isBlocked) {
      metricChipClass = 'text-rose-300 bg-rose-500/15 border-rose-500/40';
    } else if (isFlagged) {
      metricChipClass = 'text-amber-300 bg-amber-500/15 border-amber-500/40';
    } else {
      metricChipClass = 'text-emerald-300 bg-emerald-500/15 border-emerald-500/40';
    }
  } else if (metric === 'BASELINE' || metric === 'NORMAL' || metric === 'VERIFIED' || metric === 'CLEAN' || metric === 'COMPLIANT') {
    metricChipClass = 'text-emerald-300 bg-emerald-500/15 border-emerald-500/40';
  }

  // =========================================================================
  // VARIANT 1: SPECIALIST AGENT CARD (Stage 2 parallel 5-column grid)
  // =========================================================================
  if (isSpecialist) {
    return (
      <motion.div
        id={id}
        layout
        whileHover={{ y: -2 }}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25, ease: 'easeOut' }}
        className={`relative rounded-xl border p-3.5 transition-all duration-300 scroll-mt-28 flex flex-col justify-between h-full min-h-[160px] ${borderClass}`}
      >
        {/* Top Connector Anchor Notch */}
        <div
          className={`absolute -top-1 left-1/2 -translate-x-1/2 h-2 w-2 rounded-full border z-10 transition-colors ${notchColor}`}
          aria-hidden="true"
        />

        {/* Bottom Connector Anchor Notch */}
        <div
          className={`absolute -bottom-1 left-1/2 -translate-x-1/2 h-2 w-2 rounded-full border z-10 transition-colors ${notchColor}`}
          aria-hidden="true"
        />

        {/* Top Header Row: Step identifier on left, status badge on right (NEVER overflows) */}
        <div>
          <div className="flex items-center justify-between gap-1.5 w-full">
            <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-slate-400 bg-slate-800/80 px-1.5 py-0.5 rounded border border-slate-700/60 shrink-0">
              {stepNumber}
            </span>
            <div className="shrink-0">{statusBadge}</div>
          </div>

          {/* Identity Row: Icon + Full Agent Name */}
          <div className="mt-2.5 flex items-start gap-2.5">
            <div className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border transition-colors mt-0.5 ${iconBoxClass}`}>
              {icon}
            </div>
            <div className="min-w-0 flex-1">
              <h4 className="text-xs font-bold text-slate-100 tracking-tight leading-snug line-clamp-2">
                {name}
              </h4>
            </div>
          </div>

          {/* Subtitle when idle */}
          {subtitle && isPending && (
            <p className="mt-2 text-[11px] text-slate-400/90 leading-tight line-clamp-2">
              {subtitle}
            </p>
          )}

          {/* Analyzing progress bar */}
          {isRunning && (
            <div className="mt-2.5 space-y-1">
              <div className="h-1 w-full overflow-hidden rounded-full bg-slate-800">
                <motion.div
                  className="h-full bg-blue-500"
                  animate={{ x: ['-100%', '100%'] }}
                  transition={{ duration: 1.0, repeat: Infinity, ease: 'easeInOut' }}
                />
              </div>
              <p className="text-[10px] font-mono text-blue-300 truncate">
                Evaluating signals...
              </p>
            </div>
          )}
        </div>

        {/* Bottom Evaluation Insight */}
        {(isDone || isFlagged || isBlocked) && (
          <div className="mt-3 pt-2 border-t border-slate-800/80 flex flex-col gap-1.5">
            {metric && (
              <div className="flex items-center justify-between gap-1">
                <span className="font-mono text-[9px] uppercase tracking-wider text-slate-400">
                  Signal Output
                </span>
                <span className={`font-mono text-[10px] font-semibold px-1.5 py-0.5 rounded border shrink-0 ${metricChipClass}`}>
                  {metric}
                </span>
              </div>
            )}
            <p
              className="text-[11px] text-slate-300 leading-snug line-clamp-2 font-normal"
              title={summary || 'Evaluated verified signals'}
            >
              {summary || 'Completed with verified signals'}
            </p>
          </div>
        )}
      </motion.div>
    );
  }

  // =========================================================================
  // VARIANT 2: STAGE CARD (Stages 3, 4, 5 full-width pipeline stages)
  // =========================================================================
  return (
    <motion.div
      id={id}
      layout
      whileHover={{ y: -2 }}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, ease: 'easeOut' }}
      className={`relative rounded-xl border p-4 sm:p-5 transition-all duration-300 scroll-mt-28 ${borderClass}`}
    >
      {/* Top Center Notch */}
      <div
        className={`absolute -top-1 left-1/2 -translate-x-1/2 h-2.5 w-2.5 rounded-full border z-10 transition-colors ${notchColor}`}
        aria-hidden="true"
      />

      {/* Bottom Center Notch */}
      <div
        className={`absolute -bottom-1 left-1/2 -translate-x-1/2 h-2.5 w-2.5 rounded-full border z-10 transition-colors ${notchColor}`}
        aria-hidden="true"
      />

      {/* Header Row: Step + Icon + Name + Badge */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border transition-colors ${iconBoxClass}`}>
            {icon}
          </div>

          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="font-mono text-[10px] font-bold tracking-wider text-slate-400 bg-slate-800/80 px-2 py-0.5 rounded border border-slate-700/60 uppercase">
                {stepNumber}
              </span>
            </div>
            <h4 className="mt-0.5 text-sm sm:text-base font-bold text-slate-100 tracking-tight truncate">
              {name}
            </h4>
          </div>
        </div>

        <div className="shrink-0">{statusBadge}</div>
      </div>

      {/* Subtitle / context description when pending */}
      {subtitle && isPending && (
        <p className="mt-2.5 text-xs text-slate-400 leading-relaxed">
          {subtitle}
        </p>
      )}

      {/* Live running state */}
      {isRunning && (
        <div className="mt-3.5 space-y-2">
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-800">
            <motion.div
              className="h-full bg-blue-500"
              animate={{ x: ['-100%', '100%'] }}
              transition={{ duration: 1.1, repeat: Infinity, ease: 'easeInOut' }}
            />
          </div>
          <p className="text-xs font-mono text-blue-300">
            {summary || 'Processing stage synthesis...'}
          </p>
        </div>
      )}

      {/* Completed Stage Content Panel */}
      {(isDone || isFlagged || isBlocked) && (
        <div className="mt-3.5 pt-3 border-t border-slate-800/80 space-y-2">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="text-xs sm:text-sm text-slate-200 leading-relaxed font-normal flex-1">
              {summary || 'Stage execution verified.'}
            </p>

            <div className="flex items-center gap-2 shrink-0">
              {metric && (
                <span className={`font-mono text-xs font-bold px-2 py-0.5 rounded border ${metricChipClass}`}>
                  {metric}
                </span>
              )}

              {onActionClick && (
                <button
                  type="button"
                  onClick={onActionClick}
                  className="rounded-lg border border-slate-700 bg-slate-800/90 hover:bg-slate-700 hover:text-white px-2.5 py-1 text-[11px] font-medium text-slate-300 transition-colors flex items-center gap-1 cursor-pointer"
                >
                  <span>{actionLabel || 'Inspect'}</span>
                  <ArrowRight className="h-3 w-3" />
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
};

