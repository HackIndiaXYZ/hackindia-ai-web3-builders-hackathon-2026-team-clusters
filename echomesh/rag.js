const fs = require('fs');

// Comprehensive Hindi, Hinglish & Disaster Synonym dictionary for offline query expansion
const SYNONYMS = {
  // Water & Supplies
  'water': ['paani', 'pani', 'peene ka pani', 'drinking water', 'well', 'kuan', 'supply', 'source', 'jal', 'peene', 'peen', 'filter', 'tanker'],
  'paani': ['water', 'drinking water', 'pani', 'peene', 'jal', 'peen', 'peena', 'filter', 'kuan', 'supply', 'source'],
  'pani': ['water', 'drinking water', 'paani', 'peene', 'jal', 'peen', 'peena', 'filter', 'kuan', 'supply'],
  'peene': ['water', 'drinking water', 'paani', 'pani', 'filter', 'kuan', 'tanker', 'jal'],
  'peen': ['water', 'drinking water', 'paani', 'pani', 'peene', 'filter', 'kuan'],
  'peeen': ['water', 'drinking water', 'paani', 'pani', 'peene', 'filter', 'kuan'],
  'jal': ['water', 'paani', 'pani', 'drinking water', 'peene'],
  'food': ['khana', 'bhojan', 'ration', 'meal', 'supply', 'packet'],
  'khana': ['food', 'ration', 'meal', 'bhojan', 'packet'],
  'bhojan': ['food', 'khana', 'ration', 'meal'],
  'ration': ['food', 'khana', 'ration', 'packet', 'supply'],

  // Shelter & Camp
  'shelter': ['sharan', 'camp', 'tambu', 'stay', 'hall', 'building', 'surakshit', 'safe place', 'relief camp', 'rahat', 'rukne', 'rukna', 'rehna'],
  'shilter': ['shelter', 'camp', 'sharan', 'rahat', 'relief'],
  'shelet': ['shelter', 'camp', 'sharan', 'rahat', 'relief'],
  'camp': ['shelter', 'rahat camp', 'sharan', 'community hall', 'tambu', 'relief'],
  'sharan': ['shelter', 'camp', 'relief', 'safe', 'rahat'],
  'rahat': ['shelter', 'camp', 'relief', 'madad', 'help', 'ration', 'food'],
  'rukna': ['shelter', 'stay', 'camp', 'hall', 'sharan'],
  'rukne': ['shelter', 'stay', 'camp', 'hall', 'sharan'],
  'tambu': ['tent', 'camp', 'shelter', 'temporary'],
  'tent': ['tambu', 'camp', 'shelter', 'family'],

  // Medical & First Aid
  'medical': ['first aid', 'doctor', 'hospital', 'aspataal', 'upchar', 'prathmik', 'dawa', 'ilaj', 'treatment'],
  'doctor': ['medical', 'hospital', 'clinic', 'first aid', 'treatment', 'physician'],
  'hospital': ['aspataal', 'doctor', 'clinic', 'medical', 'ambulance', 'treatment', 'ilaj'],
  'aspataal': ['hospital', 'doctor', 'clinic', 'medical'],
  'first': ['first aid', 'prathmik', 'upchar'],
  'aid': ['first aid', 'medical', 'help', 'upchar'],
  'injury': ['chot', 'wound', 'ghayal', 'blood', 'khoon', 'dard', 'pain', 'bandage', 'patti', 'first aid', 'dawa'],
  'chot': ['injury', 'wound', 'pain', 'khoon', 'blood', 'first aid', 'dawa', 'dard'],
  'wound': ['chot', 'ghav', 'cut', 'bleeding', 'bandage', 'patti'],
  'ghav': ['wound', 'chot', 'cut', 'patti', 'bandage'],
  'khoon': ['blood', 'bleeding', 'cut', 'wound', 'bandage'],
  'blood': ['khoon', 'bleeding', 'cut', 'wound', 'bandage'],
  'bleeding': ['khoon', 'blood', 'cut', 'ghav', 'wound', 'pressure'],
  'snake': ['saanp', 'serpent', 'bite', 'kat', 'kaat', 'zeher', 'poison', 'venom'],
  'saanp': ['snake', 'bite', 'kaat', 'venom', 'zeher', 'poison'],
  'burn': ['burns', 'jala', 'jalan', 'aag', 'fire', 'blister', 'chaala'],
  'burns': ['burn', 'jala', 'jalan', 'aag', 'fire'],
  'jala': ['burn', 'fire', 'jalan', 'aag'],
  'jalan': ['burn', 'jala', 'fire', 'aag'],
  'fracture': ['haddi', 'bone', 'toot', 'broken', 'crack', 'splint', 'leg injury', 'arm'],
  'haddi': ['fracture', 'bone', 'toot', 'broken', 'splint'],
  'cpr': ['unconscious', 'behosh', 'breathing', 'heart', 'chest compressions', 'pulse'],
  'behosh': ['cpr', 'unconscious', 'breathing', 'pulse'],
  
  // Evacuation & Maps
  'evacuation': ['evacuate', 'nikalna', 'bachav', 'exit', 'route', 'rasta', 'safe road', 'highway', 'path', 'escape', 'bhaagna'],
  'route': ['rasta', 'road', 'path', 'direction', 'map', 'way', 'highway', 'corridor', 'exit'],
  'rasta': ['route', 'road', 'direction', 'map', 'highway', 'corridor', 'exit'],
  'road': ['rasta', 'route', 'highway', 'path'],
  'khatra': ['danger', 'unsafe', 'risk', 'avoid', 'flood', 'block'],
  'danger': ['khatra', 'flooded', 'blocked', 'closed', 'unsafe', 'risk'],
  'help': ['madad', 'sahayata', 'sos', 'bachao', 'emergency', 'urgent'],
  'madad': ['help', 'sahayata', 'sos', 'bachao', 'emergency'],
  'sahayata': ['help', 'madad', 'sos', 'emergency']
};

