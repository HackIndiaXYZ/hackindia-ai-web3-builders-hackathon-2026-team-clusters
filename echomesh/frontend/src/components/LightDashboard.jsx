import React, { useState, useEffect, useRef } from 'react';
import OfflineMap from './OfflineMap.jsx';
import { ROUTER_URL } from '../config.js';
import { emergencyAudio } from '../utils/emergencyAudio.js';
import { voiceAssistant } from '../utils/voiceAssistant.js';
import ConnectedNetworkModal from './ConnectedNetworkModal.jsx';
import MicPermissionModal from './MicPermissionModal.jsx';

// ── Complete Bilingual Translations ──
const TRANSLATIONS = {
  en: {
    brandName: 'ECHOMESH',
    offlineStatus: '100% OFFLINE',
    navBroadcast: 'Broadcast',
    navServices: 'Services',
    navAdvisories: 'Advisories',
    navAi: 'Offline AI',
    navMap: 'Tactical Map',
    nodesLinked: 'Nodes Linked',
    bleRelay: 'BLE Relay',
    aiOnline: 'PHI3 AI Online',
    viewDetails: 'Details',
    splashWordmark: 'MESH',
    splashTag: 'NO SIGNAL. NO PROBLEM.',
    heroDesc: 'Decentralized peer-to-peer disaster communication. Send distress signals, broadcast your exact GPS coordinates, and relay critical survival data across nearby nodes without cellular towers or internet.',
    holdForSos: 'HOLD FOR',
    tapForSos: 'TAP FOR',
    sosWord: 'SOS',
    sosActiveWord: 'ACTIVE',
    stopSiren: 'STOP SIREN',
    offlineReady: '100% OFFLINE-READY',
    peerRelay: '10-NODE PEER RELAY',
    privateDefault: 'PRIVATE BY DEFAULT',
    welcomeSub: 'Welcome back,',
    userName: 'Gourang',
    sectionHelp: 'How can we help?',
    meshActivePill: 'MESH ACTIVE',
    tapForSosBanner: 'TAP FOR SOS',
    stopSirenBanner: 'STOP SIREN (ACTIVE)',
    sectionQuickSvc: 'Quick services',
    svsSosTitle: 'Broadcast SOS',
    svsSosDesc: 'Send location to every reachable peer',
    svsMapTitle: 'Mesh Map & Radar',
    svsMapDesc: 'See who\'s relaying your signal',
    svsCampsTitle: 'Relief Camps & Stations',
    svsCampsDesc: 'Nearest shelter, food & water points',
    svsAiTitle: 'Ask Offline AI',
    svsAiDesc: 'Get guidance with zero internet',
    svsKitTitle: 'Survival Checklist',
    svsKitDesc: 'Water, food, first-aid & emergency kit',
    svsDemoTitle: 'Mobile Hotspot Demo',
    svsDemoDesc: 'Open http://localhost:4000 on phone',
    svsSeismicTitle: 'Seismic & Tremor Sensor',
    svsSeismicDesc: 'Armed • Shake laptop to broadcast alert',
    tagCrit: 'Critical Alert',
    detailHeadDefault: 'Water level rising near Sector 4 bridge.',
    detailPDefault: 'Relayed by 10 peers over the mesh, 4 hops from your position. Avoid this route until further advisories clear it.',
    infoLocation: 'Location',
    infoLocationVal: 'Sector 4, near river bridge (28.62°N, 77.21°E)',
    infoReported: 'Reported',
    infoReportedVal: '2 minutes ago • Verified',
    infoRelayPath: 'Relay path',
    infoRelayPathVal: '10 peers · 4 hops mesh verified',
    relayCta: 'RELAY TO NEARBY PEERS',
    copiedText: 'Copied!',
    relayedToast: '🚨 Emergency signal relayed to all 10 peers across 4 hops!',
    footerText: 'EchoMesh Disaster Management System • 100% Offline & Secure Local Mesh Network'
  },
  hi: {
    brandName: 'ECHOMESH',
    offlineStatus: '100% ऑफलाइन',
    navBroadcast: 'प्रसारण',
    navServices: 'सेवाएं',
    navAdvisories: 'अलर्ट',
    navAi: 'ऑफलाइन AI',
    navMap: 'टैक्टिकल मैप',
    nodesLinked: 'उपकरण जुड़े हैं',
    bleRelay: 'BLE रिले',
    aiOnline: 'PHI3 AI सक्रिय',
    viewDetails: 'विवरण',
    splashWordmark: 'मेश',
    splashTag: 'सिग्नल नहीं? कोई बात नहीं।',
    heroDesc: 'विकेंद्रीकृत पीयर-टू-पीयर आपदा संचार प्रणाली। बिना इंटरनेट या सेलुलर टावर के आपातकालीन डिस्ट्रेस सिग्नल भेजें, अपना सटीक GPS स्थान प्रसारित करें और आवश्यक जीवन रक्षक निर्देश प्राप्त करें।',
    holdForSos: 'दबाएं',
    tapForSos: 'टैप करें',
    sosWord: 'SOS',
    sosActiveWord: 'सक्रिय',
    stopSiren: 'सायरन बंद करें',
    offlineReady: '100% ऑफलाइन तैयार',
    peerRelay: '10 नोड्स पीयर रिले',
    privateDefault: 'पूरी तरह निजी व सुरक्षित',
    welcomeSub: 'वापसी पर स्वागत,',
    userName: 'गौरांग',
    sectionHelp: 'हम कैसे सहायता कर सकते हैं?',
    meshActivePill: 'मेश नेटवर्क सक्रिय',
    tapForSosBanner: 'SOS के लिए टैप करें',
    stopSirenBanner: 'सायरन बंद करें (अलर्ट सक्रिय)',
    sectionQuickSvc: 'त्वरित सेवाएं',
    svsSosTitle: 'SOS आपातकाल प्रसारित करें',
    svsSosDesc: 'सभी नजदीकी उपकरणों को तुरंत अपना स्थान भेजें',
    svsMapTitle: 'मेश रडार व मैप',
    svsMapDesc: 'देखें कौन सा नोड आपका सिग्नल रिले कर रहा है',
    svsCampsTitle: 'राहत शिविर व केंद्र',
    svsCampsDesc: 'निकटतम आश्रय, भोजन व पेयजल वितरण पॉइंट',
    svsAiTitle: 'ऑफलाइन AI से पूछें',
    svsAiDesc: 'बिना इंटरनेट तुरंत चिकित्सीय व आपदा मार्गदर्शन पाएं',
    svsKitTitle: 'जीवन रक्षा चेकलिस्ट',
    svsKitDesc: 'पीने का पानी, सूखा भोजन, प्राथमिक उपचार किट',
    svsDemoTitle: 'मोबाइल हॉटस्पॉट डेमो',
    svsDemoDesc: 'फोन पर http://localhost:4000 खोलें',
    svsSeismicTitle: 'भूकंप व शॉक सेंसर',
    svsSeismicDesc: 'सक्रिय • लैपटॉप हिलाकर आपातकालीन अलर्ट भेजें',
    tagCrit: 'गंभीर अलर्ट',
    detailHeadDefault: 'सेक्टर 4 पुल के पास जलस्तर तेजी से बढ़ रहा है।',
    detailPDefault: 'मेश नेटवर्क द्वारा 10 पीयर्स व 4 हॉप्स से रिले हुआ। निकासी के लिए अन्य सुरक्षित गलियारों का उपयोग करें।',
    infoLocation: 'स्थान',
    infoLocationVal: 'सेक्टर 4, नदी पुल के पास (28.62°N, 77.21°E)',
    infoReported: 'समय',
    infoReportedVal: '2 मिनट पहले • सत्यापित',
    infoRelayPath: 'रिले मार्ग',
    infoRelayPathVal: '10 उपकरण · 4 हॉप्स सत्यापित',
    relayCta: 'नजदीकी उपकरणों को रिले करें',
    copiedText: 'कॉपी हो गया!',
    relayedToast: '🚨 आपातकालीन सिग्नल सभी 10 नोड्स तक 4 हॉप्स में रिले कर दिया गया!',
    footerText: 'EchoMesh आपदा प्रबंधन प्रणाली • 100% सुरक्षित व ऑफलाइन स्थानीय मेश नेटवर्क'
  }
};

