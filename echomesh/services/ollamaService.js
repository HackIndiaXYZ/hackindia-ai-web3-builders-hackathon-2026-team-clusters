/**
 * ═══════════════════════════════════════════════════════════════
 *  EchoMesh — Ollama phi3 Local AI Service
 *  Fully offline LLM integration via local Ollama REST API.
 *  No internet or cloud API calls — everything runs on-device.
 * ═══════════════════════════════════════════════════════════════
 */

const http = require('http');

// ── Configuration ──────────────────────────────────────────────
const OLLAMA_BASE_URL = 'http://localhost:11434';
const OLLAMA_MODEL = 'phi3';
const DEFAULT_TIMEOUT_MS = 30000;   // 30s timeout for low-end hardware
const MAX_TOKENS = 256;             // Keep responses concise for battery-constrained devices
const TEMPERATURE = 0.3;            // Low temperature for factual, consistent disaster-response answers

// Track Ollama availability globally so we don't spam logs
let ollamaAvailable = false;
let phi3Available = false;

// ── Helper: Make HTTP request without axios (zero extra dependencies) ──
function makeRequest(url, options = {}) {
  return new Promise((resolve, reject) => {
    const parsedUrl = new URL(url);
    const timeout = options.timeout || DEFAULT_TIMEOUT_MS;

    const reqOptions = {
      hostname: parsedUrl.hostname,
      port: parsedUrl.port,
      path: parsedUrl.pathname,
      method: options.method || 'GET',
      headers: options.headers || {},
      timeout: timeout
    };

    const req = http.request(reqOptions, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, data: JSON.parse(data) });
        } catch (e) {
          resolve({ status: res.statusCode, data: data });
        }
      });
    });

    req.on('timeout', () => {
      req.destroy();
      reject(new Error(`Request to Ollama timed out after ${timeout}ms`));
    });

    req.on('error', (err) => {
      reject(err);
    });

    if (options.body) {
      req.write(typeof options.body === 'string' ? options.body : JSON.stringify(options.body));
    }

    req.end();
  });
}

// ═══════════════════════════════════════════════════════════════
//  checkOllamaStatus()
//  Call on server startup to verify Ollama + phi3 are available.
//  Logs clear warnings if not — critical for disaster-response ops.
// ═══════════════════════════════════════════════════════════════
async function checkOllamaStatus() {
  console.log('\n╔══════════════════════════════════════════════════════╗');
  console.log('║   🤖 EchoMesh — Ollama AI Status Check              ║');
  console.log('╚══════════════════════════════════════════════════════╝');

  try {
    // Step 1: Check if Ollama server is running
    const response = await makeRequest(`${OLLAMA_BASE_URL}/api/tags`, { timeout: 5000 });

    if (response.status !== 200) {
      console.warn('⚠️  [Ollama] Server responded with unexpected status:', response.status);
      ollamaAvailable = false;
      phi3Available = false;
      return { ollamaRunning: false, phi3Loaded: false };
    }

    ollamaAvailable = true;
    console.log('✅  [Ollama] Server is running at', OLLAMA_BASE_URL);

    // Step 2: Check if phi3 model is available
    const models = response.data?.models || [];
    const modelNames = models.map(m => m.name || m.model || '');
    const hasPhi3 = modelNames.some(name =>
      name.toLowerCase().includes('phi3') || name.toLowerCase().includes('phi-3')
    );

    if (hasPhi3) {
      phi3Available = true;
      console.log('✅  [Ollama] phi3 model is loaded and ready');
      console.log('    Available models:', modelNames.join(', '));
    } else {
      phi3Available = false;
      console.warn('⚠️  [Ollama] phi3 model NOT found!');
      console.warn('    Available models:', modelNames.length > 0 ? modelNames.join(', ') : '(none)');
      console.warn('    Run: ollama pull phi3');
    }

    return { ollamaRunning: true, phi3Loaded: hasPhi3, models: modelNames };

  } catch (err) {
    ollamaAvailable = false;
    phi3Available = false;

    if (err.code === 'ECONNREFUSED') {
      console.warn('⚠️  [Ollama] Server is NOT running at', OLLAMA_BASE_URL);
      console.warn('    Start Ollama with: ollama serve');
    } else {
      console.warn('⚠️  [Ollama] Health check failed:', err.message);
    }

    console.warn('    ℹ️  EchoMesh will operate in degraded mode (RAG-only, no AI synthesis)');
    return { ollamaRunning: false, phi3Loaded: false, error: err.message };
  }
}

