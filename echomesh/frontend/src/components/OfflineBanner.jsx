import React from 'react';

export default function OfflineBanner({ onOpenSos, userLocation, requestLocation }) {
  return (
    <header className="sticky top-0 z-40 w-full backdrop-blur-md border-b" style={{ 
      background: 'rgba(15, 23, 42, 0.92)', 
      borderColor: 'var(--border-subtle)' 
    }}>
      <div className="container-centered py-2.5 flex items-center justify-between gap-3" style={{ maxWidth: '1100px' }}>
        
        {/* Brand & Mode */}
        <div className="flex items-center gap-2.5">
          <span className="text-xl">🌐</span>
          <div className="flex flex-col sm:flex-row sm:items-center sm:gap-2">
            <span className="font-extrabold text-sm sm:text-base tracking-tight text-white">
              EchoMesh
            </span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 w-fit">
              ● 100% Offline
            </span>
          </div>
        </div>

        {/* Right: GPS Status & SOS Panic Trigger */}
        <div className="btn-group">
          <button
            onClick={requestLocation}
            className={`hidden sm:flex items-center gap-1 px-2.5 py-1.5 rounded-lg border text-[11px] font-mono transition-mesh cursor-pointer ${
              userLocation?.isGpsAcquired
                ? 'bg-teal-500/10 text-teal-300 border-teal-500/30'
                : 'bg-amber-500/10 text-amber-300 border-amber-500/30 animate-pulse'
            }`}
            title="Click to refresh GPS coordinates"
          >
            <span>📍</span>
            <span>{userLocation?.isGpsAcquired ? 'GPS Ready' : 'Allow GPS'}</span>
          </button>

          <button
            onClick={onOpenSos}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs transition-mesh shadow-lg shadow-red-600/30 active:scale-95 cursor-pointer"
          >
            <span className="w-2 h-2 rounded-full bg-white animate-ping" />
            <span>🚨 SOS HELP</span>
          </button>
        </div>

      </div>
    </header>
  );
}