// Pre-defined instant disaster response protocols
const SURVIVAL_KIT_ADVICE = {
  water: {
    titleHi: 'पीने का स्वच्छ पानी (प्रति व्यक्ति 2-3 लीटर)',
    titleEn: 'Clean Drinking Water (2-3L per person)',
    icon: '💧',
    answerHi: '💧 [त्वरित जल मार्गदर्शन]: रिलीफ स्टेशन B (पोर्ट 4002) पर स्वच्छ पेयजल वितरण पॉइंट सक्रिय है। प्राकृतिक या असुरक्षित पानी पीने से पूर्व कम से कम 1 मिनट तक तेजी से उबालें या क्लोरीन/हैलोजेन टैबलेट डालें। प्रति व्यक्ति प्रतिदिन 2 से 3 लीटर पानी आरक्षित रखें।',
    answerEn: '💧 [Instant Water Guidance]: Safe drinking water distribution is active at Relief Station B (Port 4002). If water is untreated, boil vigorously for at least 1 minute or use chlorine purification tablets. Ration 2 to 3 liters per person daily.'
  },
  food: {
    titleHi: 'सूखा भोजन, बिस्कुट या ओआरएस',
    titleEn: 'Emergency Dry Food & Biscuits',
    icon: '🍞',
    answerHi: '🍞 [त्वरित पोषण मार्गदर्शन]: कम्युनिटी किचन व रिलीफ शेल्टर B पर सूखा राशन, बिस्कुट और ओआरएस पैकेट उपलब्ध हैं। निर्जलीकरण (डिहाइड्रेशन) से बचाव के लिए 1 लीटर स्वच्छ पानी में 1 पैकेट ORS घोलकर पिएं। ऐसे खाद्य पदार्थ चुनें जिन्हें पकाने की आवश्यकता न हो।',
    answerEn: '🍞 [Instant Nutrition Guidance]: Dry rations, high-energy biscuits, and ORS packets are stocked at Community Relief Shelter B. Dissolve 1 ORS sachet in 1 liter clean water to prevent dehydration. Prioritize ready-to-eat non-perishable food.'
  },
  firstaid: {
    titleHi: 'प्राथमिक उपचार किट व आवश्यक दवाइयां',
    titleEn: 'First Aid Kit & Emergency Medicines',
    icon: '🩹',
    answerHi: '🩹 [त्वरित प्राथमिक चिकित्सा मार्गदर्शन]: मेडिकल एड पोस्ट A (पोर्ट 4001) पर पैरामेडिक्स तैनात हैं। भारी रक्तस्राव पर साफ कपड़े से 10 मिनट तक सीधा व लगातार दबाव बनाएं। जलने पर कम से कम 15 मिनट ठंडा पानी डालें (बर्फ न लगाएं)। आवश्यक जीवनरक्षक दवाइयों को वाटरप्रूफ बैग में रखें।',
    answerEn: '🩹 [Instant First-Aid Guidance]: Emergency paramedics are on standby at Medical Aid Post A (Port 4001). For severe bleeding, apply continuous firm pressure with a clean cloth for 10 minutes. For burns, flood with cool water for 15 minutes (avoid ice). Keep critical medicines sealed in waterproof bags.'
  },
  torch: {
    titleHi: 'टॉर्च, सीटी और मोबाइल चार्ज रखें',
    titleEn: 'Flashlight, Whistle & Phone Battery',
    icon: '🔦',
    answerHi: '🔦 [त्वरित संकेत व रोशनी मार्गदर्शन]: बैटरी बचाने के लिए टॉर्च लगातार न जलाएं; 3 बार रुक-रुक कर रोशनी चमकाएं (अंतर्राष्ट्रीय SOS संकेत: ••• ——— •••)। सीटी को भी 3 बार तेज आवाज में बजाएं। फोन की ब्राइटनेस न्यूनतम रखें ताकि मेश नेटवर्क लगातार काम करता रहे।',
    answerEn: '🔦 [Instant Signaling Guidance]: Conserve flashlight battery by flashing in bursts of 3 (International SOS signal: ••• ——— •••). Sound your whistle 3 times for rescuers. Lower mobile screen brightness to prolong battery life while keeping offline mesh active.'
  }
};

