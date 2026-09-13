import React, { useState, useEffect } from 'react';
import { voiceAssistant } from '../utils/voiceAssistant.js';

export default function QueryInput({ onSubmit, loading }) {
  const [query, setQuery] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [voiceError, setVoiceError] = useState(null);

  useEffect(() => {
    return () => {
      voiceAssistant.stopListening();
    };
  }, []);

  const handleVoiceToggle = async () => {
    if (isListening) {
      voiceAssistant.stopListening();
      setIsListening(false);
      return;
    }

    setVoiceError(null);
    setIsListening(true);

    await voiceAssistant.startListening({
      lang: 'hi-IN', // Supports Hindi + English mixed disaster queries
      onResult: ({ transcript }) => {
        if (transcript) {
          setQuery(transcript);
        }
      },
      onError: (errMessage) => {
        setIsListening(false);
        setVoiceError(errMessage || 'Voice input unavailable or permission denied.');
        setTimeout(() => setVoiceError(null), 5000);
      },
      onEnd: () => {
        setIsListening(false);
      }
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (query.trim() && !loading) {
      voiceAssistant.stopListening();
      setIsListening(false);
      onSubmit(query.trim());
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto space-y-3">
      <form onSubmit={handleSubmit}>
        <div className={`
          relative flex items-center gap-3 glass-card px-4 py-3.5
          transition-mesh
          ${isListening ? 'border-teal-glow ring-2 ring-teal-glow/30 glow-teal' : loading ? 'glow-cyan-strong' : 'hover:glow-cyan focus-within:glow-cyan-strong'}
        `}>
          {/* Search/mesh icon */}
          <svg className="w-5 h-5 text-cyan-glow shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>

          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={isListening ? "Listening... Bol rahe hain..." : "Ask the mesh (Type or tap mic to speak)..."}
            disabled={loading}
            className="
              flex-1 bg-transparent border-none outline-none
              text-text-primary placeholder-text-dim
              text-sm sm:text-base font-light
              disabled:opacity-50
            "
          />

          {/* Real Mic Voice AI Assistant Button */}
          <button
            type="button"
            onClick={handleVoiceToggle}
            disabled={loading}
            className={`p-2.5 rounded-xl transition-mesh shrink-0 cursor-pointer flex items-center gap-1.5 ${
              loading ? 'opacity-50 cursor-not-allowed' :
              isListening
                ? 'bg-teal-500 text-white animate-pulse shadow-lg shadow-teal-500/50'
                : 'text-text-dim hover:text-cyan-bright hover:bg-white/[0.05]'
            }`}
            title={isListening ? "Stop listening" : "Speak your query (Hindi & English)"}
          >
            {isListening ? (
              <>
                <span className="w-2 h-2 rounded-full bg-white animate-ping" />
                <span className="text-xs font-mono font-bold">Listening</span>
              </>
            ) : (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
              </svg>
            )}
          </button>

          {/* Submit button */}
          <button
            type="submit"
            disabled={loading || !query.trim()}
            className={`
              p-2.5 rounded-xl shrink-0 transition-mesh
              ${loading || !query.trim()
                ? 'bg-mesh-border text-text-dim cursor-not-allowed opacity-50'
                : 'bg-cyan-glow/20 text-cyan-bright hover:bg-cyan-glow/30 hover:scale-105 active:scale-95'
              }
            `}
          >
            {loading ? (
              <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
            ) : (
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            )}
          </button>
        </div>
      </form>

      {/* Voice feedback message */}
      {isListening && (
        <div className="text-center">
          <p className="text-xs text-teal-glow font-mono animate-pulse flex items-center justify-center gap-2">
            <span>🎙️</span> Speak now (e.g. <em>"paani kahan milega"</em> or <em>"snake bite first aid"</em>)
          </p>
        </div>
      )}

      {voiceError && (
        <p className="text-xs text-amber-400 font-mono text-center">
          ⚠️ {voiceError}
        </p>
      )}

      {loading && (
        <div className="text-center">
          <span className="text-xs text-cyan-glow font-mono typing-cursor">
            Querying mesh network & AI
          </span>
        </div>
      )}
    </div>
  );
}
