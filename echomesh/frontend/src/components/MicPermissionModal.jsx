import React, { useState } from 'react';

export default function MicPermissionModal({
  isOpen,
  onClose,
  onSelectPreset = null,
  lang = 'hi'
}) {
  const [testStatus, setTestStatus] = useState(null); // 'testing' | 'success' | 'failed'

  if (!isOpen) return null;

  const currentHost = typeof window !== 'undefined' ? window.location.hostname : '192.168.137.1';
  const httpsUrl = `https://${currentHost}:4443`;
  const isCurrentlyHttps = typeof window !== 'undefined' && window.location.protocol === 'https:';

  const handleRequestDirectPermission = async () => {
    setTestStatus('testing');
    try {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        stream.getTracks().forEach(t => t.stop());
        setTestStatus('success');
        setTimeout(() => {
          if (onClose) onClose();
        }, 1200);
        return;
      }
      
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (SpeechRecognition) {
        const sr = new SpeechRecognition();
        sr.onstart = () => {
          sr.stop();
          setTestStatus('success');
          setTimeout(() => {
            if (onClose) onClose();
          }, 1200);
        };
        sr.onerror = (e) => {
          console.warn('SR test error:', e);
          setTestStatus('failed');
        };
        sr.start();
        return;
      }

      setTestStatus('failed');
    } catch (err) {
      console.warn('Direct mic request error:', err);
      setTestStatus('failed');
    }
  };

  const emergencyPresets = [
    { emoji: '🌊', text: 'छत पर 4 लोग फंसे हैं, तुरंत बचाव नाव और दल भेजें!' },
    { emoji: '🩺', text: 'गंभीर चोट लगी है, डॉक्टर और आपातकालीन एम्बुलेंस चाहिए!' },
    { emoji: '🏚️', text: 'मकान गिर गया है, मलबे में 3 लोग दबे हैं, कटर लाओ!' },
    { emoji: '💧', text: 'पीने का पानी और राशन खत्म हो चुका है, तुरंत मदद चाहिए!' },
    { emoji: '👶', text: 'बच्चे और बुजुर्ग गंभीर स्थिति में हैं, तत्काल सहायता भेजो!' }
  ];

  return (
    <div
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/80 backdrop-blur-sm animate-fade-in"
    >
      <div className="bg-white rounded-3xl max-w-md w-full p-5 sm:p-6 border border-slate-200 shadow-2xl space-y-4 max-h-[92vh] overflow-y-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-amber-50 border border-amber-300 text-amber-600 flex items-center justify-center text-xl shrink-0">
              🎙️
            </div>
            <div>
              <h3 className="text-base font-black text-slate-900 leading-tight">
                {lang === 'hi' ? 'फोन में माइक चालू कैसे करें?' : 'Enable Phone Microphone'}
              </h3>
              <p className="text-[11px] text-slate-500 font-medium">
                {lang === 'hi' ? 'Chrome ब्राउज़र का सुरक्षा नियम व 1-क्लिक समाधान' : 'Browser security restriction & 1-click fix'}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center text-xs font-bold cursor-pointer transition-colors"
          >
            ✕
          </button>
        </div>

        {/* ── Key Explanation Box: Why does it ask even if enabled in phone? ── */}
        <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 space-y-1.5 text-xs text-rose-950">
          <div className="font-black text-rose-800 flex items-center gap-1.5 uppercase tracking-wider text-[10px]">
            <span>⚠️</span>
            <span>{lang === 'hi' ? 'फोन में परमिशन ऑन है, फिर भी क्यों मांग रहा है?' : 'Permission is ON in phone, why blocked?'}</span>
          </div>
          <p className="leading-relaxed">
            {lang === 'hi'
              ? 'Google Chrome का सुरक्षा नियम: जब आप बिना HTTPS (HTTP IP) से कनेक्ट करते हैं, तो Chrome फोन में अनुमति होने के बावजूद माइक को सीधे ब्लॉक कर देता है।'
              : 'Google Chrome strictly blocks microphone on insecure HTTP IP addresses even if allowed in phone settings.'}
          </p>
        </div>

        {/* ── Solution 1: Switch to HTTPS (1-Click Instant Unlock) ── */}
        {!isCurrentlyHttps && (
          <div className="p-3.5 rounded-2xl bg-emerald-50 border-2 border-emerald-300 space-y-2.5">
            <div className="flex items-center justify-between text-xs">
              <span className="font-black text-emerald-900 flex items-center gap-1.5 uppercase text-[10px]">
                <span>🔒</span>
                <span>{lang === 'hi' ? 'तरीका 1 (सबसे आसान): सुरक्षित HTTPS पर खोलें' : 'Method 1 (Instant): Switch to HTTPS'}</span>
              </span>
              <span className="text-[9px] bg-emerald-200 text-emerald-900 px-2 py-0.5 rounded-full font-bold">
                100% Guaranteed
              </span>
            </div>

            <p className="text-xs text-emerald-900 font-medium leading-relaxed">
              EchoMesh अब सुरक्षित SSL (Port 4443) पर भी लाइव है। इस लिंक पर टैप करें:
            </p>

            <a
              href={httpsUrl}
              target="_blank"
              rel="noreferrer"
              className="w-full py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs uppercase tracking-wider transition-all shadow-md flex items-center justify-center gap-2 text-center cursor-pointer active:scale-95"
            >
              <span>🚀</span>
              <span>{lang === 'hi' ? `HTTPS में खोलें (${httpsUrl})` : `Open in HTTPS (${httpsUrl})`}</span>
            </a>

            <p className="text-[10px] text-emerald-800 leading-tight">
              👉 <em>फोन पर चेतावनी आए तो <strong>"Advanced / विवरण"</strong> पर टैप करके <strong>"Proceed to site / आगे बढ़ें"</strong> दबाएं। इसके बाद फोन पर माइक तुरंत चलने लगेगा!</em>
            </p>
          </div>
        )}

        {/* Test / Request Direct Permission Button */}
        <div className="space-y-2">
          <button
            type="button"
            onClick={handleRequestDirectPermission}
            disabled={testStatus === 'testing'}
            className="w-full py-2.5 px-4 rounded-xl bg-[#0D6EFD] hover:bg-blue-700 text-white font-black text-xs uppercase tracking-wider transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer active:scale-95"
          >
            <span>🎙️</span>
            <span>
              {testStatus === 'testing'
                ? 'अनुमति जांची जा रही है...'
                : testStatus === 'success'
                ? '✅ माइक चालू हो गया!'
                : 'माइक अनुमति पुनः टेस्ट करें (Test Mic)'}
            </span>
          </button>

          {testStatus === 'success' && (
            <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold text-center animate-fade-in">
              🎉 माइक सफलतापूर्वक चालू हो गया! अब आप बोल सकते हैं।
            </div>
          )}

          {testStatus === 'failed' && (
            <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-[11px] font-semibold text-center animate-fade-in">
              ⚠️ HTTP पर Chrome ने रोक दिया। ऊपर दिए गए <strong>"HTTPS में खोलें"</strong> बटन पर टैप करें या नीचे 1-टैप संदेश चुनें।
            </div>
          )}
        </div>

        {/* ── Solution 2: 1-Tap Emergency Voice Presets (Emergency Fail-Proof Fallback) ── */}
        <div className="pt-2 border-t border-slate-100 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-800">
              ⚡ {lang === 'hi' ? 'तरीका 2: बिना बोले 1-टैप में संदेश भेजें:' : 'Method 2: 1-Tap Emergency Voice Presets:'}
            </span>
            <span className="text-[10px] font-mono text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full font-bold">
              बिना माइक के
            </span>
          </div>

          <div className="space-y-1.5">
            {emergencyPresets.map((p, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => {
                  if (onSelectPreset) {
                    onSelectPreset(p.text);
                  }
                  onClose();
                }}
                className="w-full text-left p-2.5 rounded-xl bg-slate-50 hover:bg-red-50 hover:border-red-300 border border-slate-200 text-slate-800 hover:text-red-700 text-xs transition-all flex items-center gap-2 cursor-pointer font-medium group active:scale-[0.99]"
              >
                <span className="text-base group-hover:scale-110 transition-transform">{p.emoji}</span>
                <span className="flex-1 truncate">"{p.text}"</span>
                <span className="text-[10px] font-bold text-[#0D6EFD] group-hover:text-red-600 shrink-0">चुनें ›</span>
              </button>
            ))}
          </div>
        </div>

        {/* ── Method 3: Chrome Flag Trick for HTTP ── */}
        <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1 text-[11px] text-slate-600">
          <div className="font-bold text-slate-800 text-[10px] uppercase">
            ⚙️ तरीका 3: Chrome Flag से HTTP पर हमेशा के लिए चालू करें:
          </div>
          <p className="leading-tight">
            Chrome URL में लिखें: <code className="bg-slate-200 px-1 py-0.5 rounded text-[10px] font-mono">chrome://flags/#unsafely-treat-insecure-origin-as-secure</code>
            <br />वहां <code className="bg-slate-200 px-1 py-0.5 rounded text-[10px] font-mono">http://{currentHost}:4000</code> डालकर <strong>Enabled</strong> करें और Relaunch दबाएं।
          </p>
        </div>

      </div>
    </div>
  );
}
