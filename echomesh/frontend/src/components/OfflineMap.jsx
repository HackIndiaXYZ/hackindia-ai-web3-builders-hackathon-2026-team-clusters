import React, { useState, useEffect, useRef, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle, Polyline, Polygon, useMap } from 'react-leaflet';
import L from 'leaflet';
import { ROUTER_URL } from '../config.js';

// Fix default Leaflet marker icon (local — no CDN needed)
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});


// ── Custom Emoji Icon Factory ──
function createEmojiIcon(emoji, size = 32, highlight = false) {
  return L.divIcon({
    className: 'leaflet-emoji-icon',
    html: `<div style="
      font-size: ${size * 0.65}px;
      width: ${size}px;
      height: ${size}px;
      display: flex;
      align-items: center;
      justify-content: center;
      background: ${highlight ? 'rgba(6,182,212,0.25)' : 'rgba(15,23,42,0.85)'};
      border: 2px solid ${highlight ? '#22d3ee' : 'rgba(255,255,255,0.15)'};
      border-radius: 12px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.4);
      backdrop-filter: blur(4px);
    ">${emoji}</div>`,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
    popupAnchor: [0, -size / 2 - 4],
  });
}

// SOS pulsing icon
function createSosIcon() {
  return L.divIcon({
    className: 'leaflet-sos-icon',
    html: `<div style="position:relative;width:40px;height:40px;">
      <div style="position:absolute;inset:-8px;border-radius:50%;background:rgba(239,68,68,0.3);animation:ping 1.5s cubic-bezier(0,0,0.2,1) infinite;"></div>
      <div style="width:40px;height:40px;border-radius:50%;background:linear-gradient(135deg,#dc2626,#b91c1c);border:2px solid white;display:flex;align-items:center;justify-content:center;font-size:18px;box-shadow:0 0 20px rgba(239,68,68,0.6);">🆘</div>
    </div>`,
    iconSize: [40, 40],
    iconAnchor: [20, 20],
    popupAnchor: [0, -24],
  });
}

// User location icon (big pulsing blue dot)
function createUserIcon() {
  return L.divIcon({
    className: 'leaflet-user-icon',
    html: `<div style="position:relative;width:24px;height:24px;">
      <div style="position:absolute;inset:-10px;border-radius:50%;background:rgba(34,211,238,0.2);animation:ping 2s cubic-bezier(0,0,0.2,1) infinite;"></div>
      <div style="width:24px;height:24px;border-radius:50%;background:#22d3ee;border:3px solid #0f172a;box-shadow:0 0 15px rgba(34,211,238,0.5);"></div>
    </div>`,
    iconSize: [24, 24],
    iconAnchor: [12, 12],
    popupAnchor: [0, -16],
  });
}

// Device node icon with status
function createDeviceIcon(emoji, isOnline) {
  return L.divIcon({
    className: 'leaflet-device-icon',
    html: `<div style="position:relative;width:36px;height:36px;">
      ${isOnline ? `<div style="position:absolute;top:-3px;right:-3px;width:10px;height:10px;border-radius:50%;background:#22c55e;border:2px solid #0f172a;z-index:10;"></div>` : ''}
      <div style="
        width:36px;height:36px;border-radius:12px;display:flex;align-items:center;justify-content:center;
        font-size:18px;
        background:${isOnline ? 'rgba(8,47,73,0.9)' : 'rgba(69,10,10,0.9)'};
        border:2px solid ${isOnline ? '#06b6d4' : '#ef4444'};
        box-shadow:0 2px 10px ${isOnline ? 'rgba(6,182,212,0.3)' : 'rgba(239,68,68,0.3)'};
      ">${emoji}</div>
    </div>`,
    iconSize: [36, 36],
    iconAnchor: [18, 18],
    popupAnchor: [0, -22],
  });
}

// ── Component to auto-fly to user location ──
function FlyToUser({ center }) {
  const map = useMap();
  useEffect(() => {
    if (center) {
      map.flyTo(center, 15, { duration: 1.5 });
    }
  }, [center, map]);
  return null;
}

