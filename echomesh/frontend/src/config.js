// Dynamically detect the host at runtime so mobile phones and mesh peers
// automatically connect to the laptop/router IP without hardcoding localhost!

export const ROUTER_URL = typeof window !== 'undefined'
  ? (window.location.port === '4000' || window.location.port === ''
      ? window.location.origin
      : `${window.location.protocol}//${window.location.hostname}:4000`)
  : (import.meta.env.VITE_ROUTER_URL || 'http://localhost:4000');
