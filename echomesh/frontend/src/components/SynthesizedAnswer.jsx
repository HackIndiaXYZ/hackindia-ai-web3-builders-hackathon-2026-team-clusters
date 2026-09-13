import React, { useState, useEffect } from 'react';
import { voiceAssistant } from '../utils/voiceAssistant.js';

export default function SynthesizedAnswer({ result, onReset }) {
  const [isSpeaking, setIsSpeaking] = useState(false);

  useEffect(() => {
    return () => {
      voiceAssistant.stopSpeaking();
    };
  }, []);

  if (!result) return null;

  const { finalAnswer, contributingDevices, query } = result;
  const hasSources = contributingDevices && contributingDevices.length > 0;

  const toggleSpeak = () => {
    if (isSpeaking) {
      voiceAssistant.stopSpeaking();
      setIsSpeaking(false);
    } else {
      setIsSpeaking(true);
      voiceAssistant.speak(finalAnswer, {
        onStart: () => setIsSpeaking(true),
        onEnd: () => setIsSpeaking(false)
      });
    }
  };

  return (
    <div className="fade-in-up" style={{ animationDelay: '0.2s', opacity: 0 }}>
      <div className={`glass-card overflow-hidden ${hasSources ? 'glow-teal' : 'glow-cyan'}`}>
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b" style={{ borderColor: 'var(--border-subtle)' }}>
          <div className="flex items-center gap-2.5">
            <div className="relative">
              <div className={`w-3 h-3 rounded-full ${hasSources ? 'bg-teal-glow' : 'bg-cyan-glow'}`} />
              <div className={`absolute inset-0 w-3 h-3 rounded-full ${hasSources ? 'bg-teal-glow' : 'bg-cyan-glow'} animate-ping opacity-30`} />
            </div>
            <h3 className="font-bold text-base text-text-primary">
              {hasSources ? 'Synthesized Answer' : 'Mesh Response'}
            </h3>
          </div>

          <div className="btn-group">
            {/* Voice Assistant Read Aloud Button */}
            <button
              onClick={toggleSpeak}
              className={`text-xs font-mono transition-mesh flex items-center gap-1.5 px-3 py-1.5 rounded-lg border cursor-pointer ${
                isSpeaking
                  ? 'bg-teal-500/20 text-teal-300 border-teal-500/50 animate-pulse'
                  : 'text-text-dim hover:text-cyan-bright hover:bg-white/[0.05] border-mesh-border/30 hover:scale-[1.03]'
              }`}
              title={isSpeaking ? "Stop speech" : "Read answer aloud (AI Voice)"}
            >
              <span>{isSpeaking ? '⏹️' : '🔊'}</span>
              <span>{isSpeaking ? 'Stop Voice' : 'Read Aloud'}</span>
            </button>

            <button
              onClick={() => {
                voiceAssistant.stopSpeaking();
                onReset();
              }}
              className="text-xs text-text-dim hover:text-cyan-bright transition-mesh flex items-center gap-1.5 px-3 py-1.5 rounded-lg hover:bg-white/[0.05] border border-mesh-border/30 cursor-pointer hover:scale-[1.03] active:scale-95"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              New query
            </button>
          </div>
        </div>


        {/* Query */}
        <div className="px-5 py-3 border-b" style={{ background: 'rgba(255,255,255,0.015)', borderColor: 'var(--border-subtle)' }}>
          <p className="text-[10px] text-text-dim mb-1 font-mono uppercase tracking-wider">Your question</p>
          <p className="text-sm text-text-secondary italic">"{query}"</p>
        </div>

        {/* Answer */}
        <div className="px-5 py-5">
          <p className="text-sm sm:text-base text-text-primary leading-relaxed whitespace-pre-wrap">
            {finalAnswer}
          </p>
        </div>

        {/* Contributing devices footer */}
        {hasSources && (
          <div className="px-5 py-3 border-t flex flex-wrap items-center gap-2" style={{ borderColor: 'var(--border-subtle)' }}>
            <span className="text-[10px] font-mono text-text-dim uppercase tracking-wider">
              Sources:
            </span>
            {contributingDevices.map((d, i) => (
              <span
                key={i}
                className="text-[10px] font-mono px-2.5 py-1 rounded-full bg-teal-glow/10 text-teal-glow border border-teal-glow/20"
              >
                {d}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
