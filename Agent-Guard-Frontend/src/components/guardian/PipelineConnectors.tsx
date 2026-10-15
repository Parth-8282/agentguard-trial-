import React from 'react';
import { motion } from 'motion/react';

interface BranchingConnectorProps {
  active: boolean;
  completed: boolean;
}

export const BranchingConnector: React.FC<BranchingConnectorProps> = ({ active, completed }) => {
  return (
    <div className="relative my-2 w-full">
      {/* Desktop 5-branch circuit */}
      <div className="hidden lg:block h-11 w-full">
        <svg
          viewBox="0 0 1000 44"
          className="h-full w-full overflow-visible"
          preserveAspectRatio="none"
        >
          <defs>
            <linearGradient id="branchGlow" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#60A5FA" stopOpacity="0.9" />
              <stop offset="100%" stopColor="#2563EB" stopOpacity="0.9" />
            </linearGradient>
            <linearGradient id="branchStatic" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#3B82F6" stopOpacity="0.5" />
              <stop offset="100%" stopColor="#1E3A8A" stopOpacity="0.3" />
            </linearGradient>
          </defs>

          {/* 5 Branching paths from center (500, 0) to 5 columns: (100, 44), (300, 44), (500, 44), (700, 44), (900, 44) */}
          {[100, 300, 500, 700, 900].map((targetX, idx) => (
            <g key={targetX}>
              {/* Background passive track */}
              <path
                d={`M 500 0 C 500 22, ${targetX} 22, ${targetX} 44`}
                fill="none"
                stroke="#1E293B"
                strokeWidth="1.5"
              />

              {/* Completed / Active streaming line */}
              {(active || completed) && (
                <motion.path
                  d={`M 500 0 C 500 22, ${targetX} 22, ${targetX} 44`}
                  fill="none"
                  stroke={active ? "url(#branchGlow)" : "url(#branchStatic)"}
                  strokeWidth="2"
                  strokeDasharray={active ? "4 4" : "none"}
                  initial={{ strokeDashoffset: 24, opacity: 0 }}
                  animate={{ strokeDashoffset: 0, opacity: 1 }}
                  transition={{
                    duration: 0.8,
                    repeat: active ? Infinity : 0,
                    ease: 'linear',
                    delay: idx * 0.05,
                  }}
                />
              )}

              {/* Streaming data packet */}
              {active && (
                <motion.circle
                  r="2.5"
                  fill="#93C5FD"
                  initial={{ offsetDistance: '0%' }}
                  animate={{ offsetDistance: '100%' }}
                  transition={{
                    duration: 0.9,
                    repeat: Infinity,
                    ease: 'easeInOut',
                    delay: idx * 0.1,
                  }}
                  style={{
                    offsetPath: `path('M 500 0 C 500 22, ${targetX} 22, ${targetX} 44')`,
                  }}
                />
              )}

              {/* Bottom anchor notch marker */}
              <circle
                cx={targetX}
                cy="44"
                r="3"
                fill={active ? '#3B82F6' : completed ? '#10B981' : '#334155'}
              />
            </g>
          ))}

          {/* Central fan-out origin hub */}
          <circle cx="500" cy="1" r="5" fill="#3B82F6" />
          <circle cx="500" cy="1" r="2" fill="#FFFFFF" />
          {active && (
            <motion.circle
              cx="500"
              cy="1"
              r="8"
              fill="none"
              stroke="#60A5FA"
              strokeWidth="1.5"
              initial={{ scale: 0.8, opacity: 1 }}
              animate={{ scale: 1.8, opacity: 0 }}
              transition={{ duration: 1.2, repeat: Infinity, ease: 'easeOut' }}
            />
          )}
        </svg>
      </div>

      {/* Mobile/Tablet vertical fallback conduit */}
      <div className="block lg:hidden py-1">
        <VerticalStemConnector active={active} completed={completed} color="#3B82F6" />
      </div>
    </div>
  );
};

interface ConvergingConnectorProps {
  active: boolean;
  completed: boolean;
}

