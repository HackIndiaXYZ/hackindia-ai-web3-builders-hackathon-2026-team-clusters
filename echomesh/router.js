const express = require('express');
const cors = require('cors');
const axios = require('axios');
const path = require('path');
const http = require('http');
const https = require('https');
const fs = require('fs');
const os = require('os');
const WebSocket = require('ws');
const bonjourLib = require('bonjour');

// ── Ollama AI Service & RAG Module ──
const { checkOllamaStatus, queryPhi3, getStatus: getOllamaStatus } = require('./services/ollamaService');
const { loadKnowledge, retrieve } = require('./rag');

// ── EchoMesh Permissioned Blockchain (SHA-256 + HMAC-SHA256) ──
const { echoChain } = require('./services/blockchain');

// ── Load all knowledge bases for RAG retrieval on the router ──
const knowledgeMedical = loadKnowledge(path.join(__dirname, 'knowledge_medical.json'));
const knowledgeShelter = loadKnowledge(path.join(__dirname, 'knowledge_shelter.json'));
const knowledgeMaps = loadKnowledge(path.join(__dirname, 'knowledge_maps.json'));
const allKnowledge = [...knowledgeMedical, ...knowledgeShelter, ...knowledgeMaps];

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

// ── Optional HTTPS Server on port 4443 for Mobile Secure Context (Microphone / Web Speech) ──
let httpsServer = null;
let httpsWss = null;
const HTTPS_PORT = process.env.HTTPS_PORT || 4443;
const keyPath = path.join(__dirname, 'key.pem');
const certPath = path.join(__dirname, 'cert.pem');
if (fs.existsSync(keyPath) && fs.existsSync(certPath)) {
  try {
    httpsServer = https.createServer({
      key: fs.readFileSync(keyPath),
      cert: fs.readFileSync(certPath)
    }, app);
    httpsWss = new WebSocket.Server({ server: httpsServer });
    console.log(`[HTTPS] Initialized SSL support on port ${HTTPS_PORT} (Secure Context enabled)`);
  } catch (sslErr) {
    console.warn('[HTTPS] Could not initialize SSL server:', sslErr.message);
  }
}

const PORT = process.env.PORT || 4000;
const NODE_ID = process.env.NODE_ID || `${os.hostname()}-${PORT}`;
const ROLE = 'peer';

// Allow requests from any local network origin (for phone access)
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type']
}));

app.use(express.json({ limit: '15mb' }));

// Serve static files (sos.html, rescue-dashboard.html) from /public
app.use(express.static(path.join(__dirname, 'public')));

// ── Serve built React frontend from /frontend/dist on the SAME port ──
// This means phone just opens http://<laptop-ip>:4000 — no separate Vite server needed!
const FRONTEND_DIST = path.join(__dirname, 'frontend', 'dist');
app.use(express.static(FRONTEND_DIST, {
  etag: false,
  maxAge: 0,
  setHeaders: (res) => {
    res.set('Cache-Control', 'no-store, no-cache, must-revalidate, private');
  }
}));

// ── Early Access Lead Capture API ──
const earlyAccessLeads = [];
app.post('/api/interest', (req, res) => {
  const { fullName, phone, email, organization, deployArea, useCase } = req.body || {};
  if (!fullName || !phone || !email) {
    return res.status(400).json({ success: false, error: 'Full name, phone, and email are required.' });
  }
  const lead = {
    id: `lead-${Date.now()}`,
    fullName,
    phone,
    email,
    organization: organization || 'Individual / General',
    deployArea: deployArea || 'General Zone',
    useCase: useCase || 'Personal safety',
    receivedAt: new Date().toISOString()
  };
  earlyAccessLeads.push(lead);
  console.log(`[EchoMesh Lead] New early access request:`, lead);
  res.json({
    success: true,
    message: 'Thank you for requesting early access! We will notify you.',
    leadId: lead.id
  });
});

app.get('/api/interest', (req, res) => {
  res.json({ success: true, count: earlyAccessLeads.length, leads: earlyAccessLeads });
});

// ── Mesh Anchor Geo-Location (Self-Healing Mesh Positioning) ──
let meshLocation = {
  latitude: 28.4927,
  longitude: 77.5358,
  city: 'Greater Noida',
  region: 'Uttar Pradesh',
  country: 'India',
  accuracy: 25,
  source: 'network_anchor',
  lastUpdated: new Date().toISOString()
};

// Auto-detect real IP geolocation on router start
(async function initMeshLocation() {
  try {
    const geoRes = await axios.get('http://ip-api.com/json', { timeout: 3500 });
    if (geoRes.data && geoRes.data.status === 'success' && geoRes.data.lat) {
      meshLocation = {
        latitude: geoRes.data.lat,
        longitude: geoRes.data.lon,
        city: geoRes.data.city || 'Greater Noida',
        region: geoRes.data.regionName || 'Uttar Pradesh',
        country: geoRes.data.country || 'India',
        accuracy: 25,
        source: 'ip_geo_anchor',
        lastUpdated: new Date().toISOString()
      };
      console.log(`[Mesh Location] 📍 Real anchor acquired: ${meshLocation.latitude}°N, ${meshLocation.longitude}°E (${meshLocation.city}, ${meshLocation.region})`);
    }
  } catch (e) {
    console.log('[Mesh Location] Using local anchor:', meshLocation.city, meshLocation.latitude, meshLocation.longitude);
  }
})();

app.get('/api/location', (req, res) => {
  res.json({ success: true, location: meshLocation });
});

app.post('/api/location', (req, res) => {
  const { latitude, longitude, accuracy, city, source } = req.body || {};
  if (typeof latitude === 'number' && typeof longitude === 'number') {
    meshLocation = {
      latitude,
      longitude,
      accuracy: accuracy || 10,
      city: city || meshLocation.city,
      region: meshLocation.region,
      country: meshLocation.country,
      source: source || 'mobile_gps_sync',
      lastUpdated: new Date().toISOString()
    };
    log('[Mesh Location] 📍 Anchor updated via GPS sync', meshLocation);
    notifyFrontendClients({
      type: 'MESH_LOCATION_UPDATED',
      location: meshLocation
    });
    return res.json({ success: true, location: meshLocation });
  }
  res.status(400).json({ error: 'Valid latitude and longitude required.' });
});

// Device registry with human-readable metadata
const DEVICES = [
  { url: 'http://127.0.0.1:4001', name: 'Device A', specialty: 'medical' },
  { url: 'http://127.0.0.1:4002', name: 'Device B', specialty: 'shelter' },
  { url: 'http://127.0.0.1:4003', name: 'Device C', specialty: 'maps' }
];

