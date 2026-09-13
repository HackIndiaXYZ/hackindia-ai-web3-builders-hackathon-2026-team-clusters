import { useState, useEffect, useRef, useCallback } from 'react';
import { ROUTER_URL } from '../config.js';
import { emergencyAudio } from '../utils/emergencyAudio.js';

export function useIncomingSos() {
  const [activeSosList, setActiveSosList] = useState([]);
  const [incomingSos, setIncomingSos] = useState(null);
  const [isAlertModalOpen, setIsAlertModalOpen] = useState(false);
  const [isSirenSounding, setIsSirenSounding] = useState(false);
  const [locationStatus, setLocationStatus] = useState('prompting'); // 'prompting' | 'acquired' | 'denied'
  const [userLocation, setUserLocation] = useState({
    latitude: null,
    longitude: null,
    accuracy: null,
    isGpsAcquired: false,
    x: 48, // default % on vector map
    y: 58
  });

  // Track muted or dismissed SOS IDs so we don't spam after user closes
  const dismissedIdsRef = useRef(new Set());
  const mutedSosIdsRef = useRef(new Set());
  const isMutedByUserRef = useRef(false);
  const knownActiveIdsRef = useRef(new Set());
  const watchIdRef = useRef(null);

  // Initial sync with mesh router anchor location (Greater Noida / NCR real anchor)
  useEffect(() => {
    async function syncMeshLocation() {
      try {
        const res = await fetch(`${ROUTER_URL}/api/location`);
        if (res.ok) {
          const data = await res.json();
          if (data?.location?.latitude && data?.location?.longitude) {
            setUserLocation(prev => ({
              ...prev,
              latitude: data.location.latitude,
              longitude: data.location.longitude,
              city: data.location.city,
              isGpsAcquired: true
            }));
            setLocationStatus('acquired');
          }
        }
      } catch (e) {}
    }
    syncMeshLocation();
  }, []);

  // Function to explicitly request and watch GPS location in real time
  const requestLocation = useCallback(() => {
    const fallbackLat = 28.4927 + (Math.random() - 0.5) * 0.005;
    const fallbackLng = 77.5358 + (Math.random() - 0.5) * 0.005;

    if (typeof navigator === 'undefined' || !navigator.geolocation) {
      setUserLocation(prev => ({
        latitude: prev.latitude || fallbackLat,
        longitude: prev.longitude || fallbackLng,
        accuracy: 15,
        isGpsAcquired: true,
        x: 48,
        y: 58
      }));
      setLocationStatus('acquired');
      return;
    }

    const onGpsSuccess = (pos) => {
      setUserLocation({
        latitude: pos.coords.latitude,
        longitude: pos.coords.longitude,
        accuracy: Math.round(pos.coords.accuracy || 5),
        isGpsAcquired: true,
        x: 48,
        y: 58
      });
      setLocationStatus('acquired');

      if (typeof window !== 'undefined') {
        window.__echomesh_last_coords = {
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
          accuracy: pos.coords.accuracy || 10
        };
      }

      // Sync high-precision GPS across mesh so laptop & peers anchor accurately
      try {
        fetch(`${ROUTER_URL}/api/location`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            latitude: pos.coords.latitude,
            longitude: pos.coords.longitude,
            accuracy: Math.round(pos.coords.accuracy || 5),
            source: 'device_gps'
          })
        }).catch(() => {});
      } catch (e) {}
    };

    // 1. First attempt: High accuracy GPS with reasonable 10s timeout
    navigator.geolocation.getCurrentPosition(
      onGpsSuccess,
      (err) => {
        console.log('High accuracy GPS timed out/fallback, trying network positioning...', err.message);
        // 2. Second attempt: Low accuracy cellular/wifi (fast & works indoors)
        navigator.geolocation.getCurrentPosition(
          onGpsSuccess,
          (err2) => {
            console.log('GPS browser policy fallback (HTTP/denied):', err2.message);
            setUserLocation((prev) => ({
              latitude: prev.latitude || fallbackLat,
              longitude: prev.longitude || fallbackLng,
              accuracy: 25,
              isGpsAcquired: prev.isGpsAcquired || true,
              x: 48,
              y: 58
            }));
            setLocationStatus('acquired');
          },
          { enableHighAccuracy: false, timeout: 8000, maximumAge: 120000 }
        );
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
    );

    // Continuous live watch if available to keep tracking accurate
    if (watchIdRef.current == null && navigator.geolocation) {
      try {
        watchIdRef.current = navigator.geolocation.watchPosition(
          (pos) => {
            setUserLocation({
              latitude: pos.coords.latitude,
              longitude: pos.coords.longitude,
              accuracy: Math.round(pos.coords.accuracy || 5),
              isGpsAcquired: true,
              x: 48,
              y: 58
            });
            setLocationStatus('acquired');
          },
          (wErr) => {
            console.log('watchPosition notice:', wErr.message);
          },
          { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 }
        );
      } catch (e) {}
    }
  }, []);

  // 1. Immediately request GPS on startup
  useEffect(() => {
    requestLocation();
    return () => {
      if (watchIdRef.current != null && typeof navigator !== 'undefined' && navigator.geolocation) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
    };
  }, [requestLocation]);

  const isSirenSoundingRef = useRef(false);
  useEffect(() => {
    isSirenSoundingRef.current = isSirenSounding;
  }, [isSirenSounding]);

  // 2. Poll router for active SOS alerts in the mesh
  const checkSosStatus = useCallback(async () => {
    try {
      const res = await fetch(`${ROUTER_URL}/sos-list`, { signal: AbortSignal.timeout(3000) });
      if (!res.ok) return;
      const data = await res.json();
      const active = data.active || [];
      setActiveSosList(active);

      if (active.length === 0) {
        // If all resolved, stop siren and reset mute memory
        mutedSosIdsRef.current.clear();
        isMutedByUserRef.current = false;
        emergencyAudio.unmute();
        if (isSirenSoundingRef.current) {
          emergencyAudio.stopSiren();
          setIsSirenSounding(false);
        }
        return;
      }

      // Find any active SOS that hasn't been dismissed by the user
      const unhandledActive = active.find(s => 
        !dismissedIdsRef.current.has(s.id) && 
        !dismissedIdsRef.current.has(String(s.id)) && 
        !dismissedIdsRef.current.has(Number(s.id)) &&
        !dismissedIdsRef.current.has(`${s.id}_${s.timestamp || ''}`)
      );

      // Detect if this is a newly arrived SOS or currently unhandled SOS
      if (unhandledActive) {
        setIncomingSos(unhandledActive);
        setIsAlertModalOpen(true);

        const sosId = unhandledActive.id;
        const alertKey = `${sosId}_${unhandledActive.timestamp || ''}`;
        const isMuted = isMutedByUserRef.current || 
                        mutedSosIdsRef.current.has(sosId) || 
                        mutedSosIdsRef.current.has(String(sosId)) || 
                        mutedSosIdsRef.current.has(alertKey);

        // Sound the emergency alarm siren only if user hasn't explicitly muted!
        if (!isSirenSoundingRef.current && !isMuted) {
          emergencyAudio.startSiren();
          setIsSirenSounding(true);

          // Physical phone vibration (SOS Pattern: short-short-short, long-long-long, short-short-short)
          if (typeof navigator !== 'undefined' && navigator.vibrate) {
            try {
              navigator.vibrate([250, 100, 250, 100, 250, 200, 500, 150, 500, 150, 500, 200, 250, 100, 250]);
            } catch (ve) {}
          }
        }
      }

      knownActiveIdsRef.current = new Set(active.map(s => s.id));
    } catch (e) {
      // Mesh offline / silent failover
    }
  }, []);

  useEffect(() => {
    checkSosStatus();
    const interval = setInterval(checkSosStatus, 2000);

    // Instantaneous WebSocket mesh listener for zero-delay alerts
    let ws = null;
    let reconnectTimeout = null;
    let isMounted = true;

    function connectWs() {
      try {
        if (!isMounted) return;
        // Connect to router WebSocket using ROUTER_URL protocol & host
        const wsUrl = ROUTER_URL.replace(/^http/, 'ws');
        ws = new WebSocket(wsUrl);

        ws.onopen = () => {
          try { ws.send(JSON.stringify({ type: 'CLIENT_LISTEN' })); } catch (e) {}
        };

        ws.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            if (data.type === 'SOS_BROADCAST' && data.entry) {
              const entry = data.entry;
              const sosId = entry.id;

              // Clear dismissal for this ID because a live broadcast just arrived
              dismissedIdsRef.current.delete(sosId);
              dismissedIdsRef.current.delete(String(sosId));
              dismissedIdsRef.current.delete(Number(sosId));
              if (entry.timestamp) {
                dismissedIdsRef.current.delete(`${sosId}_${entry.timestamp}`);
              }

              // Instantly update incoming SOS and open modal
              setIncomingSos(entry);
              setIsAlertModalOpen(true);

              const alertKey = `${sosId}_${entry.timestamp || ''}`;
              const isMuted = isMutedByUserRef.current || 
                              mutedSosIdsRef.current.has(sosId) || 
                              mutedSosIdsRef.current.has(String(sosId)) || 
                              mutedSosIdsRef.current.has(alertKey);

              if (!isSirenSoundingRef.current && !isMuted) {
                emergencyAudio.startSiren();
                setIsSirenSounding(true);
                if (typeof navigator !== 'undefined' && navigator.vibrate) {
                  try { navigator.vibrate([250, 100, 250, 100, 250, 200, 500, 150, 500, 150, 500, 200, 250, 100, 250]); } catch (ve) {}
                }
              }
              checkSosStatus();
            }

            if (data.type === 'MESH_LOCATION_UPDATED' && data.location) {
              setUserLocation(prev => ({
                ...prev,
                latitude: data.location.latitude,
                longitude: data.location.longitude,
                accuracy: data.location.accuracy || 15,
                city: data.location.city || prev.city,
                isGpsAcquired: true
              }));
              setLocationStatus('acquired');
            }
          } catch (err) {}
        };

        ws.onclose = () => {
          if (isMounted) reconnectTimeout = setTimeout(connectWs, 3000);
        };
        ws.onerror = () => {
          try { ws.close(); } catch (e) {}
        };
      } catch (err) {}
    }

    connectWs();

    return () => {
      isMounted = false;
      clearInterval(interval);
      if (reconnectTimeout) clearTimeout(reconnectTimeout);
      if (ws) {
        try { ws.close(); } catch (e) {}
      }
    };
  }, [checkSosStatus]);

  // Bulletproof siren mute: stops audio engine, registers muted ID, cancels vibration
  const muteSiren = useCallback((targetId) => {
    emergencyAudio.mute();
    setIsSirenSounding(false);
    isSirenSoundingRef.current = false;
    isMutedByUserRef.current = true;
    if (targetId) {
      mutedSosIdsRef.current.add(targetId);
      mutedSosIdsRef.current.add(String(targetId));
      mutedSosIdsRef.current.add(Number(targetId));
    }
    if (incomingSos?.id) {
      mutedSosIdsRef.current.add(incomingSos.id);
      mutedSosIdsRef.current.add(String(incomingSos.id));
      mutedSosIdsRef.current.add(Number(incomingSos.id));
    }

    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      try { navigator.vibrate(0); } catch (e) {}
    }
  }, [incomingSos?.id]);

  // Manual unmute if user wants to play siren again
  const unmuteSiren = useCallback(() => {
    isMutedByUserRef.current = false;
    mutedSosIdsRef.current.clear();
    emergencyAudio.unmute();
    emergencyAudio.startSiren(true);
    setIsSirenSounding(true);
  }, []);

  const openSosAlert = useCallback((sosItem) => {
    if (!sosItem) return;
    dismissedIdsRef.current.delete(sosItem.id);
    dismissedIdsRef.current.delete(String(sosItem.id));
    dismissedIdsRef.current.delete(Number(sosItem.id));
    if (sosItem.timestamp) {
      dismissedIdsRef.current.delete(`${sosItem.id}_${sosItem.timestamp}`);
    }
    setIncomingSos(sosItem);
    setIsAlertModalOpen(true);
  }, []);

  const dismissAlert = useCallback((id, timestamp) => {
    if (id) {
      dismissedIdsRef.current.add(id);
      dismissedIdsRef.current.add(String(id));
      dismissedIdsRef.current.add(Number(id));
      mutedSosIdsRef.current.add(id);
      mutedSosIdsRef.current.add(String(id));
      mutedSosIdsRef.current.add(Number(id));
      if (timestamp) {
        dismissedIdsRef.current.add(`${id}_${timestamp}`);
        mutedSosIdsRef.current.add(`${id}_${timestamp}`);
      }
    }
    emergencyAudio.stopSiren();
    emergencyAudio.mute();
    setIsSirenSounding(false);
    isSirenSoundingRef.current = false;
    setIsAlertModalOpen(false);
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      try { navigator.vibrate(0); } catch (e) {}
    }
  }, []);

  const resolveSos = useCallback(async (id) => {
    try {
      emergencyAudio.stopSiren();
      emergencyAudio.mute();
      setIsSirenSounding(false);
      isSirenSoundingRef.current = false;
      if (typeof navigator !== 'undefined' && navigator.vibrate) {
        try { navigator.vibrate(0); } catch (e) {}
      }
      await fetch(`${ROUTER_URL}/sos-resolve/${id}`, { method: 'POST' });
      dismissAlert(id);
      checkSosStatus();
    } catch (e) {
      console.error('Failed to resolve SOS:', e);
    }
  }, [dismissAlert, checkSosStatus]);

  return {
    activeSosList,
    incomingSos,
    isAlertModalOpen,
    setIsAlertModalOpen,
    isSirenSounding,
    muteSiren,
    unmuteSiren,
    openSosAlert,
    dismissAlert,
    resolveSos,
    userLocation,
    locationStatus,
    requestLocation,
    refreshSos: checkSosStatus
  };
}