export const ConvergingConnector: React.FC<ConvergingConnectorProps> = ({ active, completed }) => {
  return (
    <div className="relative my-2 w-full">
      {/* Desktop 5-line converging circuit */}
      <div className="hidden lg:block h-14 w-full">
        <svg
          viewBox="0 0 1000 52"
          className="h-full w-full overflow-visible"
          preserveAspectRatio="none"
        >
          <defs>
            <linearGradient id="convergeGlow" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#3B82F6" stopOpacity="0.9" />
              <stop offset="100%" stopColor="#2563EB" stopOpacity="0.9" />
            </linearGradient>
            <linearGradient id="convergeStatic" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#10B981" stopOpacity="0.6" />
              <stop offset="100%" stopColor="#059669" stopOpacity="0.4" />
            </linearGradient>
          </defs>

          {/* 5 Converging paths from cards (100, 0), (300, 0), (500, 0), (700, 0), (900, 0) to hub (500, 32) */}
          {[100, 300, 500, 700, 900].map((startX, idx) => (
            <g key={startX}>
              {/* Start anchor notch */}
              <circle
                cx={startX}
                cy="0"
                r="3"
                fill={active ? '#3B82F6' : completed ? '#10B981' : '#334155'}
              />

              {/* Passive track */}
              <path
                d={`M ${startX} 0 C ${startX} 16, 500 16, 500 32`}
                fill="none"
                stroke="#1E293B"
                strokeWidth="1.5"
              />

              {/* Active streaming path */}
              {(active || completed) && (
                <motion.path
                  d={`M ${startX} 0 C ${startX} 16, 500 16, 500 32`}
                  fill="none"
                  stroke={active ? "url(#convergeGlow)" : "url(#convergeStatic)"}
                  strokeWidth="2"
                  strokeDasharray={active ? "4 4" : "none"}
                  initial={{ strokeDashoffset: 24, opacity: 0 }}
                  animate={{ strokeDashoffset: 0, opacity: 1 }}
                  transition={{
                    duration: 0.8,
                    repeat: active ? Infinity : 0,
                    ease: 'linear',
                    delay: idx * 0.05,
                  }}
                />
              )}

              {/* Streaming data particle */}
              {active && (
                <motion.circle
                  r="2.5"
                  fill="#93C5FD"
                  initial={{ offsetDistance: '0%' }}
                  animate={{ offsetDistance: '100%' }}
                  transition={{
                    duration: 0.9,
                    repeat: Infinity,
                    ease: 'easeInOut',
                    delay: idx * 0.1,
                  }}
                  style={{
                    offsetPath: `path('M ${startX} 0 C ${startX} 16, 500 16, 500 32')`,
                  }}
                />
              )}
            </g>
          ))}

          {/* Central convergence node */}
          <circle cx="500" cy="32" r="5" fill="#3B82F6" />
          <circle cx="500" cy="32" r="2" fill="#FFFFFF" />

          {/* Downward stem into Stage 3 */}
          <path
            d="M 500 32 L 500 52"
            fill="none"
            stroke="#1E293B"
            strokeWidth="2"
          />
          {(active || completed) && (
            <motion.path
              d="M 500 32 L 500 52"
              fill="none"
              stroke="#3B82F6"
              strokeWidth="2.5"
              initial={{ scaleY: 0 }}
              animate={{ scaleY: 1 }}
              transition={{ duration: 0.3 }}
            />
          )}
        </svg>
      </div>

      {/* Mobile/Tablet vertical fallback conduit */}
      <div className="block lg:hidden py-1">
        <VerticalStemConnector active={active} completed={completed} color="#3B82F6" />
      </div>
    </div>
  );
};

export const VerticalStemConnector: React.FC<{
  active: boolean;
  completed: boolean;
  color?: string;
  label?: string;
}> = ({
  active,
  completed,
  color = '#3B82F6',
  label,
}) => {
  return (
    <div className="relative flex h-8 w-full items-center justify-center my-0.5">
      <div className="relative h-full w-0.5 bg-slate-800/80">
        {(active || completed) && (
          <motion.div
            className="absolute inset-0 w-full"
            style={{ backgroundColor: color }}
            initial={{ scaleY: 0 }}
            animate={{ scaleY: 1 }}
            transition={{ duration: 0.25 }}
          />
        )}
        {active && (
          <motion.div
            className="absolute -left-1 h-2.5 w-2.5 rounded-full shadow-sm"
            style={{ backgroundColor: color, boxShadow: `0 0 8px ${color}` }}
            animate={{ y: [0, 22, 0] }}
            transition={{ duration: 1.1, repeat: Infinity, ease: 'easeInOut' }}
          />
        )}
      </div>

      {label && (
        <span className="absolute left-1/2 ml-3 -translate-y-1/2 font-mono text-[9px] uppercase tracking-wider text-slate-500 bg-[#070B14] px-1 rounded border border-slate-800">
          {label}
        </span>
      )}
    </div>
  );
};

