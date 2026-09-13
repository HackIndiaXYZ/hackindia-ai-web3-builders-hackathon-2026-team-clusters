import React, { useState, useEffect, useRef, useCallback } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, Circle, useMap } from 'react-leaflet';
import L from 'leaflet';
import { emergencyAudio } from '../utils/emergencyAudio.js';
import { voiceAssistant } from '../utils/voiceAssistant.js';
import { playAudioClip, stopAudioClip, isAmrFormat } from '../utils/universalAudio.js';

// 100% Real Haversine GPS Distance Calculation
function calculateGeoDistance(lat1, lon1, lat2, lon2) {
  if (lat1 == null || lon1 == null || lat2 == null || lon2 == null) {
    return {
      meters: 0,
      formatted: 'Mesh Radio Range (<15m)',
      walkTime: 'Adjacent Room / Proximity',
      bearing: 0,
      bearingText: 'Direct Proximity',
      isExactGps: false,
      gpsDetail: 'GPS pending on one device — Connected via offline mesh'
    };
  }

  const R = 6371e3; // Earth radius in meters
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const meters = Math.round(R * c);

  const y = Math.sin(Δλ) * Math.cos(φ2);
  const x = Math.cos(φ1) * Math.sin(φ2) - Math.sin(φ1) * Math.cos(φ2) * Math.cos(Δλ);
  const θ = Math.atan2(y, x);
  const bearing = Math.round(((θ * 180) / Math.PI + 360) % 360);

  const directions = ['North', 'North-East', 'East', 'South-East', 'South', 'South-West', 'West', 'North-West'];
  const bearingText = directions[Math.round(bearing / 45) % 8];

  let formatted = '';
  let walkTime = '';

  if (meters <= 5) {
    formatted = `~${meters}m (Same Room / Proximity)`;
    walkTime = 'Adjacent Device';
  } else if (meters <= 20) {
    formatted = `${meters}m (Immediate Vicinity)`;
    walkTime = '< 30 sec reach';
  } else if (meters < 1000) {
    formatted = `${meters}m away`;
    const mins = Math.max(1, Math.round(meters / 80));
    walkTime = `~${mins} min walk`;
  } else {
    formatted = `${(meters / 1000).toFixed(2)} km away`;
    const mins = Math.round(meters / 80);
    walkTime = `~${mins} min walk`;
  }

  return {
    meters,
    formatted,
    walkTime,
    bearing,
    bearingText,
    isExactGps: true,
    gpsDetail: `Real-time GPS lock (${lat1.toFixed(4)}°, ${lon1.toFixed(4)}°)`
  };
}

// Custom Leaflet Icons
function createUserIcon() {
  return L.divIcon({
    className: 'leaflet-user-icon',
    html: `<div style="
      font-size: 18px;
      width: 36px;
      height: 36px;
      display: flex;
      align-items: center;
      justify-content: center;
      background: rgba(6,182,212,0.3);
      border: 2px solid #22d3ee;
      border-radius: 50%;
      box-shadow: 0 0 12px #06b6d4;
    ">📍</div>`,
    iconSize: [36, 36],
    iconAnchor: [18, 18],
  });
}

function createSosIcon() {
  return L.divIcon({
    className: 'leaflet-sos-icon',
    html: `<div style="
      font-size: 20px;
      width: 40px;
      height: 40px;
      display: flex;
      align-items: center;
      justify-content: center;
      background: rgba(239,68,68,0.35);
      border: 2.5px solid #ef4444;
      border-radius: 50%;
      box-shadow: 0 0 16px #ef4444;
    " class="animate-pulse">🆘</div>`,
    iconSize: [40, 40],
    iconAnchor: [20, 20],
  });
}

// Helper to auto-fit map view to contain both receiver and victim markers
function FitMapBounds({ userPos, victimPos }) {
  const map = useMap();
  useEffect(() => {
    if (userPos && victimPos) {
      try {
        const bounds = L.latLngBounds([userPos, victimPos]);
        map.fitBounds(bounds, { padding: [40, 40], maxZoom: 16 });
      } catch (e) {}
    }
  }, [map, userPos, victimPos]);
  return null;
}

