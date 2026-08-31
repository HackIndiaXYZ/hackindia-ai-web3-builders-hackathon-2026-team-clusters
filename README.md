# hackindia-ai-web3-builders-hackathon-2026-team-clusters
Hackathon team repository for Team Clusters - [hackindia-team:hackindia-ai-web3-builders-hackathon-2026:team-clusters]
# 🌐 EchoMesh — Offline AI Mesh Network for Disaster Response

> A fully offline, decentralized AI-powered mesh network and tactical SOS system built for the golden 72 hours after a disaster — when the internet goes down but the need for help doesn't.

---

## 🚨 Problem Statement

During major disasters — floods, cyclones, earthquakes, or landslides — mobile towers collapse and fiber-optic lines are severed, wiping out 4G/5G connectivity across the entire affected zone. This single point of failure disables the entire emergency-response ecosystem at once:

- **Cloud-dependent tools become completely useless.** ChatGPT, Google Maps, and even the 112 emergency helpline run on cloud infrastructure — the moment internet goes down, they drop to 0% functionality.
- **Victims have no way to call for help.** No calls connect, no messages reach rescuers or nearby volunteers — victims are effectively cut off from the outside world.
- **Rescuers cannot locate victims.** Without GPS-linked network data, finding a stranded person becomes nearly impossible, especially when multiple people are trapped across a wide area simultaneously.
- **No centralized tracking of multiple SOS signals.** When several people send distress signals at once, there's no system to consolidate who is where, how far away, and who needs to be reached first.
- **No access to survival-critical information.** Victims have no offline source to learn where clean drinking water, relief shelters, or safe routes are located.

**Core Problem:** Today's disaster-response technology assumes internet connectivity will be available — and that exact assumption fails precisely when it matters most, during the critical **golden 72 hours** after a disaster strikes.

---

## 💡 Our Solution — EchoMesh

**EchoMesh** turns ordinary smartphones and laptops in a disaster zone into a self-sustaining local rescue grid — with **zero dependency on internet or cloud servers.**

### 🔑 Core Features

**1. One-Tap / Voice SOS Beacon**
Victims can send an SOS with a single tap or by simply speaking. It's instantly broadcast over a local peer-to-peer mesh (WiFi/hotspot) to every connected device in range.

**2. Mesh-Wide Siren Alert**
The moment an SOS is triggered, a loud, penetrating dual-oscillator siren sounds on every device within range — instantly alerting nearby people that someone needs help.

**3. Live Multi-SOS Tracking & Tactical Radar Map**
EchoMesh simultaneously tracks **every active SOS signal in the zone**, not just one. Each rescuer's device displays a live radar map showing:
- 📍 Live GPS pin for every victim
- 📏 Exact distance from the rescuer (via Haversine formula, e.g. 15m, 120m)
- 🧭 Compass bearing (direction to head)

This turns scattered distress calls into a single, coordinated rescue map — showing how many people are stranded, where, and who to reach first.

**4. Offline AI Voice Assistant (Local RAG)**
Victims can ask questions by voice in Hindi — like *"paani kahan milega?"* or *"saanp katne par kya karein?"* — and get instant spoken answers from local knowledge packs, entirely offline.

**5. Offline Vector Maps**
Hardware GPS renders safe routes and danger zones directly on-device — no live map-tile downloads needed.

**6. Instant PWA Deployment**
No app-store install required. Anyone can "Add to Home Screen" via Chrome and have a fully functional app running in under 2 seconds — critical for mass adoption in a live disaster scenario.

---

## 🏗️ Technical Architecture
                                 ┌─────────────────────────────────────────┐
                   │           DISASTER AFFECTED ZONE         │
                   │          (0KB Internet Available)        │
                   └───────────────────┬───────────────────────┘
                                        │
     ┌──────────────────────────────────┴──────────────────────────────────┐
     │                                                                     │
     ▼                                                                     ▼

