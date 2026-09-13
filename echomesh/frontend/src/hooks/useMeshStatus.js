import { useState, useEffect, useCallback, useRef } from 'react';
import { ROUTER_URL } from '../config.js';

// Auto-detect client device model name
function detectClientModel() {
  if (typeof navigator === 'undefined') return 'Mobile Node';
  const ua = navigator.userAgent;
  if (/Android/i.test(ua)) {
    if (/Samsung/i.test(ua)) return 'Samsung Galaxy';
    if (/Redmi|Xiaomi/i.test(ua)) return 'Redmi Phone';
    if (/Realme/i.test(ua)) return 'Realme Phone';
    if (/OnePlus/i.test(ua)) return 'OnePlus';
    if (/Vivo/i.test(ua)) return 'Vivo Phone';
    return 'Android Phone';
  }
  if (/iPhone/i.test(ua)) return 'Apple iPhone';
  if (/iPad/i.test(ua)) return 'Apple iPad';
  if (/Windows/i.test(ua)) return 'Windows Laptop (Host Root)';
  return 'EchoMesh Node';
}

export function useMeshStatus() {
  const [devices, setDevices] = useState([
    { url: '', name: 'Device A', specialty: 'medical', status: 'unknown' },
    { url: '', name: 'Device B', specialty: 'shelter', status: 'unknown' },
    { url: '', name: 'Device C', specialty: 'maps', status: 'unknown' }
  ]);
  const [peers, setPeers] = useState([]);
  const [bluetoothPeers, setBluetoothPeers] = useState([]);
  const [connectedClients, setConnectedClients] = useState([]);
  const [routingTable, setRoutingTable] = useState([]); // multi-hop routes
  const [lostRoutes, setLostRoutes] = useState([]);    // recently broken routes
  const [nodeInfo, setNodeInfo] = useState(null);
  const [routerOnline, setRouterOnline] = useState(false);
  const [lastChecked, setLastChecked] = useState(null);

  // Real-time mDNS/WiFi Peer Connection Toast Notification State
  const [peerToast, setPeerToast] = useState(null); // { type: 'connect'|'disconnect', text: string, timestamp: number }

  const deviceIdRef = useRef(`client-${Math.random().toString(36).substring(2, 9)}`);
  const deviceNameRef = useRef(detectClientModel());
  const wsRef = useRef(null);

  // Automatic real-time presence heartbeat to the router
  const sendHeartbeat = useCallback(async () => {
    try {
      await fetch(`${ROUTER_URL}/client-heartbeat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          deviceId: deviceIdRef.current,
          deviceName: deviceNameRef.current,
          connectionType: 'auto_mesh',
          hopCount: 1
        })
      });
    } catch (e) {
      // Offline / ignoring
    }
  }, []);

  const checkStatus = useCallback(async () => {
    try {
      const res = await fetch(`${ROUTER_URL}/status`, { signal: AbortSignal.timeout(5000) });
      const data = await res.json();
      setDevices(data.devices || []);
      setPeers(data.peers || []);
      setBluetoothPeers(data.bluetoothPeers || []);
      setConnectedClients(data.connectedClients || []);
      setRoutingTable(data.routingTable || []);
      setNodeInfo({ nodeId: data.nodeId, port: data.port });
      setRouterOnline(true);
      setLastChecked(data.timestamp);
    } catch (e) {
      setRouterOnline(false);
      setDevices(prev => prev.map(d => ({ ...d, status: 'offline' })));
    }
  }, []);

  // Real-time WebSocket connection to backend router for instant mDNS peer event pushes
  useEffect(() => {
    let socketUrl = ROUTER_URL.replace(/^http/, 'ws');
    if (!socketUrl.startsWith('ws')) {
      socketUrl = `ws://${window.location.hostname}:4000`;
    }

    try {
      const ws = new WebSocket(socketUrl);
      wsRef.current = ws;

      ws.onopen = () => {
        try {
          ws.send(JSON.stringify({ type: 'CLIENT_LISTEN', clientId: deviceIdRef.current }));
        } catch (e) {}
      };

      ws.onmessage = (event) => {
        try {
          const msg = JSON.parse(event.data);
          if (msg.type === 'PEER_CONNECTED' && msg.peer) {
            const name = msg.peer.deviceName || msg.peer.nodeId || 'Nearby Peer';
            setPeerToast({
              type: 'connect',
              text: `✅ EchoMesh Connected to ${name}`,
              timestamp: Date.now()
            });
            checkStatus(); // Instantly refresh status & peer lists
          } else if (msg.type === 'PEER_DISCONNECTED' && msg.peer) {
            const name = msg.peer.deviceName || msg.peer.nodeId || 'Peer';
            setPeerToast({
              type: 'disconnect',
              text: `⚠️ ${name} Disconnected`,
              timestamp: Date.now()
            });
            checkStatus(); // Instantly refresh status & peer lists
          } else if (msg.type === 'ROUTING_TABLE_UPDATED' && Array.isArray(msg.routingTable)) {
            // Real-time routing table update from mesh — show new multi-hop paths instantly
            setRoutingTable(msg.routingTable);
            if (Array.isArray(msg.lostRoutes) && msg.lostRoutes.length > 0) {
              setLostRoutes(msg.lostRoutes);
              // Auto-clear "broken route" warning after 8s (node may reconnect via alternate path)
              setTimeout(() => setLostRoutes([]), 8000);
            }
          }
        } catch (e) {}
      };

      return () => {
        try {
          ws.close();
        } catch (e) {}
      };
    } catch (e) {}
  }, [checkStatus]);

  useEffect(() => {
    sendHeartbeat();
    checkStatus();

    const statusInterval = setInterval(checkStatus, 3500);
    const heartbeatInterval = setInterval(sendHeartbeat, 6000);

    return () => {
      clearInterval(statusInterval);
      clearInterval(heartbeatInterval);
    };
  }, [checkStatus, sendHeartbeat]);

  return {
    devices,
    peers,
    bluetoothPeers,
    connectedClients,
    routingTable,
    lostRoutes,
    nodeInfo,
    routerOnline,
    lastChecked,
    peerToast,
    dismissPeerToast: () => setPeerToast(null),
    refresh: checkStatus
  };
}
