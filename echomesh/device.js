const express = require('express');
const cors = require('cors');
const axios = require('axios');
const { loadKnowledge, retrieve } = require('./rag');

const PORT = process.argv[2] || 4001;
const KNOWLEDGE_FILE = process.argv[3] || 'knowledge_medical.json';
const DEVICE_NAME = process.argv[4] || 'DeviceA';

// Derive specialty from knowledge filename (e.g. knowledge_medical.json -> medical)
const SPECIALTY = KNOWLEDGE_FILE.replace('knowledge_', '').replace('.json', '');

const knowledge = loadKnowledge(KNOWLEDGE_FILE);
const app = express();
app.use(cors());
app.use(express.json());

// Health check endpoint for router /status pings
app.get('/health', (req, res) => {
  res.json({ device: DEVICE_NAME, status: 'online', specialty: SPECIALTY });
});

async function askOllama(prompt) {
  const res = await axios.post('http://localhost:11434/api/generate', {
    model: 'phi3',
    prompt: prompt,
    stream: false
  }, { timeout: 3500 });
  return res.data.response;
}


app.post('/query', (req, res) => {
  const { question } = req.body;
  const relevant = retrieve(knowledge, question);

  if (!relevant || relevant.length === 0) {
    return res.json({ device: DEVICE_NAME, specialty: SPECIALTY, hasLocalData: false, answer: null });
  }

  // Return the top verified Hindi knowledge facts directly without LLM hallucination
  const uniqueContents = [...new Set(relevant.map(r => r.content.trim()))];
  const answer = uniqueContents.slice(0, 2).join('\n\n');

  res.json({
    device: DEVICE_NAME,
    specialty: SPECIALTY,
    hasLocalData: true,
    answer
  });
});



// ---- SOS Alert relay endpoint ----
app.post('/sos-alert', (req, res) => {
  try {
    const { id, deviceName, latitude, longitude, message, timestamp } = req.body;
    const coords = latitude && longitude ? `(${latitude}, ${longitude})` : '(no location)';
    console.log(`\n🚨🚨🚨 SOS ALERT RECEIVED 🚨🚨🚨`);
    console.log(`   From: ${deviceName}`);
    console.log(`   Location: ${coords}`);
    console.log(`   Message: ${message || 'Emergency!'}`);
    console.log(`   Time: ${timestamp}`);
    console.log(`   Relayed to: ${DEVICE_NAME}`);
    console.log(`${'─'.repeat(40)}\n`);
    res.json({ received: true, relayedBy: DEVICE_NAME });
  } catch (e) {
    res.status(500).json({ received: false, error: e.message });
  }
});

app.listen(PORT, '0.0.0.0', () => console.log(`${DEVICE_NAME} (${SPECIALTY}) running on port ${PORT}`));