import React from 'react';

const SPECIALTY_CONFIG = {
  medical: {
    icon: '🏥',
    label: 'Medical',
    color: 'text-red-400',
  },
  shelter: {
    icon: '🏠',
    label: 'Shelter',
    color: 'text-amber-400',
  },
  maps: {
    icon: '🗺️',
    label: 'Maps',
    color: 'text-emerald-400',
  }
};

export default function DeviceNode({ device, isActive, isContributing, index }) {
  const config = SPECIALTY_CONFIG[device.specialty] || SPECIALTY_CONFIG.medical;
  const isOnline = device.status === 'online';

  return (
    <div
      className={`
        glass-card p-5 sm:p-6 transition-mesh relative
        ${isActive ? 'glow-cyan-strong' : ''}
        ${isContributing ? 'glow-teal' : ''}
      `}
    >
      {/* Top row: Icon + Name + Status */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className={`text-2xl ${isActive ? 'animate-bounce' : ''}`}>
            {config.icon}
          </div>
          <div>
            <h3 className="font-bold text-base text-text-primary leading-tight">
              {device.name}
            </h3>
            <p className={`text-[11px] font-mono ${config.color} uppercase tracking-wider mt-0.5`}>
              {config.label} Node
            </p>
          </div>
        </div>

        {/* Status indicator */}
        <div className="flex items-center gap-1.5 shrink-0 ml-2">
          <span className="text-[10px] font-mono text-text-dim uppercase">
            {isOnline ? 'on' : 'off'}
          </span>
          <div
            className={`
              w-2.5 h-2.5 rounded-full shrink-0
              ${isOnline ? 'bg-green-pulse pulse-dot-online' : 'bg-red-offline pulse-dot-offline'}
            `}
          />
        </div>
      </div>

      {/* Knowledge indicator */}
      <div className="flex items-center gap-2 text-xs text-text-dim">
        <svg className="w-3.5 h-3.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4" />
        </svg>
        <span>Local knowledge base</span>
      </div>

      {/* Active query indicator */}
      {isActive && (
        <div className="mt-4 pt-3 border-t border-mesh-border/50">
          <div className="flex items-center gap-2 text-xs text-cyan-glow">
            <div className="w-1.5 h-1.5 rounded-full bg-cyan-glow animate-pulse shrink-0" />
            <span className="font-mono">Processing query...</span>
          </div>
        </div>
      )}

      {/* Contributing badge */}
      {isContributing && !isActive && (
        <div className="mt-4 pt-3 border-t border-mesh-border/50">
          <div className="flex items-center gap-2 text-xs text-teal-glow">
            <svg className="w-3.5 h-3.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <span className="font-mono">Contributed answer</span>
          </div>
        </div>
      )}
    </div>
  );
}
