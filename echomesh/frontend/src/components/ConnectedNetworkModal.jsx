import React from 'react';

/**
 * ConnectedNetworkModal
 * Displays an ultra-clean, spacious breakdown of all 9 connected mesh network devices.
 * Designed with generous padding (p-5 to p-6) and clear categorization so it never looks messy.
 */
export default function ConnectedNetworkModal({
  isOpen,
  onClose,
  meshStatus = {},
  lang = 'en',
  onOpenBleModal,
  onNavigateToMap
}) {
  if (!isOpen) return null;

  const isHindi = lang === 'hi';

  const {
    devices = [],
    peers = [],
    bluetoothPeers = [],
    connectedClients = []
  } = meshStatus;

  // Real or simulated connected micro-stations
  const stationList = [
    {
      id: 'stationA',
      name: isHindi ? 'चिकित्सा सहायता स्टेशन (Device A)' : 'Medical Aid Station (Device A)',
      spec: 'Port 4001 • Direct Hop (0) • Ping: 3ms',
      desc: isHindi ? 'प्राथमिक चिकित्सा गाइड, सीपीआर निर्देश व जीवनरक्षक औषधि डेटाबेस।' : 'Emergency triage, CPR guides & vital medicines stock.',
      icon: '🏥',
      badge: isHindi ? 'सक्रिय (Online)' : 'Online',
      badgeColor: 'bg-[#E8F5E9] text-[#198754] border-[#198754]/30'
    },
    {
      id: 'stationB',
      name: isHindi ? 'राहत शिविर व आश्रय (Device B)' : 'Relief & Shelter Camp (Device B)',
      spec: 'Port 4002 • Multi-Hop (1 Hop) • Ping: 8ms',
      desc: isHindi ? 'सुरक्षित शरणस्थल, पेयजल वितरण केंद्र व आपातकालीन राशन भंडार।' : 'Evacuation camp locations, potable water points & rations.',
      icon: '⛺',
      badge: isHindi ? 'सक्रिय (Online)' : 'Online',
      badgeColor: 'bg-[#E8F5E9] text-[#198754] border-[#198754]/30'
    },
    {
      id: 'stationC',
      name: isHindi ? 'सुरक्षित मार्ग व मैप (Device C)' : 'Safe Corridors & Maps (Device C)',
      spec: 'Port 4003 • Multi-Hop (1 Hop) • Ping: 11ms',
      desc: isHindi ? 'निकासी कॉरिडोर, अवरुद्ध सड़कों की चेतावनी व सुरक्षित निकास पथ।' : 'Clear exit routes, debris hazards & evacuation pathways.',
      icon: '🗺️',
      badge: isHindi ? 'सक्रिय (Online)' : 'Online',
      badgeColor: 'bg-[#E8F5E9] text-[#198754] border-[#198754]/30'
    }
  ];

  // Connected Phone & Field Laptop Clients (4 devices)
  const clientList = [
    {
      id: 'client1',
      name: isHindi ? 'फील्ड रेस्क्यू वर्कर 01 (Android)' : 'Field Responder 01 (Android)',
      spec: 'IP: 192.168.4.15 • WiFi P2P Direct • RSSI: -58 dBm',
      role: isHindi ? 'खोज व बचाव दल (सर्च एवं रेस्क्यू यूनिट)' : 'Search & Rescue First Responder Unit',
      battery: '88%',
      icon: '📱'
    },
    {
      id: 'client2',
      name: isHindi ? 'नागरिक सहायता नोड (Apple iPhone)' : 'Citizen Node (Apple iPhone)',
      spec: 'IP: 192.168.4.22 • WiFi Mesh Relay • RSSI: -67 dBm',
      role: isHindi ? 'नागरिक स्थिति रिपोर्टर व SOS सिग्नल रिले' : 'Citizen Status Reporter & SOS Relay Point',
      battery: '74%',
      icon: '📱'
    },
    {
      id: 'client3',
      name: isHindi ? 'कंट्रोल पोस्ट लैपटॉप (Civil Defense)' : 'Control Post Laptop (Civil Defense)',
      spec: 'IP: 192.168.4.5 • Hotspot Bridge • RSSI: -42 dBm',
      role: isHindi ? 'केंद्रीय आपदा समन्वय व ब्लॉकचेन सत्यापन' : 'Command Center & Ledger Audit Host',
      battery: '100%',
      icon: '💻'
    },
    {
      id: 'client4',
      name: isHindi ? 'वर्तमान होस्ट टर्मिनल (This Device)' : 'Local Host Terminal (This Device)',
      spec: '127.0.0.1:4000 • EchoMesh Root Master • Localhost',
      role: isHindi ? 'PHI3 AI स्थानीय ट्राइएज व मेश गेटवे रूट' : 'PHI3 AI Local Triage & Mesh Gateway Root',
      battery: '100%',
      icon: '📡'
    }
  ];

  // Bluetooth Low-Energy Relays (2 nodes)
  const bleList = [
    {
      id: 'ble1',
      name: 'EchoMesh-Relay-Alpha',
      spec: 'BLE 5.2 GATT • RSSI: -64 dBm (High Quality)',
      role: isHindi ? 'ऑफलाइन शॉर्ट-रेंज ब्लूटूथ पैकेट फॉरवर्डिंग' : 'Offline Short-Range BLE Distress Packet Forwarding',
      icon: '🔵'
    },
    {
      id: 'ble2',
      name: 'EchoMesh-Relay-Beta',
      spec: 'BLE 5.0 GATT • RSSI: -76 dBm (Stable Signal)',
      role: isHindi ? 'बैकअप आपातकालीन ब्लूटूथ चैनल' : 'Secondary Fallback BLE Emergency Channel',
      icon: '🔵'
    }
  ];

  const totalCount = stationList.length + clientList.length + bleList.length; // 9

  return (
    <div
      className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 overflow-y-auto animate-fade-in"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className="bg-white rounded-3xl max-w-2xl w-full border border-slate-200 shadow-2xl overflow-hidden animate-scale-up my-auto"
        style={{ height: '640px', maxHeight: '88vh', display: 'flex', flexDirection: 'column' }}
      >
        
        {/* 1. MODAL HEADER (Fixed Top with Generous Padding) */}
        <div className="flex-shrink-0 px-6 pt-5 pb-4 border-b border-slate-100 flex items-start justify-between gap-3 bg-white">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 border border-blue-100 text-[#0D6EFD] flex items-center justify-center text-2xl flex-shrink-0 shadow-2xs">
              📡
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight">
                  {isHindi ? 'जुड़े हुए नेटवर्क उपकरण' : 'Connected Mesh Network Devices'}
                </h3>
                <span className="px-2.5 py-0.5 rounded-full bg-blue-100 text-[#0D6EFD] text-xs font-black tracking-wider">
                  {totalCount}/{totalCount} {isHindi ? 'सक्रिय नोड्स' : 'Active Nodes'}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                {isHindi
                  ? 'स्थानीय ऑफलाइन मेश पर जुड़े सभी स्टेशनों और फील्ड उपकरणों का लाइव विवरण'
                  : 'Live status of all offline disaster micro-stations, relays & responder devices'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-slate-900 flex items-center justify-center font-bold text-base transition-all flex-shrink-0 cursor-pointer"
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        {/* 2. SUMMARY METRICS ROW (Fixed Sub-header with Proper Spacing) */}
        <div className="flex-shrink-0 px-6 py-3 bg-[#F8F9FA] border-b border-slate-100 grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          <div className="p-2.5 rounded-xl bg-white border border-slate-200 text-center shadow-2xs">
            <span className="text-[10px] font-bold text-slate-500 block uppercase tracking-wider">
              {isHindi ? 'कुल नोड्स' : 'Total Nodes'}
            </span>
            <span className="text-base font-black text-[#0D6EFD] mt-0.5 block">
              9 / 9
            </span>
          </div>

          <div className="p-2.5 rounded-xl bg-white border border-slate-200 text-center shadow-2xs">
            <span className="text-[10px] font-bold text-slate-500 block uppercase tracking-wider">
              {isHindi ? 'मेश लेटेंसी' : 'Mesh Latency'}
            </span>
            <span className="text-base font-black text-[#198754] mt-0.5 block">
              &lt; 12ms
            </span>
          </div>

          <div className="p-2.5 rounded-xl bg-white border border-slate-200 text-center shadow-2xs">
            <span className="text-[10px] font-bold text-slate-500 block uppercase tracking-wider">
              {isHindi ? 'मेश कवरेज' : 'Coverage'}
            </span>
            <span className="text-base font-black text-slate-800 mt-0.5 block">
              850m P2P
            </span>
          </div>

          <div className="p-2.5 rounded-xl bg-white border border-slate-200 text-center shadow-2xs">
            <span className="text-[10px] font-bold text-slate-500 block uppercase tracking-wider">
              {isHindi ? 'सुरक्षा' : 'Security'}
            </span>
            <span className="text-base font-black text-amber-600 mt-0.5 block">
              SHA-256
            </span>
          </div>
        </div>

        {/* 3. SCROLLABLE DEVICE LIST CONTAINER (Ample Breathing Room & Padding) */}
        <div className="overflow-y-auto px-6 py-5 space-y-6" style={{ flex: '1 1 0px', minHeight: 0 }}>
          
          {/* SECTION 1: EMERGENCY MICRO-STATIONS (3 STATIONS) */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-black uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                <span>🚨</span>
                <span>{isHindi ? 'आपातकालीन माइक्रो-स्टेशन (3 मुख्य रिले)' : 'Emergency Micro-Stations (3 Core Relays)'}</span>
              </h4>
              <span className="text-[11px] text-slate-400 font-semibold">
                {isHindi ? 'ज्ञान भंडार स्टेशन' : 'Disaster Knowledge Base'}
              </span>
            </div>

            <div className="space-y-3">
              {stationList.map((station) => (
                <div
                  key={station.id}
                  className="p-4 sm:p-5 rounded-2xl border border-slate-200 bg-[#F8FAFB] hover:border-blue-300 hover:shadow-xs transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div className="flex items-start gap-3.5">
                    <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-xl flex-shrink-0 shadow-2xs">
                      {station.icon}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h5 className="text-sm font-bold text-slate-900">
                          {station.name}
                        </h5>
                      </div>
                      <p className="text-xs text-blue-600 font-mono font-semibold mt-0.5">
                        {station.spec}
                      </p>
                      <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                        {station.desc}
                      </p>
                    </div>
                  </div>

                  <div className="flex-shrink-0 self-start sm:self-center">
                    <span className="px-3 py-1 rounded-full text-[11px] font-black bg-[#E8F5E9] text-[#198754] border border-[#198754]/30 flex items-center gap-1.5 shadow-2xs">
                      <span className="w-2 h-2 rounded-full bg-[#198754] inline-block animate-pulse" />
                      {station.badge}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* SECTION 2: CONNECTED CLIENTS & SMARTPHONES (4 CLIENTS) */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-black uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                <span>📱</span>
                <span>{isHindi ? 'जुड़े हुए मोबाइल फोन व लैपटॉप (4 उपकरण)' : 'Connected Mobile & Laptop Clients (4 Devices)'}</span>
              </h4>
              <span className="text-[11px] text-slate-400 font-semibold">
                {isHindi ? 'फील्ड दल व नागरिक' : 'Responders & Civilians'}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {clientList.map((client) => (
                <div
                  key={client.id}
                  className="p-4 rounded-2xl border border-slate-200 bg-white hover:border-blue-300 hover:shadow-xs transition-all space-y-2 shadow-2xs"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{client.icon}</span>
                      <h5 className="text-xs font-bold text-slate-900 leading-tight">
                        {client.name}
                      </h5>
                    </div>
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-blue-100 text-[#0D6EFD]">
                      🔋 {client.battery}
                    </span>
                  </div>

                  <p className="text-[11px] text-slate-500 font-mono">
                    {client.spec}
                  </p>
                  <p className="text-[11px] text-slate-600 font-medium">
                    {client.role}
                  </p>

                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px]">
                    <span className="text-slate-400">{isHindi ? 'स्थिति' : 'Status'}</span>
                    <span className="text-[#198754] font-bold flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#198754]" />
                      {isHindi ? 'सक्रिय (Active)' : 'Connected'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* SECTION 3: BLUETOOTH LOW-ENERGY RELAYS (2 NODES) */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-black uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                <span>🔵</span>
                <span>{isHindi ? 'ब्लूटूथ लो-एनर्जी (BLE) रिले (2 नोड्स)' : 'Bluetooth Low-Energy Relays (2 Nodes)'}</span>
              </h4>
              <span className="text-[11px] text-slate-400 font-semibold">
                {isHindi ? 'शॉर्ट-रेंज बैकअप' : 'Short-Range Fallback'}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {bleList.map((ble) => (
                <div
                  key={ble.id}
                  className="p-4 rounded-2xl border border-slate-200 bg-[#F8FAFB] hover:border-blue-300 hover:shadow-xs transition-all space-y-1.5 shadow-2xs"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="text-base">{ble.icon}</span>
                      <h5 className="text-xs font-bold text-slate-900 leading-tight">
                        {ble.name}
                      </h5>
                    </div>
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-[#E8F5E9] text-[#198754]">
                      {isHindi ? 'लिंक्ड' : 'Linked'}
                    </span>
                  </div>

                  <p className="text-[11px] text-slate-500 font-mono">
                    {ble.spec}
                  </p>
                  <p className="text-[11px] text-slate-600 font-medium">
                    {ble.role}
                  </p>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* 4. MODAL ACTION FOOTER (Fixed Bottom with Generous Padding) */}
        <div
          className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3"
          style={{ flexShrink: 0, minHeight: '68px' }}
        >
          <div className="flex items-center gap-2 w-full sm:w-auto">
            {onNavigateToMap && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onNavigateToMap();
                }}
                className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl bg-blue-50 hover:bg-blue-100 text-[#0D6EFD] border border-blue-200 text-xs font-bold transition-all hover:scale-105 active:scale-95 cursor-pointer flex items-center justify-center gap-1.5 shadow-2xs"
              >
                <span>🗺️</span>
                <span>{isHindi ? 'टैक्टिकल रडार पर देखें' : 'View on Tactical Radar'}</span>
              </button>
            )}

            {onOpenBleModal && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenBleModal();
                }}
                className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 text-xs font-bold transition-all hover:scale-105 active:scale-95 cursor-pointer flex items-center justify-center gap-1.5"
              >
                <span>🔵</span>
                <span>{isHindi ? 'ब्लूटूथ पेयर करें' : 'Pair New Device'}</span>
              </button>
            )}
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-[#0D6EFD] hover:bg-blue-700 active:scale-95 text-white text-xs font-bold transition-all cursor-pointer shadow-xs"
          >
            {isHindi ? 'बंद करें' : 'Close'}
          </button>
        </div>

      </div>
    </div>
  );
}
