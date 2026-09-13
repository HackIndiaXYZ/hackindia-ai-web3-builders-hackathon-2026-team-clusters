import React, { useState } from 'react';

export default function PartialAnswer({ device, answer, index }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div
      className={`glass-card-sm overflow-hidden transition-mesh fade-in-up`}
      style={{ animationDelay: `${index * 0.15}s`, opacity: 0 }}
    >
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-white/[0.03] transition-mesh cursor-pointer"
      >
        <div className="flex items-center gap-2.5">
          <div className="w-2 h-2 rounded-full bg-teal-glow" />
          <span className="text-sm font-medium text-text-primary">{device}</span>
          <span className="text-[10px] font-mono text-text-dim uppercase tracking-wider px-1.5 py-0.5 rounded" style={{ background: 'var(--border-subtle)' }}>
            partial
          </span>
        </div>
        <svg
          className={`w-4 h-4 text-text-dim transition-transform duration-200 ${expanded ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {expanded && (
        <div className="slide-down px-4 pb-4 pt-1">
          <p className="text-sm text-text-secondary leading-relaxed">
            {answer}
          </p>
        </div>
      )}
    </div>
  );
}