// ---- Logging helper ----
function log(message, data = {}) {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] ${message}`, Object.keys(data).length ? JSON.stringify(data) : '');
}

// Helper to get local network IP addresses for self-filtering
function getLocalAddresses() {
  const interfaces = os.networkInterfaces();
  const ips = new Set(['127.0.0.1', 'localhost', '::1']);
  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name]) {
      if (iface.family === 'IPv4' || iface.family === 4) {
        ips.add(iface.address);
      }
    }
  }
  return ips;
}

// ══════════════════════════════════════════════════════════════
//  WEBSOCKET PEER MESH & CONNECTION MANAGEMENT
// ══════════════════════════════════════════════════════════════

// Active peer connections map: peerKey -> { ws, key, nodeId, deviceName, role, ip, port, type, status }
const peers = new Map();

// ── Multi-Hop Routing Table ──
// routingTable.get(nodeId) = { via: 'peerNodeId', hops: N, updatedAt: timestamp }
// Tracks how to reach nodes we are NOT directly connected to
const routingTable = new Map();

// Max TTL (hops) for any routed message — prevents infinite loops
const MESH_MAX_TTL = 6;

// Find a directly-connected peer WebSocket by its nodeId
function findPeerWsByNodeId(nodeId) {
  for (const peer of peers.values()) {
    if (peer.nodeId === nodeId && peer.status === 'connected' && peer.ws && peer.ws.readyState === WebSocket.OPEN) {
      return peer.ws;
    }
  }
  return null;
}

// Get list of all connected peer nodeIds (for ROUTE_ANNOUNCE)
function getConnectedPeerNodeIds() {
  return Array.from(peers.values())
    .filter(p => p.status === 'connected')
    .map(p => p.nodeId)
    .filter(Boolean);
}

// Update routing table when we learn about reachable nodes via a peer
function updateRoutingTable(reachableNodes, viaPeerNodeId, baseHops) {
  for (const nodeId of reachableNodes) {
    if (nodeId === NODE_ID) continue; // don't route to self
    const existing = routingTable.get(nodeId);
    const newHops = baseHops + 1;
    if (!existing || existing.hops > newHops) {
      routingTable.set(nodeId, { via: viaPeerNodeId, hops: newHops, updatedAt: Date.now() });
      log(`[Routing] 🗺️  Route updated: ${nodeId} → via ${viaPeerNodeId} (${newHops} hop${newHops > 1 ? 's' : ''})`);
    }
  }
}

// Invalidate all routing table entries that go through a failed peer
// Returns list of now-unreachable nodeIds so we can broadcast ROUTE_WITHDRAW
function invalidateRoutesVia(failedPeerNodeId) {
  const lost = [];
  for (const [nodeId, route] of routingTable.entries()) {
    if (route.via === failedPeerNodeId) {
      routingTable.delete(nodeId);
      lost.push(nodeId);
      log(`[Routing] 🔴 Route LOST: ${nodeId} (was via ${failedPeerNodeId})`);
    }
  }
  // Also remove the direct entry for the failed peer itself
  if (routingTable.has(failedPeerNodeId)) {
    routingTable.delete(failedPeerNodeId);
    lost.push(failedPeerNodeId);
  }
  if (lost.length > 0) {
    // Tell all remaining peers: these routes are now dead
    const withdrawMsg = JSON.stringify({
      type: 'ROUTE_WITHDRAW',
      lostNodes: lost,
      via: failedPeerNodeId,
      reportedBy: NODE_ID
    });
    for (const peer of peers.values()) {
      if (peer.status === 'connected' && peer.ws && peer.ws.readyState === WebSocket.OPEN) {
        try { peer.ws.send(withdrawMsg); } catch (e) {}
      }
    }
    // Notify frontend — UI shows "Route broken" for these nodes
    notifyFrontendClients({
      type: 'ROUTING_TABLE_UPDATED',
      routingTable: Array.from(routingTable.entries()).map(([nodeId, r]) => ({
        nodeId, via: r.via, hops: r.hops
      })),
      lostRoutes: lost
    });
  }
  return lost;
}

// Forward a routed MESH_MESSAGE toward its destination
function forwardMessage(msg, incomingPeerKey) {
  if (!msg || !msg.to || !msg.type) return;

  // TTL check
  if (typeof msg.ttl !== 'number' || msg.ttl <= 0) {
    log(`[Routing] ⛔ TTL expired, dropping message to ${msg.to}`);
    return;
  }

  // Loop prevention
  const visited = Array.isArray(msg.visitedNodes) ? msg.visitedNodes : [];
  if (visited.includes(NODE_ID)) {
    log(`[Routing] 🔄 Loop detected, dropping message to ${msg.to}`);
    return;
  }

  // Clone and stamp this hop
  const outMsg = { ...msg, ttl: msg.ttl - 1, visitedNodes: [...visited, NODE_ID] };
  const outStr = JSON.stringify(outMsg);

  // 1. Direct connection available?
  const directWs = findPeerWsByNodeId(msg.to);
  if (directWs) {
    try { directWs.send(outStr); } catch (e) {}
    log(`[Routing] ✅ Direct delivery: ${msg.from} → ${msg.to}`);
    return;
  }

  // 2. Routing table has a path?
  const route = routingTable.get(msg.to);
  if (route) {
    const relayWs = findPeerWsByNodeId(route.via);
    if (relayWs) {
      try { relayWs.send(outStr); } catch (e) {}
      log(`[Routing] 🔀 Relay delivery: ${msg.from} → ${msg.to} via ${route.via}`);
      return;
    }
  }

  // 3. Unknown route — flood to all peers except sender
  log(`[Routing] 📡 Unknown route to ${msg.to}, flooding to all peers`);
  for (const [key, peer] of peers.entries()) {
    if (key === incomingPeerKey) continue; // don't echo back
    if (peer.ws && peer.ws.readyState === WebSocket.OPEN && !outMsg.visitedNodes.includes(peer.nodeId)) {
      try { peer.ws.send(outStr); } catch (e) {}
    }
  }
}

// Local browser frontend WebSocket clients for real-time mesh events
const frontendClients = new Set();

// Bluetooth peers & active pairing sessions (declared here so handlePeerMessage can access them)
const bluetoothPeers = new Map();
const activePairings = new Map();

function notifyFrontendClients(eventPayload) {
  const message = JSON.stringify(eventPayload);
  for (const clientWs of frontendClients) {
    if (clientWs.readyState === WebSocket.OPEN) {
      try {
        clientWs.send(message);
      } catch (e) {}
    }
  }
}

// Broadcast message to all connected inter-peer mesh nodes
function broadcastToPeers(payload) {
  const message = JSON.stringify(payload);
  for (const [key, peer] of peers.entries()) {
    if (peer.ws && peer.ws.readyState === WebSocket.OPEN) {
      try {
        peer.ws.send(message);
      } catch (e) {
        console.warn(`[Mesh/WS] Failed to send message to peer ${key}:`, e.message);
      }
    }
  }
}

// Process incoming inter-peer messages
async function handlePeerMessage(msg, ws, peerKey) {
  if (!msg || typeof msg !== 'object') return;

  // ── ROUTE_ANNOUNCE: a peer is telling us which nodes IT can reach ──
  if (msg.type === 'ROUTE_ANNOUNCE' && Array.isArray(msg.reachableNodes)) {
    const viaPeer = msg.nodeId || peerKey;
    updateRoutingTable(msg.reachableNodes, viaPeer, msg.baseHops || 0);

    // Notify frontend that routing table updated
    notifyFrontendClients({
      type: 'ROUTING_TABLE_UPDATED',
      routingTable: Array.from(routingTable.entries()).map(([nodeId, r]) => ({
        nodeId, via: r.via, hops: r.hops
      }))
    });
    return;
  }

  // ── ROUTE_WITHDRAW: a peer lost routes, update our table too ──
  if (msg.type === 'ROUTE_WITHDRAW' && Array.isArray(msg.lostNodes)) {
    let changed = false;
    for (const nodeId of msg.lostNodes) {
      const route = routingTable.get(nodeId);
      // Only remove if we also route via the same failed peer
      if (route && route.via === msg.via) {
        routingTable.delete(nodeId);
        log(`[Routing] 🔴 ROUTE_WITHDRAW: removed ${nodeId} (was via ${msg.via})`);
        changed = true;
      }
    }
    if (changed) {
      notifyFrontendClients({
        type: 'ROUTING_TABLE_UPDATED',
        routingTable: Array.from(routingTable.entries()).map(([nodeId, r]) => ({
          nodeId, via: r.via, hops: r.hops
        })),
        lostRoutes: msg.lostNodes
      });
    }
    return;
  }

  // ── MESH_MESSAGE: generic routable message ──
  if (msg.type === 'MESH_MESSAGE') {
    if (msg.to === NODE_ID) {
      // Message is for us — handle payload
      log(`[Routing] 📨 MESH_MESSAGE received from ${msg.from}`, { payload: msg.payload });
      notifyFrontendClients({
        type: 'MESH_MESSAGE_RECEIVED',
        from: msg.from,
        payload: msg.payload,
        hopPath: [...(msg.visitedNodes || []), NODE_ID]
      });
    } else {
      // Not for us — forward
      forwardMessage(msg, peerKey);
    }
    return;
  }

  // ── SOS_BROADCAST: multi-hop SOS relay with TTL & loop prevention ──
  if (msg.type === 'SOS_BROADCAST' && msg.entry) {
    const entry = msg.entry;

    // TTL check
    const ttl = typeof msg.ttl === 'number' ? msg.ttl : MESH_MAX_TTL;
    if (ttl <= 0) {
      log(`[Routing] ⛔ SOS TTL expired, dropping id=${entry.id}`);
      return;
    }

    // Loop / duplicate prevention via visitedNodes
    const visited = Array.isArray(msg.visitedNodes) ? msg.visitedNodes : [];
    if (visited.includes(NODE_ID)) return;

    const exists = sosLog.some(s => s.id === entry.id && s.deviceName === entry.deviceName);
    if (!exists) {
      log('🚨 RELAYED SOS RECEIVED FROM MESH PEER', {
        peer: peerKey,
        id: entry.id,
        from: entry.deviceName,
        hopsLeft: ttl - 1,
        via: visited.join(' → '),
        coords: `${entry.latitude},${entry.longitude}`
      });
      sosLog.push(entry);

      // Notify local frontend UI clients in real-time
      notifyFrontendClients({
        type: 'SOS_BROADCAST',
        entry,
        originNode: msg.originNode || NODE_ID
      });

      // Relay to local specialty devices
      await Promise.allSettled(
        DEVICES.map(device =>
          axios.post(`${device.url}/sos-alert`, entry, { timeout: 5000 })
        )
      );

      // Forward to other peers with decremented TTL and updated visitedNodes
      const relayMsg = {
        type: 'SOS_BROADCAST',
        entry,
        relayedBy: NODE_ID,
        originNode: msg.originNode || NODE_ID,
        ttl: ttl - 1,
        visitedNodes: [...visited, NODE_ID]
      };

      for (const [key, peer] of peers.entries()) {
        if (key === peerKey) continue; // don't echo back to sender
        if (relayMsg.visitedNodes.includes(peer.nodeId)) continue; // loop prevention
        if (peer.ws && peer.ws.readyState === WebSocket.OPEN) {
          try { peer.ws.send(JSON.stringify(relayMsg)); } catch (e) {}
        }
      }
    }
    return;
  }

  // ── BLE_PEER_ANNOUNCE: replicate bluetooth peer across mesh nodes ──
  if (msg.type === 'BLE_PEER_ANNOUNCE' && msg.peer) {
    const p = msg.peer;
    if (!bluetoothPeers.has(p.id)) {
      bluetoothPeers.set(p.id, p);
      log(`🔵 [BLE Multi-Hop] Peer relayed from ${msg.originNode}: "${p.deviceName}" (Hop ${p.hopCount})`);
      notifyFrontendClients({ type: 'BLE_PEER_ANNOUNCED', peer: p });
    }
    return;
  }
}

// Outbound peer connection function: connects to a discovered peer via WebSocket
function connectToPeer(host, port, metadata = {}) {
  try {
    const peerPort = parseInt(port, 10);
    if (!host || !peerPort || isNaN(peerPort)) return;

    const peerKey = `${host}:${peerPort}`;
    const peerNodeId = metadata.nodeId || metadata.name || `peer-${peerKey}`;
    const peerDeviceName = metadata.deviceName || peerNodeId;

    // Filter out self-connection
    if (peerNodeId === NODE_ID) return;
    const ownIps = getLocalAddresses();
    if (ownIps.has(host) && peerPort === Number(PORT)) return;

    // Check existing connection
    const existing = peers.get(peerKey);
    if (existing && existing.status === 'connected') return;

    const wsUrl = `ws://${host}:${peerPort}`;
    console.log(`[Mesh/WS] Connecting outbound to peer: ${wsUrl} [Name: "${peerDeviceName}"]`);
    const ws = new WebSocket(wsUrl);

    peers.set(peerKey, {
      ws,
      key: peerKey,
      nodeId: peerNodeId,
      deviceName: peerDeviceName,
      role: metadata.role || 'peer',
      ip: host,
      port: peerPort,
      type: 'outbound',
      status: 'connecting'
    });

    ws.on('open', () => {
      const peer = peers.get(peerKey);
      if (peer) {
        peer.status = 'connected';
      }
      console.log(`[Mesh/WS] 🤝 Outbound socket open: ${wsUrl} -> Sending HANDSHAKE...`);

      // Send initial handshake
      try {
        ws.send(JSON.stringify({
          type: 'HANDSHAKE',
          nodeId: NODE_ID,
          deviceName: process.env.DEVICE_NAME || NODE_ID,
          role: ROLE,
          port: PORT
        }));
      } catch (e) {}

      // Announce our routing table so peer can learn indirect routes through us
      try {
        const myReachable = getConnectedPeerNodeIds();
        if (myReachable.length > 0) {
          ws.send(JSON.stringify({
            type: 'ROUTE_ANNOUNCE',
            nodeId: NODE_ID,
            reachableNodes: myReachable,
            baseHops: 0
          }));
        }
      } catch (e) {}
    });

    ws.on('message', (data) => {
      try {
        const msg = JSON.parse(data.toString());

        if (msg.type === 'HANDSHAKE_ACK' || msg.type === 'hello_ack') {
          const peer = peers.get(peerKey);
          if (peer) {
            peer.status = 'connected';
            peer.deviceName = msg.deviceName || msg.nodeId || peer.deviceName;
            peer.nodeId = msg.nodeId || peer.nodeId;
            console.log(`[Mesh/WS] ✅ Handshake complete (outbound): "${peer.deviceName}" [ws://${peerKey}]`);

            // Update routing table: this peer is reachable directly (0 extra hops)
            updateRoutingTable([peer.nodeId], peer.nodeId, 0);

            // Notify local frontend UI of real-time peer connection
            notifyFrontendClients({
              type: 'PEER_CONNECTED',
              peer: {
                key: peerKey,
                nodeId: peer.nodeId,
                deviceName: peer.deviceName,
                ip: peer.ip,
                port: peer.port,
                status: 'connected'
              }
            });

            // ── Blockchain: Record new mesh node joining as a signed block ──
            try {
              echoChain.addBlock('NODE_JOIN', {
                peerNodeId:   peer.nodeId,
                deviceName:   peer.deviceName,
                ip:           peer.ip,
                port:         peer.port,
                connectionType: 'wifi_mesh_ws',
                joinedAt:     new Date().toISOString()
              }, NODE_ID);
            } catch (bcErr) {
              console.error('[Blockchain] NODE_JOIN block error:', bcErr.message);
            }

          }
          return;
        }

        handlePeerMessage(msg, ws, peerKey);
      } catch (err) {
        console.error(`[Mesh/WS] Failed to parse message from ${peerKey}:`, err.message);
      }
    });

    ws.on('close', () => {
      const peer = peers.get(peerKey);
      if (peer) {
        const lostNodeId = peer.nodeId;
        peer.status = 'offline';
        console.log(`[Mesh/WS] ⚠️ Peer disconnected: "${peer.deviceName || peerNodeId}" [ws://${peerKey}]`);

        // 🔴 Invalidate all routes that went through this peer
        invalidateRoutesVia(lostNodeId);

        // Notify frontend
        notifyFrontendClients({
          type: 'PEER_DISCONNECTED',
          peer: {
            key: peerKey,
            nodeId: peer.nodeId,
            deviceName: peer.deviceName,
            ip: peer.ip,
            port: peer.port,
            status: 'offline'
          }
        });

        // 🔄 Auto-reconnect: outbound peer — retry with exponential backoff
        const retryDelays = [3000, 6000, 12000, 24000, 30000];
        let attempt = 0;
        function tryReconnect() {
          if (attempt >= retryDelays.length) {
            console.log(`[Mesh/WS] 🚫 Giving up reconnect to ${peerKey} after ${attempt} attempts`);
            return;
          }
          const existing = peers.get(peerKey);
          if (existing && existing.status === 'connected') return; // already back

          const delay = retryDelays[attempt++];
          console.log(`[Mesh/WS] 🔄 Reconnect attempt ${attempt} to ${peerKey} in ${delay / 1000}s...`);
          setTimeout(() => {
            const current = peers.get(peerKey);
            if (!current || current.status !== 'connected') {
              connectToPeer(peer.ip, peer.port, { nodeId: lostNodeId, deviceName: peer.deviceName });
              // If still not connected after this attempt, schedule next
              setTimeout(() => {
                const after = peers.get(peerKey);
                if (!after || after.status !== 'connected') tryReconnect();
              }, 2000);
            }
          }, delay);
        }
        tryReconnect();
      }
    });

    ws.on('error', (err) => {
      console.warn(`[Mesh/WS] Peer connection error (${wsUrl}): ${err.message}`);
      const peer = peers.get(peerKey);
      if (peer) peer.status = 'offline';
    });

  } catch (err) {
    console.error(`[Mesh/WS] Error connecting to peer ${host}:${port}:`, err.message);
  }
}

