/**
 * EchoMesh — /api/ask Endpoint Test Script
 * Tests the local Ollama phi3 AI-enhanced query endpoint.
 *
 * Usage:
 *   node test-ai-ask.js
 *
 * Prerequisites:
 *   1. Start EchoMesh: npm start (or node router.js)
 *   2. Ensure Ollama is running: ollama serve
 *   3. Ensure phi3 is downloaded: ollama pull phi3
 *
 * Equivalent curl commands:
 *
 *   # Basic query
 *   curl -X POST http://localhost:4000/api/ask \
 *     -H "Content-Type: application/json" \
 *     -d '{"query": "snake bite first aid"}'
 *
 *   # Hindi/Hinglish query
 *   curl -X POST http://localhost:4000/api/ask \
 *     -H "Content-Type: application/json" \
 *     -d '{"query": "paani kahan milega"}'
 *
 *   # Check Ollama status
 *   curl http://localhost:4000/api/ollama-status
 */

const http = require('http');

const BASE_URL = 'http://localhost:4000';

function makeRequest(url, options = {}) {
  return new Promise((resolve, reject) => {
    const parsedUrl = new URL(url);
    const reqOptions = {
      hostname: parsedUrl.hostname,
      port: parsedUrl.port,
      path: parsedUrl.pathname,
      method: options.method || 'GET',
      headers: options.headers || {},
      timeout: 35000
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

    req.on('error', reject);
    req.on('timeout', () => { req.destroy(); reject(new Error('Timeout')); });

    if (options.body) {
      req.write(JSON.stringify(options.body));
    }
    req.end();
  });
}

async function runTests() {
  console.log('═══════════════════════════════════════════════════════');
  console.log('  🧪 EchoMesh /api/ask Endpoint Tests');
  console.log('═══════════════════════════════════════════════════════\n');

  // Test 1: Check Ollama status
  console.log('── Test 1: Ollama Status Check ──');
  try {
    const status = await makeRequest(`${BASE_URL}/api/ollama-status`);
    console.log('   Status:', JSON.stringify(status.data, null, 2));
  } catch (e) {
    console.log('   ❌ Server not reachable:', e.message);
    console.log('   Make sure EchoMesh is running (npm start or node router.js)');
    return;
  }

  // Test 2: Medical query (English)
  console.log('\n── Test 2: Medical Query (English) ──');
  try {
    const res = await makeRequest(`${BASE_URL}/api/ask`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: { query: 'How to treat a snake bite?' }
    });
    console.log('   Mode:', res.data.mode);
    console.log('   Response time:', res.data.responseTime, 'ms');
    console.log('   Sources:', res.data.sources?.map(s => s.topic).join(', ') || 'none');
    console.log('   Answer:', (res.data.answer || '').substring(0, 150) + '...');
  } catch (e) {
    console.log('   ❌ Error:', e.message);
  }

  // Test 3: Hindi/Hinglish query
  console.log('\n── Test 3: Hinglish Query ──');
  try {
    const res = await makeRequest(`${BASE_URL}/api/ask`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: { query: 'paani kahan milega?' }
    });
    console.log('   Mode:', res.data.mode);
    console.log('   Response time:', res.data.responseTime, 'ms');
    console.log('   Sources:', res.data.sources?.map(s => s.topic).join(', ') || 'none');
    console.log('   Answer:', (res.data.answer || '').substring(0, 150) + '...');
  } catch (e) {
    console.log('   ❌ Error:', e.message);
  }

  // Test 4: Empty query (should return 400)
  console.log('\n── Test 4: Empty Query (should fail) ──');
  try {
    const res = await makeRequest(`${BASE_URL}/api/ask`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: { query: '' }
    });
    console.log('   Status:', res.status, res.status === 400 ? '✅ Correctly rejected' : '❌ Should be 400');
    console.log('   Error:', res.data.error);
  } catch (e) {
    console.log('   ❌ Error:', e.message);
  }

  // Test 5: Existing /ask route still works
  console.log('\n── Test 5: Existing /ask Route (backward compat) ──');
  try {
    const res = await makeRequest(`${BASE_URL}/ask`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: { question: 'shelter kahan hai?' }
    });
    console.log('   Status:', res.status, res.status === 200 ? '✅ Still working' : '❌ Broken');
    console.log('   Contributing devices:', res.data.contributingDevices?.join(', ') || 'none');
  } catch (e) {
    console.log('   ❌ Error:', e.message);
  }

  console.log('\n═══════════════════════════════════════════════════════');
  console.log('  Tests complete!');
  console.log('═══════════════════════════════════════════════════════\n');
}

runTests();
