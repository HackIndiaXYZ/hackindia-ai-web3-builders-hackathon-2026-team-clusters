import React, { useState } from 'react';

export default function InfoModal() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="
          inline-flex items-center gap-1.5 text-xs text-text-dim
          hover:text-cyan-glow transition-mesh px-3 py-1.5 rounded-lg
          hover:bg-white/[0.03] border border-transparent hover:border-mesh-border/30
        "
      >
        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        How EchoMesh works
      </button>

      {isOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          onClick={() => setIsOpen(false)}
        >
          <div
            className="glass-card glow-cyan max-w-md w-full p-6 fade-in-up"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-bold text-text-primary flex items-center gap-2">
                <span className="text-xl">🌐</span>
                How EchoMesh Works
              </h2>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 text-text-dim hover:text-text-primary transition-mesh rounded-lg hover:bg-white/[0.05]"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="space-y-4">
              <div className="flex gap-3">
                <div className="text-lg shrink-0 mt-0.5">💡</div>
                <div>
                  <h3 className="text-sm font-semibold text-cyan-bright mb-0.5">Knowledge Sharing</h3>
                  <p className="text-xs text-text-secondary leading-relaxed">
                    Each device holds a unique fragment of knowledge (medical, shelter, maps).
                    No single device has the full picture — the mesh does.
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <div className="text-lg shrink-0 mt-0.5">⚡</div>
                <div>
                  <h3 className="text-sm font-semibold text-cyan-bright mb-0.5">Distributed Compute</h3>
                  <p className="text-xs text-text-secondary leading-relaxed">
                    Each device runs its own on-device LLM (Ollama + Phi-3).
                    AI inference is split across the mesh — no cloud needed.
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <div className="text-lg shrink-0 mt-0.5">📡</div>
                <div>
                  <h3 className="text-sm font-semibold text-cyan-bright mb-0.5">Mesh Communication</h3>
                  <p className="text-xs text-text-secondary leading-relaxed">
                    Devices communicate over local WiFi (simulating Bluetooth/WiFi-Direct).
                    A Query Router coordinates requests and synthesizes final answers.
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-5 pt-4 border-t border-mesh-border/50">
              <p className="text-[10px] text-text-dim font-mono text-center uppercase tracking-wider">
                Built for disaster response · No internet required
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