// Inbound WebSocket connection handler (for browser UI clients and peer mesh servers)
function handleInboundWsConnection(ws, req) {
  const remoteIp = req.socket.remoteAddress ? req.socket.remoteAddress.replace(/^.*:/, '') : '127.0.0.1';
  let peerKey = `${remoteIp}:${req.socket.remotePort}`;
  let peerNodeId = `peer-${peerKey}`;

  // Register as frontend UI listener
  frontendClients.add(ws);

  ws.on('message', (data) => {
    try {
      const msg = JSON.parse(data.toString());

      if (msg.type === 'CLIENT_LISTEN') {
        // Explicit frontend registration
        frontendClients.add(ws);
        return;
      }

      if (msg.type === 'HANDSHAKE' || msg.type === 'hello') {
        peerNodeId = msg.nodeId || peerNodeId;
        const peerDeviceName = msg.deviceName || msg.nodeId || peerNodeId;
        if (msg.port) {
          peerKey = `${remoteIp}:${msg.port}`;
        }

        const peerEntry = {
          ws,
          key: peerKey,
          nodeId: peerNodeId,
          deviceName: peerDeviceName,
          role: msg.role || 'peer',
          ip: remoteIp,
          port: msg.port || req.socket.remotePort,
          type: 'inbound',
          status: 'connected',
          connectedAt: new Date().toISOString()
        };

        peers.set(peerKey, peerEntry);
        console.log(`[Mesh/WS] 🤝 Inbound handshake received from "${peerDeviceName}" [ws://${peerKey}]`);

        // Send HANDSHAKE_ACK back
        try {
          ws.send(JSON.stringify({
            type: 'HANDSHAKE_ACK',
            nodeId: NODE_ID,
            deviceName: process.env.DEVICE_NAME || NODE_ID,
            role: ROLE,
            port: PORT
          }));
        } catch (e) {}

        // Update routing table for this newly connected inbound peer
        updateRoutingTable([peerNodeId], peerNodeId, 0);

        // Announce our routing knowledge to this new peer
        try {
          const myReachable = getConnectedPeerNodeIds().filter(id => id !== peerNodeId);
          if (myReachable.length > 0) {
            ws.send(JSON.stringify({
              type: 'ROUTE_ANNOUNCE',
              nodeId: NODE_ID,
              reachableNodes: myReachable,
              baseHops: 0
            }));
          }
        } catch (e) {}

        // Notify local frontend clients of new peer
        notifyFrontendClients({
          type: 'PEER_CONNECTED',
          peer: {
            key: peerKey,
            nodeId: peerEntry.nodeId,
            deviceName: peerEntry.deviceName,
            ip: peerEntry.ip,
            port: peerEntry.port,
            status: 'connected'
          }
        });
        return;
      }

      handlePeerMessage(msg, ws, peerKey);
    } catch (err) {
      console.error(`[Mesh/WS] Inbound message processing error from ${remoteIp}:`, err.message);
    }
  });

  ws.on('close', () => {
    frontendClients.delete(ws);
    const peer = peers.get(peerKey);
    if (peer) {
      const lostNodeId = peer.nodeId;
      peer.status = 'offline';
      console.log(`[Mesh/WS] ⚠️ Inbound peer disconnected: "${peer.deviceName || peerNodeId}" [ws://${peerKey}]`);

      // 🔴 Invalidate all routes that went through this peer
      invalidateRoutesVia(lostNodeId);

      notifyFrontendClients({
        type: 'PEER_DISCONNECTED',
        peer: {
          key: peerKey,
          nodeId: peer.nodeId,
          deviceName: peer.deviceName,
          ip: peer.ip,
          port: peer.port,
          status: 'offline'
        }
      });
    }
  });

  ws.on('error', (err) => {
    frontendClients.delete(ws);
    const peer = peers.get(peerKey);
    if (peer) peer.status = 'offline';
  });
}