export default function IncomingSosModal({
  isOpen,
  sos,
  activeSosList = [],
  userLocation,
  isSirenSounding,
  onMute,
  onDismiss,
  onResolve,
  onOpenMap
}) {
  const [selectedSosIndex, setSelectedSosIndex] = useState(0);
  const [isSpeakingVoice, setIsSpeakingVoice] = useState(false);
  const [isPlayingVictimAudio, setIsPlayingVictimAudio] = useState(false);

  const currentSos = (activeSosList && activeSosList.length > 0)
    ? (activeSosList[selectedSosIndex] || activeSosList[0] || sos)
    : sos;

  // Real GPS calculations
  const distanceInfo = calculateGeoDistance(
    userLocation?.latitude,
    userLocation?.longitude,
    currentSos?.latitude,
    currentSos?.longitude
  );

  const isSeismic = currentSos?.emergencyType === 'seismic' ||
    (currentSos?.message && /seismic|earthquake|tremor|shockwave/i.test(currentSos.message));

  const playVictimAudio = useCallback(() => {
    if (!currentSos?.audioData) return;
    stopAudioClip();
    setIsPlayingVictimAudio(true);
    playAudioClip(currentSos.audioData, {
      onStart: () => setIsPlayingVictimAudio(true),
      onEnd: () => setIsPlayingVictimAudio(false),
      onError: (err) => {
        console.warn('Victim audio playback error:', err);
        setIsPlayingVictimAudio(false);
      }
    });
  }, [currentSos?.audioData]);

  const stopVictimAudio = useCallback(() => {
    stopAudioClip();
    setIsPlayingVictimAudio(false);
  }, []);

  // Auto-speak "सावधान!" distress warning aloud when alert arrives, then play victim audio!
  useEffect(() => {
    if (isOpen && currentSos) {
      stopAudioClip();
      setIsPlayingVictimAudio(false);

      const alertSpeech = isSeismic
        ? 'सावधान! सावधान! उच्च तीव्रता का असामान्य भूकंप या झटका दर्ज किया गया है। तुरंत सुरक्षित स्थान पर जाएं।'
        : `सावधान! सावधान! आपातकालीन संदेश प्राप्त हुआ है। ${currentSos.deviceName || 'आपदा पीड़ित'} से संदेश: ${currentSos.message || 'मदद की आवश्यकता है।'}`;

      const timer = setTimeout(() => {
        voiceAssistant.speak(alertSpeech, {
          lang: 'hi-IN',
          rate: 0.95,
          onStart: () => setIsSpeakingVoice(true),
          onEnd: () => {
            setIsSpeakingVoice(false);
            // If the SOS alert includes an attached voice recording, automatically play it!
            if (currentSos?.audioData) {
              setTimeout(() => {
                playVictimAudio();
              }, 400);
            }
          }
        });
      }, 600);

      return () => {
        clearTimeout(timer);
        voiceAssistant.stopSpeaking();
        stopAudioClip();
        setIsSpeakingVoice(false);
        setIsPlayingVictimAudio(false);
      };
    } else {
      stopAudioClip();
      voiceAssistant.stopSpeaking();
      setIsSpeakingVoice(false);
      setIsPlayingVictimAudio(false);
    }
  }, [isOpen, currentSos?.id, currentSos?.audioData, isSeismic, playVictimAudio]);

  const handleDismissWithVoice = () => {
    stopAudioClip();
    voiceAssistant.stopSpeaking();
    setIsSpeakingVoice(false);
    setIsPlayingVictimAudio(false);
    onDismiss(currentSos?.id, currentSos?.timestamp);
  };

  if (!isOpen || !currentSos) return null;

  const totalSosCount = activeSosList.length > 0 ? activeSosList.length : 1;

  // Position coordinates
  const userLat = userLocation?.latitude || 26.9124;
  const userLng = userLocation?.longitude || 75.7873;
  const victimLat = currentSos.latitude || (userLat + 0.0025);
  const victimLng = currentSos.longitude || (userLng + 0.0035);

  const userPos = [userLat, userLng];
  const victimPos = [victimLat, victimLng];
  const mapCenter = [(userLat + victimLat) / 2, (userLng + victimLng) / 2];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      
      <div className={`bg-white rounded-3xl max-w-lg w-full p-5 sm:p-7 border-2 ${isSeismic ? 'border-amber-500 shadow-amber-500/20' : 'border-red-500'} relative shadow-2xl overflow-hidden animate-scale-up`}>
        
        {/* Animated Emergency Top Bar */}
        <div className={`absolute top-0 left-0 right-0 h-2 bg-gradient-to-r ${isSeismic ? 'from-amber-500 via-red-600 to-amber-500' : 'from-red-600 via-amber-500 to-red-600'} animate-pulse`} />

        {/* Close & Silence Button */}
        <button
          onClick={handleDismissWithVoice}
          className="absolute top-3.5 right-3.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-red-50 text-slate-600 hover:text-red-600 border border-slate-200 hover:border-red-300 font-bold text-xs transition-all cursor-pointer flex items-center gap-1 shadow-xs active:scale-95"
          title="Dismiss Alert, Stop Siren & Voice"
        >
          <span>✕</span>
          <span className="hidden sm:inline">सायरन रोकें / Close</span>
        </button>

        {/* Header Badge & Multi-Victim Switcher */}
        <div className="text-center mb-3 pt-1">
          <div className={`inline-flex items-center gap-2 px-3.5 py-1 rounded-full ${isSeismic ? 'bg-amber-50 border border-amber-300 text-amber-800' : 'bg-red-50 border border-red-300 text-[#DC3545]'} text-xs font-bold animate-pulse mb-2`}>
            <span className={`w-2.5 h-2.5 rounded-full ${isSeismic ? 'bg-amber-500' : 'bg-[#DC3545]'} animate-ping inline-block`} />
            <span>{isSeismic ? '⚡ SEISMIC / UNUSUAL ACTIVITY ALERT' : `🚨 INCOMING SOS (${selectedSosIndex + 1} of ${totalSosCount})`}</span>
          </div>

          {totalSosCount > 1 && (
            <div className="flex items-center justify-center gap-2 mb-2">
              <button
                onClick={() => setSelectedSosIndex((prev) => (prev > 0 ? prev - 1 : totalSosCount - 1))}
                className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 border border-slate-200 text-xs text-slate-700 font-bold cursor-pointer"
              >
                ◀ Previous Victim
              </button>
              <span className="text-[11px] font-bold text-slate-500">
                Alert {selectedSosIndex + 1} / {totalSosCount}
              </span>
              <button
                onClick={() => setSelectedSosIndex((prev) => (prev < totalSosCount - 1 ? prev + 1 : 0))}
                className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 border border-slate-200 text-xs text-slate-700 font-bold cursor-pointer"
              >
                Next Victim ▶
              </button>
            </div>
          )}

          <h2 className="text-xl sm:text-2xl font-black text-slate-900 flex items-center justify-center gap-2">
            <span>{isSeismic ? '⚡ Unusual Tremors Detected' : `Disaster Victim: ${currentSos.deviceName}`}</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            {isSeismic ? 'Shockwave / physical tremor detected by connected mesh node.' : 'Emergency distress signal detected in local mesh network.'}
          </p>

          {/* Prominent Emergency Message / Evacuation Box */}
          <div className={`mt-2.5 p-3.5 rounded-2xl ${isSeismic ? 'bg-amber-50 border border-amber-300 text-amber-900' : 'bg-red-50 border border-red-200 text-red-900'} text-xs font-medium text-left shadow-xs`}>
            <div className="font-bold flex items-center justify-between gap-1.5 mb-1.5 pb-1 border-b border-red-200/60">
              <span className="flex items-center gap-1">
                <span>{isSeismic ? '🚨 EVACUATION NOTICE:' : '📢 DISTRESS MESSAGE:'}</span>
              </span>
              <button
                type="button"
                onClick={() => {
                  if (isSpeakingVoice) {
                    voiceAssistant.stopSpeaking();
                    setIsSpeakingVoice(false);
                  } else {
                    const alertSpeech = isSeismic
                      ? 'सावधान! उच्च तीव्रता का असामान्य भूकंप या झटका दर्ज किया गया है। तुरंत सुरक्षित स्थान पर जाएं।'
                      : `सावधान! ${currentSos.deviceName || 'विक्टिम नोड'} से संदेश: ${currentSos.message || 'मदद की आवश्यकता है।'}`;
                    voiceAssistant.speak(alertSpeech, {
                      lang: 'hi-IN',
                      rate: 0.95,
                      onStart: () => setIsSpeakingVoice(true),
                      onEnd: () => setIsSpeakingVoice(false)
                    });
                  }
                }}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-black transition-all flex items-center gap-1.5 cursor-pointer shadow-xs active:scale-95 ${
                  isSpeakingVoice
                    ? 'bg-rose-600 text-white animate-pulse'
                    : 'bg-white border border-slate-300 text-slate-700 hover:text-red-600 hover:bg-slate-50'
                }`}
                title="Hear emergency voice message aloud"
              >
                <span>{isSpeakingVoice ? '⏹️' : '🔊'}</span>
                <span>{isSpeakingVoice ? 'आवाज़ रोकें (Stop Voice)' : 'वॉइस सुनें (Play Voice)'}</span>
              </button>
            </div>
            <p className="leading-relaxed font-semibold text-xs sm:text-sm">
              "{currentSos.message || (isSeismic ? 'Tremors detected in area. Move immediately to open ground!' : 'Emergency! Need urgent assistance.')}"
            </p>
            {isSeismic && (
              <div className="mt-1.5 pt-1.5 border-t border-amber-200 text-[11px] font-bold text-amber-800 flex items-center gap-1">
                <span>🛡️</span>
                <span>Guideline: Drop, Cover & Hold On. Keep clear of walls, glass, & wires.</span>
              </div>
            )}

            {currentSos.audioData && (
              <div className="mt-3 p-3.5 rounded-2xl bg-gradient-to-r from-red-50 to-amber-50 border-2 border-red-400 text-left shadow-md space-y-2.5">
                <div className="flex items-center justify-between text-xs font-black text-red-900">
                  <span className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-red-600 animate-ping" />
                    <span>🎙️ पीड़ित की वास्तविक रिकॉर्ड की गई आवाज़ (Voice Clip):</span>
                  </span>
                  <span className="text-[10px] bg-red-600 text-white px-2 py-0.5 rounded-full font-black tracking-wider">
                    {isPlayingVictimAudio ? 'PLAYING...' : 'VOICE ATTACHED'}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      if (isPlayingVictimAudio) {
                        stopVictimAudio();
                      } else {
                        voiceAssistant.stopSpeaking();
                        setIsSpeakingVoice(false);
                        playVictimAudio();
                      }
                    }}
                    className={`w-full py-2.5 px-4 rounded-xl font-black text-xs sm:text-sm transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md active:scale-95 ${
                      isPlayingVictimAudio
                        ? 'bg-rose-600 hover:bg-rose-700 text-white ring-4 ring-rose-400/40 animate-pulse'
                        : 'bg-[#DC3545] hover:bg-red-700 text-white'
                    }`}
                  >
                    <span className="text-base">{isPlayingVictimAudio ? '⏹️' : '🔊'}</span>
                    <span>
                      {isPlayingVictimAudio ? 'आवाज़ रोकें (Stop Voice Clip)' : '🔊 पीड़ित की आवाज़ सुनें (Play Victim Voice)'}
                    </span>
                  </button>
                </div>

                {!isAmrFormat(currentSos.audioData) && (
                  <audio controls src={currentSos.audioData} className="w-full h-8 rounded" />
                )}
              </div>
            )}
          </div>
        </div>

        {/* Siren Sound Active Banner with Mute Button */}
        {isSirenSounding ? (
          <div className="flex items-center justify-between px-3.5 py-2.5 rounded-2xl bg-red-50 border border-red-300 mb-4 text-xs text-red-700 animate-pulse">
            <div className="flex items-center gap-2">
              <span className="text-xl animate-bounce">🔊</span>
              <div>
                <p className="font-black text-[#DC3545]">Emergency Siren Sounding</p>
                <p className="text-[10px] text-red-600 font-medium">Audible on all nearby mesh devices</p>
              </div>
            </div>
            <button
              onClick={onMute}
              className="px-3.5 py-2 rounded-xl bg-[#DC3545] hover:bg-red-700 text-white font-black text-xs transition-all shadow-md cursor-pointer active:scale-95"
            >
              🔇 MUTE SIREN
            </button>
          </div>
        ) : (
          <div className="flex items-center justify-between px-3.5 py-2 rounded-2xl bg-slate-50 border border-slate-200 mb-4 text-xs text-slate-500">
            <span className="font-bold">🔇 Siren is currently Muted</span>
            <button
              onClick={() => emergencyAudio.startSiren()}
              className="text-[#0D6EFD] hover:underline text-[11px] cursor-pointer font-bold flex items-center gap-1"
            >
              🔊 Play Siren
            </button>
          </div>
        )}

        {/* ═══ REAL OPENSTREETMAP LEAFLET TACTICAL RADAR CANVAS ═══ */}
        <div className="relative h-56 rounded-2xl border border-slate-200 overflow-hidden shadow-inner mb-4 bg-[#07111e]">
          <MapContainer
            center={mapCenter}
            zoom={15}
            style={{
              height: '100%',
              width: '100%',
              backgroundColor: '#07111e',
              backgroundImage: `
                radial-gradient(circle at center, rgba(239, 68, 68, 0.18) 0%, rgba(7, 17, 30, 0.95) 75%),
                linear-gradient(rgba(14, 165, 233, 0.15) 1px, transparent 1px),
                linear-gradient(90deg, rgba(14, 165, 233, 0.15) 1px, transparent 1px)
              `,
              backgroundSize: '100% 100%, 40px 40px, 40px 40px'
            }}
            zoomControl={false}
            attributionControl={false}
          >
            {/* Offline-first: tiles try OSM, fall back to high-tech tactical grid if no internet */}
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              maxZoom={19}
              errorTileUrl="data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7"
            />

            <FitMapBounds userPos={userPos} victimPos={victimPos} />

            {/* Concentric Tactical Sonar Range Rings around Receiver */}
            <Circle
              center={userPos}
              radius={150}
              pathOptions={{ color: '#06b6d4', fillColor: '#06b6d4', fillOpacity: 0.05, weight: 1, dashArray: '4, 4' }}
            />
            <Circle
              center={userPos}
              radius={400}
              pathOptions={{ color: '#3b82f6', fillColor: 'transparent', weight: 1, dashArray: '6, 6' }}
            />

            {/* Connecting Polyline between You and Victim */}
            <Polyline
              positions={[userPos, victimPos]}
              pathOptions={{ color: '#0D6EFD', weight: 3, dashArray: '6, 6' }}
            />

            {/* Pulsing Circle around Victim */}
            <Circle
              center={victimPos}
              radius={80}
              pathOptions={{ color: '#DC3545', fillColor: '#DC3545', fillOpacity: 0.22, weight: 2 }}
            />

            {/* Receiver / You Location Marker */}
            <Marker position={userPos} icon={createUserIcon()}>
              <Popup>
                <div style={{ fontFamily: 'sans-serif', fontSize: '12px', color: '#0f172a' }}>
                  <strong>📍 YOU (Receiver)</strong><br />
                  <span>GPS: {userLat.toFixed(5)}°, {userLng.toFixed(5)}°</span>
                </div>
              </Popup>
            </Marker>

            {/* Victim Location Marker */}
            <Marker position={victimPos} icon={createSosIcon()}>
              <Popup>
                <div style={{ fontFamily: 'sans-serif', fontSize: '12px', color: '#0f172a' }}>
                  <strong style={{ color: '#dc2626' }}>🚨 VICTIM: {currentSos.deviceName}</strong><br />
                  <span>GPS: {victimLat.toFixed(5)}°, {victimLng.toFixed(5)}°</span>
                </div>
              </Popup>
            </Marker>
          </MapContainer>

          {/* Distance Badge Floating Overlay */}
          <div className="absolute bottom-3 left-3 z-[1000] px-3 py-1.5 rounded-xl bg-white/95 border border-blue-200 text-[#0D6EFD] text-xs font-bold shadow-md backdrop-blur-md flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-blue-500 animate-ping" />
            <span>📍 {distanceInfo.formatted}</span>
          </div>
        </div>

        {/* Rescue Details Grid */}
        <div className="grid grid-cols-2 gap-3 mb-5 text-xs">
          <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200">
            <span className="text-[10px] text-slate-500 uppercase tracking-wider font-bold block mb-1">
              VICTIM / SENDER
            </span>
            <div className="flex items-center gap-1.5 font-bold text-slate-900">
              <span>👤 {currentSos.deviceName}</span>
            </div>
            {currentSos.latitude && (
              <span className="text-[10px] text-slate-500 block mt-1 font-mono">
                {currentSos.latitude.toFixed(4)}°, {currentSos.longitude.toFixed(4)}°
              </span>
            )}
          </div>

          <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200">
            <span className="text-[10px] text-slate-500 uppercase tracking-wider font-bold block mb-1">
              DISTANCE & BEARING
            </span>
            <div className="font-bold text-[#0D6EFD]">
              📐 {distanceInfo.bearingText} ({distanceInfo.bearing}°)
            </div>
            <span className="text-[10px] text-[#198754] font-bold block mt-1">
              🏃 {distanceInfo.walkTime}
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            {/* Primary Stop Siren / Dismiss Button */}
            <button
              onClick={() => onDismiss(currentSos.id)}
              className="flex-1 py-3.5 rounded-2xl bg-gradient-to-r from-red-600 to-rose-700 hover:from-red-700 hover:to-rose-800 text-white font-black text-xs shadow-lg transition-all cursor-pointer active:scale-95 flex items-center justify-center gap-2 border border-red-400/30"
            >
              <span className="text-base">🔇</span>
              <span>सायरन बंद करें / STOP ALARM</span>
            </button>

            {onOpenMap && (
              <button
                onClick={() => {
                  onDismiss(currentSos.id);
                  onOpenMap();
                }}
                className="px-4 py-3.5 rounded-2xl bg-blue-50 hover:bg-blue-100 text-[#0D6EFD] font-bold text-xs border border-blue-200 transition-all cursor-pointer flex items-center gap-1.5"
                title="View Tactical Radar Map"
              >
                <span>🗺️</span>
                <span>MAP</span>
              </button>
            )}
          </div>

          <button
            onClick={() => onResolve(currentSos.id)}
            className="w-full py-2.5 rounded-xl bg-slate-100 hover:bg-emerald-50 text-slate-700 hover:text-emerald-700 font-bold text-xs border border-slate-200 hover:border-emerald-300 transition-all cursor-pointer active:scale-95 flex items-center justify-center gap-2"
          >
            <span>✅</span>
            <span>स्थिति सुरक्षित है (Mark as Rescued / Resolved)</span>
          </button>
        </div>

      </div>
    </div>
  );
}