// Direct Devanagari Hindi keyword mappings
const HINDI_MAP = {
  'पानी': ['water', 'drinking water', 'paani', 'pani', 'peene', 'filter', 'kuan', 'tanker'],
  'पीने': ['water', 'drinking water', 'paani', 'peene', 'filter', 'kuan'],
  'जल': ['water', 'paani', 'drinking water'],
  'खाना': ['food', 'ration', 'khana', 'bhojan', 'meal'],
  'भोजन': ['food', 'ration', 'khana', 'meal'],
  'राशन': ['food', 'ration', 'khana', 'packet'],
  'शिविर': ['shelter', 'camp', 'rahat', 'sharan', 'community hall'],
  'आश्रय': ['shelter', 'camp', 'sharan', 'rahat'],
  'राहत': ['shelter', 'camp', 'relief', 'madad'],
  'तंबू': ['tent', 'camp', 'shelter'],
  'चिकित्सा': ['medical', 'first aid', 'treatment', 'doctor', 'hospital', 'upchar', 'dawa'],
  'प्राथमिक': ['first aid', 'medical', 'upchar', 'prathmik'],
  'उपचार': ['treatment', 'first aid', 'medical', 'hospital', 'ilaj'],
  'दवा': ['medicine', 'dawa', 'medical', 'first aid'],
  'दवाइयां': ['medicine', 'dawa', 'medical', 'first aid'],
  'अस्पताल': ['hospital', 'doctor', 'medical', 'ambulance'],
  'डॉक्टर': ['doctor', 'hospital', 'medical'],
  'चोट': ['injury', 'wound', 'first aid', 'chot', 'dard'],
  'खून': ['blood', 'bleeding', 'wound', 'bandage'],
  'सांप': ['snake', 'bite', 'saanp', 'zeher'],
  'जलना': ['burn', 'burns', 'fire', 'jala'],
  'जला': ['burn', 'burns', 'fire', 'jalan'],
  'आग': ['fire', 'burn', 'jalan'],
  'हड्डी': ['fracture', 'bone', 'haddi', 'toot'],
  'फ्रैक्चर': ['fracture', 'bone', 'haddi', 'toot'],
  'बेहोश': ['cpr', 'unconscious', 'breathing'],
  'रास्ता': ['route', 'rasta', 'road', 'safe road', 'evacuation'],
  'मार्ग': ['route', 'rasta', 'road', 'corridor'],
  'निकासी': ['evacuation', 'safe road', 'escape', 'exit'],
  'बाढ़': ['flood', 'badh', 'water level', 'safe zone'],
  'मदद': ['help', 'madad', 'emergency', 'sos'],
  'सहायता': ['help', 'madad', 'emergency', 'sos'],
  'सुरक्षित': ['safe', 'shelter', 'camp', 'high ground']
};