// Attach inbound handler to HTTP WebSocket server
wss.on('connection', handleInboundWsConnection);

// Attach inbound handler to HTTPS WebSocket server if active
if (httpsWss) {
  httpsWss.on('connection', handleInboundWsConnection);
}

// ══════════════════════════════════════════════════════════════
//  mDNS PEER DISCOVERY (BONJOUR)
// ══════════════════════════════════════════════════════════════

let bonjour = null;
let publishedService = null;
let discoveryBrowser = null;

function startMdnsDiscovery() {
  try {
    bonjour = bonjourLib();

    // 1. Publish mDNS service for this device on local network
    publishedService = bonjour.publish({
      name: `EchoMesh-${NODE_ID}`,
      type: 'echomesh',
      port: Number(PORT),
      txt: {
        nodeId: NODE_ID,
        deviceName: process.env.DEVICE_NAME || NODE_ID,
        role: ROLE,
        port: String(PORT)
      }
    });

    console.log(`[mDNS] 📡 Service published: type=echomesh, name=EchoMesh-${NODE_ID}, port=${PORT}, deviceName="${process.env.DEVICE_NAME || NODE_ID}"`);

    // 2. Discover other EchoMesh services on the same WiFi network / hotspot
    discoveryBrowser = bonjour.find({ type: 'echomesh' });

    discoveryBrowser.on('up', (service) => {
      try {
        const peerTxt = service.txt || {};
        const peerNodeId = peerTxt.nodeId || service.name;
        const peerDeviceName = peerTxt.deviceName || peerNodeId;
        const peerPort = Number(service.port || peerTxt.port);

        // Extract IPv4 address
        const addresses = service.addresses || [];
        const ipv4 = addresses.find(ip => /^\d+\.\d+\.\d+\.\d+$/.test(ip)) ||
                     service.referer?.address ||
                     service.host;

        if (!ipv4 || !peerPort) return;

        // Filter out self-discovery
        if (peerNodeId === NODE_ID) return;
        const ownIps = getLocalAddresses();
        if (ownIps.has(ipv4) && peerPort === Number(PORT)) return;

        console.log(`[mDNS] 📡 Peer Discovered on WiFi: "${peerDeviceName}" (${peerNodeId}) at ${ipv4}:${peerPort}`);

        // Connect using WebSocket
        connectToPeer(ipv4, peerPort, { nodeId: peerNodeId, deviceName: peerDeviceName, role: peerTxt.role || 'peer' });

      } catch (err) {
        console.error('[mDNS] Error handling discovered peer:', err.message);
      }
    });

    discoveryBrowser.on('down', (service) => {
      try {
        console.log(`[mDNS] ⚠️ Peer service offline: "${service.name}"`);
      } catch (err) {
        console.error('[mDNS] Error handling service offline:', err.message);
      }
    });

  } catch (err) {
    console.error('[mDNS] Failed to start discovery:', err.message);
  }
}

