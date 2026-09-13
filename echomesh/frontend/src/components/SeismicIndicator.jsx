import React, { useState } from 'react';

export default function SeismicIndicator({
  isArmed,
  setIsArmed,
  currentGForce,
  isTriggering,
  lastTriggeredAt,
  triggerSeismicAlert,
  lang = 'en'
}) {
  const [isExpanded, setIsExpanded] = useState(false);
  const isHi = lang === 'hi';

  return (
    <div className="fixed bottom-4 right-4 z-40 flex flex-col items-end gap-2 font-sans select-none">
      
      {/* ── Trigger Flash Banner when Shake happens ── */}
      {isTriggering && (
        <div className="animate-bounce bg-gradient-to-r from-red-600 via-amber-600 to-red-600 text-white px-4 py-2.5 rounded-2xl shadow-2xl border border-white/30 flex items-center gap-2.5 text-xs font-black tracking-wide">
          <span className="text-xl animate-spin">⚡</span>
          <div>
            <p className="uppercase">{isHi ? 'भूकंपीय झटका पहचाना गया!' : 'SEISMIC TREMOR DETECTED!'}</p>
            <p className="text-[10px] font-medium text-amber-100">
              {isHi ? 'सभी मोबाइल फोन पर आपातकालीन अलर्ट व सायरन भेजा गया!' : 'Emergency siren & broadcast dispatched to all phones!'}
            </p>
          </div>
        </div>
      )}

      {/* ── Collapsible Panel ── */}
      {isExpanded && (
        <div className="w-80 bg-white/95 backdrop-blur-md rounded-3xl border border-slate-200 shadow-2xl p-4 animate-scale-up space-y-3.5 text-slate-800">
          
          <div className="flex items-center justify-between pb-2.5 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <span className="text-xl">⚡</span>
              <div>
                <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider">
                  {isHi ? 'भूकंप व शॉक सेंसर' : 'Seismic & Tremor Sensor'}
                </h4>
                <p className="text-[10px] text-slate-500 font-medium">
                  {isHi ? 'मेश आपदा पूर्व-चेतावनी प्रणाली' : 'Mesh Early Warning Network'}
                </p>
              </div>
            </div>
            <button
              onClick={() => setIsExpanded(false)}
              className="w-7 h-7 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center text-xs font-bold transition-all cursor-pointer"
            >
              ✕
            </button>
          </div>

          {/* Status & Live G-Force Meter */}
          <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
            <div className="flex items-center justify-between text-xs font-bold">
              <span className="text-slate-500 text-[11px]">{isHi ? 'सेंसर स्थिति' : 'Sensor Status'}</span>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase flex items-center gap-1 ${
                isArmed
                  ? 'bg-emerald-100 text-emerald-700 border border-emerald-300'
                  : 'bg-slate-200 text-slate-600'
              }`}>
                <span className={`w-1.5 h-1.5 rounded-full ${isArmed ? 'bg-emerald-500 animate-ping' : 'bg-slate-400'}`} />
                {isArmed ? (isHi ? 'सक्रिय (ARMED)' : 'ARMED & LISTENING') : (isHi ? 'निष्क्रिय' : 'DISARMED')}
              </span>
            </div>

            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-500 text-[11px] font-medium">{isHi ? 'लाइव G-Force' : 'Live Force'}</span>
              <span className="font-mono font-bold text-slate-800 text-xs">
                {currentGForce?.toFixed(2) || '1.00'} G
              </span>
            </div>

            {/* Visual Seismograph Pulse Animation */}
            <div className="h-8 rounded-xl bg-slate-900 flex items-center justify-center overflow-hidden relative px-2">
              <div className="w-full flex items-center justify-between text-emerald-400 font-mono text-[10px] opacity-80 select-none">
                <span className="animate-pulse">〰️〰️</span>
                <span className="text-amber-400 font-black animate-ping text-xs">⚡</span>
                <span className="animate-pulse">〰️〰️</span>
              </div>
            </div>
          </div>

          {/* Quick Demo Instructions */}
          <div className="p-2.5 rounded-xl bg-blue-50/80 border border-blue-200 text-[11px] text-blue-900 leading-relaxed font-medium">
            <span className="font-bold block mb-0.5">🎯 {isHi ? 'डेमो निर्देश:' : 'Live Demo Trigger:'}</span>
            {isHi ? (
              <span>लैपटॉप को हल्का सा हिलाएं <strong>(Shake Laptop)</strong>, या कीबोर्ड पर <strong>Shift + S</strong> दबाएं, या नीचे दिए गए बटन पर टैप करें।</span>
            ) : (
              <span>Lightly <strong>shake laptop</strong>, press <strong>Shift + S</strong> on keyboard, or click the button below to simulate tremors.</span>
            )}
          </div>

          {/* Test Trigger Button */}
          <button
            type="button"
            disabled={isTriggering}
            onClick={() => triggerSeismicAlert()}
            className="w-full py-2.5 rounded-2xl bg-gradient-to-r from-red-600 to-amber-600 hover:from-red-700 hover:to-amber-700 active:scale-95 text-white font-black text-xs transition-all shadow-md cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
          >
            <span className="text-sm">⚡</span>
            <span>{isTriggering ? (isHi ? 'अलर्ट प्रसारित हो रहा है...' : 'Broadcasting Alert...') : (isHi ? 'शॉक / भूकंप टेस्ट करें (DEMO)' : 'SIMULATE TREMOR / SHAKE')}</span>
          </button>

          {/* Arm / Disarm Toggle */}
          <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1">
            <span>{isHi ? 'सेंसर चालू/बंद रखें' : 'Sensor Active'}</span>
            <button
              onClick={() => setIsArmed(!isArmed)}
              className={`text-xs font-bold cursor-pointer hover:underline ${isArmed ? 'text-emerald-600' : 'text-slate-400'}`}
            >
              {isArmed ? (isHi ? 'चालू (ON)' : 'ENABLED (ON)') : (isHi ? 'बंद (OFF)' : 'MUTED (OFF)')}
            </button>
          </div>

        </div>
      )}

      {/* ── Main Pill / Floating HUD Trigger ── */}
      <button
        type="button"
        onClick={() => setIsExpanded(!isExpanded)}
        className={`px-3.5 py-2.5 rounded-full border shadow-xl flex items-center gap-2.5 transition-all hover:scale-105 active:scale-95 cursor-pointer backdrop-blur-md ${
          isTriggering
            ? 'bg-red-600 text-white border-red-300 animate-pulse'
            : isArmed
            ? 'bg-slate-900/90 hover:bg-slate-900 text-white border-slate-700'
            : 'bg-white/90 text-slate-700 border-slate-200'
        }`}
        title="Seismic Shock & Tremor Sensor (Shake Laptop to Trigger)"
      >
        <div className="relative flex items-center justify-center">
          <span className={`text-base ${isArmed ? 'animate-pulse' : ''}`}>⚡</span>
          {isArmed && (
            <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
          )}
        </div>
        <div className="text-left">
          <div className="text-[10px] uppercase font-black tracking-wider leading-none text-emerald-400">
            {isHi ? 'भूकंप सेंसर' : 'Seismic Sensor'}
          </div>
          <div className="text-[11px] font-bold text-white leading-tight flex items-center gap-1.5 mt-0.5">
            <span>{isArmed ? (isHi ? 'सक्रिय (Shake me)' : 'Armed (Shake Laptop)') : (isHi ? 'निष्क्रिय' : 'Muted')}</span>
            <span className="text-[10px] text-slate-400 font-mono hidden sm:inline">
              [{currentGForce?.toFixed(1) || '1.0'}G]
            </span>
          </div>
        </div>
        <span className="text-slate-400 text-xs ml-1 font-bold">
          {isExpanded ? '▼' : '▲'}
        </span>
      </button>

    </div>
  );
}