// ── Interactive Tactical Leaflet Map Controls (Zoom In, Zoom Out, Recenter) ──
function TacticalMapControls({ userPos, defaultCenter }) {
  const map = useMap();

  return (
    <div className="absolute top-3 right-3 z-[1000] flex flex-col gap-1.5 shadow-lg select-none pointer-events-auto">
      {/* Zoom In Button */}
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          map.zoomIn();
        }}
        className="w-10 h-10 rounded-xl bg-white/95 hover:bg-white text-slate-800 hover:text-[#0D6EFD] border border-slate-200 flex items-center justify-center text-lg font-black shadow-md backdrop-blur-md transition-all hover:scale-105 active:scale-95 cursor-pointer"
        title="Zoom In (+)"
        aria-label="Zoom In"
      >
        ➕
      </button>

      {/* Zoom Out Button */}
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          map.zoomOut();
        }}
        className="w-10 h-10 rounded-xl bg-white/95 hover:bg-white text-slate-800 hover:text-[#0D6EFD] border border-slate-200 flex items-center justify-center text-lg font-black shadow-md backdrop-blur-md transition-all hover:scale-105 active:scale-95 cursor-pointer"
        title="Zoom Out (-)"
        aria-label="Zoom Out"
      >
        ➖
      </button>

      {/* Recenter to My GPS Location */}
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          const target = userPos || defaultCenter;
          if (target) {
            map.flyTo(target, 16, { duration: 1.2 });
          }
        }}
        className="w-10 h-10 rounded-xl bg-white/95 hover:bg-blue-50 text-[#0D6EFD] border border-blue-200 flex items-center justify-center text-base font-bold shadow-md backdrop-blur-md transition-all hover:scale-105 active:scale-95 cursor-pointer"
        title="Center to My GPS Location (📍)"
        aria-label="My Location"
      >
        📍
      </button>

      {/* Reset Zoom / Full View */}
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          map.flyTo(userPos || defaultCenter, 13, { duration: 1.0 });
        }}
        className="w-10 h-10 rounded-xl bg-white/95 hover:bg-slate-100 text-slate-700 border border-slate-200 flex items-center justify-center text-[10px] font-black shadow-md backdrop-blur-md transition-all hover:scale-105 active:scale-95 cursor-pointer"
        title="Reset Map Zoom (1x)"
        aria-label="Reset Zoom"
      >
        1x
      </button>
    </div>
  );
}

