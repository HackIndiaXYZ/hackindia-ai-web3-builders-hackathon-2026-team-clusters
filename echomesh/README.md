# 🌐 EchoMesh — Decentralized Offline AI Mesh Network & SOS Emergency System

> Multiple devices, each with a fragment of knowledge, collaborating through a local mesh to answer questions and relay emergency signals — **no internet required.**

![EchoMesh](https://img.shields.io/badge/EchoMesh-Offline_AI_Mesh-06b6d4?style=for-the-badge)
![Node.js](https://img.shields.io/badge/Node.js-Express-339933?style=for-the-badge&logo=node.js&logoColor=white)
![React](https://img.shields.io/badge/React-Vite-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![Ollama](https://img.shields.io/badge/Ollama-Phi--3-white?style=for-the-badge)
![Emergency SOS](https://img.shields.io/badge/SOS-Emergency_Relay-dc2626?style=for-the-badge)

---

## 🏗️ Architecture

```
┌────────────────────────┐
│   SOS Panic Button     │ (Child / User in danger)
│ http://<ip>:4000/sos   │
└───────────┬────────────┘
            │ POST /sos (GPS coords + name)
            ▼
┌────────────────────────┐     ┌───────────────────────┐
│     Query & Relay      │────▶│      Device A         │ (🏥 Medical, port 4001)
│        Router          │     │    /sos-alert 🚨      │
│      (port 4000)       │────▶│      Device B         │ (🏠 Shelter, port 4002)
│                        │     │    /sos-alert 🚨      │
│  - /sos (broadcast)    │────▶│      Device C         │ (🗺️ Maps, port 4003)
│  - /ask (synthesis)    │     │    /sos-alert 🚨      │
│  - /sos-list (active)  │     └───────────────────────┘
│  - /sos-resolve/:id    │                 │
└───────────┬────────────┘                 │
            │                              ▼
            ├─────────────────────▶ ┌─────────────┐
            │                       │   Ollama    │ (phi3, port 11434)
            │                       └─────────────┘
            ▼
┌────────────────────────┐     ┌───────────────────────┐
│    Rescue Dashboard    │     │  Mesh AI QA Frontend  │ (Live network viz)
│  /rescue-dashboard.html│     │   http://<ip>:5173    │
└────────────────────────┘     └───────────────────────┘
```

**Two Core Modes:**
1. **Mesh AI QA:** Query Router broadcasts questions to all 3 nodes, devices search local JSON fragments + Ollama, Router synthesizes final combined answer.
2. **Emergency SOS Broadcast:** Panic button captures GPS coordinates, Router broadcasts alerts to all devices simultaneously using resilient `Promise.allSettled`, and live Rescue Dashboard displays active alerts with Google Maps links and resolution tracking.

---

## 📋 Prerequisites

| Requirement | Version | Notes |
|-------------|---------|-------|
| **Node.js** | v18+    | [Download](https://nodejs.org) |
| **Ollama**  | latest  | [Download](https://ollama.com) |
| **Phi-3 model** | —   | Pulled via Ollama |

### Install Ollama & pull the model:

```bash
# Install Ollama from https://ollama.com, then:
ollama pull phi3
```

---

## 🚀 Quick Start

### 1. Install Dependencies

```bash
# Backend dependencies
cd echomesh
npm install

# Frontend dependencies
cd frontend
npm install
```

### 2. Start Ollama

```bash
ollama serve
```

### 3. Start the 3 Mesh Device Nodes (separate terminals)

```bash
# Terminal 1 — Medical Device
node device.js 4001 knowledge_medical.json DeviceA

# Terminal 2 — Shelter Device
node device.js 4002 knowledge_shelter.json DeviceB

# Terminal 3 — Maps Device
node device.js 4003 knowledge_maps.json DeviceC
```

### 4. Start the Router (Coordinator + SOS Relay + Static Server)

```bash
# Terminal 4
node router.js
```

### 5. Start the React AI Mesh Frontend

```bash
# Terminal 5
cd frontend
npm run dev
```

---

## 🚨 Emergency SOS Flow & Demo

EchoMesh includes two standalone, zero-dependency emergency interfaces served directly from the router:

### 1. Panic Button (`sos.html`)
- **URL:** `http://<laptop-ip>:4000/sos.html` (or `http://localhost:4000/sos.html`)
- **Persona:** Child / Victim in an emergency.
- **Features:**
  - One-tap large red SOS button with pulsing radar animation.
  - Asks user name once and saves to `localStorage`.
  - Captures browser Geolocation (`navigator.geolocation`) with high accuracy (falls back gracefully if denied/timed out).
  - Auto-retries every 5 seconds if offline.
  - Built-in 30-second spam/rate-limiting protection.
  - Visual feedback: *"Signal Sent — 3 devices notified"*.

### 2. Rescue Dashboard (`rescue-dashboard.html`)
- **URL:** `http://<laptop-ip>:4000/rescue-dashboard.html` (or `http://localhost:4000/rescue-dashboard.html`)
- **Persona:** Rescue worker / Emergency Response Team.
- **Features:**
  - Auto-polls `GET /sos-list` every 5 seconds.
  - Real-time active alerts shown as high-priority red cards with sender name, relative timestamp (*"2 min ago"*), and direct Google Maps coordinate links (`https://www.google.com/maps?q=LAT,LONG`).
  - **"Mark Resolved"** button calls `POST /sos-resolve/:id`.
  - Resolved alerts collapse neatly into a history section.

---

## 📱 Mobile Demo Setup (Local WiFi)

### Step 1: Find your Laptop's Local IP

**Windows:**
```powershell
ipconfig
# Note your WiFi IPv4 Address (e.g. 192.168.1.15)
```

**macOS / Linux:**
```bash
ifconfig | grep "inet "
# Or:
ip addr show | grep "inet "
```

### Step 2: Configure Router IP in HTML & Env (if connecting from phone)

- In `public/sos.html`: edit `const ROUTER_URL = 'http://<YOUR_IP>:4000';`
- In `public/rescue-dashboard.html`: edit `const ROUTER_URL = 'http://<YOUR_IP>:4000';`
- In `frontend/.env.local`: set `VITE_ROUTER_URL=http://<YOUR_IP>:4000`

### Step 3: Open on Phones connected to same WiFi Hotspot

- **Phone 1 (Victim):** `http://<YOUR_IP>:4000/sos.html`
- **Phone 2 (Rescuer):** `http://<YOUR_IP>:4000/rescue-dashboard.html`
- **Phone 3 or Laptop (Q&A):** `http://<YOUR_IP>:5173`

---

## 🌐 API Reference

### Router (port 4000)

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/ask` | Broadcasts QA query to devices, combines responses via Ollama. Body: `{ "question": "..." }` |
| GET | `/status` | Live connection health of all mesh nodes |
| POST | `/sos` | Triggers SOS broadcast. Body: `{ "deviceName", "latitude", "longitude", "message" }` |
| GET | `/sos-list` | Returns active and resolved SOS entries |
| POST | `/sos-resolve/:id` | Marks specific SOS alert as `RESOLVED` |

### Device Nodes (ports 4001–4003)

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/query` | Keyword RAG search + local Ollama answer. Body: `{ "question": "..." }` |
| GET | `/health` | Node health, name, and specialty tag |
| POST | `/sos-alert` | Receives relayed SOS alert and logs with `🚨` to console |

---

## 📁 Project Structure

```
echomesh/
├── device.js                 # Express server per node (QA + SOS alert listener)
├── router.js                 # Coordinator (QA router + SOS relay + static file server)
├── rag.js                    # Keyword matching retrieval
├── knowledge_medical.json    # Medical first-aid data
├── knowledge_shelter.json    # Shelter & water data
├── knowledge_maps.json       # Evacuation routes & locations
├── package.json              # Backend dependencies
├── public/                   # Standalone Zero-Build Emergency Pages
│   ├── sos.html              # Panic button UI (GPS + one-tap broadcast)
│   └── rescue-dashboard.html # Emergency response command center
└── frontend/                 # React + Vite + Tailwind AI Mesh UI
    ├── src/
    │   ├── App.jsx           # Centralized mesh visualization & query flow
    │   ├── components/       # MeshVisualization, DeviceNode, QueryInput, etc.
    │   └── hooks/            # useMeshStatus, useMeshQuery
    └── package.json
```

---

## 🔮 Production Vision

This local WiFi setup simulates a mesh network for hackathon demos. In production:
- **Zero-Infrastructure Mesh:** Use Bluetooth Low Energy (BLE) & Wi-Fi Direct (via Android Nearby Connections API) to hop packets across kilometers of disconnected devices.
- **Store-and-Forward:** Offline devices store SOS signals and opportunistic forward them to any newly encountered peer.
- **Embedded LLMs:** Deploy quantized GGUF models directly on edge smartphones.

---

## 🏆 Hackathon Demo Tips

1. **Terminal Visibility:** Position the 3 device terminals so judges can see the `🚨🚨🚨 SOS ALERT RECEIVED 🚨🚨🚨` pop up simultaneously across all nodes when the SOS button is tapped on a phone.
2. **Dashboard Realtime:** Keep `rescue-dashboard.html` open on a laptop or tablet to show the immediate appearance of the active alert and Google Maps link.
3. **Resilience Test:** Kill one device server (`Ctrl+C`) to demonstrate that the router's `Promise.allSettled` broadcast still delivers alerts to surviving nodes without crashing.
