import React, { useRef, useEffect, useState } from 'react';
import DeviceNode from './DeviceNode.jsx';

export default function MeshVisualization({ devices, phase, contributingDevices, bluetoothPeers = [], routingTable = [], lostRoutes = [] }) {
  const containerRef = useRef(null);
  const [lines, setLines] = useState([]);
  const routerRef = useRef(null);
  const deviceRefs = useRef([]);

  useEffect(() => {
    function calcLines() {
      if (!containerRef.current || !routerRef.current) return;
      const containerRect = containerRef.current.getBoundingClientRect();
      const routerRect = routerRef.current.getBoundingClientRect();

      const routerCenter = {
        x: routerRect.left - containerRect.left + routerRect.width / 2,
        y: routerRect.top - containerRect.top + routerRect.height / 2
      };

      const newLines = deviceRefs.current.map((ref, i) => {
        if (!ref) return null;
        const rect = ref.getBoundingClientRect();
        return {
          x1: routerCenter.x,
          y1: routerCenter.y,
          x2: rect.left - containerRect.left + rect.width / 2,
          y2: rect.top - containerRect.top + rect.height / 2,
          index: i
        };
      }).filter(Boolean);

      setLines(newLines);
    }

    calcLines();
    window.addEventListener('resize', calcLines);
    const t1 = setTimeout(calcLines, 300);
    const t2 = setTimeout(calcLines, 800);
    return () => {
      window.removeEventListener('resize', calcLines);
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [devices]);

  const isDeviceContributing = (device) => {
    if (!contributingDevices || !device || !device.name) return false;
    return contributingDevices.includes(device.name);
  };

  const getLineColor = (index) => {
    const device = devices?.[index];
    if (!device) return '#162033';
    if (phase === 'done' && isDeviceContributing(device)) return '#14b8a6';
    if ((phase === 'querying' || phase === 'synthesizing')) return '#06b6d4';
    if (phase === 'routing') return '#0e7490';
    return device.status === 'online' ? '#1e3a5f' : '#162033';
  };

  return (
    <div ref={containerRef} className="relative w-full flex flex-col items-center">
      {/* SVG Connecting Lines */}
      <svg
        className="absolute inset-0 w-full h-full pointer-events-none"
        style={{ zIndex: 1 }}
      >
        <defs>
          <filter id="glow">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
        {lines.map((line, i) => (
          <g key={i}>
            <line
              x1={line.x1} y1={line.y1}
              x2={line.x2} y2={line.y2}
              stroke={getLineColor(i)}
              strokeWidth={devices[i]?.status === 'online' ? 2 : 1}
              className="mesh-line"
              strokeOpacity={0.7}
            />
            {(phase === 'querying' || phase === 'synthesizing' || phase === 'routing') && (
              <line
                x1={line.x1} y1={line.y1}
                x2={line.x2} y2={line.y2}
                stroke="#06b6d4"
                strokeWidth={3}
                className="query-line-active"
                style={{ animationDelay: `${i * 0.2}s` }}
                strokeOpacity={0.9}
                filter="url(#glow)"
              />
            )}
          </g>
        ))}
      </svg>

      {/* Router Node — centered */}
      <div className="mb-20 sm:mb-28 relative" style={{ zIndex: 2 }}>
        <div
          ref={routerRef}
          className={`
            glass-card px-6 py-4 sm:px-8 sm:py-5 flex items-center gap-4 transition-mesh
            ${phase === 'routing' || phase === 'synthesizing' ? 'glow-cyan-strong scale-105' : 'glow-cyan'}
          `}
        >
          <div className={`text-2xl sm:text-3xl ${phase === 'routing' || phase === 'synthesizing' ? 'animate-pulse' : ''}`}>
            🔀
          </div>
          <div className="text-center">
            <h2 className="font-bold text-base sm:text-lg text-text-primary">
              Query Router
            </h2>
            <p className="text-[11px] sm:text-xs font-mono text-cyan-glow uppercase tracking-wider">
              {phase === 'routing' ? 'Routing query...'
                : phase === 'querying' ? 'Awaiting responses...'
                : phase === 'synthesizing' ? 'Synthesizing...'
                : 'Mesh Coordinator'}
            </p>
          </div>
          {phase !== 'idle' && phase !== 'done' && (
            <div className="w-2.5 h-2.5 rounded-full bg-cyan-glow animate-pulse ml-1" />
          )}
        </div>
      </div>

      {/* Device Nodes — 3 equal columns, centered */}
      <div className="w-full grid grid-cols-1 sm:grid-cols-3 gap-5 sm:gap-8 relative" style={{ zIndex: 2 }}>
        {devices.map((device, i) => (
          <div key={device.url || i} ref={el => deviceRefs.current[i] = el}>
            <DeviceNode
              device={device}
              isActive={phase === 'querying' || phase === 'synthesizing'}
              isContributing={isDeviceContributing(device)}
              index={i}
            />
          </div>
        ))}
      </div>

      {/* Bluetooth Multi-Hop Satellite Nodes Section */}
      {bluetoothPeers.length > 0 && (
        <div className="mt-10 w-full flex flex-col items-center relative z-10 animate-fade-in">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-950/40 border border-blue-500/30 text-xs font-mono text-blue-300 shadow-md">
            <span className="w-2 h-2 rounded-full bg-blue-400 animate-ping" />
            <span>🔵 Bluetooth Multi-Hop Relay Active ({bluetoothPeers.length} Nodes Linked)</span>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3 mt-3">
            {bluetoothPeers.map(p => (
              <div
                key={p.id}
                className="flex items-center gap-2.5 px-3.5 py-2 rounded-xl bg-[#0f172a]/90 border border-blue-400/40 text-xs font-mono shadow-lg hover:border-blue-400 transition-mesh"
              >
                <span className="text-base">📱</span>
                <div>
                  <span className="font-bold text-white block">{p.deviceName}</span>
                  <span className="text-[10px] text-blue-300">Hop {p.hopCount} · via {p.relayedBy}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Multi-Hop Routing Table — Indirect paths via relay nodes */}
      {(routingTable.length > 0 || lostRoutes.length > 0) && (
        <div className="mt-8 w-full flex flex-col items-center relative z-10 animate-fade-in">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-violet-950/40 border border-violet-500/30 text-xs font-mono text-violet-300 shadow-md mb-3">
            <span className="w-2 h-2 rounded-full bg-violet-400 animate-pulse" />
            <span>🛜 Mesh Routing Table — {routingTable.length} Indirect Path{routingTable.length !== 1 ? 's' : ''} Active</span>
          </div>

          {/* Broken Route Warning Banner */}
          {lostRoutes.length > 0 && (
            <div className="mb-3 flex items-center gap-2 px-4 py-2 rounded-xl bg-red-950/40 border border-red-500/40 text-xs font-mono text-red-300 animate-pulse shadow-md">
              <span className="text-base">🔴</span>
              <div>
                <span className="font-bold block">Relay node offline — route broken!</span>
                <span className="text-[10px] text-red-400">
                  Lost: {lostRoutes.join(', ')} · Auto-reconnecting...
                </span>
              </div>
              <div className="ml-2 flex gap-1">
                {[0,1,2].map(i => (
                  <div key={i} className="w-1.5 h-1.5 rounded-full bg-red-400"
                    style={{ animationDelay: `${i * 0.2}s`, animation: 'pulse 1s infinite' }} />
                ))}
              </div>
            </div>
          )}

          <div className="flex flex-wrap items-center justify-center gap-3">
            {routingTable.map((route, i) => (
              <div
                key={route.nodeId || i}
                className="flex items-center gap-2.5 px-3.5 py-2 rounded-xl bg-[#0f0f1a]/90 border border-violet-500/30 text-xs font-mono shadow-lg hover:border-violet-400 transition-mesh"
              >
                {/* Hop count badge */}
                <div className="flex items-center justify-center w-6 h-6 rounded-full bg-violet-900/60 border border-violet-500/50 text-violet-300 font-bold text-[10px]">
                  {route.hops}
                </div>
                <div>
                  <span className="font-bold text-white block truncate max-w-[120px]">
                    {route.nodeId}
                  </span>
                  <span className="text-[10px] text-violet-300">
                    via {route.via} · {route.hops} hop{route.hops > 1 ? 's' : ''}
                  </span>
                </div>
                {/* Animated relay dots */}
                <div className="flex gap-0.5 items-center">
                  {Array.from({ length: Math.min(route.hops, 4) }).map((_, hi) => (
                    <div
                      key={hi}
                      className="w-1.5 h-1.5 rounded-full bg-violet-400"
                      style={{ opacity: 1 - hi * 0.2, animationDelay: `${hi * 0.15}s` }}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* No central server reminder */}
          <p className="mt-3 text-[10px] font-mono text-violet-400/60 tracking-wider uppercase">
            ✦ Decentralized · No central server · Peer-to-peer relay
          </p>
        </div>
      )}
    </div>
  );
}
