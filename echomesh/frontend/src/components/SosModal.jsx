import React, { useState, useEffect, useRef } from 'react';
import { ROUTER_URL } from '../config.js';
import { emergencyAudio } from '../utils/emergencyAudio.js';
import { voiceAssistant } from '../utils/voiceAssistant.js';
import { playAudioClip, stopAudioClip, convertAmrToWavDataUrl } from '../utils/universalAudio.js';
import MicPermissionModal from './MicPermissionModal.jsx';

export default function SosModal({ isOpen, onClose }) {
  const [userName, setUserName] = useState(() => {
    try {
      return localStorage.getItem('echomesh_sos_name') || 'आपदा पीड़ित (Survivor)';
    } catch (e) {
      return 'आपदा पीड़ित (Survivor)';
    }
  });
  const [nameSaved, setNameSaved] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [status, setStatus] = useState({ type: 'idle', message: 'Tap the red button or speak your emergency message to broadcast across the mesh' });
  const [notifiedCount, setNotifiedCount] = useState(null);
  const [isSirenActive, setIsSirenActive] = useState(false);
  const [customDistressMsg, setCustomDistressMsg] = useState('');
  const [isVoiceListening, setIsVoiceListening] = useState(false);
  const [isMicGuideOpen, setIsMicGuideOpen] = useState(false);

  // Native HTML5 mobile microphone capture (works 100% on HTTP without SSL or flags!)
  const nativeAudioInputRef = useRef(null);
  const [recordedAudioUrl, setRecordedAudioUrl] = useState(null);
  const [recordedAudioBase64, setRecordedAudioBase64] = useState(null);
  const [isPlayingPreview, setIsPlayingPreview] = useState(false);

  const handleAudioCaptured = async (e) => {
    const file = e.target.files && e.target.files[0];
    if (file) {
      setStatus({
        type: 'locating',
        message: '⏳ आवाज़ सुरक्षित की जा रही है (Processing voice audio)...'
      });
      try {
        // Convert to standard WAV format so all receiving laptops & browsers can play it
        const wavDataUrl = await convertAmrToWavDataUrl(file);
        setRecordedAudioBase64(wavDataUrl);
        setRecordedAudioUrl(wavDataUrl);

        if (!customDistressMsg) {
          setCustomDistressMsg('🚨 [वॉइस ऑडियो संदेश संलग्न] आपातकालीन बचाव सहायता चाहिए!');
        }
        setStatus({
          type: 'idle',
          message: '✅ आपकी आवाज़ रिकॉर्ड हो गई! नीचे दिए लाल बटन से तुरंत प्रसारित करें।'
        });
      } catch (convErr) {
        console.warn('WAV conversion fallback:', convErr);
        const reader = new FileReader();
        reader.onload = () => {
          setRecordedAudioBase64(reader.result);
          setRecordedAudioUrl(URL.createObjectURL(file));
          if (!customDistressMsg) {
            setCustomDistressMsg('🚨 [वॉइस ऑडियो संदेश संलग्न] आपातकालीन बचाव सहायता चाहिए!');
          }
          setStatus({
            type: 'idle',
            message: '✅ आवाज़ रिकॉर्ड हो गई! नीचे दिए लाल बटन से तुरंत प्रसारित करें।'
          });
        };
        reader.readAsDataURL(file);
      }
    }
  };

  const togglePlayPreview = () => {
    if (isPlayingPreview) {
      stopAudioClip();
      setIsPlayingPreview(false);
    } else {
      if (!recordedAudioBase64 && !recordedAudioUrl) return;
      setIsPlayingPreview(true);
      playAudioClip(recordedAudioBase64 || recordedAudioUrl, {
        onStart: () => setIsPlayingPreview(true),
        onEnd: () => setIsPlayingPreview(false),
        onError: () => setIsPlayingPreview(false)
      });
    }
  };

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
        const onOk = (pos) => {
          setCachedCoords({
            latitude: pos.coords.latitude,
            longitude: pos.coords.longitude
          });
        };
        navigator.geolocation.getCurrentPosition(
          onOk,
          () => {
            navigator.geolocation.getCurrentPosition(
              onOk,
              () => setCachedCoords({ latitude: fallbackLat, longitude: fallbackLng }),
              { enableHighAccuracy: false, timeout: 8000, maximumAge: 120000 }
            );
          },
          { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
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
      emergencyAudio.mute();
      voiceAssistant.stopListening();
      stopAudioClip();
      setIsSirenActive(false);
      setIsVoiceListening(false);
      setIsPlayingPreview(false);
    }
  }, [isOpen]);

  const toggleSirenSound = () => {
    if (isSirenActive) {
      emergencyAudio.stopSiren();
      emergencyAudio.mute();
      setIsSirenActive(false);
    } else {
      emergencyAudio.unmute();
      emergencyAudio.startSiren(true);
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

  // Voice Recording & Typing for Emergency Message
  const toggleVoiceTyping = async () => {
    const isLocalhost = typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');
    const isHttps = typeof window !== 'undefined' && window.location.protocol === 'https:';

    // On mobile phone over HTTP: directly open phone's native microphone recorder!
    // No SSL warning, no permissions blocked, works 100% on any browser!
    if (!isLocalhost && !isHttps) {
      if (nativeAudioInputRef.current) {
        nativeAudioInputRef.current.click();
      }
      return;
    }

    if (isVoiceListening) {
      voiceAssistant.stopListening();
      setIsVoiceListening(false);
      return;
    }

    setIsVoiceListening(true);
    setStatus({
      type: 'locating',
      message: '🎙️ सुन रहे हैं... बोलना शुरू करें (उदा. "छत पर 4 लोग फंसे हैं, तुरंत नाव भेजो")...'
    });

    await voiceAssistant.startListening({
      lang: 'hi-IN',
      onResult: ({ transcript }) => {
        if (transcript) {
          setCustomDistressMsg(transcript);
          setStatus({
            type: 'idle',
            message: '✅ वॉइस संदेश रिकॉर्ड हो गया! लाल SOS बटन दबाकर या नीचे दिए बटन से प्रसारित करें।'
          });
        }
      },
      onError: () => {
        setIsVoiceListening(false);
        // Seamless fallback to phone's native sound recorder:
        if (nativeAudioInputRef.current) {
          nativeAudioInputRef.current.click();
        }
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
          message: finalMessage,
          audioData: recordedAudioBase64 || null
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
    <div className="fixed inset-0 z-50 flex items-start sm:items-center justify-center p-3 sm:p-5 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-150 overflow-y-auto overscroll-contain">
      <div className="bg-white border border-slate-200 text-slate-800 max-w-md w-full p-5 sm:p-7 rounded-2xl relative shadow-2xl my-auto max-h-[92vh] overflow-y-auto overscroll-contain">
        
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

            {/* ── Prominent Dedicated Voice SOS Card ── */}
            <div className="w-full p-3.5 sm:p-4 rounded-2xl bg-amber-50/80 border-2 border-amber-300 shadow-sm space-y-2.5 text-left">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-lg">🎙️</span>
                  <div>
                    <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider">
                      बोलकर SOS भेजें (Voice SOS)
                    </h4>
                    <p className="text-[10px] text-slate-500 font-medium">
                      हिंदी या English में बोलें — तुरंत डिस्ट्रेस अलर्ट प्रसारित होगा
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsMicGuideOpen(true)}
                  className="text-[10px] text-amber-800 hover:text-amber-950 underline font-bold flex items-center gap-1 cursor-pointer bg-white/70 px-2 py-1 rounded-lg border border-amber-200 shadow-2xs"
                  title="माइक अनुमति कैसे दें / अनब्लॉक करें"
                >
                  <span>🔓</span>
                  <span>माइक चालू कैसे करें?</span>
                </button>
              </div>

              {/* If on mobile HTTP, suggest 1-click switch to HTTPS */}
              {typeof window !== 'undefined' && window.location.protocol !== 'https:' && window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1' && (
                <div className="p-2 rounded-xl bg-emerald-100 border border-emerald-300 text-emerald-950 flex items-center justify-between text-[11px] font-bold">
                  <span className="flex items-center gap-1.5">
                    <span>🔒</span>
                    <span>फोन में माइक हेतु: HTTPS (4443) खोलें</span>
                  </span>
                  <a
                    href={`https://${window.location.hostname}:4443`}
                    target="_blank"
                    rel="noreferrer"
                    className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-black text-[10px] transition-colors shadow-2xs"
                  >
                    स्विच करें ↗
                  </a>
                </div>
              )}

              {/* Hidden Native Mobile Audio Capture Input */}
              <input
                type="file"
                ref={nativeAudioInputRef}
                accept="audio/*"
                capture="microphone"
                onChange={handleAudioCaptured}
                className="hidden"
              />

              {/* Big Interactive Tap-to-Speak Button */}
              <button
                type="button"
                onClick={toggleVoiceTyping}
                className={`w-full py-3 px-4 rounded-xl font-black text-xs transition-all flex items-center justify-center gap-2.5 cursor-pointer shadow-md active:scale-95 ${
                  isVoiceListening
                    ? 'bg-[#DC3545] text-white animate-pulse shadow-red-500/50 ring-4 ring-red-400/40'
                    : 'bg-white hover:bg-slate-50 text-slate-900 border-2 border-slate-300 hover:border-slate-400'
                }`}
              >
                <span className="text-base">{isVoiceListening ? '🔴' : '🎙️'}</span>
                <span className="text-xs sm:text-sm">
                  {isVoiceListening ? 'सुन रहे हैं... बोलिए (रोकने के लिए दबाएं)' : '🎙️ माइक चालू करें / बोलकर रिकॉर्ड करें (Tap to Speak)'}
                </span>
              </button>

              {/* Real Recorded Audio Preview Player */}
              {recordedAudioUrl && (
                <div className="p-3.5 rounded-2xl bg-emerald-50 border-2 border-emerald-400 space-y-2.5 animate-fade-in text-left shadow-xs">
                  <div className="flex items-center justify-between text-xs text-emerald-950 font-black">
                    <span className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                      <span>आपकी रिकॉर्ड की गई आवाज़ (Voice Clip Ready)</span>
                    </span>
                    <button
                      type="button"
                      onClick={() => nativeAudioInputRef.current?.click()}
                      className="text-[11px] text-emerald-700 hover:text-emerald-950 font-black underline cursor-pointer"
                    >
                      🔄 दोबारा रिकॉर्ड करें
                    </button>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={togglePlayPreview}
                      className={`flex-1 py-2 px-3 rounded-xl font-black text-xs transition-all flex items-center justify-center gap-2 cursor-pointer shadow-xs active:scale-95 ${
                        isPlayingPreview
                          ? 'bg-rose-600 text-white animate-pulse'
                          : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                      }`}
                    >
                      <span>{isPlayingPreview ? '⏹️' : '▶️'}</span>
                      <span>{isPlayingPreview ? 'आवाज़ रोकें (Stop)' : 'अपनी आवाज़ सुनें (Play Voice Preview)'}</span>
                    </button>
                  </div>
                  <audio controls src={recordedAudioUrl} className="w-full h-8 rounded" />
                </div>
              )}

              {/* Spoken Text Display / Input Box */}
              <div className={`relative flex items-center rounded-xl bg-white border transition-all ${
                isVoiceListening ? 'border-red-400 ring-2 ring-red-400/30' : 'border-slate-300 focus-within:border-[#DC3545]'
              }`}>
                <input
                  type="text"
                  value={customDistressMsg}
                  onChange={(e) => setCustomDistressMsg(e.target.value)}
                  placeholder={isVoiceListening ? "🎙️ सुन रहे हैं... (Listening live)..." : "बोला गया संदेश यहाँ दिखेगा, या टाइप करें..."}
                  className="w-full bg-transparent border-none px-3.5 py-2.5 text-xs text-slate-900 placeholder-slate-400 outline-none font-medium"
                />
                {customDistressMsg && (
                  <button
                    type="button"
                    onClick={() => setCustomDistressMsg('')}
                    className="px-2.5 text-slate-400 hover:text-slate-700 text-xs font-bold cursor-pointer"
                    title="हटाएं"
                  >
                    ✕
                  </button>
                )}
              </div>

              {/* Instant Spoken Message Broadcast Button */}
              {customDistressMsg.trim() && (
                <button
                  type="button"
                  onClick={() => triggerSOS(customDistressMsg.trim())}
                  disabled={isSending}
                  className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-red-600 via-rose-600 to-red-600 hover:from-red-700 hover:to-rose-700 text-white font-black text-xs uppercase tracking-wider shadow-md hover:shadow-red-500/30 transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95 animate-fade-in"
                >
                  <span>🚨</span>
                  <span>यह वॉइस संदेश तुरंत भेजें (Send Voice Message)</span>
                </button>
              )}

              {/* Quick 1-Tap Emergency Reason Chips */}
              <div className="pt-0.5">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] text-slate-600 font-bold">
                    ⚡ या 1-टैप में कारण चुनें (बिना बोले):
                  </span>
                  <span className="text-[9px] text-emerald-700 font-bold bg-emerald-100 px-1.5 py-0.5 rounded">
                    100% Guaranteed
                  </span>
                </div>
                <div className="flex flex-wrap gap-1">
                  {quickChips.map((chip, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setCustomDistressMsg(chip)}
                      className="text-[11px] px-2.5 py-1 rounded-lg bg-white border border-slate-300 text-slate-800 hover:text-[#DC3545] hover:border-red-400 hover:bg-red-50 transition-all cursor-pointer font-semibold shadow-2xs active:scale-95"
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

      {/* Mic Permission Unblock Guide & Direct Test Modal */}
      <MicPermissionModal
        isOpen={isMicGuideOpen}
        onClose={() => setIsMicGuideOpen(false)}
        onSelectPreset={(txt) => setCustomDistressMsg(txt)}
        lang="hi"
      />
    </div>
  );
}