// Graceful cleanup of mDNS services
function cleanupMdns(callback) {
  console.log('[mDNS] Unpublishing service & stopping discovery...');
  try {
    if (bonjour) {
      bonjour.unpublishAll(() => {
        try {
          bonjour.destroy();
        } catch (e) {}
        if (callback) callback();
      });
      return;
    }
  } catch (e) {
    console.error('[mDNS] Error during cleanup:', e.message);
  }
  if (callback) callback();
}

// ---- Ollama helper (existing logic, unchanged) ----
async function askOllama(prompt) {
  const res = await axios.post('http://localhost:11434/api/generate', {
    model: 'phi3',
    prompt: prompt,
    stream: false
  }, { timeout: 4000 });
  return res.data.response;
}

// ---- GET /status — ping all devices for live connection status ----
app.get('/status', async (req, res) => {
  log('Status check requested');

  const statuses = await Promise.all(
    DEVICES.map(async (device) => {
      try {
        const r = await axios.get(`${device.url}/health`, { timeout: 3000 });
        return {
          url: device.url,
          name: r.data.device || device.name,
          specialty: r.data.specialty || device.specialty,
          status: 'online'
        };
      } catch (e) {
        return {
          url: device.url,
          name: device.name,
          specialty: device.specialty,
          status: 'offline'
        };
      }
    })
  );

  const peerList = Array.from(peers.values()).map(p => ({
    key: p.key,
    nodeId: p.nodeId,
    role: p.role,
    ip: p.ip,
    port: p.port,
    type: p.type,
    status: p.status
  }));

  // Prune clients not seen in last 15s
  const now = Date.now();
  for (const [id, client] of connectedClients.entries()) {
    if (now - client.lastSeen > 15000) {
      connectedClients.delete(id);
    }
  }

  const clientList = Array.from(connectedClients.values());
  const bleList = Array.from(bluetoothPeers.values());

  // Expose routing table so UI can show hop paths
  const routingTableList = Array.from(routingTable.entries()).map(([nodeId, r]) => ({
    nodeId,
    via: r.via,
    hops: r.hops,
    updatedAt: r.updatedAt
  }));

  res.json({
    nodeId: NODE_ID,
    port: PORT,
    devices: statuses,
    peers: peerList,
    bluetoothPeers: bleList,
    connectedClients: clientList,
    routingTable: routingTableList,
    timestamp: new Date().toISOString()
  });
});

// ══════════════════════════════════════════════════════════════
//  AUTOMATIC CLIENT PRESENCE HEARTBEAT (REAL-TIME PHONE DISCOVERY)
// ══════════════════════════════════════════════════════════════
const connectedClients = new Map();

app.post('/client-heartbeat', (req, res) => {
  const { deviceId, deviceName, connectionType, hopCount, coords } = req.body || {};
  const clientIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress || '127.0.0.1';
  const id = deviceId || `client-${clientIp.replace(/[^0-9]/g, '')}`;

  const isNew = !connectedClients.has(id);

  connectedClients.set(id, {
    id,
    name: deviceName || 'Mobile Mesh Node',
    ip: clientIp,
    connectionType: connectionType || 'wifi_or_bluetooth',
    hopCount: hopCount || 1,
    lastSeen: Date.now(),
    status: 'online',
    coords: coords || null
  });

  // If a mobile phone has real GPS coordinates, sync them to mesh anchor!
  if (coords && typeof coords.latitude === 'number' && typeof coords.longitude === 'number' && coords.latitude !== 0) {
    if (meshLocation.source !== 'mobile_gps_sync' || (coords.accuracy && coords.accuracy < (meshLocation.accuracy || 100))) {
      meshLocation = {
        latitude: coords.latitude,
        longitude: coords.longitude,
        accuracy: coords.accuracy || 10,
        city: meshLocation.city,
        region: meshLocation.region,
        country: meshLocation.country,
        source: `mobile_gps_${deviceName || 'peer'}`,
        lastUpdated: new Date().toISOString()
      };
      log(`📱 [Mesh Location] High-precision GPS synced from mobile phone: ${coords.latitude}°N, ${coords.longitude}°E`);
      notifyFrontendClients({
        type: 'MESH_LOCATION_UPDATED',
        location: meshLocation
      });
    }
  }

  if (isNew) {
    log(`📱 [Auto-Presence] New Device Connected in Real-Time: "${deviceName || 'Mobile Node'}" from ${clientIp}`);
  }

  res.json({ success: true, activeClientsCount: connectedClients.size, meshLocation });
});
// ══════════════════════════════════════════════════════════════
//  SYNCHRONIZED TWO-WAY BLUETOOTH PAIRING & RELAY REGISTRY
// ══════════════════════════════════════════════════════════════
// (bluetoothPeers and activePairings are declared near the top of the file)

// ---- POST /pairing-initiate — Initiates a 6-digit Bluetooth pairing request across devices ----
app.post('/pairing-initiate', (req, res) => {
  const { sourceDevice, targetDevice, passkey, hopCount, mac } = req.body;
  const pairingId = `pair-${Date.now()}`;

  const requestData = {
    id: pairingId,
    sourceDevice: sourceDevice || 'Phone 1 (Gateway)',
    targetDevice: targetDevice || 'Nearby Device',
    passkey: passkey || Math.floor(100000 + Math.random() * 900000),
    hopCount: hopCount || 2,
    mac: mac || '7D:FD:D5:14:A0:B5',
    status: 'pending',
    timestamp: Date.now()
  };

  activePairings.set(pairingId, requestData);

  log(`🔵 [BLE Pairing] Pairing Initiated: "${requestData.sourceDevice}" ➔ "${requestData.targetDevice}" with Passkey [${requestData.passkey}]`);

  // Broadcast to all connected clients / phones via WebSocket
  broadcastToPeers({
    type: 'BLE_PAIRING_REQUEST',
    pairing: requestData
  });

  res.json({ success: true, pairing: requestData });
});

// ---- GET /pairing-active — List active pending pairing requests ----
app.get('/pairing-active', (req, res) => {
  const now = Date.now();
  // Clear pairings older than 2 minutes
  for (const [id, p] of activePairings.entries()) {
    if (now - p.timestamp > 120000) activePairings.delete(id);
  }
  res.json({ activePairings: Array.from(activePairings.values()) });
});

