import React, { useState, useEffect } from 'react';
import { ROUTER_URL } from '../config.js';
import { emergencyAudio } from '../utils/emergencyAudio.js';
import { voiceAssistant } from '../utils/voiceAssistant.js';

export default function SosModal({ isOpen, onClose }) {
  const [userName, setUserName] = useState('');
  const [nameSaved, setNameSaved] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [status, setStatus] = useState({ type: 'idle', message: 'Tap the red button or speak your emergency message to broadcast across the mesh' });
  const [notifiedCount, setNotifiedCount] = useState(null);
  const [isSirenActive, setIsSirenActive] = useState(false);
  const [customDistressMsg, setCustomDistressMsg] = useState('');
  const [isVoiceListening, setIsVoiceListening] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('echomesh_sos_name');
    if (saved) {
      setUserName(saved);
      setNameSaved(true);
    }
  }, []);

  const [cachedCoords, setCachedCoords] = useState({ latitude: null, longitude: null });

  // Pre-fetch live GPS coordinates as soon as SOS modal is opened
  useEffect(() => {
    const fallbackLat = 28.6139 + (Math.random() - 0.5) * 0.008;
    const fallbackLng = 77.2090 + (Math.random() - 0.5) * 0.008;

    if (isOpen) {
      if (typeof navigator !== 'undefined' && navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (pos) => {
            setCachedCoords({
              latitude: pos.coords.latitude,
              longitude: pos.coords.longitude
            });
          },
          () => {
            setCachedCoords({ latitude: fallbackLat, longitude: fallbackLng });
          },
          { enableHighAccuracy: true, timeout: 4000, maximumAge: 0 }
        );
      } else {
        setCachedCoords({ latitude: fallbackLat, longitude: fallbackLng });
      }
    }
  }, [isOpen]);

  // Cleanup audio & voice when modal closes
  useEffect(() => {
    if (!isOpen) {
      emergencyAudio.stopSiren();
      voiceAssistant.stopListening();
      setIsSirenActive(false);
      setIsVoiceListening(false);
    }
  }, [isOpen]);

  const toggleSirenSound = () => {
    if (isSirenActive) {
      emergencyAudio.stopSiren();
      setIsSirenActive(false);
    } else {
      emergencyAudio.startSiren();
      setIsSirenActive(true);
    }
  };

  const saveName = (e) => {
    e.preventDefault();
    if (userName.trim()) {
      localStorage.setItem('echomesh_sos_name', userName.trim());
      setNameSaved(true);
    }
  };

  // Voice Typing for Emergency Message (Hindi & English STT)
  const toggleVoiceTyping = async () => {
    if (isVoiceListening) {
      voiceAssistant.stopListening();
      setIsVoiceListening(false);
      return;
    }

    setIsVoiceListening(true);
    setStatus({
      type: 'locating',
      message: '🎙️ Listening... Bolna shuru karein (e.g. "छत पर 4 लोग फंसे हैं, तुरंत मदद भेजो")...'
    });

    await voiceAssistant.startListening({
      lang: 'hi-IN',
      onResult: ({ transcript }) => {
        if (transcript) {
          setCustomDistressMsg(transcript);
          setStatus({
            type: 'idle',
            message: '✅ Voice message captured! Press the RED SOS BUTTON to broadcast.'
          });
        }
      },
      onError: (errMsg) => {
        setIsVoiceListening(false);
        setStatus({ type: 'error', message: `⚠️ ${errMsg || 'Voice recognition unavailable.'}` });
      },
      onEnd: () => {
        setIsVoiceListening(false);
      }
    });
  };

  const triggerSOS = async (overrideMessage = null) => {
    if (isSending) return;
    setIsSending(true);
    voiceAssistant.stopListening();
    setIsVoiceListening(false);

    // 1. Immediately sound Emergency Disaster Siren!
    emergencyAudio.startSiren();
    setIsSirenActive(true);

    const name = userName.trim() || 'Disaster Victim';
    setStatus({ type: 'locating', message: '📍 Real-time GPS location lock ho raha hai...' });

    let latitude = cachedCoords.latitude;
    let longitude = cachedCoords.longitude;

    if (!latitude || !longitude) {
      try {
        if (navigator.geolocation) {
          const pos = await new Promise((resolve, reject) => {
            navigator.geolocation.getCurrentPosition(resolve, reject, {
              enableHighAccuracy: true,
              timeout: 6000,
              maximumAge: 0
            });
          });
          latitude = pos.coords.latitude;
          longitude = pos.coords.longitude;
        }
      } catch (e) {
        // Continue with mesh broadcast even if GPS denied
      }
    }

    setStatus({ type: 'sending', message: '📡 Pure offline mesh network par SOS broadcast ho raha hai...' });

    const finalMessage = overrideMessage || customDistressMsg.trim() || '🚨 आपातकालीन मदद की आवश्यकता है! (Need immediate rescue assistance!)';

    try {
      const res = await fetch(`${ROUTER_URL}/sos`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          deviceName: name,
          latitude,
          longitude,
          message: finalMessage
        })
      });

      if (res.status === 429) {
        const data = await res.json();
        setStatus({ type: 'rate-limited', message: `⏳ Cooldown active. Please wait ${data.retryAfterSeconds}s.` });
        setIsSending(false);
        return;
      }

      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      const data = await res.json();
      setNotifiedCount(data.devicesNotified);
      setStatus({
        type: 'success',
        message: `✅ SOS Broadcast Sent! ${data.devicesNotified} mesh devices ko siren aur location pahuch gayi.`
      });
      setIsSending(false);
    } catch (e) {
      setStatus({
        type: 'error',
        message: '❌ Router connect nahi hua. Local WiFi hotspot check karein.'
      });
      setIsSending(false);
    }
  };

  if (!isOpen) return null;

  // Quick 1-Tap Emergency Reason Chips
  const quickChips = [
    '🩺 मेडिकल इमरजेंसी / डॉक्टर चाहिए',
    '🌊 बाढ़ में फंसे हैं / नाव भेजो',
    '🏚️ मकान गिरा है / लोग दबे हैं',
    '💧 पीने का पानी व खाना खत्म',
    '👶 बच्चे व बुजुर्ग गंभीर स्थिति में'
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-150 overflow-y-auto">
      <div className="bg-white border border-slate-200 text-slate-800 max-w-md w-full p-5 sm:p-7 rounded-2xl relative shadow-2xl my-auto">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-700 p-2 rounded-lg hover:bg-slate-100 transition-all cursor-pointer"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Modal Header */}
        <div className="text-center mb-5">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-50 border border-red-200 text-[#DC3545] text-xs font-bold animate-pulse mb-2">
            <span className="w-2 h-2 rounded-full bg-[#DC3545] animate-ping inline-block" />
            <span>🚨 OFFLINE RESCUE BEACON</span>
          </div>
          <h2 className="text-2xl font-black text-slate-900">Emergency SOS Broadcast</h2>
          <p className="text-xs text-slate-500 mt-1">
            Bina internet ke paas ke sabhi devices aur rescuer dashboard par alert bhejein.
          </p>
        </div>

        {/* Identity Step */}
        {!nameSaved ? (
          <form onSubmit={saveName} className="space-y-4">
            <div>
              <label className="text-xs font-bold text-slate-800 block mb-1.5 text-center">
                Aapka Naam ya Device ID / Name:
              </label>
              <input
                type="text"
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                placeholder="e.g. Rahul Sharma / Room 104"
                required
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-3 text-sm text-slate-900 placeholder-slate-400 outline-none focus:border-[#DC3545] transition-all text-center font-bold"
              />
            </div>
            <button
              type="submit"
              className="w-full py-3 rounded-xl bg-[#DC3545] hover:bg-red-700 text-white font-bold text-sm transition-all shadow-md cursor-pointer hover:scale-105 active:scale-95"
            >
              Aage Badhein (Continue to SOS)
            </button>
          </form>
        ) : (
          <div className="flex flex-col items-center space-y-4">
            {/* Registered Name badge */}
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <span>Sender Name:</span>
              <span className="text-slate-900 font-bold bg-slate-100 px-2.5 py-0.5 rounded border border-slate-200">
                {userName}
              </span>
              <button
                onClick={() => setNameSaved(false)}
                className="text-[#0D6EFD] hover:underline text-[11px] font-bold cursor-pointer"
              >
                (Change)
              </button>
            </div>

            {/* Voice-Typing & Custom Distress Message Box */}
            <div className="w-full space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-[11px] font-bold text-slate-700 flex items-center gap-1">
                  <span>✍️ Emergency Message (Bol Kar Ya Type Karein):</span>
                </label>
                <span className="text-[10px] text-[#0D6EFD] font-bold">Hindi / English Mic</span>
              </div>

              {/* Message Box with Integrated Big Mic Voice Typing */}
              <div className={`relative flex items-center rounded-xl bg-slate-50 border transition-all ${
                isVoiceListening ? 'border-red-400 ring-2 ring-red-400/30 shadow-md' : 'border-slate-300 focus-within:border-[#DC3545]'
              }`}>
                <input
                  type="text"
                  value={customDistressMsg}
                  onChange={(e) => setCustomDistressMsg(e.target.value)}
                  placeholder={isVoiceListening ? "🎙️ Bol rahe hain... (Listening live)..." : "Bol kar ya type karke message likhein..."}
                  className="w-full bg-transparent border-none px-3.5 py-2.5 text-xs text-slate-900 placeholder-slate-400 outline-none"
                />

                {/* Voice Typing Mic Button */}
                <button
                  type="button"
                  onClick={toggleVoiceTyping}
                  className={`mr-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shrink-0 ${
                    isVoiceListening
                      ? 'bg-[#DC3545] text-white animate-pulse shadow-md'
                      : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-300'
                  }`}
                  title="Click to speak your emergency message"
                >
                  <span>{isVoiceListening ? '🔴' : '🎙️'}</span>
                  <span>{isVoiceListening ? 'Stop' : 'बोलें'}</span>
                </button>
              </div>

              {/* Quick 1-Tap Hindi Emergency Reasons */}
              <div className="pt-1">
                <span className="text-[10px] text-slate-500 block mb-1 font-semibold">⚡ Ya 1-Tap me select karein:</span>
                <div className="flex flex-wrap gap-1">
                  {quickChips.map((chip, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setCustomDistressMsg(chip)}
                      className="text-[11px] px-2.5 py-1 rounded-lg bg-slate-100 border border-slate-200 text-slate-700 hover:text-[#DC3545] hover:border-red-300 hover:bg-red-50 transition-all cursor-pointer font-medium"
                    >
                      {chip}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Giant Circular Panic SOS Button */}
            <div className="relative flex items-center justify-center my-2 pt-2">
              <div className="absolute w-36 h-36 rounded-full border-2 border-red-500/30 animate-ping pointer-events-none" />
              
              <button
                onClick={() => triggerSOS()}
                disabled={isSending}
                className={`w-32 h-32 rounded-full flex flex-col items-center justify-center gap-1 transition-all text-white font-black shadow-xl active:scale-95 hover:scale-105 cursor-pointer ${
                  status.type === 'success'
                    ? 'bg-[#198754] shadow-emerald-500/30'
                    : 'bg-[#DC3545] hover:bg-red-700 shadow-red-500/40'
                }`}
              >
                <span className="text-3xl">{status.type === 'success' ? '✅' : '🆘'}</span>
                <span className="text-[11px] tracking-wider uppercase font-black">
                  {isSending ? 'SENDING...' : status.type === 'success' ? 'SENT!' : 'DABAYEIN (SOS)'}
                </span>
              </button>
            </div>

            {/* Siren Sound Control Banner */}
            {isSirenActive && (
              <div className="flex items-center justify-between w-full px-4 py-2.5 rounded-xl bg-red-50 border border-red-200 text-xs text-[#DC3545] font-bold animate-pulse">
                <span className="flex items-center gap-1.5">
                  <span>🔊</span> Emergency Siren Baj Rahi Hai!
                </span>
                <button
                  onClick={toggleSirenSound}
                  className="px-3 py-1 rounded-lg bg-[#DC3545] hover:bg-red-700 text-white font-bold text-[11px] cursor-pointer"
                >
                  MUTE SIREN
                </button>
              </div>
            )}

            {/* Status Feedback Message */}
            <div className={`text-center p-3 rounded-xl w-full text-xs font-semibold transition-all ${
              status.type === 'success'
                ? 'bg-[#E8F5E9] border border-[#198754]/30 text-[#198754]'
                : status.type === 'error'
                ? 'bg-rose-50 border border-rose-200 text-rose-700'
                : status.type === 'locating' || status.type === 'sending'
                ? 'bg-blue-50 border border-blue-200 text-[#0D6EFD] animate-pulse'
                : 'bg-slate-50 border border-slate-200 text-slate-600'
            }`}>
              {status.message}
            </div>

            {/* Direct Links */}
            <div className="flex items-center justify-between w-full pt-3 border-t border-slate-100 text-xs font-bold">
              <a
                href="/rescue-dashboard.html"
                target="_blank"
                rel="noreferrer"
                className="text-[#0D6EFD] hover:underline flex items-center gap-1"
              >
                <span>🚑</span> Rescue Dashboard ↗
              </a>
              <a
                href="/sos.html"
                target="_blank"
                rel="noreferrer"
                className="text-[#DC3545] hover:underline flex items-center gap-1"
              >
                <span>🚨</span> Fullscreen Beacon ↗
              </a>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
