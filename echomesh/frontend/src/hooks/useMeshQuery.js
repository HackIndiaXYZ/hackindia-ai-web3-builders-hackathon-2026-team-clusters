import { useState, useCallback } from 'react';
import { ROUTER_URL } from '../config.js';

export function useMeshQuery() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [phase, setPhase] = useState('idle');
  // phases: idle -> routing -> querying -> synthesizing -> done

  const askMesh = useCallback(async (question) => {
    setLoading(true);
    setError(null);
    setResult(null);

    // Phase 1: visual — query sent to router
    setPhase('routing');
    await delay(600);

    // Phase 2: visual — router broadcasting to devices
    setPhase('querying');
    await delay(400);

    try {
      const res = await fetch(`${ROUTER_URL}/ask`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question })
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || `Request failed (${res.status})`);
      }

      const data = await res.json();

      // Phase 3: visual — synthesis happening
      setPhase('synthesizing');
      await delay(500);

      setResult(data);
      setPhase('done');
    } catch (e) {
      setError(e.message || 'Failed to reach the mesh network.');
      setPhase('idle');
    } finally {
      setLoading(false);
    }
  }, []);

  const reset = useCallback(() => {
    setResult(null);
    setError(null);
    setPhase('idle');
    setLoading(false);
  }, []);

  return { loading, result, error, phase, askMesh, reset };
}

function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}