// ---- POST /pairing-respond — Accept or decline a pairing request from another phone ----
app.post('/pairing-respond', (req, res) => {
  const { pairingId, action, deviceName } = req.body;
  const pairing = activePairings.get(pairingId);

  if (!pairing) {
    return res.status(404).json({ error: 'Pairing session expired or not found' });
  }

  if (action === 'accept') {
    pairing.status = 'accepted';

    // Auto-register as connected Bluetooth peer
    const peerId = `ble-${Date.now()}`;
    const bleEntry = {
      id: peerId,
      deviceName: deviceName || pairing.targetDevice,
      connectionType: 'bluetooth',
      relayedBy: pairing.sourceDevice,
      hopCount: pairing.hopCount,
      rssi: -62,
      status: 'connected',
      connectedAt: new Date().toISOString()
    };

    bluetoothPeers.set(peerId, bleEntry);
    log(`🔵 [BLE Pairing] SUCCESS: "${bleEntry.deviceName}" paired with "${pairing.sourceDevice}"!`);

    broadcastToPeers({
      type: 'BLE_PAIRING_CONFIRMED',
      pairingId,
      peer: bleEntry
    });

    activePairings.delete(pairingId);
    return res.json({ success: true, status: 'accepted', peer: bleEntry });
  } else {
    pairing.status = 'declined';
    activePairings.delete(pairingId);
    log(`🔵 [BLE Pairing] DECLINED: Pairing for "${pairing.targetDevice}" was rejected.`);
    return res.json({ success: true, status: 'declined' });
  }
});

// ---- POST /peer-register — Phone announces a newly connected Bluetooth peer to Central Mesh ----
app.post('/peer-register', (req, res) => {
  try {
    const { id, deviceName, connectionType, relayedBy, hopCount, rssi } = req.body;
    const peerId = id || `ble-${Date.now()}-${Math.floor(Math.random()*1000)}`;
    const name = deviceName || `Bluetooth-Device-${peerId.slice(-4)}`;

    const bleEntry = {
      id: peerId,
      deviceName: name,
      connectionType: connectionType || 'bluetooth',
      relayedBy: relayedBy || 'Phone 1 (Gateway)',
      hopCount: hopCount || 2,
      rssi: rssi || -68,
      status: 'connected',
      connectedAt: new Date().toISOString()
    };

    bluetoothPeers.set(peerId, bleEntry);

    log(`🔵 [BLE Multi-Hop] Peer Registered: "${bleEntry.deviceName}" via Relay "${bleEntry.relayedBy}" (Hop ${bleEntry.hopCount})`);

    // Broadcast update across WebSocket mesh to other nodes
    broadcastToPeers({
      type: 'BLE_PEER_ANNOUNCE',
      peer: bleEntry,
      originNode: NODE_ID
    });

    res.json({ success: true, registered: bleEntry, totalBluetoothPeers: bluetoothPeers.size });
  } catch (e) {
    res.status(500).json({ error: 'Failed to register Bluetooth peer', details: e.message });
  }
});

// ---- POST /peer-unregister — Remove disconnected Bluetooth peer ----
app.post('/peer-unregister', (req, res) => {
  const { id } = req.body;
  if (bluetoothPeers.has(id)) {
    const removed = bluetoothPeers.get(id);
    bluetoothPeers.delete(id);
    log(`🔵 [BLE Multi-Hop] Peer Disconnected: "${removed.deviceName}"`);
    res.json({ success: true, unregistered: id });
  } else {
    res.status(404).json({ error: 'Peer not found' });
  }
});

// ══════════════════════════════════════════════════════════════
//  POST /api/ask — LOCAL OLLAMA PHI3 AI-ENHANCED QUERY ENDPOINT
//  Uses on-device RAG retrieval + phi3 LLM for intelligent answers.
//  Fully offline — no internet or cloud API calls.
// ══════════════════════════════════════════════════════════════

app.post('/api/ask', async (req, res) => {
  const startTime = Date.now();
  const { query } = req.body;

  // ── Input Validation ──
  if (!query || typeof query !== 'string' || !query.trim()) {
    return res.status(400).json({
      error: 'Missing or empty "query" field in request body.',
      mode: 'error'
    });
  }

  const trimmedQuery = query.trim();

  if (trimmedQuery.length > 500) {
    return res.status(400).json({
      error: 'Query too long. Please keep queries under 500 characters for faster response.',
      mode: 'error'
    });
  }

  log('🤖 [AI/Ask] Query received', { query: trimmedQuery });

  // ── Step 1: RAG Retrieval — find relevant context chunks from local knowledge ──
  let contextChunks = [];
  let sources = [];

  try {
    const retrieved = retrieve(allKnowledge, trimmedQuery);
    if (retrieved && retrieved.length > 0) {
      contextChunks = retrieved.slice(0, 3); // Top 3 most relevant
      sources = contextChunks.map(c => ({
        topic: c.topic || 'Unknown',
        tags: c.tags || []
      }));
      log('🤖 [AI/Ask] RAG retrieved context', { chunks: contextChunks.length, topics: sources.map(s => s.topic) });
    } else {
      log('🤖 [AI/Ask] No relevant context found in knowledge base');
    }
  } catch (ragErr) {
    log('🤖 [AI/Ask] RAG retrieval error', { error: ragErr.message });
  }

  // ── Step 2: Query phi3 via Ollama (with timeout) ──
  const ollamaStatus = getOllamaStatus();

  if (ollamaStatus.ollamaRunning && ollamaStatus.phi3Loaded) {
    try {
      const aiResult = await queryPhi3(trimmedQuery, contextChunks, {
        timeout: 12000,  // Fast timeout for real-time disaster responsiveness
        maxTokens: 140   // Keep response concise and ultra-fast
      });

      if (aiResult && aiResult.answer) {
        let finalAnswer = aiResult.answer.trim();

        // Safety check: small LLMs hallucinating negative or gibberish statements
        const isHallucination =
          finalAnswer.length < 5 ||
          /not needed|water is not needed|servalya|सर्वल्या|no water|nahi chahiye/i.test(finalAnswer);

        if (isHallucination && contextChunks.length > 0) {
          log('🤖 [AI/Ask] Phi3 gave hallucinated response, using verified RAG knowledge instead');
          finalAnswer = contextChunks[0].content;
        }

        const totalTime = Date.now() - startTime;
        log('🤖 [AI/Ask] phi3 answer generated', {
          responseTime: `${aiResult.responseTimeMs}ms`,
          totalTime: `${totalTime}ms`,
          answerLength: finalAnswer.length
        });

        // ── Blockchain: Record AI query + response as a signed block ──
        try {
          echoChain.addBlock('AI_QUERY', {
            query: trimmedQuery,
            answerLength: finalAnswer.length,
            sources: sources.map(s => s.topic),
            responseTimeMs: totalTime,
            model: 'phi3',
            mode: 'ai'
          }, NODE_ID);
        } catch (bcErr) {
          log('[Blockchain] AI_QUERY block error', { error: bcErr.message });
        }

        return res.json({
          answer: finalAnswer,
          sources: sources,
          responseTime: totalTime,
          llmTime: aiResult.responseTimeMs,
          mode: 'ai',
          model: 'phi3'
        });
      }

      // phi3 returned null — fall through to degraded mode
      log('🤖 [AI/Ask] phi3 returned no answer — falling back to RAG-only mode');

    } catch (aiErr) {
      log('🤖 [AI/Ask] phi3 query failed', { error: aiErr.message });
    }
  } else {
    log('🤖 [AI/Ask] Ollama/phi3 unavailable — using RAG-only fallback', ollamaStatus);
  }

  // ── Step 3: Graceful Degradation — return raw retrieved context without AI synthesis ──
  const totalTime = Date.now() - startTime;

  if (contextChunks.length > 0) {
    const fallbackAnswer = contextChunks
      .map(c => c.content || '')
      .filter(Boolean)
      .join('\n\n');

    log('🤖 [AI/Ask] Returning RAG-only fallback', { totalTime: `${totalTime}ms` });

    return res.json({
      answer: fallbackAnswer,
      sources: sources,
      responseTime: totalTime,
      mode: 'fallback',
      fallbackReason: ollamaStatus.ollamaRunning ? 'phi3 did not respond' : 'Ollama is not running'
    });
  }

  // No context found at all
  return res.json({
    answer: 'इस सवाल का जवाब ऑफलाइन डेटाबेस में नहीं मिला। कृपया प्राथमिक चिकित्सा, आश्रय, या निकासी मार्ग से संबंधित सवाल पूछें।\n\nThis question was not found in the offline database. Please ask about first aid, shelter, or evacuation routes.',
    sources: [],
    responseTime: totalTime,
    mode: 'no_data'
  });
});

