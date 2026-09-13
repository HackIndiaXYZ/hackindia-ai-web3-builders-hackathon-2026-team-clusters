# 🚀 EchoMesh Deployment Guide

EchoMesh can be deployed in 3 different ways depending on your use case:

---

## Option 1: True Offline Field / Hotspot Deployment (Recommended for Hackathons & Disaster Simulations)

Since EchoMesh is designed for zero-internet disaster environments, you can host the entire mesh directly on your laptop or a Raspberry Pi / local server:

1. **Build the production frontend:**
   ```bash
   npm run build
   ```
2. **Start the complete mesh network (Router + Device A + Device B + Device C):**
   ```bash
   npm start
   ```
3. **Connect devices on local WiFi / Hotspot:**
   - Turn on your laptop or phone's **Mobile Hotspot**.
   - Check your laptop's local IP (run `ipconfig` on Windows or `ifconfig` on Mac/Linux, e.g. `192.168.1.5`).
   - Anyone on the hotspot can open in their phone's browser:
     - **Main Web App & AI Mesh**: `http://<your-ip>:4000`
     - **Tactical Map**: `http://<your-ip>:4000` (Map Tab)
     - **Rescue Command Dashboard**: `http://<your-ip>:4000/rescue-dashboard.html`
     - **Panic SOS Beacon**: `http://<your-ip>:4000/sos.html`

---

## Option 2: Cloud Deployment on Render / Railway / VPS (1-Click Unified Deploy)

1. **Push your code to GitHub.**
2. **On Render (render.com) or Railway (railway.app):**
   - Click **New Web Service** -> Select your EchoMesh GitHub repo.
   - **Build Command**: `npm run build`
   - **Start Command**: `npm start`
   - **Environment Variable**: `PORT=4000` (or auto-assigned)
3. Render/Railway will build the React app and launch the unified mesh router.

---

## Option 3: Frontend on Vercel + Backend on Render/Tunnel

1. **Deploy Frontend on Vercel:**
   - Connect your GitHub repo to [Vercel](https://vercel.com).
   - Set **Root Directory** to `frontend`.
   - Set Environment Variable: `VITE_ROUTER_URL=https://your-backend-url.onrender.com` (or your Ngrok tunnel).
2. **Deploy Backend on Render or VPS:**
   - Run `node router.js`

---

## Option 4: Quick Public Demo with Ngrok / Cloudflare Tunnel

To share a live working public link with judges or remote teammates with 1 command:
```bash
npx ngrok http 4000
```
This gives you a public HTTPS URL (e.g. `https://abc123.ngrok-free.app`) that anyone around the world can open on their mobile phone to test SOS beacons, radar dual pins, voice queries, and live sirens!
