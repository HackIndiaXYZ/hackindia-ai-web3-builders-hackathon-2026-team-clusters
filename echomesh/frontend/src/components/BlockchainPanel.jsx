import React, { useState, useEffect, useCallback } from 'react';
import { ROUTER_URL } from '../config.js';

// ── Blockchain Panel — EchoMesh SHA-256 Permissioned Ledger ──
export default function BlockchainPanel() {
  const [chain,    setChain]    = useState([]);
  const [stats,    setStats]    = useState(null);
  const [validity, setValidity] = useState(null);
  const [filter,   setFilter]   = useState('ALL');
  const [loading,  setLoading]  = useState(true);
  const [expanded, setExpanded] = useState(null); // expanded block index

  const fetchChain = useCallback(async () => {
    try {
      const url = filter === 'ALL'
        ? `${ROUTER_URL}/api/blockchain`
        : `${ROUTER_URL}/api/blockchain?type=${filter}`;
      const res  = await fetch(url, { signal: AbortSignal.timeout(5000) });
      const data = await res.json();
      setChain(data.chain  || []);
      setStats(data.stats  || null);
      setLoading(false);
    } catch (e) {
      setLoading(false);
    }
  }, [filter]);

  const verifyChain = useCallback(async () => {
    try {
      const res  = await fetch(`${ROUTER_URL}/api/blockchain/verify`, { signal: AbortSignal.timeout(5000) });
      const data = await res.json();
      setValidity(data);
    } catch (e) {}
  }, []);

  useEffect(() => {
    fetchChain();
    verifyChain();
    const interval = setInterval(() => { fetchChain(); verifyChain(); }, 5000);
    return () => clearInterval(interval);
  }, [fetchChain, verifyChain]);

  // ── Color per block type ──
  const typeColor = {
    GENESIS:   { bg: 'rgba(139,92,246,0.15)', border: '#8b5cf6', badge: 'bg-purple-900 text-purple-200',  icon: '🌐' },
    SOS:       { bg: 'rgba(239,68,68,0.15)',  border: '#ef4444', badge: 'bg-red-900 text-red-200',        icon: '🚨' },
    AI_QUERY:  { bg: 'rgba(6,182,212,0.15)',  border: '#06b6d4', badge: 'bg-cyan-900 text-cyan-200',      icon: '🤖' },
    NODE_JOIN: { bg: 'rgba(34,197,94,0.15)',  border: '#22c55e', badge: 'bg-green-900 text-green-200',    icon: '📡' }
  };

  const FILTERS = ['ALL', 'SOS', 'AI_QUERY', 'NODE_JOIN'];

  const displayChain = [...chain].reverse(); // newest first

  return (
    <div className="space-y-6">

      {/* ── Header ── */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            ⛓️ Permissioned Blockchain
          </h2>
          <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
            SHA-256 hashed blocks · HMAC-SHA256 digital signatures · Tamper-proof audit trail
          </p>
        </div>

        {/* Chain validity badge */}
        {validity && (
          <div className={`flex items-center gap-2 px-4 py-2 rounded-xl font-semibold text-sm border ${
            validity.valid
              ? 'bg-green-900/40 border-green-500 text-green-300'
              : 'bg-red-900/40 border-red-500 text-red-300'
          }`}>
            {validity.valid ? '✅ Chain Valid' : '⚠️ Chain Tampered!'}
            <span className="opacity-60 font-normal">{validity.blocks} blocks</span>
          </div>
        )}
      </div>

      {/* ── Stats Cards ── */}
      {stats && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {[
            { label: 'Total Blocks', value: stats.totalBlocks, icon: '📦', color: '#8b5cf6' },
            { label: 'SOS Events',   value: stats.sosBlocks,   icon: '🚨', color: '#ef4444' },
            { label: 'AI Queries',   value: stats.aiQueryBlocks, icon: '🤖', color: '#06b6d4' },
            { label: 'Nodes Joined', value: stats.nodeJoinBlocks, icon: '📡', color: '#22c55e' }
          ].map(card => (
            <div key={card.label}
              className="rounded-xl p-4 border flex flex-col gap-1"
              style={{ background: 'var(--surface-elevated)', borderColor: 'var(--border-subtle)' }}>
              <div className="text-xl">{card.icon}</div>
              <div className="text-2xl font-bold text-white">{card.value}</div>
              <div className="text-xs" style={{ color: 'var(--text-muted)' }}>{card.label}</div>
            </div>
          ))}
        </div>
      )}

      {/* ── Genesis + Latest hash display ── */}
      {stats && (
        <div className="rounded-xl p-4 border space-y-2"
          style={{ background: 'var(--surface-elevated)', borderColor: 'var(--border-subtle)' }}>
          <div className="flex items-center gap-2 text-xs flex-wrap">
            <span style={{ color: 'var(--text-muted)' }}>Genesis:</span>
            <code className="text-purple-300 font-mono">{stats.genesisHash.substring(0, 32)}...</code>
          </div>
          <div className="flex items-center gap-2 text-xs flex-wrap">
            <span style={{ color: 'var(--text-muted)' }}>Latest:</span>
            <code className="text-cyan-300 font-mono">{stats.latestHash.substring(0, 32)}...</code>
          </div>
        </div>
      )}

      {/* ── Filter tabs ── */}
      <div className="flex gap-2 flex-wrap">
        {FILTERS.map(f => (
          <button key={f}
            onClick={() => { setFilter(f); setLoading(true); }}
            className={`px-4 py-1.5 rounded-lg text-sm font-semibold border transition-all ${
              filter === f
                ? 'bg-cyan-600 border-cyan-500 text-white'
                : 'border-gray-700 text-gray-400 hover:border-gray-500 hover:text-white'
            }`}
            style={{ background: filter === f ? undefined : 'var(--surface-elevated)' }}>
            {f === 'ALL' ? '📦 All' : f === 'SOS' ? '🚨 SOS' : f === 'AI_QUERY' ? '🤖 AI' : '📡 Nodes'}
          </button>
        ))}
      </div>

      {/* ── Block List ── */}
      {loading ? (
        <div className="text-center py-12" style={{ color: 'var(--text-muted)' }}>
          <div className="text-3xl mb-2">⛓️</div>
          <div>Loading blockchain...</div>
        </div>
      ) : displayChain.length === 0 ? (
        <div className="text-center py-12 rounded-xl border"
          style={{ background: 'var(--surface-elevated)', borderColor: 'var(--border-subtle)', color: 'var(--text-muted)' }}>
          <div className="text-3xl mb-2">📭</div>
          <div>No blocks yet. Send an SOS or ask the AI to create your first block!</div>
        </div>
      ) : (
        <div className="space-y-3">
          {displayChain.map((block, idx) => {
            const tc      = typeColor[block.type] || typeColor.GENESIS;
            const isOpen  = expanded === block.index;
            return (
              <div key={block.index}
                className="rounded-xl border overflow-hidden transition-all cursor-pointer"
                style={{ background: tc.bg, borderColor: tc.border }}
                onClick={() => setExpanded(isOpen ? null : block.index)}>

                {/* Block header row */}
                <div className="flex items-center gap-3 px-4 py-3 flex-wrap">
                  <span className="text-lg">{tc.icon}</span>

                  {/* Block # */}
                  <span className="text-xs font-mono text-gray-400">#{block.index}</span>

                  {/* Type badge */}
                  <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${tc.badge}`}>
                    {block.type}
                  </span>

                  {/* Hash preview */}
                  <code className="text-xs font-mono text-gray-300 flex-1 truncate hidden sm:block">
                    {block.hash.substring(0, 40)}...
                  </code>

                  {/* Timestamp */}
                  <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
                    {new Date(block.timestamp).toLocaleTimeString()}
                  </span>

                  {/* Node */}
                  <span className="text-xs px-2 py-0.5 rounded bg-gray-800 text-gray-400 font-mono truncate max-w-[120px]">
                    {block.nodeId.split('-').slice(0, 2).join('-')}
                  </span>

                  <span className="text-gray-500 ml-auto">{isOpen ? '▲' : '▼'}</span>
                </div>

                {/* Expanded block details */}
                {isOpen && (
                  <div className="px-4 pb-4 space-y-3 border-t" style={{ borderColor: tc.border + '55' }}>
                    <div className="grid grid-cols-1 gap-2 mt-3">

                      {/* Full hash */}
                      <div className="space-y-1">
                        <div className="text-xs font-semibold text-gray-400">SHA-256 Hash</div>
                        <code className="text-xs font-mono text-green-300 break-all block">{block.hash}</code>
                      </div>

                      {/* Previous hash */}
                      <div className="space-y-1">
                        <div className="text-xs font-semibold text-gray-400">Previous Hash</div>
                        <code className="text-xs font-mono text-purple-300 break-all block">{block.previousHash}</code>
                      </div>

                      {/* Signature */}
                      <div className="space-y-1">
                        <div className="text-xs font-semibold text-gray-400">HMAC-SHA256 Signature</div>
                        <code className="text-xs font-mono text-cyan-300 break-all block">{block.signature}</code>
                      </div>

                      {/* Data payload */}
                      <div className="space-y-1">
                        <div className="text-xs font-semibold text-gray-400">Block Data</div>
                        <pre className="text-xs font-mono text-gray-300 bg-black/30 rounded p-2 overflow-auto max-h-40">
                          {JSON.stringify(block.data, null, 2)}
                        </pre>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* ── Integrity footer note ── */}
      <div className="text-xs text-center py-2" style={{ color: 'var(--text-muted)' }}>
        Each block is SHA-256 hashed and HMAC-SHA256 signed · Changing any block invalidates the entire chain
      </div>
    </div>
  );
}