// ── GET /api/ollama-status — Check Ollama/phi3 availability ──
app.get('/api/ollama-status', (req, res) => {
  res.json(getOllamaStatus());
});

// ══════════════════════════════════════════════════════════════
//  BLOCKCHAIN API ENDPOINTS
// ══════════════════════════════════════════════════════════════

// ── GET /api/blockchain — Return full chain (for UI panel) ──
app.get('/api/blockchain', (req, res) => {
  try {
    const type = req.query.type; // optional filter: ?type=SOS
    const chain = type ? echoChain.getBlocksByType(type) : echoChain.getChain();
    const stats = echoChain.getStats();
    res.json({ chain, stats, nodeId: NODE_ID });
  } catch (e) {
    res.status(500).json({ error: 'Failed to retrieve blockchain', details: e.message });
  }
});

// ── GET /api/blockchain/verify — Validate chain integrity ──
app.get('/api/blockchain/verify', (req, res) => {
  try {
    const result = echoChain.isChainValid();
    res.json({
      ...result,
      nodeId: NODE_ID,
      checkedAt: new Date().toISOString()
    });
  } catch (e) {
    res.status(500).json({ error: 'Verification failed', details: e.message });
  }
});

// ── GET /api/blockchain/stats — Quick stats for dashboard ──
app.get('/api/blockchain/stats', (req, res) => {
  res.json({ ...echoChain.getStats(), nodeId: NODE_ID });
});

// ---- POST /ask — main query routing (existing logic preserved, logging added) ----
app.post('/ask', async (req, res) => {
  const { question } = req.body;

  if (!question || typeof question !== 'string' || !question.trim()) {
    return res.status(400).json({ error: 'Missing or empty "question" field in request body.' });
  }

  log('Query received', { question });

  // Step 1: broadcast query to all devices
  const responses = await Promise.all(
    DEVICES.map(async (device) => {
      try {
        const r = await axios.post(`${device.url}/query`, { question }, { timeout: 15000 });
        return { url: device.url, ...r.data };
      } catch (e) {
        log('Device unreachable', { url: device.url, error: e.message });
        return {
          url: device.url,
          device: device.name,
          specialty: device.specialty,
          hasLocalData: false,
          answer: null,
          error: 'unreachable'
        };
      }
    })
  );

  const lowerQ = question.toLowerCase().trim();

  // 1. Handle Greetings & Introduction warmly in Hindi
  const isGreeting = /^(hi|hello|hey|namaste|namaskar|kaise ho|kya hal|who are you|kaun ho|help|madad)\b/i.test(lowerQ) && lowerQ.length < 25;
  if (isGreeting) {
    return res.json({
      query: question,
      contributingDevices: ['EchoMesh Assistant'],
      finalAnswer: "नमस्ते! 🙏 मैं EchoMesh ऑफलाइन आपदा सहायता AI हूँ।\n\nमैं बिना इंटरनेट के इस नेटवर्क में आपकी इन चीज़ों में मदद कर सकता हूँ:\n\n• 🩺 प्राथमिक उपचार (सांप काटना, जलना, फ्रैक्चर, घाव)\n• 💧 पीने का साफ पानी और राशन वितरण\n• 🏠 सुरक्षित राहत शिविर व कैंप की जगह\n• 🏥 नजदीकी अस्पताल और डॉक्टर\n• 🗺️ बाढ़ से सुरक्षित निकासी रास्ते\n\nआप सीधे बोलकर या टाइप करके अपना सवाल पूछ सकते हैं!",
      allResponses: responses
    });
  }

  // Step 2: only keep devices that actually had relevant data
  const contributing = responses.filter(r => r.hasLocalData);

  log('Query routed', {
    question,
    totalDevices: responses.length,
    contributingDevices: contributing.map(r => r.device)
  });

  if (contributing.length === 0) {
    return res.json({
      query: question,
      contributingDevices: [],
      finalAnswer: "यह सवाल ऑफलाइन आपदा डेटाबेस में सीधे नहीं मिला।\n\n💡 त्वरित सहायता:\n• पीने का पानी: 1.5 किमी पूर्व (स्कूल ग्राउंड वाटर फिल्टर)\n• प्राथमिक चिकित्सा / अस्पताल: जिला अस्पताल (3 किमी उत्तर-पूर्व) व चौराहा 12 क्लिनिक\n• सुरक्षित शिविर: कम्युनिटी हॉल (सेक्टर 4)\n• गंभीर आपात स्थिति में लाल '🚨 SOS HELP' बटन दबाएं।",
      allResponses: responses
    });
  }

  // Combine unique verified Hindi facts directly from contributing mesh devices
  const allAnswers = contributing.map(r => r.answer.trim()).filter(Boolean);
  const uniqueAnswers = [...new Set(allAnswers)];
  const finalAnswer = uniqueAnswers.join('\n\n');

  log('Direct verified Hindi response returned', {
    contributingDevices: contributing.map(r => r.device)
  });

  res.json({
    query: question,
    contributingDevices: contributing.map(r => r.device),
    finalAnswer,
    allResponses: responses
  });
});

// ══════════════════════════════════════════════════════════════
//  SOS EMERGENCY SYSTEM
// ══════════════════════════════════════════════════════════════

// In-memory SOS log
const sosLog = [];
let sosIdCounter = 1;

// Rate-limiting: track last SOS time per deviceName
const sosRateLimit = new Map();
const SOS_COOLDOWN_MS = 30000; // 30 seconds