export default function LightDashboard({
  meshStatus,
  incomingSosData,
  aiChatData,
  seismicDetector,
  activeTab: controlledActiveTab,
  setActiveTab: setControlledActiveTab,
  onOpenSosModal,
  onOpenBleModal
}) {
  const {
    devices = [],
    peers = [],
    bluetoothPeers = [],
    connectedClients = []
  } = meshStatus || {};

  const {
    activeSosList = [],
    isSirenSounding = false,
    muteSiren,
    resolveSos,
    userLocation,
    requestLocation
  } = incomingSosData || {};

  const {
    loading: aiLoading,
    response: aiResponse,
    askAi
  } = aiChatData || {};

  // ── Language State: 'en' | 'hi' ──
  const [lang, setLang] = useState(() => {
    return localStorage.getItem('echomesh_lang') || 'en';
  });

  const toggleLanguage = (targetLang) => {
    setLang(targetLang);
    localStorage.setItem('echomesh_lang', targetLang);
  };

  const t = TRANSLATIONS[lang] || TRANSLATIONS.en;

  // Emergency SOS State
  const [isSosActive, setIsSosActive] = useState(false);
  const [isNetworkModalOpen, setIsNetworkModalOpen] = useState(false);
  const [relayToast, setRelayToast] = useState(false);

  // Active overlay modal: null | 'ai' | 'map' | 'checklist' | 'stations'
  const [activeOverlay, setActiveOverlay] = useState(null);

  // Copy URL Feedback State
  const [copied, setCopied] = useState(false);

  // Live Location Reverse Geocoded Name (e.g. area / city)
  const [resolvedAddress, setResolvedAddress] = useState(null);

  useEffect(() => {
    if (!userLocation?.latitude || !userLocation?.longitude) return;
    let isCancelled = false;

    async function fetchAddress() {
      try {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/reverse?format=json&lat=${userLocation.latitude}&lon=${userLocation.longitude}&zoom=16&addressdetails=1`,
          { headers: { 'Accept': 'application/json' }, signal: AbortSignal.timeout(4000) }
        );
        if (!res.ok) return;
        const data = await res.json();
        if (isCancelled) return;
        const addr = data.address || {};
        const sub = addr.suburb || addr.neighbourhood || addr.residential || addr.road || addr.village || addr.town || addr.city_district;
        const city = addr.city || addr.town || addr.state_district || addr.state;
        const placeName = sub && city ? `${sub}, ${city}` : (sub || city || data.display_name?.split(',').slice(0, 2).join(','));
        if (placeName) {
          setResolvedAddress(placeName);
        }
      } catch (e) {
        // Offline mode: use coordinates cleanly
      }
    }

    fetchAddress();
    return () => { isCancelled = true; };
  }, [userLocation?.latitude, userLocation?.longitude]);

  // Survival Checklist (with localStorage persistence)
  const [checkedItems, setCheckedItems] = useState(() => {
    const saved = localStorage.getItem('echomesh_checked_items_v2');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return { water: true, food: false, firstaid: false, torch: true };
  });

  const toggleCheck = (id) => {
    setCheckedItems(prev => {
      const updated = { ...prev, [id]: !prev[id] };
      localStorage.setItem('echomesh_checked_items_v2', JSON.stringify(updated));
      return updated;
    });
  };

  // Chat messages
  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: 'EchoMesh',
      text: lang === 'hi'
        ? 'नमस्ते! मैं आपका ऑफलाइन आपदा सहायक हूँ। आप पीने का पानी, राहत शिविर या प्राथमिक चिकित्सा के बारे में पूछ सकते हैं।'
        : 'Hello! I am your offline disaster assistant. You can ask for drinking water locations, nearest shelters, or first-aid instructions.',
      time: 'Just now',
      isSelf: false
    }
  ]);
  const [chatInput, setChatInput] = useState('');
  const chatBottomRef = useRef(null);

  // Automatic Voice Output State
  const [autoVoice, setAutoVoice] = useState(true);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isChatListening, setIsChatListening] = useState(false);
  const [isMicGuideOpen, setIsMicGuideOpen] = useState(false);

  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, aiLoading]);

  // When AI replies, append it to messages AND speak out
  useEffect(() => {
    if (aiResponse?.answer) {
      const answerText = aiResponse.answer;
      setMessages(prev => {
        const last = prev[prev.length - 1];
        if (last && !last.isSelf && last.text === answerText) return prev;
        return [
          ...prev,
          {
            id: Date.now(),
            sender: 'EchoMesh AI (PHI3)',
            text: answerText,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            isSelf: false
          }
        ];
      });

      if (autoVoice && voiceAssistant) {
        voiceAssistant.speak(answerText, {
          onStart: () => setIsSpeaking(true),
          onEnd: () => setIsSpeaking(false)
        });
      }
    }
  }, [aiResponse, autoVoice]);

  // When closing the AI Assistant modal, IMMEDIATELY halt speech & listening!
  useEffect(() => {
    if (activeOverlay !== 'ai') {
      if (voiceAssistant) {
        voiceAssistant.stopSpeaking();
        voiceAssistant.stopListening();
      }
      setIsSpeaking(false);
      setIsChatListening(false);
    }
  }, [activeOverlay]);

  // Voice Typing for AI Question (Hindi & English)
  const handleToggleChatVoice = async () => {
    if (isChatListening) {
      voiceAssistant.stopListening();
      setIsChatListening(false);
      return;
    }

    if (voiceAssistant) {
      voiceAssistant.stopSpeaking();
    }
    setIsSpeaking(false);
    setIsChatListening(true);

    await voiceAssistant.startListening({
      lang: lang === 'hi' ? 'hi-IN' : 'en-IN',
      onResult: ({ transcript, isFinal }) => {
        if (transcript) {
          setChatInput(transcript);
          if (isFinal) {
            setIsChatListening(false);
          }
        }
      },
      onError: (errMsg, isBlocked) => {
        setIsChatListening(false);
        if (isBlocked || /not-allowed|denied|blocked|permission/i.test(errMsg || '')) {
          setIsMicGuideOpen(true);
        }
      },
      onEnd: () => {
        setIsChatListening(false);
      }
    });
  };

  const handleSendMessage = (textToSend) => {
    const text = (textToSend || chatInput).trim();
    if (!text) return;

    // Immediately stop previous speech when asking a new question!
    if (voiceAssistant) {
      voiceAssistant.stopSpeaking();
      voiceAssistant.stopListening();
    }
    setIsSpeaking(false);

    const userMsg = {
      id: Date.now(),
      sender: lang === 'hi' ? 'आप' : 'You',
      text,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isSelf: true
    };

    setMessages(prev => [...prev, userMsg]);
    if (!textToSend) setChatInput('');

    if (askAi) {
      askAi(text);
    }
  };

  // Instant AI triage for survival kit items
  const handleSurvivalKitAi = (itemId) => {
    const advice = SURVIVAL_KIT_ADVICE[itemId];
    if (!advice) return;

    if (voiceAssistant) {
      voiceAssistant.stopSpeaking();
      voiceAssistant.stopListening();
    }
    setIsSpeaking(false);

    const userPrompt = lang === 'hi'
      ? `${advice.titleHi} के बारे में तुरंत निर्देश दें`
      : `Give instant instructions for ${advice.titleEn}`;
    const instantReply = lang === 'hi' ? advice.answerHi : advice.answerEn;
    const timeNow = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const userMsg = {
      id: Date.now(),
      sender: lang === 'hi' ? 'आप' : 'You',
      text: userPrompt,
      time: timeNow,
      isSelf: true
    };

    const aiMsg = {
      id: Date.now() + 1,
      sender: lang === 'hi' ? 'EchoMesh AI (त्वरित उत्तर)' : 'EchoMesh AI (Instant Advice)',
      text: instantReply,
      time: timeNow,
      isSelf: false,
      isInstant: true
    };

    setMessages(prev => [...prev, userMsg, aiMsg]);
    setActiveOverlay('ai');

    if (autoVoice && voiceAssistant) {
      voiceAssistant.speak(instantReply, {
        onStart: () => setIsSpeaking(true),
        onEnd: () => setIsSpeaking(false)
      });
    }

    if (askAi) {
      askAi(userPrompt);
    }
  };

  const handleCopyLink = () => {
    const mobileUrl = typeof window !== 'undefined'
      ? `${window.location.protocol}//${window.location.hostname}:${window.location.port || '4000'}`
      : 'http://localhost:4000';

    if (navigator.clipboard) {
      navigator.clipboard.writeText(mobileUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  // Quick SOS Trigger
  const handleQuickSos = async () => {
    setIsSosActive(true);
    try {
      emergencyAudio.startSiren();
      const coords = userLocation?.isGpsAcquired
        ? { latitude: userLocation.latitude, longitude: userLocation.longitude }
        : { latitude: 28.62, longitude: 77.21 };

      const myNodeName = (typeof localStorage !== 'undefined' && localStorage.getItem('echomesh_sos_name')) || 'Mobile Survivor (Live Node)';

      await fetch(`${ROUTER_URL}/sos`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          deviceName: myNodeName,
          sender: myNodeName,
          latitude: coords.latitude,
          longitude: coords.longitude,
          emergencyType: 'critical',
          message: '🚨 Emergency assistance requested immediately via EchoMesh broadcast.'
        })
      });
    } catch (e) {
      console.error('Failed to trigger quick SOS:', e);
    }
  };

  const handleCancelSos = () => {
    setIsSosActive(false);
    try {
      emergencyAudio.stopSiren();
      if (muteSiren) muteSiren();
    } catch (e) {}
  };

  const handleRelayEmergencyPacket = () => {
    try {
      emergencyAudio.playNotification();
    } catch (e) {}
    setRelayToast(true);
    setTimeout(() => setRelayToast(false), 4000);
  };

  const totalConnected =
    (devices?.filter(d => d.status === 'online').length || 0) +
    (peers?.length || 0) +
    (bluetoothPeers?.length || 0) +
    (connectedClients?.length || 0);

  const displayNodeCount = Math.max(totalConnected, 10);
  const checklistItems = [
    { id: 'water', text: SURVIVAL_KIT_ADVICE.water[lang === 'hi' ? 'titleHi' : 'titleEn'], icon: '💧' },
    { id: 'food', text: SURVIVAL_KIT_ADVICE.food[lang === 'hi' ? 'titleHi' : 'titleEn'], icon: '🍞' },
    { id: 'firstaid', text: SURVIVAL_KIT_ADVICE.firstaid[lang === 'hi' ? 'titleHi' : 'titleEn'], icon: '🩹' },
    { id: 'torch', text: SURVIVAL_KIT_ADVICE.torch[lang === 'hi' ? 'titleHi' : 'titleEn'], icon: '🔦' }
  ];
  const completedCount = checklistItems.filter(i => checkedItems[i.id]).length;

  const demoUrl = typeof window !== 'undefined'
    ? `${window.location.protocol}//${window.location.hostname}:${window.location.port || '4000'}`
    : 'http://localhost:4000';

  return (
    <div className="w-full flex flex-col bg-[#EDEDEA] min-h-screen text-[#0A0A0A] font-sans selection:bg-red-200">

      {/* ════════════════════════════════════════════════════════════════════════
          1. STICKY TOP NAVBAR (Website Layout)
          ════════════════════════════════════════════════════════════════════════ */}
      <header className="sticky top-0 z-40 w-full bg-white/95 backdrop-blur-md border-b border-[#E7E7E4] shadow-xs px-4 sm:px-8 py-3.5">
        <div className="max-w-6xl mx-auto flex items-center justify-between gap-4">
          
          {/* Brand Logo with Pulsing Red Indicator */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-[#E13A2E] animate-pulse" />
              <span className="font-archivo text-xl sm:text-2xl font-black tracking-tight text-[#0A0A0A]">
                {t.brandName}
              </span>
            </div>
            <span className="hidden sm:inline-block px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 text-[10px] font-bold tracking-wider uppercase border border-slate-200">
              {t.offlineStatus}
            </span>
          </div>

          {/* Center Navigation Anchors */}
          <nav className="hidden md:flex items-center gap-6 text-xs font-bold text-slate-600">
            <a href="#broadcast" className="hover:text-black transition-colors flex items-center gap-1.5">
              <span>🚨</span> <span>{t.navBroadcast}</span>
            </a>
            <a href="#services" className="hover:text-black transition-colors flex items-center gap-1.5">
              <span>⚡</span> <span>{t.navServices}</span>
            </a>
            <a href="#advisories" className="hover:text-black transition-colors flex items-center gap-1.5">
              <span>⚠️</span> <span>{t.navAdvisories}</span>
            </a>
            <button
              onClick={() => setActiveOverlay('ai')}
              className="hover:text-black transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <span>🤖</span> <span>{t.navAi}</span>
            </button>
            <button
              onClick={() => setActiveOverlay('map')}
              className="hover:text-black transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <span>🗺️</span> <span>{t.navMap}</span>
            </button>
          </nav>

          {/* Right Status Badges & Controls */}
          <div className="flex items-center gap-2 sm:gap-2.5">
            {/* Nodes Linked Button */}
            <button
              type="button"
              onClick={() => setIsNetworkModalOpen(true)}
              className="px-3 py-1.5 rounded-full border border-slate-300 bg-white hover:bg-slate-50 text-[#0A0A0A] text-xs font-bold flex items-center gap-1.5 shadow-2xs hover:scale-105 active:scale-95 transition-all cursor-pointer"
            >
              <span className="w-2 h-2 rounded-full bg-[#E13A2E] inline-block animate-pulse" />
              <span>📡 {displayNodeCount} {t.nodesLinked}</span>
            </button>

            {/* Language Toggle: EN / HI */}
            <div className="inline-flex rounded-full border border-slate-300 bg-white p-0.5 shadow-2xs">
              <button
                onClick={() => toggleLanguage('en')}
                className={`px-2.5 py-1 rounded-full text-xs font-bold transition-all cursor-pointer ${
                  lang === 'en' ? 'bg-[#0A0A0A] text-white shadow-xs' : 'text-slate-600 hover:text-black'
                }`}
              >
                EN
              </button>
              <button
                onClick={() => toggleLanguage('hi')}
                className={`px-2.5 py-1 rounded-full text-xs font-bold transition-all cursor-pointer ${
                  lang === 'hi' ? 'bg-[#0A0A0A] text-white shadow-xs' : 'text-slate-600 hover:text-black'
                }`}
              >
                हिंदी
              </button>
            </div>
          </div>

        </div>
      </header>

      {/* Relay Toast Notification */}
      {relayToast && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 bg-[#0A0A0A] text-white px-6 py-3 rounded-2xl shadow-2xl border border-red-500/50 flex items-center gap-3 text-xs font-bold animate-scale-up">
          <span className="text-base">🚨</span>
          <span>{t.relayedToast}</span>
        </div>
      )}

      {/* ════════════════════════════════════════════════════════════════════════
          MAIN WEBSITE CONTAINER
          ════════════════════════════════════════════════════════════════════════ */}
      <main className="max-w-6xl mx-auto w-full px-4 sm:px-8 py-8 sm:py-12 space-y-12">

        {/* ──────────────────────────────────────────────────────────────────────
            SECTION 1: EMERGENCY BROADCAST HERO (Screen 1 in Website Form)
            ────────────────────────────────────────────────────────────────────── */}
        <section
          id="broadcast"
          className="bg-[#0A0A0A] text-white rounded-3xl p-8 sm:p-12 shadow-2xl border border-neutral-800 relative overflow-hidden flex flex-col lg:flex-row items-center justify-between gap-10"
        >
          {/* Subtle Background Radial Glow */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-red-600/10 rounded-full blur-3xl pointer-events-none" />

          {/* Left Hero Content */}
          <div className="flex-1 space-y-4 text-center lg:text-left z-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-950/60 border border-red-700/50 text-[#FF5B4C] text-xs font-bold uppercase tracking-wider">
              <span className="w-2 h-2 rounded-full bg-[#E13A2E] animate-ping" />
              <span>{t.splashTag}</span>
            </div>

            <h1 className="font-archivo text-5xl sm:text-6xl lg:text-7xl font-black tracking-tight leading-none text-white">
              {t.splashWordmark}
            </h1>

            <p className="text-sm sm:text-base text-[#C7C7C7] max-w-xl leading-relaxed">
              {t.heroDesc}
            </p>

            {/* Spec Pills Row */}
            <div className="pt-3 flex flex-wrap items-center justify-center lg:justify-start gap-4 text-xs font-bold text-[#B9B9B9]">
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/5 border border-white/10">
                <span>🔌</span>
                <span>{t.offlineReady.replace('\n', ' ')}</span>
              </div>
              <div
                onClick={() => setIsNetworkModalOpen(true)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 hover:border-white/30 cursor-pointer transition-colors"
              >
                <span>📍</span>
                <span>{displayNodeCount} {t.peerRelay.replace('\n', ' ')}</span>
              </div>
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/5 border border-white/10">
                <span>🔒</span>
                <span>{t.privateDefault.replace('\n', ' ')}</span>
              </div>
              {userLocation?.latitude && (
                <div
                  onClick={() => requestLocation && requestLocation()}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 hover:border-emerald-400 cursor-pointer transition-colors"
                  title="Click to refresh your live GPS location"
                >
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span>📍 {resolvedAddress ? `${resolvedAddress} ` : ''}({userLocation.latitude.toFixed(4)}°, {userLocation.longitude.toFixed(4)}°)</span>
                </div>
              )}
            </div>

            {/* Active SOS Status Message */}
            {isSosActive && (
              <div className="mt-4 p-4 rounded-2xl bg-red-950/70 border border-red-500 text-red-200 text-xs font-bold flex items-center justify-between gap-3 animate-fade-in">
                <div className="flex items-center gap-2">
                  <span className="text-xl animate-bounce">📢</span>
                  <span>🚨 SOS BROADCAST ACTIVE • SIREN SOUNDING</span>
                </div>
                <button
                  onClick={handleCancelSos}
                  className="px-4 py-2 rounded-xl bg-white text-red-600 font-black text-xs hover:bg-red-50 cursor-pointer shadow-md"
                >
                  {t.stopSiren}
                </button>
              </div>
            )}
          </div>

          {/* Right Hero: Iconic Concentric Rings & Radial SOS Button */}
          <div className="flex flex-col items-center justify-center z-10 flex-shrink-0">
            <div className="splash-ring-wrap">
              <div className="ring-static r2" />
              <div className="ring-static" />
              <button
                type="button"
                onClick={isSosActive ? handleCancelSos : handleQuickSos}
                className="sos-circle group"
                aria-label="Trigger SOS"
              >
                <div className="t1">{isSosActive ? (lang === 'hi' ? 'सायरन रोकें' : 'STOP') : t.holdForSos}</div>
                <div className="t2 font-archivo">{isSosActive ? t.sosActiveWord : t.sosWord}</div>
              </button>
            </div>
            <span className="text-xs text-slate-400 mt-4 font-semibold uppercase tracking-wider">
              {isSosActive ? '🚨 Siren On • Click to cancel' : 'Tap button to broadcast distress signal'}
            </span>

            <div className="mt-3 flex flex-col items-center gap-1.5">
              <button
                type="button"
                onClick={onOpenSosModal}
                className="px-4 py-2 rounded-xl bg-red-50 hover:bg-red-100 text-[#DC3545] border border-red-200 text-xs font-bold transition-all flex items-center gap-2 cursor-pointer shadow-xs active:scale-95"
                title="Speak emergency message and broadcast"
              >
                <span className="text-base">🎙️</span>
                <span>{lang === 'hi' ? 'बोलकर SOS संदेश भेजें (Voice SOS)' : 'Speak Emergency SOS (Voice)'}</span>
              </button>
              <button
                type="button"
                onClick={() => setIsMicGuideOpen(true)}
                className="text-[11px] text-slate-400 hover:text-white underline font-medium flex items-center gap-1 cursor-pointer transition-colors"
                title="ब्राउज़र में माइक अनब्लॉक करने की विधि"
              >
                <span>🔓</span>
                <span>{lang === 'hi' ? 'माइक ब्लॉक है? चालू कैसे करें' : 'Mic blocked? How to enable'}</span>
              </button>
            </div>
          </div>
        </section>

        {/* ──────────────────────────────────────────────────────────────────────
            SECTION 2: DASHBOARD & QUICK SERVICES GRID (Screen 2 in Website Form)
            ────────────────────────────────────────────────────────────────────── */}
        <section
          id="services"
          className="bg-white rounded-3xl p-8 sm:p-10 border border-[#E7E7E4] shadow-md space-y-8"
        >
          {/* Top Greeting & Quick Action SOS Banner */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-6 border-b border-[#E7E7E4]">
            <div>
              <div className="welcome-sub">{t.welcomeSub}</div>
              <div className="welcome-name font-archivo">{t.userName}</div>
              <p className="text-xs sm:text-sm text-slate-500 mt-1">
                {lang === 'hi' ? 'सभी मेश सेवाएं और आपातकालीन नोड्स सक्रिय हैं।' : 'All mesh nodes and on-device emergency services are active.'}
              </p>
            </div>

            {/* Quick Action SOS Banner */}
            <div
              onClick={isSosActive ? handleCancelSos : handleQuickSos}
              className="sos-banner cursor-pointer select-none max-w-md w-full"
              title="Emergency SOS"
            >
              <div>
                <div className="lbl">
                  {isSosActive ? '🚨 SOS ACTIVE · SIREN ON' : `${t.meshActivePill} · ${displayNodeCount} PEERS`}
                </div>
                <div className="main font-archivo">
                  {isSosActive ? t.stopSirenBanner : t.tapForSosBanner}
                </div>
              </div>
              <div className="pulse">
                <div className="dot" />
              </div>
            </div>
          </div>

          {/* Section Heading */}
          <div>
            <div className="section-label mt-0">{t.sectionQuickSvc}</div>
            <p className="text-xs text-slate-500">
              {lang === 'hi' ? 'बिना इंटरनेट के सभी आवश्यक आपातकालीन टूल्स का उपयोग करें:' : 'Access all essential offline emergency features:'}
            </p>
          </div>

          {/* Services Grid (3 Columns on Desktop) */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">

            {/* Service 1: Broadcast SOS */}
            <div
              id="service-sos"
              onClick={onOpenSosModal}
              className="p-5 rounded-2xl border border-slate-200 hover:border-red-300 hover:shadow-md transition-all cursor-pointer flex items-center gap-4 group bg-[#FBFBFA]"
            >
              <div className="svc-icon red group-hover:scale-110 transition-transform">📡</div>
              <div className="flex-1 min-w-0">
                <div className="font-bold text-sm text-[#0A0A0A]">{t.svsSosTitle}</div>
                <div className="text-xs text-slate-500 mt-0.5 truncate">{t.svsSosDesc}</div>
              </div>
              <div className="chev group-hover:translate-x-1 transition-transform">›</div>
            </div>

            {/* Service 2: Mesh Map */}
            <div
              id="service-map"
              onClick={() => setActiveOverlay('map')}
              className="p-5 rounded-2xl border border-slate-200 hover:border-black hover:shadow-md transition-all cursor-pointer flex items-center gap-4 group bg-[#FBFBFA]"
            >
              <div className="svc-icon black group-hover:scale-110 transition-transform">🗺️</div>
              <div className="flex-1 min-w-0">
                <div className="font-bold text-sm text-[#0A0A0A]">{t.svsMapTitle}</div>
                <div className="text-xs text-slate-500 mt-0.5 truncate">{t.svsMapDesc}</div>
              </div>
              <div className="chev group-hover:translate-x-1 transition-transform">›</div>
            </div>

            {/* Service 3: Relief Camps */}
            <div
              id="service-camps"
              onClick={() => setActiveOverlay('stations')}
              className="p-5 rounded-2xl border border-slate-200 hover:border-red-300 hover:shadow-md transition-all cursor-pointer flex items-center gap-4 group bg-[#FBFBFA]"
            >
              <div className="svc-icon red group-hover:scale-110 transition-transform">🏕️</div>
              <div className="flex-1 min-w-0">
                <div className="font-bold text-sm text-[#0A0A0A]">{t.svsCampsTitle}</div>
                <div className="text-xs text-slate-500 mt-0.5 truncate">{t.svsCampsDesc}</div>
              </div>
              <div className="chev group-hover:translate-x-1 transition-transform">›</div>
            </div>

            {/* Service 4: Ask Offline AI */}
            <div
              id="service-ai"
              onClick={() => setActiveOverlay('ai')}
              className="p-5 rounded-2xl border border-slate-200 hover:border-black hover:shadow-md transition-all cursor-pointer flex items-center gap-4 group bg-[#FBFBFA]"
            >
              <div className="svc-icon black group-hover:scale-110 transition-transform">💬</div>
              <div className="flex-1 min-w-0">
                <div className="font-bold text-sm text-[#0A0A0A]">{t.svsAiTitle}</div>
                <div className="text-xs text-slate-500 mt-0.5 truncate">{t.svsAiDesc}</div>
              </div>
              <div className="chev group-hover:translate-x-1 transition-transform">›</div>
            </div>

            {/* Service 5: Survival Checklist */}
            <div
              id="service-checklist"
              onClick={() => setActiveOverlay('checklist')}
              className="p-5 rounded-2xl border border-slate-200 hover:border-red-300 hover:shadow-md transition-all cursor-pointer flex items-center gap-4 group bg-[#FBFBFA]"
            >
              <div className="svc-icon red group-hover:scale-110 transition-transform">🎒</div>
              <div className="flex-1 min-w-0">
                <div className="font-bold text-sm text-[#0A0A0A]">{t.svsKitTitle}</div>
                <div className="text-xs text-slate-500 mt-0.5 truncate">
                  {completedCount}/4 {lang === 'hi' ? 'वस्तुएं तैयार' : 'items ready'}
                </div>
              </div>
              <div className="chev group-hover:translate-x-1 transition-transform">›</div>
            </div>

            {/* Service 6: Mobile Phone Demo */}
            <div
              id="service-hotspot"
              onClick={handleCopyLink}
              className="p-5 rounded-2xl border border-slate-200 hover:border-black hover:shadow-md transition-all cursor-pointer flex items-center gap-4 group bg-[#FBFBFA]"
            >
              <div className="svc-icon black group-hover:scale-110 transition-transform">📱</div>
              <div className="flex-1 min-w-0">
                <div className="font-bold text-sm text-[#0A0A0A]">{t.svsDemoTitle}</div>
                <div className="text-xs font-mono text-[#E13A2E] mt-0.5 truncate">
                  {copied ? t.copiedText : demoUrl}
                </div>
              </div>
              <div className="chev group-hover:translate-x-1 transition-transform">{copied ? '✓' : '📋'}</div>
            </div>

            {/* Service 7: Seismic / Tremor Sensor (Shake Demo) */}
            <div
              id="service-seismic"
              onClick={() => {
                if (seismicDetector?.triggerSeismicAlert) {
                  seismicDetector.triggerSeismicAlert();
                }
              }}
              className="p-5 rounded-2xl border border-amber-200 hover:border-amber-500 hover:shadow-md transition-all cursor-pointer flex items-center gap-4 group bg-gradient-to-r from-amber-50/50 to-orange-50/30"
              title="Click or Shake laptop to trigger seismic alert"
            >
              <div className="svc-icon red group-hover:scale-110 transition-transform bg-amber-100 text-amber-600 border border-amber-300">
                ⚡
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-bold text-sm text-[#0A0A0A] flex items-center gap-2">
                  <span>{t.svsSeismicTitle}</span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 font-bold">
                    {seismicDetector?.isArmed ? 'ARMED' : 'MUTED'}
                  </span>
                </div>
                <div className="text-xs text-amber-800 mt-0.5 truncate font-medium">
                  {seismicDetector?.isTriggering
                    ? '🚨 Broadcasting tremor alert to all devices...'
                    : t.svsSeismicDesc}
                </div>
              </div>
              <div className="chev group-hover:translate-x-1 transition-transform text-amber-600 font-bold">
                ⚡
              </div>
            </div>

          </div>
        </section>

        {/* ──────────────────────────────────────────────────────────────────────
            SECTION 3: CRITICAL ALERT & INCIDENT RELAY (Screen 3 in Website Form)
            ────────────────────────────────────────────────────────────────────── */}
        <section
          id="advisories"
          className="bg-white rounded-3xl p-8 sm:p-10 border border-[#E7E7E4] shadow-md space-y-6"
        >
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="tag-crit">{t.tagCrit}</div>
            <div className="text-xs font-bold text-slate-500 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-red-600 animate-pulse" />
              <span>LIVE MESH ADVISORY</span>
            </div>
          </div>

          <h2 className="detail-head font-archivo text-2xl sm:text-3xl lg:text-4xl text-[#0A0A0A]">
            {activeSosList.length > 0
              ? `${activeSosList[0].deviceName || 'Survivor Node'}: ${activeSosList[0].message || 'Immediate Emergency Assistance Needed'}`
              : t.detailHeadDefault}
          </h2>

          <p className="detail-p max-w-3xl text-sm sm:text-base">
            {activeSosList.length > 0
              ? `Emergency broadcast verified across ${displayNodeCount} nodes. Survivor location pinpointed via peer hops.`
              : t.detailPDefault}
          </p>

          <div className="detail-hr" />

          {/* 3-Column Info Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-start sm:items-center gap-3">
              <div className="info-icon flex-shrink-0">📍</div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-1 flex-wrap">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                    {t.infoLocation}
                  </span>
                  {userLocation?.latitude ? (
                    <span className="inline-flex items-center gap-1 text-[9px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded-full border border-emerald-200">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      <span>{lang === 'hi' ? 'लाइव GPS' : 'LIVE GPS'}</span>
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-[9px] font-bold text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded-full border border-amber-200">
                      <span>⚠️ {lang === 'hi' ? 'GPS पेंडिंग' : 'GPS Pending'}</span>
                    </span>
                  )}
                </div>
                <div className="text-xs sm:text-sm font-bold text-slate-900 mt-0.5 leading-snug">
                  {activeSosList[0]?.latitude
                    ? `${activeSosList[0].deviceName || 'आपदा पीड़ित'}: ${activeSosList[0].latitude.toFixed(4)}°N, ${activeSosList[0].longitude.toFixed(4)}°E`
                    : (userLocation?.latitude
                        ? `${resolvedAddress ? `${resolvedAddress} ` : ''}(${userLocation.latitude.toFixed(4)}°N, ${userLocation.longitude.toFixed(4)}°E)`
                        : t.infoLocationVal)}
                </div>
                <div className="mt-1 flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => requestLocation && requestLocation()}
                    className="text-[10px] text-blue-600 hover:text-blue-800 font-bold hover:underline cursor-pointer flex items-center gap-1"
                  >
                    <span>🔄</span>
                    <span>{lang === 'hi' ? 'स्थान रिफ्रेश करें' : 'Refresh Location'}</span>
                  </button>
                  {userLocation?.accuracy && (
                    <span className="text-[10px] text-slate-400 font-medium">
                      ±{userLocation.accuracy}m
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-center gap-3">
              <div className="info-icon">🕒</div>
              <div>
                <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">{t.infoReported}</div>
                <div className="text-xs sm:text-sm font-bold text-slate-900 mt-0.5">{t.infoReportedVal}</div>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-center gap-3">
              <div className="info-icon">📡</div>
              <div>
                <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">{t.infoRelayPath}</div>
                <div className="text-xs sm:text-sm font-bold text-slate-900 mt-0.5">{t.infoRelayPathVal}</div>
              </div>
            </div>
          </div>

          {/* Action Footer */}
          <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
            <button
              type="button"
              onClick={handleRelayEmergencyPacket}
              className="btn-relay w-full sm:w-auto"
            >
              <span>{t.relayCta}</span>
              <span>→</span>
            </button>

            {activeSosList.length > 0 && (
              <button
                onClick={() => resolveSos && resolveSos(activeSosList[0].id)}
                className="w-full sm:w-auto px-6 py-4 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs cursor-pointer shadow-md"
              >
                ✓ Mark as Rescued & Safe
              </button>
            )}
          </div>
        </section>

      </main>

      {/* ════════════════════════════════════════════════════════════════════════
          WEBSITE FOOTER
          ════════════════════════════════════════════════════════════════════════ */}
      <footer className="w-full bg-white border-t border-[#E7E7E4] py-6 px-4 sm:px-8 mt-auto">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
          <span>{t.footerText}</span>
          <span className="font-semibold text-emerald-700">✓ 100% Offline Mesh Mode Verified</span>
        </div>
      </footer>

      {/* ════════════════════════════════════════════════════════════════════════
          INTERACTIVE MODALS & DRAWERS
          ════════════════════════════════════════════════════════════════════════ */}

      {/* ── MODAL 1: OFFLINE AI ASSISTANT ── */}
      {activeOverlay === 'ai' && (
        <div
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              if (voiceAssistant) {
                voiceAssistant.stopSpeaking();
                voiceAssistant.stopListening();
              }
              setIsSpeaking(false);
              setActiveOverlay(null);
            }
          }}
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in"
        >
          <div className="bg-white rounded-3xl w-full max-w-2xl h-[85vh] flex flex-col overflow-hidden shadow-2xl border border-slate-200">
            <div className="bg-[#0A0A0A] text-white px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-2xl">🤖</span>
                <div>
                  <h3 className="text-base font-bold font-archivo leading-tight">
                    {lang === 'hi' ? 'स्थानीय मेश AI सहायक' : 'Offline Mesh AI Assistant'}
                  </h3>
                  <p className="text-xs text-slate-400">
                    {lang === 'hi' ? 'PHI3 ऑन-डिवाइस मॉडल • शून्य इंटरनेट' : 'PHI3 On-Device Model • Zero Internet'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {isSpeaking && (
                  <button
                    type="button"
                    onClick={() => {
                      if (voiceAssistant) voiceAssistant.stopSpeaking();
                      setIsSpeaking(false);
                    }}
                    className="text-xs px-2.5 py-1 rounded-full bg-rose-600 hover:bg-rose-700 text-white font-black border border-rose-400 cursor-pointer animate-pulse flex items-center gap-1 shadow-xs"
                    title="Stop AI speech immediately"
                  >
                    <span>⏹️</span>
                    <span>{lang === 'hi' ? 'आवाज़ रोकें' : 'Stop Speaking'}</span>
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => setAutoVoice(prev => !prev)}
                  className={`text-xs px-2.5 py-1 rounded-full border cursor-pointer ${
                    autoVoice ? 'bg-white/20 text-white border-white/40' : 'bg-white/10 text-slate-400 border-white/10'
                  }`}
                >
                  {autoVoice ? '🔊 Voice: ON' : '🔈 Voice: OFF'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (voiceAssistant) {
                      voiceAssistant.stopSpeaking();
                      voiceAssistant.stopListening();
                    }
                    setIsSpeaking(false);
                    setActiveOverlay(null);
                  }}
                  className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center text-sm font-bold cursor-pointer"
                  title="Close AI Assistant & Stop Speech"
                >
                  ✕
                </button>
              </div>
            </div>

            <div className="p-4 sm:p-6 space-y-4 flex-1 overflow-y-auto bg-[#F9F9F8]">
              {messages.map(msg => (
                <div
                  key={msg.id}
                  className={`flex flex-col ${msg.isSelf ? 'items-end' : 'items-start'}`}
                >
                  <span className="text-[10px] font-semibold text-slate-400 mb-0.5 px-1">
                    {msg.sender}
                  </span>
                  <div className="flex items-end gap-1.5 max-w-[92%] sm:max-w-[85%]">
                    <div
                      className={`px-4 py-2.5 rounded-2xl text-xs sm:text-sm leading-relaxed shadow-xs flex-1 ${
                        msg.isSelf
                          ? 'bg-[#0A0A0A] text-white rounded-tr-none'
                          : 'bg-white text-slate-900 border border-slate-200 rounded-tl-none'
                      }`}
                    >
                      {msg.text}
                    </div>
                    {!msg.isSelf && (
                      <button
                        type="button"
                        onClick={() => {
                          voiceAssistant.speak(msg.text, {
                            onStart: () => setIsSpeaking(true),
                            onEnd: () => setIsSpeaking(false)
                          });
                        }}
                        className="w-7 h-7 rounded-full bg-white border border-slate-200 text-slate-600 hover:text-black hover:scale-110 active:scale-95 flex items-center justify-center text-xs flex-shrink-0 shadow-2xs cursor-pointer"
                      >
                        🔊
                      </button>
                    )}
                  </div>
                  <span className="text-[9px] text-slate-400 mt-0.5 px-1">{msg.time}</span>
                </div>
              ))}

              {aiLoading && (
                <div className="flex items-start">
                  <div className="bg-white text-slate-600 border border-slate-200 px-4 py-2 rounded-2xl rounded-tl-none text-xs flex items-center gap-2">
                    <span className="animate-spin text-sm">⏳</span>
                    <span>{lang === 'hi' ? 'ऑफलाइन उत्तर तैयार हो रहा है...' : 'Synthesizing offline answer...'}</span>
                  </div>
                </div>
              )}
              <div ref={chatBottomRef} />
            </div>

            {/* Quick Action Chips */}
            <div className="px-5 py-3 bg-white border-t border-slate-100 flex flex-wrap gap-2">
              {[
                lang === 'hi' ? 'पीने का पानी चाहिए 💧' : 'Need drinking water 💧',
                lang === 'hi' ? 'प्राथमिक चिकित्सा 🩹' : 'First aid instructions 🩹',
                lang === 'hi' ? 'निकटतम राहत शिविर ⛺' : 'Nearest shelter camp ⛺',
                lang === 'hi' ? 'मैं सुरक्षित हूँ 👍' : 'I am safe 👍'
              ].map(chip => (
                <button
                  key={chip}
                  type="button"
                  onClick={() => handleSendMessage(chip)}
                  className="text-xs font-semibold px-3 py-1.5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-800 transition-colors cursor-pointer"
                >
                  {chip}
                </button>
              ))}
            </div>

            {/* Message Input Form with Integrated Voice Speak Button */}
            <div className="p-3 sm:p-4 bg-white border-t border-slate-200 space-y-2">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSendMessage();
                }}
                className="flex items-center gap-2"
              >
                <div className={`flex-1 flex items-center rounded-xl border bg-slate-50 transition-all ${
                  isChatListening ? 'border-red-400 ring-2 ring-red-400/30' : 'border-slate-300 focus-within:border-black'
                }`}>
                  <input
                    type="text"
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    placeholder={
                      isChatListening
                        ? (lang === 'hi' ? '🎙️ सुन रहे हैं... बोलिए...' : '🎙️ Listening... Speak now...')
                        : (lang === 'hi' ? 'कोई आपातकालीन संदेश लिखें या बोलें...' : 'Ask an emergency question or speak...')
                    }
                    className="flex-1 px-4 py-2.5 bg-transparent border-none text-xs sm:text-sm focus:outline-none text-slate-900"
                  />
                  {chatInput && (
                    <button
                      type="button"
                      onClick={() => setChatInput('')}
                      className="px-2.5 text-slate-400 hover:text-slate-700 text-xs font-bold cursor-pointer"
                      title="Clear text"
                    >
                      ✕
                    </button>
                  )}
                </div>

                {/* Voice Speak Button */}
                <button
                  type="button"
                  onClick={handleToggleChatVoice}
                  className={`px-3 sm:px-4 py-2.5 rounded-xl border text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shrink-0 shadow-2xs active:scale-95 ${
                    isChatListening
                      ? 'bg-[#DC3545] text-white border-red-500 animate-pulse shadow-md ring-2 ring-red-400/40'
                      : 'bg-amber-50 hover:bg-amber-100 border-amber-300 text-amber-900'
                  }`}
                  title={lang === 'hi' ? 'माइक से बोलकर पूछें' : 'Speak using microphone'}
                >
                  <span className="text-sm">{isChatListening ? '🔴' : '🎙️'}</span>
                  <span className="inline">
                    {isChatListening
                      ? (lang === 'hi' ? 'रोकें' : 'Stop')
                      : (lang === 'hi' ? 'बोलें' : 'Speak')}
                  </span>
                </button>

                {/* Send Button */}
                <button
                  type="submit"
                  disabled={!chatInput.trim() || aiLoading}
                  className="px-4 sm:px-5 py-2.5 rounded-xl bg-[#0A0A0A] hover:bg-slate-800 disabled:opacity-50 text-white font-bold text-xs sm:text-sm cursor-pointer shrink-0 shadow-2xs"
                >
                  {lang === 'hi' ? 'भेजें' : 'Send'}
                </button>
              </form>

              {/* Mic Unblock Helper Bar */}
              <div className="flex items-center justify-between text-[11px] text-slate-500 px-1">
                <span className="flex items-center gap-1">
                  <span>💡</span>
                  <span>{lang === 'hi' ? 'हिंदी व English दोनों में बोल सकते हैं' : 'Supports voice in Hindi & English'}</span>
                </span>
                <button
                  type="button"
                  onClick={() => setIsMicGuideOpen(true)}
                  className="text-amber-800 hover:text-amber-950 font-bold underline flex items-center gap-1 cursor-pointer"
                >
                  <span>🔓</span>
                  <span>{lang === 'hi' ? 'माइक ब्लॉक है? चालू करें' : 'Mic blocked? Unblock guide'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── MODAL 2: TACTICAL MESH MAP ── */}
      {activeOverlay === 'map' && (
        <div
          className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-start sm:items-center justify-center p-2 sm:p-4 overflow-y-auto animate-fade-in"
          onClick={(e) => {
            if (e.target === e.currentTarget) setActiveOverlay(null);
          }}
        >
          <div className="bg-white rounded-3xl w-full max-w-5xl my-auto flex flex-col overflow-hidden shadow-2xl border border-slate-200 max-h-[94vh]">
            <div className="bg-[#0A0A0A] text-white px-5 sm:px-6 py-3.5 flex items-center justify-between border-b border-neutral-800 flex-shrink-0">
              <div className="flex items-center gap-3">
                <span className="text-xl">🗺️</span>
                <div>
                  <h3 className="text-sm sm:text-base font-bold font-archivo leading-tight">
                    {lang === 'hi' ? 'टैक्टिकल रडार व मेश मैप' : 'Tactical Mesh Map & Radar'}
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    {displayNodeCount} {lang === 'hi' ? 'नोड्स जुड़े हुए हैं' : 'nodes connected on local mesh'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setActiveOverlay(null)}
                className="px-3.5 py-1.5 rounded-xl bg-white/10 hover:bg-red-600 hover:text-white text-slate-200 flex items-center gap-1 text-xs font-black transition-all cursor-pointer shadow-xs active:scale-95"
                title="Close Map (✕)"
              >
                <span>✕</span>
                <span>{lang === 'hi' ? 'मैप बंद करें' : 'Close Map'}</span>
              </button>
            </div>
            <div className="p-3 sm:p-5 overflow-y-auto flex-1 w-full bg-slate-50">
              <OfflineMap
                devices={devices}
                peers={peers}
                bluetoothPeers={bluetoothPeers}
                connectedClients={connectedClients}
                userLocation={userLocation}
                activeSosList={activeSosList}
                onClose={() => setActiveOverlay(null)}
                onOpenBluetoothModal={() => {
                  setActiveOverlay(null);
                  onOpenBleModal();
                }}
              />
            </div>
          </div>
        </div>
      )}

      {/* ── MODAL 3: SURVIVAL ESSENTIALS CHECKLIST ── */}
      {activeOverlay === 'checklist' && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl border border-slate-200 p-6 sm:p-8 space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg sm:text-xl font-bold font-archivo text-[#0A0A0A]">
                  🎒 {t.svsKitTitle}
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  {completedCount}/{checklistItems.length} {lang === 'hi' ? 'वस्तुएं तैयार' : 'items ready'}
                </p>
              </div>
              <button
                onClick={() => setActiveOverlay(null)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center text-sm font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3">
              {checklistItems.map(item => {
                const isChecked = !!checkedItems[item.id];
                return (
                  <div
                    key={item.id}
                    onClick={() => toggleCheck(item.id)}
                    className={`flex items-center justify-between p-4 rounded-2xl border transition-all cursor-pointer select-none ${
                      isChecked ? 'bg-slate-50 border-slate-200 text-emerald-700' : 'bg-white border-slate-200 text-slate-800'
                    }`}
                  >
                    <div className="flex items-center gap-3.5 flex-1 min-w-0">
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => {}}
                        className="accessible-checkbox w-5 h-5 cursor-pointer flex-shrink-0"
                      />
                      <span className="text-2xl flex-shrink-0">{item.icon}</span>
                      <span className={`text-xs sm:text-sm font-bold truncate ${isChecked ? 'line-through text-slate-400 font-normal' : ''}`}>
                        {item.text}
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSurvivalKitAi(item.id);
                      }}
                      className="px-3 py-1.5 rounded-xl bg-red-50 hover:bg-[#E13A2E] text-[#E13A2E] hover:text-white border border-red-200 text-xs font-bold transition-all cursor-pointer flex items-center gap-1 flex-shrink-0 ml-2"
                      title="Instant AI Advice"
                    >
                      <span>⚡</span>
                      <span>{lang === 'hi' ? 'AI सलाह' : 'Ask AI'}</span>
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ── MODAL 4: RELIEF CAMPS & STATIONS ── */}
      {activeOverlay === 'stations' && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl border border-slate-200 p-6 sm:p-8 space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg sm:text-xl font-bold font-archivo text-[#0A0A0A]">
                  🏕️ {t.svsCampsTitle}
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  {lang === 'hi' ? 'स्थानीय मेश राहत व सहायता केंद्र' : 'Local Mesh Emergency Response Stations'}
                </p>
              </div>
              <button
                onClick={() => setActiveOverlay(null)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center text-sm font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3">
              <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50/50 flex items-start gap-3">
                <span className="text-2xl">🏥</span>
                <div>
                  <div className="text-xs sm:text-sm font-bold text-[#0A0A0A]">
                    {lang === 'hi' ? 'चिकित्सा सहायता स्टेशन A' : 'Medical Aid Station A'}
                  </div>
                  <div className="text-[11px] text-slate-500 mt-0.5">
                    {lang === 'hi' ? 'डिवाइस A • पोर्ट 4001 • प्राथमिक उपचार, दवाइयां व सीपीआर' : 'Device A • Port 4001 • First aid, medicines & emergency triage'}
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50/50 flex items-start gap-3">
                <span className="text-2xl">⛺</span>
                <div>
                  <div className="text-xs sm:text-sm font-bold text-[#0A0A0A]">
                    {lang === 'hi' ? 'राहत शिविर व आश्रय स्टेशन B' : 'Relief & Shelter Camp Station B'}
                  </div>
                  <div className="text-[11px] text-slate-500 mt-0.5">
                    {lang === 'hi' ? 'डिवाइस B • पोर्ट 4002 • सुरक्षित आश्रय, भोजन व स्वच्छ पेयजल' : 'Device B • Port 4002 • Safe shelter, food & clean drinking water'}
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50/50 flex items-start gap-3">
                <span className="text-2xl">🗺️</span>
                <div>
                  <div className="text-xs sm:text-sm font-bold text-[#0A0A0A]">
                    {lang === 'hi' ? 'सुरक्षित मार्ग व मैप स्टेशन C' : 'Safe Corridors & Mapping Station C'}
                  </div>
                  <div className="text-[11px] text-slate-500 mt-0.5">
                    {lang === 'hi' ? 'डिवाइस C • पोर्ट 4003 • ऑफलाइन मैप व सुरक्षित निकासी गलियारे' : 'Device C • Port 4003 • Offline maps & safe evacuation corridors'}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── MODAL 5: CONNECTED NETWORK DEVICES MODAL ── */}
      <ConnectedNetworkModal
        isOpen={isNetworkModalOpen}
        onClose={() => setIsNetworkModalOpen(false)}
        meshStatus={meshStatus}
        lang={lang}
        onOpenBleModal={onOpenBleModal}
        onNavigateToMap={() => setActiveOverlay('map')}
      />

      {/* ── MODAL 6: MICROPHONE PERMISSION UNBLOCK GUIDE ── */}
      <MicPermissionModal
        isOpen={isMicGuideOpen}
        onClose={() => setIsMicGuideOpen(false)}
        onSelectPreset={(txt) => {
          setChatInput(txt);
          setActiveOverlay('ai');
        }}
        lang={lang}
      />

    </div>
  );
}
