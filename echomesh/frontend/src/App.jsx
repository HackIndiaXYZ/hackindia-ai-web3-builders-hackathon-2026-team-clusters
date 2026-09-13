import React, { useState, useEffect } from 'react';
import SosModal from './components/SosModal.jsx';
import IncomingSosModal from './components/IncomingSosModal.jsx';
import BluetoothScanModal from './components/BluetoothScanModal.jsx';
import LightDashboard from './components/LightDashboard.jsx';
import EchoMeshLanding from './components/EchoMeshLanding.jsx';
import { useMeshStatus } from './hooks/useMeshStatus.js';
import { useIncomingSos } from './hooks/useIncomingSos.js';
import { useAiChat } from './hooks/useAiChat.js';

export default function App() {
  const meshStatus = useMeshStatus();
  const {
    peers,
    bluetoothPeers,
    connectedClients,
    peerToast,
    dismissPeerToast,
    refresh: refreshStatus
  } = meshStatus;

  const incomingSosData = useIncomingSos();
  const {
    activeSosList,
    incomingSos,
    isAlertModalOpen,
    isSirenSounding,
    muteSiren,
    dismissAlert,
    resolveSos,
    userLocation
  } = incomingSosData;

  // AI Chat state (local Ollama phi3)
  const aiChatData = useAiChat();

  const [isSosOpen, setIsSosOpen] = useState(false);
  const [isBleModalOpen, setIsBleModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('home');

  // Default to Hack India 2026 EchoMesh Landing Page, with seamless live app toggle
  const [viewMode, setViewMode] = useState(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      return params.get('view') === 'app' ? 'app' : 'landing';
    } catch (e) {
      return 'landing';
    }
  });

  // Manage background style based on view
  useEffect(() => {
    if (viewMode === 'landing') {
      document.body.style.backgroundColor = '#0A1628';
      document.body.style.color = '#FFFFFF';
    } else {
      document.body.style.backgroundColor = '#EDEDEA';
      document.body.style.color = '#0A0A0A';
    }
  }, [viewMode]);

  // Auto-dismiss peer connection toast after 5 seconds
  useEffect(() => {
    if (peerToast) {
      const timer = setTimeout(() => {
        if (dismissPeerToast) dismissPeerToast();
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [peerToast, dismissPeerToast]);

  return (
    <div className="w-full min-h-screen flex flex-col">
      {/* Real-time Peer Toast Notification */}
      {peerToast && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 animate-scale-up">
          <div className={`px-4 py-2.5 rounded-xl border shadow-lg flex items-center gap-2.5 text-xs font-bold ${
            peerToast.type === 'connect'
              ? 'bg-[#E8F5E9] border-[#198754] text-[#198754]'
              : 'bg-[#FFF3CD] border-[#FFC107] text-[#856404]'
          }`}>
            <span>{peerToast.type === 'connect' ? '✅' : '⚠️'}</span>
            <span>{peerToast.text}</span>
            <button onClick={dismissPeerToast} className="ml-2 text-xs opacity-60 hover:opacity-100 cursor-pointer">✕</button>
          </div>
        </div>
      )}

      {/* Global Modals for SOS, Bluetooth, and Incoming alerts */}
      <SosModal isOpen={isSosOpen} onClose={() => setIsSosOpen(false)} />
      
      <IncomingSosModal
        isOpen={isAlertModalOpen}
        sos={incomingSos}
        activeSosList={activeSosList}
        userLocation={userLocation}
        isSirenSounding={isSirenSounding}
        onMute={muteSiren}
        onDismiss={dismissAlert}
        onResolve={resolveSos}
        onOpenMap={() => {
          setViewMode('app');
          setActiveTab('map');
        }}
      />
      
      <BluetoothScanModal
        isOpen={isBleModalOpen}
        onClose={() => setIsBleModalOpen(false)}
        peers={peers}
        bluetoothPeers={bluetoothPeers}
        connectedClients={connectedClients}
        onRefresh={refreshStatus}
      />

      {/* ── Main View: Landing Page or Live Mesh App ── */}
      {viewMode === 'landing' ? (
        <EchoMeshLanding
          onLaunchDemo={(tab) => {
            setViewMode('app');
            if (typeof tab === 'string') setActiveTab(tab);
          }}
          onOpenSos={() => setIsSosOpen(true)}
          onOpenBle={() => setIsBleModalOpen(true)}
          peers={peers}
          bluetoothPeers={bluetoothPeers}
          connectedClients={connectedClients}
          userLocation={userLocation}
        />
      ) : (
        <div className="w-full min-h-screen bg-[#EDEDEA] text-[#0A0A0A] flex flex-col">
          {/* Top Bar Return to Landing Page */}
          <div className="w-full bg-[#0A1628] text-white px-4 sm:px-8 py-2.5 flex items-center justify-between border-b border-[#142238] text-xs font-bold">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#39D98A] animate-pulse" />
              <span>LIVE MESH OPERATIONAL DASHBOARD</span>
            </div>
            <button
              type="button"
              onClick={() => setViewMode('landing')}
              className="px-3 py-1 rounded-lg bg-[#142238] hover:bg-[#1E3250] text-[#39D98A] border border-[#39D98A]/40 font-mono text-xs uppercase tracking-wider transition-colors cursor-pointer"
            >
              ← Back to Overview Landing Page
            </button>
          </div>

          <LightDashboard
            meshStatus={meshStatus}
            incomingSosData={incomingSosData}
            aiChatData={aiChatData}
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            onOpenSosModal={() => setIsSosOpen(true)}
            onOpenBleModal={() => setIsBleModalOpen(true)}
            themeMode="light"
          />
        </div>
      )}
    </div>
  );
}

