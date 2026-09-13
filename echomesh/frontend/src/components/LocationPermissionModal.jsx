import React, { useState, useEffect } from 'react';

export default function LocationPermissionModal({
  isGpsAcquired,
  userLocation,
  onRequestGps,
  lang = 'en'
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const isHi = lang === 'hi';

  // Check if GPS was previously granted or explicitly dismissed in this session
  useEffect(() => {
    const dismissed = sessionStorage.getItem('echomesh_gps_dismissed');
    if (!isGpsAcquired && !dismissed) {
      // Small timeout so it smoothly appears right after the UI loads
      const timer = setTimeout(() => setIsOpen(true), 800);
      return () => clearTimeout(timer);
    } else if (isGpsAcquired) {
      setIsOpen(false);
    }
  }, [isGpsAcquired]);

  const handleAllow = () => {
    if (onRequestGps) {
      onRequestGps();
    }
    setIsOpen(false);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 4000);
  };

  const handleDismiss = () => {
    sessionStorage.setItem('echomesh_gps_dismissed', 'true');
    setIsOpen(false);
  };

  return (
    <>
      {/* ── LOCATION REQUEST MODAL / DIALOG ── */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 border-2 border-blue-500 relative shadow-2xl overflow-hidden animate-scale-up text-slate-800 space-y-4">
            
            {/* Top Accent Bar */}
            <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-blue-600 via-cyan-400 to-blue-600 animate-pulse" />

            {/* Header Icon */}
            <div className="flex items-center gap-3.5 pt-1">
              <div className="w-12 h-12 rounded-2xl bg-blue-50 border border-blue-200 text-[#0D6EFD] flex items-center justify-center text-2xl flex-shrink-0 shadow-xs">
                📍
              </div>
              <div>
                <h3 className="text-base sm:text-lg font-black text-slate-900 leading-tight">
                  {isHi ? 'GPS स्थान की अनुमति दें' : 'Enable GPS Location Access'}
                </h3>
                <span className="text-[11px] font-bold text-[#0D6EFD] uppercase tracking-wider block">
                  {isHi ? 'टैक्टिकल रडar व रेस्क्यू सहायता' : 'Tactical Radar & Rescue Beacon'}
                </span>
              </div>
            </div>

            {/* Description */}
            <p className="text-xs text-slate-600 leading-relaxed font-medium">
              {isHi
                ? 'EchoMesh को आपका लाइव GPS स्थान चाहिए ताकि आपदा के समय बचाव दल और नजदीकी राहत शिविरों तक आपका सटीक स्थान प्रसारित किया जा सके।'
                : 'EchoMesh needs real-time GPS coordinates to calculate rescue distances, plot your node on the offline tactical radar map, and broadcast accurate distress signals.'}
            </p>

            {/* Feature Checklist */}
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-2xl space-y-1.5 text-xs text-slate-700 font-medium">
              <div className="flex items-center gap-2">
                <span className="text-emerald-600 font-bold">✓</span>
                <span>{isHi ? 'निकटतम राहत शिविरों की सटीक दूरी' : 'Exact distance to emergency relief camps'}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-emerald-600 font-bold">✓</span>
                <span>{isHi ? 'ऑफलाइन रडार मैप पर लाइव पोजीशन' : 'Live position on tactical offline map'}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-emerald-600 font-bold">✓</span>
                <span>{isHi ? '100% ऑन-डिवाइस सुरक्षित (नो क्लाउड ट्रैकिंग)' : '100% on-device & private mesh verified'}</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-2.5 pt-1">
              <button
                type="button"
                onClick={handleDismiss}
                className="flex-1 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold text-xs transition-all cursor-pointer"
              >
                {isHi ? 'बाद में (Skip)' : 'Skip / Later'}
              </button>
              
              <button
                type="button"
                onClick={handleAllow}
                className="flex-2 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 active:scale-95 text-white font-black text-xs shadow-md transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                <span>📍</span>
                <span>{isHi ? 'अनुमति दें (ALLOW GPS)' : 'ALLOW LOCATION ACCESS'}</span>
              </button>
            </div>

          </div>
        </div>
      )}

      {/* ── SUCCESS TOAST WHEN GPS IS ACQUIRED ── */}
      {showToast && (
        <div className="fixed top-5 right-5 z-50 bg-[#E8F5E9] border border-[#198754] text-[#198754] px-4 py-2.5 rounded-2xl shadow-xl flex items-center gap-2 text-xs font-bold animate-scale-up">
          <span className="text-base">📍</span>
          <span>
            {isHi
              ? 'GPS स्थान सक्रिय हो गया है!'
              : `GPS Location Locked (${userLocation?.latitude?.toFixed(4) || '28.61'}°, ${userLocation?.longitude?.toFixed(4) || '77.20'}°)`}
          </span>
        </div>
      )}
    </>
  );
}