// ---- POST /sos — create SOS entry and broadcast to all devices ----
app.post('/sos', async (req, res) => {
  try {
    const { latitude, longitude, message, emergencyType, audioData } = req.body;
    const rawName = req.body.deviceName || req.body.sender || req.body.nodeId || 'Survivor-Mobile';
    const cleanName = (typeof rawName === 'string' && rawName.trim()) ? rawName.trim() : 'Survivor-Mobile';

    // Rate-limit check: fast 2s cooldown to prevent demo lockouts
    const effectiveCooldown = (emergencyType === 'seismic') ? 3000 : 2000;
    const clientKey = `${cleanName}_${req.ip || 'peer'}`;
    const lastSos = sosRateLimit.get(clientKey);
    const now = Date.now();
    if (lastSos && (now - lastSos) < effectiveCooldown) {
      const waitSec = Math.ceil((effectiveCooldown - (now - lastSos)) / 1000);
      return res.status(429).json({
        error: `SOS rate limited. Please wait ${waitSec}s before sending another.`,
        retryAfterSeconds: waitSec
      });
    }

    // Assign safe coordinates with realistic sector offset if GPS is null/0
    const safeLat = (typeof latitude === 'number' && !isNaN(latitude) && latitude !== 0)
      ? latitude
      : (meshLocation.latitude || 28.4927) + (Math.random() - 0.5) * 0.005;
    const safeLng = (typeof longitude === 'number' && !isNaN(longitude) && longitude !== 0)
      ? longitude
      : (meshLocation.longitude || 77.5358) + (Math.random() - 0.5) * 0.005;

    // Create SOS entry with unique ID and dual deviceName/sender keys
    const sosEntry = {
      id: Date.now(),
      deviceName: cleanName,
      sender: cleanName,
      emergencyType: emergencyType || 'critical',
      latitude: safeLat,
      longitude: safeLng,
      message: (message && typeof message === 'string' && message.trim()) ? message.trim() : '🚨 Emergency! Need immediate rescue assistance!',
      audioData: audioData || null,
      timestamp: new Date().toISOString(),
      status: 'ACTIVE'
    };

    sosLog.push(sosEntry);
    sosRateLimit.set(clientKey, now);

    // ── Blockchain: Record SOS as a signed block ──
    try {
      echoChain.addBlock('SOS', {
        sosId: sosEntry.id,
        deviceName: sosEntry.deviceName,
        emergencyType: sosEntry.emergencyType,
        latitude: sosEntry.latitude,
        longitude: sosEntry.longitude,
        message: sosEntry.message,
        timestamp: sosEntry.timestamp
      }, NODE_ID);
    } catch (bcErr) {
      log('[Blockchain] SOS block error', { error: bcErr.message });
    }

    log('🚨 SOS RECEIVED', { id: sosEntry.id, type: sosEntry.emergencyType, from: sosEntry.deviceName, coords: `${sosEntry.latitude},${sosEntry.longitude}` });

    // 1. Broadcast to local devices using Promise.allSettled
    const broadcastResults = await Promise.allSettled(
      DEVICES.map(device =>
        axios.post(`${device.url}/sos-alert`, sosEntry, { timeout: 5000 })
      )
    );

    const notified = broadcastResults.filter(r => r.status === 'fulfilled').length;
    const failed = broadcastResults.filter(r => r.status === 'rejected').length;

    // 2. Broadcast across WebSocket mesh to all discovered mDNS peers (with multi-hop TTL)
    broadcastToPeers({
      type: 'SOS_BROADCAST',
      entry: sosEntry,
      originNode: NODE_ID,
      relayedBy: NODE_ID,
      ttl: MESH_MAX_TTL,
      visitedNodes: [NODE_ID]
    });

    // 3. Notify local frontend browser UI clients in real-time
    notifyFrontendClients({
      type: 'SOS_BROADCAST',
      entry: sosEntry,
      originNode: NODE_ID
    });

    log('SOS broadcast complete', { id: sosEntry.id, notified, failed, meshPeers: peers.size });

    res.json({
      success: true,
      sosId: sosEntry.id,
      devicesNotified: notified,
      devicesFailed: failed,
      meshPeersNotified: peers.size,
      entry: sosEntry
    });

  } catch (e) {
    log('SOS endpoint error', { error: e.message });
    res.status(500).json({ error: 'Failed to process SOS signal.', details: e.message });
  }
});

// ---- GET /sos-list — return all SOS entries (ACTIVE first, newest first) ----
app.get('/sos-list', (req, res) => {
  const active = sosLog.filter(s => s.status === 'ACTIVE').sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
  const resolved = sosLog.filter(s => s.status === 'RESOLVED').sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
  res.json({ active, resolved, total: sosLog.length });
});

// ---- POST /sos-resolve/:id — mark an SOS as resolved ----
app.post('/sos-resolve/:id', (req, res) => {
  const id = parseInt(req.params.id, 10);
  const entry = sosLog.find(s => s.id === id);

  if (!entry) {
    return res.status(404).json({ error: `SOS entry with id ${id} not found.` });
  }

  if (entry.status === 'RESOLVED') {
    return res.json({ success: true, message: 'Already resolved.', entry });
  }

  entry.status = 'RESOLVED';
  entry.resolvedAt = new Date().toISOString();
  log('SOS resolved', { id: entry.id, deviceName: entry.deviceName });

  res.json({ success: true, entry });
});

// Serve built frontend if available
const frontendDist = path.join(__dirname, 'frontend', 'dist');
app.use(express.static(frontendDist));

// Fallback to frontend index.html for SPA routes (Express 5 compatible)
app.use((req, res, next) => {
  if (req.method === 'GET' && !req.path.startsWith('/sos') && !req.path.startsWith('/status') && !req.path.startsWith('/ask') && !req.path.startsWith('/api')) {
    const indexHtml = path.join(frontendDist, 'index.html');
    return res.sendFile(indexHtml, (err) => {
      if (err) next();
    });
  }
  next();
});

// Graceful process termination handlers
function handleShutdown(signal) {
  console.log(`\n[Process] Received ${signal}. Shutting down EchoMesh node...`);
  cleanupMdns(() => {
    for (const [key, peer] of peers.entries()) {
      try {
        peer.ws.terminate();
      } catch (e) {}
    }
    if (httpsServer) {
      try { httpsServer.close(); } catch (e) {}
    }
    server.close(() => {
      process.exit(0);
    });
    setTimeout(() => process.exit(0), 1500).unref();
  });
}

process.on('SIGINT', () => handleShutdown('SIGINT'));
process.on('SIGTERM', () => handleShutdown('SIGTERM'));
// ── SPA catch-all: serve index.html for any non-API route (React app) ──
app.use((req, res, next) => {
  const apiRoutes = ['/api', '/sos', '/status', '/query', '/pairing',
                     '/heartbeat', '/mesh-message', '/connect-peer', '/devices'];
  const isApi = apiRoutes.some(r => req.path.startsWith(r));
  if (!isApi) {
    const fs = require('fs');
    const indexPath = path.join(FRONTEND_DIST, 'index.html');
    if (fs.existsSync(indexPath)) return res.sendFile(indexPath);
  }
  next();
});


server.listen(PORT, '0.0.0.0', async () => {
  // ── Print all network IPs so user knows where to connect ──
  const nets = os.networkInterfaces();
  const ips = [];
  for (const iface of Object.values(nets)) {
    for (const addr of iface) {
      if (addr.family === 'IPv4' && !addr.internal) ips.push(addr.address);
    }
  }

  // Start HTTPS server if configured for mobile secure context
  if (httpsServer) {
    httpsServer.listen(HTTPS_PORT, '0.0.0.0', () => {
      console.log(`🔒 [HTTPS Secure Context Server] Active on port ${HTTPS_PORT}`);
    });
  }

  console.log('');
  console.log('╔══════════════════════════════════════════════════════╗');
  console.log('║   📡 EchoMesh — Server Started                       ║');
  console.log('╠══════════════════════════════════════════════════════╣');
  console.log(`║   Laptop:  http://localhost:${PORT}                       ║`);
  ips.forEach(ip => {
    const padded = `http://${ip}:${PORT}`.padEnd(46);
    console.log(`║   Network: ${padded}║`);
  });
  if (httpsServer) {
    console.log('╠══════════════════════════════════════════════════════╣');
    console.log('║   🔒 MOBILE PHONE (Native Mic & Speech Context):     ║');
    ips.forEach(ip => {
      const padded = `https://${ip}:${HTTPS_PORT}`.padEnd(43);
      console.log(`║      👉 ${padded} ║`);
    });
  }
  console.log('╠══════════════════════════════════════════════════════╣');
  console.log('║   📱 Phone (HTTP):                                   ║');
  ips.forEach(ip => {
    const padded = `http://${ip}:${PORT}`.padEnd(46);
    console.log(`║      👉 ${padded}    ║`);
  });
  console.log('╚══════════════════════════════════════════════════════╝');
  console.log('');

  log('Registered devices', { devices: DEVICES.map(d => `${d.name} (${d.specialty}) @ ${d.url}`) });
  log('SOS + AI + Static UI all served on port ' + PORT);

  // Check Ollama/phi3 availability on startup
  await checkOllamaStatus();
  console.log('');

  // Start automatic mDNS peer discovery & publishing
  startMdnsDiscovery();
});