// ── Pre-downloaded emergency points (will be placed relative to user GPS) ──
function getEmergencyPoints(userLat, userLng) {
  return [
    {
      id: 'shelter-1', type: 'shelter', name: 'Community Hall Relief Shelter',
      category: 'Relief Camp', icon: '🏠', color: '#38bdf8',
      lat: userLat + 0.012, lng: userLng - 0.005,
      distance: '~1.5 km North', capacity: '450 people (Active)',
      supplies: 'Clean water, food packets, solar mobile charging, blankets',
      instructions: 'Take the cleared North Sector road. Registration desk at main lobby.'
    },
    {
      id: 'shelter-2', type: 'shelter', name: 'Govt High School (High Ground)',
      category: 'Flood Safe Haven', icon: '🏫', color: '#38bdf8',
      lat: userLat + 0.008, lng: userLng + 0.015,
      distance: '~1.8 km Northeast', capacity: '300 people (Active)',
      supplies: 'Water filtration station, terrace emergency helipad, medical kit',
      instructions: 'Follow the uphill eastern path above the designated flood waterline.'
    },
    {
      id: 'shelter-3', type: 'shelter', name: 'District Stadium Tent City',
      category: 'Family Tents', icon: '⛺', color: '#38bdf8',
      lat: userLat - 0.005, lng: userLng - 0.018,
      distance: '~2.0 km West', capacity: '600 people (Active)',
      supplies: 'Family tents, infant nutrition kits, dry toilets, security desk',
      instructions: 'Enter via West Gate 3. Family registration booth is on the left.'
    },
    {
      id: 'medical-1', type: 'medical', name: 'District General Hospital',
      category: 'Emergency Trauma Care', icon: '🏥', color: '#f87171',
      lat: userLat + 0.02, lng: userLng + 0.01,
      distance: '~3.0 km Northeast', capacity: 'Trauma ICU & Surgery',
      supplies: 'Anti-venom, burn dressings, blood bank, fracture orthopedic unit',
      instructions: 'Highway corridor clear for ambulances. Emergency room entrance on north wing.'
    },
    {
      id: 'medical-2', type: 'medical', name: 'Mobile First-Aid Post #12',
      category: 'Field Clinic', icon: '🩹', color: '#f87171',
      lat: userLat + 0.003, lng: userLng + 0.004,
      distance: '~500m North', capacity: 'Triage & Wound Care',
      supplies: 'Bandages, antiseptic, ORS hydration, splints, pain relief',
      instructions: 'Located at the nearest crossroad, under the red military canopy.'
    },
    {
      id: 'water-1', type: 'water', name: 'Emergency Safe Water Point',
      category: 'Hydration & Food', icon: '💧', color: '#34d399',
      lat: userLat + 0.006, lng: userLng + 0.012,
      distance: '~1.5 km East', capacity: 'Continuous Potable Water',
      supplies: '5000L RO unit, chlorine purification tablets, meal packets',
      instructions: 'Bring clean vessels. Ration packets distributed at 08:00 & 18:00.'
    },
    {
      id: 'heli-1', type: 'logistics', name: 'Helipad (LZ Alpha)',
      category: 'Air Evacuation', icon: '🚁', color: '#fbbf24',
      lat: userLat + 0.025, lng: userLng - 0.008,
      distance: '~3.5 km North', capacity: 'NDRF Air-Lift & Airdrop',
      supplies: 'Heavy transport helicopters, rescue boats docking gate',
      instructions: 'Reserved for critical patient airlifts and food airdrop distribution.'
    }
  ];
}

