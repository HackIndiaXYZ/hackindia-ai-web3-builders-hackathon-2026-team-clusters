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

  // Function to explicitly request and watch GPS location in real time
  const requestLocation = useCallback(() => {
    // Generate slight random offset around base emergency sector so multiple devices don't perfectly overlap
    const fallbackLat = 28.6139 + (Math.random() - 0.5) * 0.008;
    const fallbackLng = 77.2090 + (Math.random() - 0.5) * 0.008;

    if (typeof navigator === 'undefined' || !navigator.geolocation) {
      setUserLocation({
        latitude: fallbackLat,
        longitude: fallbackLng,
        accuracy: 12,
        isGpsAcquired: true,
        x: 48,
        y: 58
      });
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
    };

    // 1. First attempt: High accuracy GPS with reasonable 10s timeout
    navigator.geolocation.getCurrentPosition(
      onGpsSuccess,
      (err) => {
        console.log('High accuracy GPS timed out/fallback, trying network/wifi positioning...', err.message);
        // 2. Second attempt: Low accuracy cellular/wifi (fast & works indoors)
        navigator.geolocation.getCurrentPosition(
          onGpsSuccess,
          (err2) => {
            console.log('GPS browser policy fallback (HTTP/denied):', err2.message);
            setUserLocation((prev) => ({
              latitude: prev.latitude || fallbackLat,
              longitude: prev.longitude || fallbackLng,
              accuracy: 25,
              isGpsAcquired: prev.isGpsAcquired || false,
              x: 48,
              y: 58
            }));
            setLocationStatus((prev) => (prev === 'acquired' ? 'acquired' : 'prompting'));
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

      // Check if there is an active SOS that hasn't been dismissed
      const newestActive = active[0];
      const sosId = newestActive.id;
      const alertKey = `${sosId}_${newestActive.timestamp || ''}`;

      const isDismissed = dismissedIdsRef.current.has(sosId) || dismissedIdsRef.current.has(alertKey);
      const isMuted = isMutedByUserRef.current || mutedSosIdsRef.current.has(sosId) || mutedSosIdsRef.current.has(alertKey);

      // Detect if this is a newly arrived SOS or currently unhandled SOS
      if (!isDismissed) {
        setIncomingSos(newestActive);
        setIsAlertModalOpen(true);

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
        const proto = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
        const wsUrl = `${proto}//${window.location.hostname}:${window.location.port || '4000'}`;
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
              const alertKey = `${sosId}_${entry.timestamp || ''}`;

              const isDismissed = dismissedIdsRef.current.has(sosId) || dismissedIdsRef.current.has(alertKey);
              const isMuted = isMutedByUserRef.current || mutedSosIdsRef.current.has(sosId) || mutedSosIdsRef.current.has(alertKey);

              if (!isDismissed) {
                setIncomingSos(entry);
                setIsAlertModalOpen(true);
                if (!isSirenSoundingRef.current && !isMuted) {
                  emergencyAudio.startSiren();
                  setIsSirenSounding(true);
                  if (typeof navigator !== 'undefined' && navigator.vibrate) {
                    try { navigator.vibrate([250, 100, 250, 100, 250, 200, 500, 150, 500, 150, 500, 200, 250, 100, 250]); } catch (ve) {}
                  }
                }
              }
              checkSosStatus();
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
    if (targetId) mutedSosIdsRef.current.add(targetId);
    if (incomingSos?.id) mutedSosIdsRef.current.add(incomingSos.id);

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

  const dismissAlert = useCallback((id, timestamp) => {
    if (id) {
      dismissedIdsRef.current.add(id);
      mutedSosIdsRef.current.add(id);
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
    dismissAlert,
    resolveSos,
    userLocation,
    locationStatus,
    requestLocation,
    refreshSos: checkSosStatus
  };
}

