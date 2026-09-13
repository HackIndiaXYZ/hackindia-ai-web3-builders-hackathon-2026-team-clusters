/**
 * EchoMesh — Custom Lightweight Permissioned Blockchain
 * =====================================================
 * SHA-256 block hashing + HMAC-SHA256 digital signatures
 * Uses Node.js built-in `crypto` — zero extra dependencies
 *
 * Block Types:
 *   'SOS'        — Emergency SOS events
 *   'AI_QUERY'   — AI mesh queries & responses
 *   'NODE_JOIN'  — Mesh peer node connections
 *   'GENESIS'    — Chain origin block
 */

'use strict';

const crypto = require('crypto');

// Permissioned network secret (shared among all authorized mesh nodes)
const MESH_NETWORK_SECRET = 'echomesh-disaster-response-v2-sha256-secret';

const BLOCK_TYPES = ['GENESIS', 'SOS', 'AI_QUERY', 'NODE_JOIN'];

// ---------------------------------------
//  Block Class
// ---------------------------------------
class Block {
  constructor({ index, type, data, nodeId, previousHash }) {
    if (!BLOCK_TYPES.includes(type)) {
      throw new Error(`Invalid block type: ${type}`);
    }
    this.index        = index;
    this.timestamp    = new Date().toISOString();
    this.type         = type;
    this.data         = data;
    this.nodeId       = nodeId || 'unknown-node';
    this.previousHash = previousHash || '0'.repeat(64);
    this.signature    = this._sign();
    this.hash         = this._computeHash();
  }

  _sign() {
    const payload = `${this.nodeId}:${this.type}:${JSON.stringify(this.data)}:${this.previousHash}`;
    return crypto.createHmac('sha256', MESH_NETWORK_SECRET).update(payload).digest('hex');
  }

  _computeHash() {
    const content = JSON.stringify({
      index:        this.index,
      timestamp:    this.timestamp,
      type:         this.type,
      data:         this.data,
      nodeId:       this.nodeId,
      previousHash: this.previousHash,
      signature:    this.signature
    });
    return crypto.createHash('sha256').update(content).digest('hex');
  }

  verifySignature() {
    const expected = crypto
      .createHmac('sha256', MESH_NETWORK_SECRET)
      .update(`${this.nodeId}:${this.type}:${JSON.stringify(this.data)}:${this.previousHash}`)
      .digest('hex');
    try {
      return crypto.timingSafeEqual(Buffer.from(this.signature, 'hex'), Buffer.from(expected, 'hex'));
    } catch (e) {
      return false;
    }
  }

  verifyHash() {
    return this.hash === this._computeHash();
  }
}

// ---------------------------------------
//  EchoMeshChain Class
// ---------------------------------------
class EchoMeshChain {
  constructor() {
    this.chain = [];
    this._createGenesisBlock();
    console.log('[Blockchain] Chain initialized with genesis block');
    console.log(`[Blockchain] Genesis hash: ${this.chain[0].hash.substring(0, 16)}...`);
  }

  _createGenesisBlock() {
    const genesis = new Block({
      index:        0,
      type:         'GENESIS',
      data:         { message: 'EchoMesh Permissioned Blockchain Genesis', version: '2.0', algorithm: 'SHA-256 + HMAC-SHA256' },
      nodeId:       'ECHOMESH-GENESIS',
      previousHash: '0'.repeat(64)
    });
    this.chain.push(genesis);
  }

  getLatestBlock() {
    return this.chain[this.chain.length - 1];
  }

  addBlock(type, data, nodeId) {
    const newBlock = new Block({
      index:        this.chain.length,
      type,
      data,
      nodeId,
      previousHash: this.getLatestBlock().hash
    });
    this.chain.push(newBlock);
    console.log(`[Blockchain] Block #${newBlock.index} | ${newBlock.type} | ${nodeId} | ${newBlock.hash.substring(0, 16)}...`);
    return newBlock;
  }

  isChainValid() {
    const errors = [];
    for (let i = 1; i < this.chain.length; i++) {
      const cur  = this.chain[i];
      const prev = this.chain[i - 1];
      if (!cur.verifyHash())               errors.push(`Block #${i}: hash tampered`);
      if (cur.previousHash !== prev.hash)  errors.push(`Block #${i}: chain broken`);
      if (!cur.verifySignature())          errors.push(`Block #${i}: invalid signature`);
    }
    return { valid: errors.length === 0, errors, blocks: this.chain.length };
  }

  getChain() {
    return this.chain.map(b => ({
      index: b.index, timestamp: b.timestamp, type: b.type,
      data: b.data, nodeId: b.nodeId,
      previousHash: b.previousHash, signature: b.signature, hash: b.hash
    }));
  }

  getBlocksByType(type) {
    return this.chain.filter(b => b.type === type);
  }

  getStats() {
    const validation = this.isChainValid();
    return {
      totalBlocks:    this.chain.length,
      sosBlocks:      this.chain.filter(b => b.type === 'SOS').length,
      aiQueryBlocks:  this.chain.filter(b => b.type === 'AI_QUERY').length,
      nodeJoinBlocks: this.chain.filter(b => b.type === 'NODE_JOIN').length,
      latestHash:     this.getLatestBlock().hash,
      genesisHash:    this.chain[0].hash,
      isValid:        validation.valid,
      errors:         validation.errors
    };
  }
}

const echoChain = new EchoMeshChain();
module.exports = { echoChain, Block, EchoMeshChain };
