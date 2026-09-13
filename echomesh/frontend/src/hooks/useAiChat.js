/**
 * useAiChat — React hook for the local Ollama phi3 AI chat via /api/ask
 * Manages query state, loading, response, error, and response time.
 */
import { useState, useCallback } from 'react';
import { ROUTER_URL } from '../config.js';

export function useAiChat() {
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState(null);
  const [error, setError] = useState(null);

  const askAi = useCallback(async (query) => {
    if (!query || !query.trim()) return;

    setLoading(true);
    setError(null);
    setResponse(null);

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 35000); // 35s client-side timeout

      const res = await fetch(`${ROUTER_URL}/api/ask`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: query.trim() }),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || `Request failed (${res.status})`);
      }

      const data = await res.json();
      setResponse(data);
    } catch (e) {
      if (e.name === 'AbortError') {
        setError('Request timed out. The AI model may be loading or the device is under heavy load.');
      } else {
        setError(e.message || 'Failed to reach the AI assistant.');
      }
    } finally {
      setLoading(false);
    }
  }, []);

  const resetAi = useCallback(() => {
    setResponse(null);
    setError(null);
    setLoading(false);
  }, []);

  return { loading, response, error, askAi, resetAi };
}