function loadKnowledge(file) {
  try {
    return JSON.parse(fs.readFileSync(file, 'utf-8'));
  } catch (e) {
    console.error(`Error loading knowledge file ${file}:`, e.message);
    return [];
  }
}

// Clean and tokenize words supporting English, Numbers, and Devanagari Hindi
function tokenize(text) {
  if (!text || typeof text !== 'string') return [];
  return text
    .toLowerCase()
    .replace(/[^\w\s\u0900-\u097F]/g, ' ')
    .split(/\s+/)
    .filter(w => w.length > 0);
}

// Expand query with English, Hinglish & Hindi Devanagari synonyms
function expandQueryTokens(query) {
  const baseTokens = tokenize(query);
  const tokenSet = new Set(baseTokens);

  baseTokens.forEach(token => {
    // Check Latin/English synonyms
    if (SYNONYMS[token]) {
      SYNONYMS[token].forEach(syn => tokenSet.add(syn.toLowerCase()));
    }

    // Check Hindi Devanagari synonyms
    if (HINDI_MAP[token]) {
      HINDI_MAP[token].forEach(syn => tokenSet.add(syn.toLowerCase()));
    }

    // Check substring matches in Hindi map
    Object.keys(HINDI_MAP).forEach(k => {
      if (token.includes(k) || k.includes(token)) {
        HINDI_MAP[k].forEach(syn => tokenSet.add(syn.toLowerCase()));
      }
    });

    // Check substring matches in Latin synonyms
    Object.keys(SYNONYMS).forEach(k => {
      if (token.includes(k) || k.includes(token)) {
        SYNONYMS[k].forEach(syn => tokenSet.add(syn.toLowerCase()));
      }
    });
  });

  return Array.from(tokenSet);
}

function retrieve(knowledge, query) {
  if (!knowledge || !Array.isArray(knowledge) || knowledge.length === 0) return null;
  if (!query || typeof query !== 'string') return null;

  const rawQuery = query.toLowerCase().trim();
  const queryTokens = expandQueryTokens(query);

  const scoredMatches = knowledge.map(item => {
    let score = 0;
    const topic = (item.topic || '').toLowerCase();
    const content = (item.content || '').toLowerCase();
    const tags = Array.isArray(item.tags) ? item.tags.map(t => t.toLowerCase()) : [];
    const keywords = Array.isArray(item.keywords) ? item.keywords.map(k => k.toLowerCase()) : [];

    // Exact topic match in query
    if (rawQuery.includes(topic) || topic.includes(rawQuery)) {
      score += 20;
    }

    // ── High-intent domain boosters ──
    const isWaterQuery = /water|paani|pani|peen|peene|peeen|jal|प्यास|पानी|पीने/i.test(rawQuery);
    if (isWaterQuery && (topic.includes('drinking water') || tags.includes('water'))) {
      score += 35;
    }

    const isShelterQuery = /shelter|camp|sharan|rahat|stay|rukna|tambu|tent|शिविर|आश्रय|राहत|कम्युनिटी/i.test(rawQuery);
    if (isShelterQuery && (topic.includes('shelter') || tags.includes('shelter'))) {
      score += 35;
    }

    const isMedicalQuery = /medical|first aid|doctor|hospital|dawa|upchar|chot|injury|wound|इलाज|उपचार|दवा|चिकित्सा|प्राथमिक/i.test(rawQuery);
    if (isMedicalQuery && (tags.includes('medical') || tags.includes('first aid'))) {
      score += 30;
    }

    const isEvacuationQuery = /route|road|rasta|evacuation|highway|रास्ता|मार्ग|निकासी/i.test(rawQuery);
    if (isEvacuationQuery && (tags.includes('corridor') || tags.includes('route') || tags.includes('maps'))) {
      score += 30;
    }

    // Token matching across topic, content, tags, keywords
    queryTokens.forEach(token => {
      if (topic.includes(token)) score += 10;
      if (tags.some(t => t.includes(token) || token.includes(t))) score += 8;
      if (keywords.some(k => k.includes(token) || token.includes(k))) score += 7;
      if (content.includes(token)) score += 4;
    });

    return { item, score };
  });

  // Filter items with positive score and sort by highest relevance
  const relevant = scoredMatches
    .filter(m => m.score > 0)
    .sort((a, b) => b.score - a.score)
    .map(m => m.item);

  return relevant.length > 0 ? relevant : null;
}

module.exports = { loadKnowledge, retrieve, expandQueryTokens, tokenize };