// ═══════════════════════════════════════════════════════════════
//  buildPrompt(query, contextChunks)
//  Constructs a clean, concise prompt combining RAG context
//  with the user's question. Kept short for fast inference.
// ═══════════════════════════════════════════════════════════════
function buildPrompt(query, contextChunks = []) {
  let contextBlock = '';
  if (contextChunks && contextChunks.length > 0) {
    const formattedChunks = contextChunks
      .slice(0, 2)
      .map((chunk, i) => {
        const topic = chunk.topic || `Info ${i + 1}`;
        const content = chunk.content || '';
        return `[${topic}]: ${content}`;
      })
      .join('\n\n');

    contextBlock = formattedChunks;
  }

  // Build prompt using official Phi-3 format (<|system|>, <|user|>, <|assistant|>)
  if (contextBlock) {
    return [
      '<|system|>',
      'You are EchoMesh, a trusted offline disaster-response assistant helping survivors.',
      'Answer the survivor\'s question accurately and helpfully using the verified context below.',
      'Language Rule: If the user asks in Hindi or Hinglish, reply in clear, supportive Hindi (Devanagari script). If English, reply in English.',
      'Do not give contradictory or negative statements.',
      '',
      'Verified Emergency Information:',
      contextBlock,
      '<|end|>',
      '<|user|>',
      query,
      '<|end|>',
      '<|assistant|>'
    ].join('\n');
  }

  // No context available — general emergency query
  return [
    '<|system|>',
    'You are EchoMesh, an offline disaster-response assistant. Answer clearly and helpfully.<|end|>',
    '<|user|>',
    query,
    '<|end|>',
    '<|assistant|>'
  ].join('\n');
}

// ═══════════════════════════════════════════════════════════════
//  queryPhi3(query, contextChunks, options)
//  Main function to send a prompt to the local Ollama phi3 model.
//  Returns: { answer: string, responseTimeMs: number } or null on failure.
// ═══════════════════════════════════════════════════════════════
async function queryPhi3(query, contextChunks = [], options = {}) {
  const startTime = Date.now();
  const timeout = options.timeout || DEFAULT_TIMEOUT_MS;
  const stream = options.stream || false;

  // Quick check: is Ollama likely available?
  if (!ollamaAvailable || !phi3Available) {
    // Re-check in case it came back online
    await checkOllamaStatus();
    if (!ollamaAvailable || !phi3Available) {
      const elapsed = Date.now() - startTime;
      console.warn(`[Ollama] phi3 unavailable — returning null (${elapsed}ms)`);
      return null;
    }
  }

  const prompt = buildPrompt(query, contextChunks);

  try {
    console.log(`[Ollama] Sending query to phi3 (timeout: ${timeout}ms)...`);

    const response = await makeRequest(`${OLLAMA_BASE_URL}/api/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      timeout: timeout,
      body: {
        model: OLLAMA_MODEL,
        prompt: prompt,
        stream: stream,
        options: {
          temperature: options.temperature || TEMPERATURE,
          num_predict: options.maxTokens || MAX_TOKENS,
        }
      }
    });

    const elapsed = Date.now() - startTime;

    if (response.status !== 200) {
      console.error(`[Ollama] Error response (${response.status}):`, response.data);

      // Check for model not found
      if (response.status === 404 || (typeof response.data === 'string' && response.data.includes('not found'))) {
        phi3Available = false;
        console.warn('[Ollama] Model "phi3" not found. Run: ollama pull phi3');
      }

      return null;
    }

    const answer = (response.data?.response || '').trim();

    if (!answer) {
      console.warn(`[Ollama] Empty response from phi3 (${elapsed}ms)`);
      return null;
    }

    console.log(`[Ollama] ✅ phi3 responded in ${elapsed}ms (${answer.length} chars)`);

    return {
      answer: answer,
      responseTimeMs: elapsed
    };

  } catch (err) {
    const elapsed = Date.now() - startTime;

    if (err.message.includes('timed out')) {
      console.warn(`[Ollama] ⏱️ phi3 query timed out after ${elapsed}ms`);
      // Don't mark Ollama as unavailable — it's just slow
    } else if (err.code === 'ECONNREFUSED') {
      ollamaAvailable = false;
      phi3Available = false;
      console.warn(`[Ollama] Connection refused — Ollama may have stopped (${elapsed}ms)`);
    } else {
      console.error(`[Ollama] Query error (${elapsed}ms):`, err.message);
    }

    return null;
  }
}

// ═══════════════════════════════════════════════════════════════
//  getStatus()
//  Returns current cached status of Ollama/phi3 availability.
// ═══════════════════════════════════════════════════════════════
function getStatus() {
  return {
    ollamaRunning: ollamaAvailable,
    phi3Loaded: phi3Available,
    endpoint: OLLAMA_BASE_URL,
    model: OLLAMA_MODEL
  };
}

module.exports = {
  checkOllamaStatus,
  queryPhi3,
  buildPrompt,
  getStatus
};
