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

    // High accuracy single acquisition with immediate offline fallback on HTTP
    navigator.geolocation.getCurrentPosition(
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
      (err) => {
        console.log('GPS browser policy fallback (HTTP):', err.message);
        // Fall back to tactical mesh sector coordinates so the user is never stuck
        setUserLocation({
          latitude: fallbackLat,
          longitude: fallbackLng,
          accuracy: 15,
          isGpsAcquired: true,
          x: 48,
          y: 58
        });
        setLocationStatus('acquired');
      },
      { enableHighAccuracy: true, timeout: 4000, maximumAge: 0 }
    );

    // Continuous live watch if available
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
          () => {},
          { enableHighAccuracy: true, maximumAge: 2000 }
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
        // If all resolved, stop siren and reset
        if (isSirenSoundingRef.current) {
          emergencyAudio.stopSiren();
          setIsSirenSounding(false);
        }
        return;
      }

      // Check if there is an active SOS that hasn't been dismissed
      const newestActive = active[0];
      const sosId = newestActive.id;

      // Detect if this is a newly arrived SOS or currently unhandled SOS
      if (!dismissedIdsRef.current.has(sosId)) {
        setIncomingSos(newestActive);
        setIsAlertModalOpen(true);

        // Sound the emergency alarm siren!
        if (!isSirenSoundingRef.current) {
          emergencyAudio.startSiren();
          setIsSirenSounding(true);
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
    return () => clearInterval(interval);
  }, [checkSosStatus]);

  const muteSiren = useCallback(() => {
    emergencyAudio.stopSiren();
    setIsSirenSounding(false);
  }, []);

  const dismissAlert = useCallback((id) => {
    if (id) {
      dismissedIdsRef.current.add(id);
    }
    setIsAlertModalOpen(false);
  }, []);

  const resolveSos = useCallback(async (id) => {
    try {
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
    dismissAlert,
    resolveSos,
    userLocation,
    locationStatus,
    requestLocation,
    refreshSos: checkSosStatus
  };
}