export default function OfflineMap({
  devices = [],
  peers = [],
  bluetoothPeers = [],
  connectedClients = [],
  routerOnline = true,
  nodeInfo = null,
  defaultLayer = 'all',
  onOpenBluetoothModal = null,
  onBack = null,
  onClose = null
}) {
  const [selectedPoint, setSelectedPoint] = useState(null);
  const [filter, setFilter] = useState(defaultLayer);
  const [sosAlerts, setSosAlerts] = useState([]);
  const [lastSync, setLastSync] = useState(new Date().toLocaleTimeString());
  const [userPos, setUserPos] = useState(null);
  const [gpsError, setGpsError] = useState(null);

  // Default center (India) — will be overridden by GPS
  const defaultCenter = [26.9124, 75.7873]; // Jaipur fallback

  // Get user's real GPS location
  useEffect(() => {
    if (!navigator.geolocation) {
      setGpsError('Geolocation not supported');
      return;
    }

    const watchId = navigator.geolocation.watchPosition(
      (pos) => {
        setUserPos([pos.coords.latitude, pos.coords.longitude]);
        setGpsError(null);
      },
      (err) => {
        console.warn('[Map] GPS error:', err.message);
        setGpsError(err.message);
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 5000 }
    );

    return () => navigator.geolocation.clearWatch(watchId);
  }, []);

  // Poll active SOS alerts
  useEffect(() => {
    async function fetchSos() {
      try {
        const res = await fetch(`${ROUTER_URL}/sos-list`);
        if (res.ok) {
          const data = await res.json();
          setSosAlerts(data.active || []);
          setLastSync(new Date().toLocaleTimeString());
        }
      } catch (e) { /* Offline fallback */ }
    }
    fetchSos();
    const timer = setInterval(fetchSos, 5000);
    return () => clearInterval(timer);
  }, []);

  const mapCenter = userPos || defaultCenter;

  // Generate emergency POI markers relative to user position
  const emergencyPoints = useMemo(() => {
    const [lat, lng] = mapCenter;
    return getEmergencyPoints(lat, lng);
  }, [mapCenter[0], mapCenter[1]]);

  // Device positions (spread around user)
  const devicePositions = useMemo(() => {
    const [lat, lng] = mapCenter;
    const offsets = [
      { dlat: -0.004, dlng: -0.008 },
      { dlat: 0.006, dlng: 0.009 },
      { dlat: -0.007, dlng: 0.003 },
    ];
    const specialtyIcons = { medical: '🩺', shelter: '🏠', maps: '🗺️' };

    return devices.map((device, idx) => {
      const off = offsets[idx % offsets.length];
      return {
        ...device,
        lat: lat + off.dlat,
        lng: lng + off.dlng,
        icon: specialtyIcons[device.specialty] || '📡',
      };
    });
  }, [devices, mapCenter[0], mapCenter[1]]);

  const totalNodesCount = devices.length + (peers?.length || 0) + (bluetoothPeers?.length || 0) + (connectedClients?.length || 0);
  const onlineNodesCount = devices.filter(d => d.status === 'online').length + (peers?.filter(p => p.status === 'connected').length || 0) + (bluetoothPeers?.filter(b => b.status === 'connected').length || 0) + (connectedClients?.length || 0);

  const filteredPoints = emergencyPoints.filter(pt => {
    if (filter === 'all') return true;
    if (filter === 'shelter') return pt.type === 'shelter';
    if (filter === 'medical') return pt.type === 'medical';
    if (filter === 'water') return pt.type === 'water';
    return false;
  });

  return (
    <div className="w-full space-y-4">
      {/* Top Controls Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white border border-slate-200 rounded-2xl p-4 shadow-sm text-slate-800">
        <div className="flex items-center gap-3">
          {onBack && (
            <button
              onClick={onBack}
              className="bg-[#0D6EFD] text-white hover:bg-blue-700 text-xs px-3.5 py-1.5 rounded-xl font-bold cursor-pointer flex items-center gap-1.5 transition-all hover:scale-105 active:scale-95 shadow-sm"
              title="Return to AI Mesh Query view"
            >
              <span>⬅️</span>
              <span>Back to AI Mesh</span>
            </button>
          )}

          <div className="flex items-center gap-2">
            <span className="text-xl">🗺️</span>
            <div>
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                Live Tactical Map & Radar
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#E8F5E9] text-[#198754] border border-[#198754]/30">
                  {onlineNodesCount}/{totalNodesCount} Nodes Active
                </span>
              </h3>
              <p className="text-[11px] text-slate-500 font-medium">
                Real OpenStreetMap · GPS: {userPos ? `${userPos[0].toFixed(4)}°, ${userPos[1].toFixed(4)}°` : (gpsError ? '⚠️ ' + gpsError : 'Acquiring...')} · Synced {lastSync}
              </p>
            </div>
          </div>
        </div>

        {/* Filter Badges */}
        <div className="flex flex-wrap items-center gap-1.5 text-xs">
          {[
            { id: 'all', label: 'All Layers' },
            { id: 'mesh', label: `📡 Mesh (${onlineNodesCount}/${totalNodesCount})` },
            { id: 'shelter', label: '🏠 Shelters' },
            { id: 'medical', label: '🏥 Medical' },
            { id: 'sos', label: `🚨 SOS (${sosAlerts.length})` }
          ].map(btn => (
            <button
              key={btn.id}
              onClick={() => setFilter(btn.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all hover:scale-105 active:scale-95 cursor-pointer ${
                filter === btn.id
                  ? 'bg-[#0D6EFD] text-white shadow-xs'
                  : 'bg-slate-100 text-slate-700 border border-slate-200 hover:bg-slate-200'
              }`}
            >
              {btn.label}
            </button>
          ))}

          {onOpenBluetoothModal && (
            <button
              onClick={onOpenBluetoothModal}
              className="px-3 py-1.5 rounded-xl bg-blue-50 hover:bg-blue-100 text-[#0D6EFD] border border-blue-200 text-xs font-bold transition-all hover:scale-105 active:scale-95 cursor-pointer flex items-center gap-1"
            >
              <span>🔵</span> + Link BLE Phone
            </button>
          )}

          {/* ── Prominent Map Close / Dismiss Cross Button ── */}
          {(onClose || onBack) && (
            <button
              type="button"
              onClick={onClose || onBack}
              className="px-3.5 py-1.5 rounded-xl bg-rose-50 hover:bg-red-600 text-red-600 hover:text-white border border-red-200 text-xs font-black transition-all hover:scale-105 active:scale-95 cursor-pointer flex items-center gap-1.5 shadow-xs"
              title="Close Map (मैप बंद करें)"
            >
              <span>✕</span>
              <span>मैप बंद करें / Close</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Map + Detail Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Real Leaflet Map (2 cols) */}
        <div className="lg:col-span-2 relative rounded-2xl overflow-hidden border" style={{ borderColor: 'var(--border-subtle)', height: '520px' }}>
          
          {/* Floating Tactical Zero-Internet Radar HUD Overlay */}
          <div className="absolute top-3 left-3 z-[1000] pointer-events-none flex flex-col gap-1.5 animate-fade-in">
            <div className="px-3.5 py-1.5 rounded-xl bg-[#07111e]/90 border border-[#39D98A]/50 text-white backdrop-blur-md shadow-xl flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#39D98A] animate-ping" />
              <span className="text-xs font-black tracking-wider uppercase text-[#39D98A]">
                TACTICAL MESH RADAR · ZERO-INTERNET FIELD MODE
              </span>
              <span className="text-[10px] text-slate-400 font-mono hidden sm:inline">| Offline P2P Grid</span>
            </div>
            <div className="flex flex-wrap items-center gap-1.5 text-[10px] font-mono text-cyan-300 bg-[#07111e]/85 px-3 py-1 rounded-lg border border-cyan-500/30 w-fit backdrop-blur-sm shadow-md">
              <span className="text-cyan-400 font-bold">🎯 Radar Range Rings:</span>
              <span className="text-cyan-300">200m</span> · 
              <span className="text-blue-300">500m</span> · 
              <span className="text-emerald-300">1.0km</span> · 
              <span className="text-slate-400">2.0km Perimeter</span>
            </div>
          </div>

          <MapContainer
            center={mapCenter}
            zoom={14}
            style={{
              height: '100%',
              width: '100%',
              backgroundColor: '#07111e',
              backgroundImage: `
                radial-gradient(circle at center, rgba(6, 182, 212, 0.16) 0%, rgba(7, 17, 30, 0.95) 75%),
                linear-gradient(rgba(14, 165, 233, 0.14) 1px, transparent 1px),
                linear-gradient(90deg, rgba(14, 165, 233, 0.14) 1px, transparent 1px),
                linear-gradient(rgba(16, 185, 129, 0.06) 1px, transparent 1px),
                linear-gradient(90deg, rgba(16, 185, 129, 0.06) 1px, transparent 1px)
              `,
              backgroundSize: '100% 100%, 80px 80px, 80px 80px, 20px 20px, 20px 20px'
            }}
            zoomControl={false}
            attributionControl={true}
            scrollWheelZoom={true}
            doubleClickZoom={true}
          >
            {/* Interactive Tactile Zoom & Recenter Controls */}
            <TacticalMapControls userPos={userPos} defaultCenter={defaultCenter} />

            {/* Offline-first map: tiles try to load, fall back gracefully to dark tactical grid */}
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              maxZoom={19}
              errorTileUrl="data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7"
            />

            {/* Fly to user when GPS acquired */}
            {userPos && <FlyToUser center={userPos} />}

            {/* Concentric Tactical Sonar Radar Range Rings (Always Visible Offline) */}
            {userPos && (
              <>
                {/* 200m Inner Perimeter Ring */}
                <Circle
                  center={userPos}
                  radius={200}
                  pathOptions={{
                    color: '#06b6d4',
                    fillColor: '#06b6d4',
                    fillOpacity: 0.05,
                    weight: 1.5,
                    dashArray: '6, 6'
                  }}
                />
                {/* 500m Mid Recon Zone Ring */}
                <Circle
                  center={userPos}
                  radius={500}
                  pathOptions={{
                    color: '#3b82f6',
                    fillColor: '#3b82f6',
                    fillOpacity: 0.03,
                    weight: 1.5,
                    dashArray: '8, 8'
                  }}
                />
                {/* 1000m Tactical P2P Hop Ring */}
                <Circle
                  center={userPos}
                  radius={1000}
                  pathOptions={{
                    color: '#10b981',
                    fillColor: '#10b981',
                    fillOpacity: 0.015,
                    weight: 1.5,
                    dashArray: '10, 10'
                  }}
                />
                {/* 2000m Extended Mesh Perimeter */}
                <Circle
                  center={userPos}
                  radius={2000}
                  pathOptions={{
                    color: '#64748b',
                    fillColor: 'transparent',
                    weight: 1,
                    dashArray: '12, 12'
                  }}
                />
              </>
            )}

            {/* Offline High-Ground Safe Zone Polygon */}
            {userPos && (
              <Polygon
                positions={[
                  [userPos[0] + 0.007, userPos[1] + 0.005],
                  [userPos[0] + 0.011, userPos[1] + 0.009],
                  [userPos[0] + 0.009, userPos[1] + 0.013],
                  [userPos[0] + 0.005, userPos[1] + 0.009]
                ]}
                pathOptions={{
                  color: '#10b981',
                  fillColor: '#10b981',
                  fillOpacity: 0.12,
                  weight: 2,
                  dashArray: '4, 4'
                }}
              >
                <Popup>
                  <div style={{ fontFamily: 'Inter, sans-serif', fontSize: '12px' }}>
                    <strong style={{ color: '#10b981' }}>🛡️ High Ground Safe Zone</strong><br />
                    <span>Designated Evacuation & Shelter Perimeter</span>
                  </div>
                </Popup>
              </Polygon>
            )}

            {/* Offline River Flood Threat Basin Polygon */}
            {userPos && (
              <Polygon
                positions={[
                  [userPos[0] - 0.004, userPos[1] - 0.012],
                  [userPos[0] - 0.002, userPos[1] - 0.006],
                  [userPos[0] - 0.008, userPos[1] - 0.004],
                  [userPos[0] - 0.011, userPos[1] - 0.010]
                ]}
                pathOptions={{
                  color: '#ef4444',
                  fillColor: '#ef4444',
                  fillOpacity: 0.10,
                  weight: 1.5,
                  dashArray: '6, 4'
                }}
              >
                <Popup>
                  <div style={{ fontFamily: 'Inter, sans-serif', fontSize: '12px' }}>
                    <strong style={{ color: '#ef4444' }}>⚠️ Flood Hazard Sector</strong><br />
                    <span>Low-lying river basin — Inundation risk</span>
                  </div>
                </Popup>
              </Polygon>
            )}

            {/* User location marker */}
            {userPos && (
              <Marker position={userPos} icon={createUserIcon()}>
                <Popup>
                  <div style={{ fontFamily: 'Inter, sans-serif', fontSize: '12px', color: '#1e293b', minWidth: '180px' }}>
                    <strong style={{ fontSize: '14px' }}>📍 Your Location (Master Node)</strong><br />
                    <span style={{ fontFamily: 'monospace', fontSize: '11px' }}>
                      {userPos[0].toFixed(6)}°, {userPos[1].toFixed(6)}°
                    </span><br />
                    <em style={{ color: '#06b6d4', fontWeight: 600 }}>P2P Mesh Beacon Active</em>
                  </div>
                </Popup>
              </Marker>
            )}

            {/* Emergency POI markers */}
            {(filter === 'all' || filter === 'shelter' || filter === 'medical' || filter === 'water') && filteredPoints.map(pt => (
              <Marker
                key={pt.id}
                position={[pt.lat, pt.lng]}
                icon={createEmojiIcon(pt.icon, 34, selectedPoint?.id === pt.id)}
                eventHandlers={{ click: () => setSelectedPoint(pt) }}
              >
                <Popup>
                  <div style={{ fontFamily: 'Inter, sans-serif', fontSize: '12px', color: '#1e293b', minWidth: '200px' }}>
                    <strong style={{ fontSize: '14px' }}>{pt.icon} {pt.name}</strong><br />
                    <span style={{ color: '#0e7490', fontWeight: 600, fontSize: '11px' }}>{pt.category}</span><br />
                    <span>{pt.distance} · {pt.capacity}</span><br />
                    <em style={{ color: '#64748b', fontSize: '11px' }}>{pt.supplies}</em>
                  </div>
                </Popup>
              </Marker>
            ))}

            {/* Mesh device nodes on real map */}
            {(filter === 'all' || filter === 'mesh') && devicePositions.map((device, idx) => {
              const isOnline = device.status === 'online';
              return (
                <React.Fragment key={`device-${device.name || idx}`}>
                  <Marker
                    position={[device.lat, device.lng]}
                    icon={createDeviceIcon(device.icon, isOnline)}
                    eventHandlers={{
                      click: () => setSelectedPoint({
                        id: `node-${device.name}`,
                        type: 'mesh-node',
                        name: `${device.name} (${device.specialty?.toUpperCase()})`,
                        category: isOnline ? '🟢 Connected Mesh Node' : '🔴 Node Offline',
                        icon: device.icon,
                        color: isOnline ? '#06b6d4' : '#ef4444',
                        distance: 'Local WiFi Mesh Link',
                        capacity: isOnline ? 'Online & Queryable' : 'Unreachable',
                        supplies: `Specialty: ${device.specialty}. Local RAG facts index loaded.`,
                        instructions: isOnline
                          ? `Node is communicating over local HTTP/WebSocket. Queries for ${device.specialty} are automatically routed here.`
                          : `⚠️ Node is offline. Restart with "node device.js <port> knowledge_${device.specialty}.json".`
                      })
                    }}
                  >
                    <Popup>
                      <div style={{ fontFamily: 'Inter, sans-serif', fontSize: '12px', color: '#1e293b' }}>
                        <strong>{device.icon} {device.name}</strong><br />
                        <span style={{ color: isOnline ? '#16a34a' : '#dc2626' }}>
                          {isOnline ? '● Online' : '● Offline'}
                        </span> · {device.specialty}
                      </div>
                    </Popup>
                  </Marker>

                  {/* Mesh connection line from user to device */}
                  {userPos && (
                    <Polyline
                      positions={[userPos, [device.lat, device.lng]]}
                      pathOptions={{
                        color: isOnline ? '#06b6d4' : '#ef4444',
                        weight: isOnline ? 2 : 1,
                        opacity: isOnline ? 0.7 : 0.3,
                        dashArray: '8,6'
                      }}
                    />
                  )}
                </React.Fragment>
              );
            })}

            {/* SOS alerts on real map */}
            {sosAlerts.map((sos, idx) => {
              const sosLat = sos.latitude || (mapCenter[0] + 0.003 * (idx + 1));
              const sosLng = sos.longitude || (mapCenter[1] - 0.004 * (idx + 1));

              return (
                <React.Fragment key={`sos-${sos.id}`}>
                  <Marker
                    position={[sosLat, sosLng]}
                    icon={createSosIcon()}
                    eventHandlers={{
                      click: () => setSelectedPoint({
                        id: `sos-${sos.id}`,
                        type: 'sos',
                        name: `🚨 SOS: ${sos.deviceName}`,
                        category: 'Active Emergency Beacon',
                        icon: '🚨',
                        color: '#ef4444',
                        distance: sos.latitude ? `GPS: ${sos.latitude.toFixed(5)}, ${sos.longitude.toFixed(5)}` : 'Approximate location',
                        capacity: 'CRITICAL RESCUE NEEDED',
                        supplies: sos.message || 'Need urgent assistance',
                        instructions: `Activated at ${sos.timestamp}. Head towards the emergency signal.`
                      })
                    }}
                  >
                    <Popup>
                      <div style={{ fontFamily: 'Inter, sans-serif', fontSize: '12px', color: '#dc2626', fontWeight: 'bold', minWidth: '180px' }}>
                        🚨 SOS: {sos.deviceName}<br />
                        <span style={{ fontWeight: 'normal', color: '#1e293b' }}>{sos.message || 'Emergency!'}</span><br />
                        <em style={{ fontSize: '10px', color: '#64748b' }}>{sos.timestamp}</em>
                      </div>
                    </Popup>
                  </Marker>

                  {/* SOS danger radius */}
                  <Circle
                    center={[sosLat, sosLng]}
                    radius={300}
                    pathOptions={{
                      color: '#ef4444',
                      fillColor: '#ef4444',
                      fillOpacity: 0.08,
                      weight: 1.5,
                      dashArray: '6,4'
                    }}
                  />

                  {/* Rescue line from user to SOS */}
                  {userPos && (
                    <Polyline
                      positions={[userPos, [sosLat, sosLng]]}
                      pathOptions={{
                        color: '#ef4444',
                        weight: 2.5,
                        opacity: 0.8,
                        dashArray: '8,6'
                      }}
                    />
                  )}
                </React.Fragment>
              );
            })}
          </MapContainer>

          {/* Map Legend Overlay */}
          <div className="absolute bottom-3 left-3 right-3 z-[1000] flex flex-wrap items-center justify-between gap-2 px-3.5 py-2 rounded-xl bg-white/95 border border-slate-200 shadow-md backdrop-blur-md">
            <div className="flex items-center gap-3 text-[11px] font-medium text-slate-700">
              <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-[#0D6EFD] inline-block" /> You</span>
              <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-[#198754] inline-block" /> Online Node</span>
              <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-[#DC3545] inline-block" /> SOS / Offline</span>
              <span className="flex items-center gap-1">🏠 Shelter</span>
              <span className="flex items-center gap-1">🏥 Medical</span>
              <span className="flex items-center gap-1">💧 Water</span>
            </div>
            <span className="text-[#0D6EFD] text-[10px] font-bold">OpenStreetMap · Live GPS</span>
          </div>
        </div>

        {/* Selected POI Details Panel (1 col) */}
        <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 flex flex-col justify-between shadow-sm">
          {selectedPoint ? (
            <div className="space-y-4">
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2.5">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center text-xl"
                    style={{ backgroundColor: `${selectedPoint.color}15`, border: `1px solid ${selectedPoint.color}40` }}
                  >
                    {selectedPoint.icon}
                  </div>
                  <div>
                    <h4 className="text-sm sm:text-base font-bold text-slate-900 leading-tight">
                      {selectedPoint.name}
                    </h4>
                    <span className="text-[11px] font-bold text-[#0D6EFD]">
                      {selectedPoint.category}
                    </span>
                  </div>
                </div>
              </div>

              {/* Metrics */}
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="text-[10px] text-slate-500 uppercase font-bold block">Distance</span>
                  <span className="text-slate-900 font-bold">{selectedPoint.distance}</span>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="text-[10px] text-slate-500 uppercase font-bold block">Status</span>
                  <span className="text-[#198754] font-bold">{selectedPoint.capacity}</span>
                </div>
              </div>

              {/* Details */}
              <div className="space-y-2.5 text-xs">
                <div>
                  <span className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Supplies / Info</span>
                  <p className="text-slate-700 leading-relaxed font-medium">{selectedPoint.supplies}</p>
                </div>
                <div className="p-3 rounded-xl bg-blue-50/70 border border-blue-200">
                  <span className="text-[10px] font-bold text-[#0D6EFD] uppercase block mb-1">Navigation Guidance</span>
                  <p className="text-xs text-slate-800 leading-relaxed font-medium">{selectedPoint.instructions}</p>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-10 text-slate-500 text-xs">
              <p className="text-3xl mb-2">📍</p>
              <p className="font-bold text-slate-700 text-sm">Tap any marker on the map to view details.</p>
              <p className="mt-1 text-slate-400">Your real location is shown as a blue dot with pulsing radar.</p>
            </div>
          )}

          {/* Status footer */}
          <div className="mt-4 pt-3 border-t border-slate-100 text-[11px] font-bold text-slate-500 flex items-center justify-between">
            <span>📦 {onlineNodesCount}/{totalNodesCount} Nodes Linked</span>
            <span className={onlineNodesCount > 0 ? "text-[#198754]" : "text-[#DC3545]"}>
              {onlineNodesCount > 0 ? '● Mesh Active' : '● Mesh Down'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