┌─────────────────────────────────┐ ┌─────────────────────────────────┐
│ 📱 VICTIM DEVICE (Phone A) │ ─── Local P2P Mesh ───▶│ 📱 RESCUER DEVICE (Phone B) │
│ • Speech-to-Text Voice SOS │ (WiFi/Hotspot) │ • Loud Emergency Siren Alert │
│ • Hardware Satellite GPS │ │ • Tactical Dual-Pin Radar Map │
│ • Instant 1-Tap SOS Beacon │ │ • Live Distance Ring (Haversine)│
└────────────────┬─────────────────┘ └────────────────┬────────────────┘
│ │
└──────────────────────────┬─────────────────────────────────┘
│
▼
┌─────────────────────────────────────────┐
│ 🌐 ECHOMESH UNIFIED QUERY ROUTER │
│ (Local Node Coordinator :4000) │
└───────────────────┬───────────────────────┘
│
┌───────────────────────┼───────────────────────┐
│ │ │
▼ ▼ ▼
┌────────────────────┐ ┌────────────────────┐ ┌────────────────────┐
│ 🩺 Node A (4001) │ │ 🏠 Node B (4002) │ │ 🗺️ Node C (4003) │
│ [Medical Pack] │ │ [Shelter Pack] │ │ [Maps Pack] │
│ • First Aid │ │ • Drinking Water │ │ • Safe Corridors │
│ • 24/7 Hospitals │ │ • Relief Camps │ │ • Danger Zones │
└────────────────────┘ └────────────────────┘ └────────────────────┘
│
▼
┌─────────────────────────────────────────┐
│ 🤖 LOCAL RAG & HINDI SPEECH ENGINE │
│ • Strict Hindi Natural Synthesis │
│ • Native Web Audio & SpeechSynthesis │
│ • Zero-Timeout Smart Fallback │
└─────────────────────────────────────────┘


---

## ⚙️ Tech Stack

| Layer | Technology | Function |
|---|---|---|
| **Frontend UI/UX** | React 18, Vite, TailwindCSS | 1-Tap accessible UI in Hindi + English, glassmorphic dark theme |
| **Mesh Networking** | Node.js, Express 5, Local P2P Sockets | Coordinates distributed node querying without internet |
| **Intelligence (RAG)** | Local TF-IDF & Keyword Inverted Index + Synonym Expansion, Ollama (phi3) | Matches colloquial Hindi/English queries to verified disaster facts in ~0.05s |
| **Database** | SQLite | Lightweight, offline-first local storage |
| **Voice Engine** | Web Speech API (SpeechRecognition + SpeechSynthesis) | Hindi Speech-to-Text for SOS & Text-to-Speech readout |
| **Geo-Tactical Engine** | Hardware GNSS GPS, Haversine & Bearing formulas | Computes distances & radar angles between victim and rescuer |
| **Emergency Audio** | HTML5 Web Audio API (Dual-Oscillator) | Penetrating frequency-sweep siren (960Hz ↔ 770Hz) |
| **Real-time Comms** | WebSocket | Live SOS + radar sync across mesh devices |

---

## 🌟 Key USPs

1. **Zero Internet & Zero Cloud Dependency** — No server, no AWS, no mobile data. A single laptop or phone becomes the AI coordinator for an entire affected zone.
2. **Multi-Victim Live Radar Tracking** — Not just one SOS at a time; rescuers see *every* active victim, their distance, and direction simultaneously.
3. **Natural Hindi Voice Assistance** — Built for illiterate/semi-literate users who can't type during a panic situation but can speak.
4. **2-Second PWA Deployment** — No app store, no install friction — just "Add to Home Screen."

---

## 🚀 Getting Started

```bash
# Clone the repository
git clone <repo-url>
cd echomesh

# Install dependencies
npm install

# Start the local coordinator + knowledge nodes
npm run start
```

Then open the app in Chrome and select **"Add to Home Screen"** to install it as a PWA on each device in the mesh.

---

## 👥 Team

Built for **Hack India 2026** by Team Clusters.

---

## 📜 License

This project is submitted as part of Hack India 2026 and is open for evaluation purposes.
