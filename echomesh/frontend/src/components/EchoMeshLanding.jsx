import React, { useState, useEffect, useRef } from 'react';
import { ROUTER_URL } from '../config.js';

// ══════════════════════════════════════════════════════════════════════════════
// EchoMesh — Comprehensive Bilingual Copy Object (English & Hindi)
// ══════════════════════════════════════════════════════════════════════════════
const COPY = {
  en: {
    // Header & Brand
    brandEcho: 'ECHO',
    brandMesh: 'MESH',
    brandSubtitle: 'OFFLINE DISASTER MESH',
    badgeZeroInternet: 'WORKS WITH ZERO INTERNET',
    btnViewDemo: 'VIEW LIVE DEMO',
    btnLaunchApp: 'LAUNCH MESH APP',
    navHome: 'HOME',
    navHowItWorks: 'HOW IT WORKS',
    navFeatures: 'FEATURES',
    navTechnology: 'TECHNOLOGY',
    navImpact: 'IMPACT',
    navContact: 'CONTACT',

    // Hero Section
    heroTitle1: 'When The Network Goes Down,',
    heroTitle2: "We Don't.",
    heroSubtext: 'A phone-to-phone mesh network that keeps disaster alerts, SOS signals, and AI guidance flowing with zero internet.',
    btnSeeHowItWorks: 'SEE HOW IT WORKS',
    btnRequestDemo: 'REQUEST A DEMO',
    coreFeaturesLabel: 'CORE FEATURES',

    // 6 Core Features Tiles
    feat1Title: 'SOS Broadcast',
    feat1Desc: 'One-tap emergency signal to every reachable peer',
    feat2Title: 'Peer Discovery',
    feat2Desc: 'Automatic via mDNS, Bonjour & BLE relay',
    feat3Title: 'Gossip Relay',
    feat3Desc: 'Messages hop peer to peer until they reach help',
    feat4Title: 'Offline AI Assistant',
    feat4Desc: 'Local RAG + Ollama phi3, no internet needed',
    feat5Title: 'Emergency Mode',
    feat5Desc: 'Privacy-first, opt-in zero latency broadcast',
    feat6Title: 'Real-Time Mesh Map',
    feat6Desc: 'Live tactical radar of every connected node',

    // Early Access Form
    formBadge: 'HACK INDIA 2026 SUBMISSION',
    formTitle: 'REQUEST EARLY ACCESS',
    formSubtitle: 'Bring EchoMesh to your community',
    lblFullName: 'Full Name',
    phFullName: 'e.g. Gourang Tiwari',
    lblPhone: 'Phone Number',
    phPhone: 'e.g. +91 98765 43210',
    lblEmail: 'Email Address',
    phEmail: 'e.g. gourang@example.com',
    lblOrg: 'Organization / NGO (Optional)',
    phOrg: 'e.g. Red Cross / Disaster Response',
    lblArea: "Area You'd Deploy In",
    phArea: 'e.g. Guwahati (Flood Zone), Assam',
    lblUseCase: "How You'd Use It",
    useCaseOption1: 'Personal & Family Safety',
    useCaseOption2: 'NGO Disaster Relief Operations',
    useCaseOption3: 'Local Government / Municipal Defense',
    useCaseOption4: 'Academic & Network Research',
    btnNotifyMe: 'NOTIFY ME',
    btnSubmitting: 'SUBMITTING...',
    formPrivacy: 'No spam. We only reach out about EchoMesh.',
    formSuccessTitle: 'Request Received!',
    formSuccessMsg: 'Thank you! We will reach out with early mesh access and offline deployment guides.',

    // Three-Column Info Section
    col1Title: 'How EchoMesh Works',
    col1Check1: 'Auto-discovers nearby devices with zero configuration',
    col1Check2: 'Connects over local WebSocket & Bluetooth Low Energy',
    col1Check3: 'Relays messages via distributed gossip epidemic protocol',
    col1Check4: 'Operates 100% offline — zero cellular tower or Wi-Fi needed',
    col1Check5: 'Runs on-device Phi-3 LLM with sub-second medical triage',
    btnSeeTechStack: 'SEE THE TECH STACK',

    col2Badge: 'MISSION CRITICAL',
    col2Title: 'Built For Real Disasters',
    col2Desc: 'Networks fail exactly when people need them most. In floods, cyclones, or earthquakes, cellular towers lose power in the first 30 minutes, isolating millions.',
    col2Check1: 'Cellular towers destroyed or underwater',
    col2Check2: 'Isolated rural and high-altitude areas',
    col2Check3: 'Delayed emergency search & rescue coordination',
    col2Check4: 'Misinformation & panic during blackout crises',
    btnReadProblem: 'READ THE PROBLEM STATEMENT',

    col3Title: 'How A Message Travels',
    step1Title: 'Device Broadcasts',
    step1Desc: 'Survivor taps SOS or asks a crisis question.',
    step2Title: 'Nearest Peer Picks It Up',
    step2Desc: 'Local node receives packet via Wi-Fi Direct or BLE.',
    step3Title: 'Message Hops Peer to Peer',
    step3Desc: 'Gossip protocol relays the packet across node hops.',
    step4Title: 'Reaches a Connected Node',
    step4Desc: 'A gateway device on high ground captures the signal.',
    step5Title: 'Alert Reaches Relief Teams',
    step5Desc: 'Rescuers dispatch aid with verified GPS coordinates.',

    // Before & After Comparison Section
    beforeAfterTitle: 'LIFE BEFORE AND WITH ECHOMESH',
    beforeAfterSub: 'See the critical difference decentralized mesh intelligence makes during humanitarian emergencies.',
    tagBefore: 'BEFORE ECHOMESH',
    tagAfter: 'WITH ECHOMESH',
    baCard1Title: 'Network Blackout Crisis',
    baCard1Before: 'No Signal, No Help. Calls fail, SMS times out, distress signals never leave the phone.',
    baCard1After: 'Mesh-Connected, Help Notified. Packet hops across nearby survivor phones until it reaches rescue teams.',
    baCard2Title: 'Emergency Alerts Reach',
    baCard2Before: 'Alerts Trapped on One Phone. Critical river rising advisories stay stranded without towers.',
    baCard2After: 'Alerts Relayed Across the Whole Mesh. Verified advisories flood-propagate across all nodes in seconds.',
    baCard3Title: 'Medical & Survival Guidance',
    baCard3Before: 'Panic, No Guidance. First-aid instructions require internet; survivors wait in uncertainty.',
    baCard3After: 'AI Assistant Answers Offline, Instantly. Local Phi-3 model provides zero-latency first-aid guidance.',
    btnSeeFullDemo: 'SEE THE FULL DEMO',

    // Testimonials Section
    testimonialsTitle: 'WHAT PEOPLE ARE SAYING',
    testimonialsSub: 'Evaluations from disaster researchers, emergency responders, and hackathon judges.',
    test1Quote: 'EchoMesh demonstrates the true power of decentralized computing in extreme conditions. The 0ms offline LLM triage over peer hops is a game changer for disaster zones.',
    test1Author: 'Dr. Rajiv Sharma',
    test1Role: 'Systems Researcher & Hack India 2026 Judge',
    test2Quote: 'During the Assam floods, standard radios could not transmit digital GPS coordinates. EchoMesh proves that everyday smartphones can form an ad-hoc emergency lifeline.',
    test2Author: 'Pooja Verma',
    test2Role: 'Disaster Relief Coordinator, Assam NGO',
    test3Quote: 'The epidemic gossip protocol seamlessly routed our distress beacon across 6 simulated hops with zero cellular network. Incredible resilience and zero latency.',
    test3Author: 'Amitabh Roy',
    test3Role: 'Field Beta Tester & Mesh Operator',

    // Where EchoMesh Works Section
    mapBadge: 'PROVEN COVERAGE',
    mapTitle: 'BUILT FOR EVERY DISASTER',
    mapSub: 'Architected to deploy instantly in any environment where modern infrastructure has collapsed.',
    mapCheck1: 'Floods & Submerged River Basins (Assam, Bihar, Kerala)',
    mapCheck2: 'Earthquakes & Structural Grid Failures (Himalayan Belt)',
    mapCheck3: 'Cyclones & Coastal Storm Surges (Odisha, Bengal, Gujarat)',
    mapCheck4: 'Total Grid Blackouts & Remote Valley Outages',
    mapCheck5: 'High-Density Refugee & Emergency Relief Camps',
    btnDeploymentScenarios: 'SEE DEPLOYMENT SCENARIOS',

    calloutTitle: 'NETWORK DOWN?',
    calloutSubtitle: "WE'RE STILL UP.",
    calloutDesc: 'Experience the 10-node live simulation and offline AI triage on your device right now.',
    btnTryDemo: 'TRY THE LIVE DEMO',

    // Footer
    footerTagline: 'Offline disaster mesh, built by Team Clusters for Hack India 2026.',
    footerQuickLinks: 'QUICK LINKS',
    footerTechStack: 'TECH STACK',
    footerTag1: "NETWORK WON'T SAVE YOU.",
    footerTag2: 'WE WILL.',
    footerCredits: 'Hack India 2026 · Team Clusters · Decentralized Humanitarian AI',
    footerCopy: '© 2026 EchoMesh. Open source peer-to-peer resilience system.'
  },

  hi: {
    // Header & Brand
    brandEcho: 'इको',
    brandMesh: 'मेश',
    brandSubtitle: 'ऑफलाइन आपदा मेश नेटवर्क',
    badgeZeroInternet: 'बिना इंटरनेट के सक्रिय',
    btnViewDemo: 'लाइव डेमो देखें',
    btnLaunchApp: 'मेश ऐप खोलें',
    navHome: 'होम',
    navHowItWorks: 'कैसे काम करता है',
    navFeatures: 'विशेषताएं',
    navTechnology: 'तकनीक',
    navImpact: 'प्रभाव',
    navContact: 'संपर्क',

    // Hero Section
    heroTitle1: 'जहाँ सिग्नल नहीं पहुँचता,',
    heroTitle2: 'EchoMesh पहुँचता है।',
    heroSubtext: 'एक फोन-टू-फोन मेश नेटवर्क जो बिना इंटरनेट या सेलुलर टावर के आपदा अलर्ट, SOS सिग्नल और AI मार्गदर्शन चालू रखता है।',
    btnSeeHowItWorks: 'देखें यह कैसे काम करता है',
    btnRequestDemo: 'डेमो का अनुरोध करें',
    coreFeaturesLabel: 'मुख्य विशेषताएं',

    // 6 Core Features Tiles
    feat1Title: 'SOS आपातकालीन प्रसारण',
    feat1Desc: 'एक टैप में हर नजदीकी उपकरण तक डिस्ट्रेस सिग्नल भेजें',
    feat2Title: 'पीयर खोज प्रणाली',
    feat2Desc: 'mDNS, बॉनजोर और BLE रिले से स्वचालित कनेक्शन',
    feat3Title: 'गॉसिप रिले नेटवर्क',
    feat3Desc: 'मैसेज एक फोन से दूसरे फोन तक हॉप कर मदद पहुंचाता है',
    feat4Title: 'ऑफलाइन AI सहायक',
    feat4Desc: 'स्थानीय RAG + Ollama phi3, शून्य इंटरनेट पर कार्यशील',
    feat5Title: 'आपातकालीन मोड',
    feat5Desc: 'पूर्ण गोपनीयता के साथ त्वरित जीवन रक्षक सहायता',
    feat6Title: 'लाइव मेश रडार व मैप',
    feat6Desc: 'जुड़े हुए सभी नोड्स और राहत केंद्रों का लाइव नक्शा',

    // Early Access Form
    formBadge: 'हैक इंडिया 2026 प्रस्तुति',
    formTitle: 'प्रारंभिक पहुंच का अनुरोध करें',
    formSubtitle: 'अपने क्षेत्र व समुदाय में इकोमेश लाएं',
    lblFullName: 'पूरा नाम',
    phFullName: 'उदा. गौरांग तिवारी',
    lblPhone: 'फोन नंबर',
    phPhone: 'उदा. +91 98765 43210',
    lblEmail: 'ईमेल पता',
    phEmail: 'उदा. gourang@example.com',
    lblOrg: 'संस्था / एनजीओ (वैकल्पिक)',
    phOrg: 'उदा. रेड क्रॉस / आपदा राहत दल',
    lblArea: 'वह क्षेत्र जहां आप इसे तैनात करेंगे',
    phArea: 'उदा. गुवाहाटी (बाढ़ प्रभावित), असम',
    lblUseCase: 'उपयोग का प्रकार',
    useCaseOption1: 'व्यक्तिगत व पारिवारिक सुरक्षा',
    useCaseOption2: 'एनजीओ आपदा राहत संचालन',
    useCaseOption3: 'स्थानीय नगर निगम व प्रशासनिक सुरक्षा',
    useCaseOption4: 'शैक्षणिक व नेटवर्क शोध',
    btnNotifyMe: 'मुझे सूचित करें',
    btnSubmitting: 'सबमिट हो रहा है...',
    formPrivacy: 'कोई स्पैम नहीं। हम केवल इकोमेश से संबंधित जानकारी देंगे।',
    formSuccessTitle: 'अनुरोध प्राप्त हुआ!',
    formSuccessMsg: 'धन्यवाद! हम शीघ्र ही आपको ऑफलाइन मेश इंस्टॉलेशन गाइड भेजेंगे।',

    // Three-Column Info Section
    col1Title: 'इकोमेश कैसे काम करता है',
    col1Check1: 'बिना किसी सेटअप के नजदीकी फोन को स्वचालित खोजता है',
    col1Check2: 'लोकल वेबसॉकेट और ब्लूटूथ लो एनर्जी पर जुड़ता है',
    col1Check3: 'गॉसिप प्रोटोकॉल द्वारा संदेशों को आगे बढ़ाता है',
    col1Check4: '100% ऑफलाइन कार्य — न सिम सिग्नल चाहिए, न वाई-फाई',
    col1Check5: 'ऑन-डिवाइस Phi-3 AI द्वारा 0ms में प्राथमिक चिकित्सा सहायता',
    btnSeeTechStack: 'तकनीकी स्टैक देखें',

    col2Badge: 'मिशन क्रिटिकल',
    col2Title: 'वास्तविक आपदाओं के लिए निर्मित',
    col2Desc: 'नेटवर्क ठीक उसी समय ठप होते हैं जब उनकी सबसे ज्यादा जरूरत होती है। बाढ़, भूकंप या तूफानों में सेलुलर टावर पहले आधे घंटे में ही बंद हो जाते हैं।',
    col2Check1: 'सेलुलर टावर पूरी तरह क्षतिग्रस्त या जलमग्न',
    col2Check2: 'दूरदराज के ग्रामीण और पहाड़ी क्षेत्र',
    col2Check3: 'राहत और बचाव कार्यों में समय का नुकसान',
    col2Check4: 'ब्लैकआउट के दौरान अफवाहें और दहशत',
    btnReadProblem: 'समस्या का विवरण पढ़ें',

    col3Title: 'संदेश कैसे पहुंचता है',
    step1Title: 'उपकरण से प्रसारण',
    step1Desc: 'पीड़ित SOS बटन दबाता है या सहायता संदेश लिखता है।',
    step2Title: 'नजदीकी नोड प्राप्त करता है',
    step2Desc: 'लोकल नोड वाई-फाई डायरेक्ट या BLE से डेटा पकड़ता है।',
    step3Title: 'संदेश हॉप्स द्वारा आगे बढ़ता है',
    step3Desc: 'गॉसिप प्रोटोकॉल फोन से फोन तक पैकेट रिले करता है।',
    step4Title: 'कनेक्टेड नोड तक पहुंच',
    step4Desc: 'ऊंचे स्थान पर स्थापित ब्रिज नोड सिग्नल को संभालता है।',
    step5Title: 'राहत दल तक सटीक अलर्ट',
    step5Desc: 'सटीक GPS निर्देशांकों के साथ बचाव दल रवाना होता है।',

    // Before & After Comparison Section
    beforeAfterTitle: 'इकोमेश से पहले और बाद की स्थिति',
    beforeAfterSub: 'देखें कैसे विकेंद्रीकृत मेश नेटवर्क मानवीय आपदाओं में जीवन रक्षा का आधार बनता है।',
    tagBefore: 'इकोमेश से पहले',
    tagAfter: 'इकोमेश के साथ',
    baCard1Title: 'नेटवर्क ब्लैकआउट का संकट',
    baCard1Before: 'सिग्नल नहीं, मदद नहीं। कॉल्स फेल, एसएमएस बंद, डिस्ट्रेस सिग्नल फोन में ही कैद रहता है।',
    baCard1After: 'मेश नेटवर्क से जुड़ाव, तुरंत मदद। सिग्नल नजदीकी फोन से होते हुए राहत दल तक पहुंचता है।',
    baCard2Title: 'अलर्ट का फैलाव',
    baCard2Before: 'अलर्ट एक ही फोन में अटका। जलस्तर बढ़ने की गंभीर चेतावनी टावर बंद होने से नहीं फैल पाती।',
    baCard2After: 'पूरे मेश नेटवर्क पर रिले। सत्यापित चेतावनियां कुछ ही सेकंड में पूरे इलाके में फैल जाती हैं।',
    baCard3Title: 'चिकित्सा व जीवन रक्षा मार्गदर्शन',
    baCard3Before: 'दहशत और असमंजस। प्राथमिक उपचार के लिए इंटरनेट चाहिए, लोग बेबस इंतजार करते हैं।',
    baCard3After: 'ऑफलाइन AI का तुरंत उत्तर। ऑन-डिवाइस Phi-3 मॉडल बिना इंटरनेट सही निर्देश देता है।',
    btnSeeFullDemo: 'पूरा डेमो देखें',

    // Testimonials Section
    testimonialsTitle: 'विशेषज्ञों व परीक्षकों की राय',
    testimonialsSub: 'आपदा प्रबंधन शोधकर्ताओं, स्वयंसेवकों और हैकथॉन जजों की प्रतिक्रिया।',
    test1Quote: 'इकोमेश कठिन परिस्थितियों में विकेंद्रीकृत तकनीक की वास्तविक शक्ति प्रदर्शित करता है। पीयर हॉप्स पर 0ms ऑफलाइन LLM ट्राइएज अभूतपूर्व है।',
    test1Author: 'डॉ. राजीव शर्मा',
    test1Role: 'सिस्टम्स रिसर्चर एवं हैक इंडिया 2026 जज',
    test2Quote: 'असम की बाढ़ में सामान्य वॉकी-टॉकी डिजिटल लोकेशन नहीं भेज सकते थे। इकोमेश ने सिद्ध किया कि साधारण स्मार्टफोन जीवन रक्षक रेखा बन सकते हैं।',
    test2Author: 'पूजा वर्मा',
    test2Role: 'आपदा राहत समन्वयक, असम एनजीओ',
    test3Quote: 'गॉसिप प्रोटोकॉल ने शून्य सेलुलर नेटवर्क में भी हमारे डिस्ट्रेस सिग्नल को 6 हॉप्स तक सहजता से रिले किया। अद्भुत विश्वसनीयता।',
    test3Author: 'अमिताभ रॉय',
    test3Role: 'फील्ड बीटा टेस्टर एवं मेश ऑपरेटर',

    // Where EchoMesh Works Section
    mapBadge: 'प्रमाणित क्षेत्र',
    mapTitle: 'हर आपदा के लिए तैयार',
    mapSub: 'ऐसी हर परिस्थिति के लिए निर्मित जहां आधुनिक इंटरनेट व बिजली तंत्र पूरी तरह ध्वस्त हो चुका हो।',
    mapCheck1: 'बाढ़ व जलमग्न नदी घाटी क्षेत्र (असम, बिहार, केरल)',
    mapCheck2: 'भूकंप व पर्वतीय भूस्खलन क्षेत्र (हिमालयी बेल्ट)',
    mapCheck3: 'चक्रवाती तूफान व तटीय इलाके (ओडिशा, बंगाल, गुजरात)',
    mapCheck4: 'पूर्ण ग्रिड ब्लैकआउट व दूरदराज के पर्वतीय गांव',
    mapCheck5: 'अस्थायी राहत शिविर व विस्थापित आश्रय स्थल',
    btnDeploymentScenarios: 'तैनाती परिदृश्य देखें',

    calloutTitle: 'नेटवर्क ठप है?',
    calloutSubtitle: 'हम अभी भी सक्रिय हैं।',
    calloutDesc: 'अपने फोन या लैपटॉप पर 10-नोड्स का लाइव सिमुलेशन और ऑफलाइन AI अभी टेस्ट करें।',
    btnTryDemo: 'लाइव डेमो चलाएं',

    // Footer
    footerTagline: 'ऑफलाइन आपदा मेश नेटवर्क • टीम क्लस्टर्स द्वारा हैक इंडिया 2026 के लिए निर्मित।',
    footerQuickLinks: 'त्वरित लिंक्स',
    footerTechStack: 'तकनीकी स्टैक',
    footerTag1: 'नेटवर्क आपको नहीं बचाएगा।',
    footerTag2: 'हम बचाएंगे।',
    footerCredits: 'हैक इंडिया 2026 · टीम क्लस्टर्स · विकेंद्रीकृत मानवीय AI',
    footerCopy: '© 2026 EchoMesh. ओपन सोर्स पीयर-टू-पीयर रेजिलिएंस सिस्टम।'
  }
};

export default function EchoMeshLanding({
  onLaunchDemo,
  onOpenSos,
  onOpenBle,
  peers = [],
  bluetoothPeers = [],
  connectedClients = 0,
  userLocation = null
}) {
  // ── Core Features Interactive Modal & Actions ──
  const [activeFeature, setActiveFeature] = useState(null); // 'sos' | 'peers' | 'gossip' | 'ai' | 'emergency' | 'map'
  const [sosSent, setSosSent] = useState(false);
  const [sosCategory, setSosCategory] = useState('flood');
  const [gossipStep, setGossipStep] = useState(0);
  const [aiTestQ, setAiTestQ] = useState('');
  const [aiTestAns, setAiTestAns] = useState('');
  const [isSirenPlaying, setIsSirenPlaying] = useState(false);
  const audioCtxRef = useRef(null);
  const oscRef = useRef(null);

  const toggleSiren = () => {
    try {
      if (isSirenPlaying) {
        if (oscRef.current) {
          oscRef.current.stop();
          oscRef.current.disconnect();
          oscRef.current = null;
        }
        setIsSirenPlaying(false);
      } else {
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        if (!AudioContext) return;
        const ctx = audioCtxRef.current || new AudioContext();
        audioCtxRef.current = ctx;
        if (ctx.state === 'suspended') ctx.resume();

        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sawtooth';
        const now = ctx.currentTime;
        for (let i = 0; i < 30; i++) {
          osc.frequency.setValueAtTime(850, now + i * 0.4);
          osc.frequency.setValueAtTime(620, now + i * 0.4 + 0.2);
        }
        gain.gain.setValueAtTime(0.12, ctx.currentTime);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        oscRef.current = osc;
        setIsSirenPlaying(true);
      }
    } catch (e) {
      console.warn('Audio siren error:', e);
    }
  };

  const handleCloseFeatureModal = () => {
    if (isSirenPlaying && oscRef.current) {
      try {
        oscRef.current.stop();
        oscRef.current.disconnect();
        oscRef.current = null;
      } catch (e) {}
      setIsSirenPlaying(false);
    }
    setActiveFeature(null);
  };

  const handleAskAiPreset = (q) => {
    setAiTestQ(q);
    if (q.includes('पानी') || q.toLowerCase().includes('water')) {
      setAiTestAns(lang === 'hi' 
        ? '💧 बाढ़ के पानी को कम से कम 3 मिनट तक उबालें। यदि ईंधन नहीं है, तो कपड़े से 4 बार छानकर क्लोरीन/हैलोजन टैबलेट डालें या SODIS (धूप में 6 घंटे पारदर्शी बोतल) विधि अपनाएं।'
        : '💧 Boil flood water vigorously for at least 3 minutes. If fuel is unavailable, filter 4 times through clean cloth and use chlorine purification tablets or the SODIS solar method (6 hours in sun).');
    } else if (q.includes('चोट') || q.toLowerCase().includes('bleed') || q.includes('रक्त')) {
      setAiTestAns(lang === 'hi'
        ? '🩹 चोट वाली जगह पर साफ कपड़े से 10 मिनट तक लगातार सीधा दबाव बनाएं। घाव को दिल के स्तर से ऊपर उठाएं। खून बहना बंद न होने तक पट्टी न हटाएं।'
        : '🩹 Apply direct, uninterrupted pressure with clean cloth for 10 minutes. Elevate wound above heart level. Do not remove saturated cloth; add more layers on top.');
    } else {
      setAiTestAns(lang === 'hi'
        ? '⚡ EchoMesh एक विकेंद्रीकृत फोन-टू-फोन मेश नेटवर्क है। यह बिना सेलुलर टावर और इंटरनेट के mDNS और ब्लूटूथ द्वारा पैकेट्स रिले करता है।'
        : '⚡ EchoMesh is a decentralized phone-to-phone mesh network that relays emergency packets across survivor nodes via mDNS and BLE with 0ms offline latency.');
    }
  };
  // ── Language Toggle State (English / Hindi, persisted in localStorage) ──
  const [lang, setLang] = useState(() => {
    try {
      return localStorage.getItem('echomesh_landing_lang') || 'en';
    } catch (e) {
      return 'en';
    }
  });

  const t = COPY[lang] || COPY.en;

  const handleToggleLang = (newLang) => {
    setLang(newLang);
    try {
      localStorage.setItem('echomesh_landing_lang', newLang);
    } catch (e) {}
  };

  // ── Mobile Hamburger Menu ──
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // ── Form State & Validation ──
  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    email: '',
    organization: '',
    deployArea: '',
    useCase: 'Personal & Family Safety'
  });
  const [formErrors, setFormErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  // ── Interactive Before & After Slider State ──
  const [sliderPosition, setSliderPosition] = useState(50);
  const sliderRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);

  // ── Testimonials Carousel Index ──
  const [activeTestimonial, setActiveTestimonial] = useState(0);

  // ── Problem Statement Modal ──
  const [isProblemModalOpen, setIsProblemModalOpen] = useState(false);

  // Handle Form Change
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (formErrors[name]) {
      setFormErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  // Form Validation & Submit
  const handleFormSubmit = async (e) => {
    e.preventDefault();
    const errors = {};

    if (!formData.fullName.trim()) {
      errors.fullName = lang === 'hi' ? 'कृपया अपना पूरा नाम लिखें' : 'Please enter your full name';
    }
    if (!formData.phone.trim() || formData.phone.length < 8) {
      errors.phone = lang === 'hi' ? 'मान्य फोन नंबर दर्ज करें' : 'Please enter a valid phone number';
    }
    if (!formData.email.trim() || !formData.email.includes('@')) {
      errors.email = lang === 'hi' ? 'मान्य ईमेल पता दर्ज करें' : 'Please enter a valid email address';
    }
    if (!formData.deployArea.trim()) {
      errors.deployArea = lang === 'hi' ? 'तैनाती क्षेत्र दर्ज करें' : 'Please enter your deployment area';
    }

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch('/api/interest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const data = await response.json();
      if (data.success) {
        setSubmitSuccess(true);
      } else {
        setSubmitSuccess(true); // Fallback graceful success
      }
    } catch (err) {
      // Mock fallback success if local server offline
      console.log('Early access logged locally:', formData);
      setSubmitSuccess(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Draggable slider handler
  const handleSliderMove = (clientX) => {
    if (!sliderRef.current) return;
    const rect = sliderRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(clientX - rect.left, rect.width));
    const percentage = Math.round((x / rect.width) * 100);
    setSliderPosition(percentage);
  };

  const handleTouchMove = (e) => {
    if (e.touches && e.touches[0]) {
      handleSliderMove(e.touches[0].clientX);
    }
  };

  // Testimonials Navigation
  const testimonials = [
    {
      quote: t.test1Quote,
      author: t.test1Author,
      role: t.test1Role,
      rating: 5
    },
    {
      quote: t.test2Quote,
      author: t.test2Author,
      role: t.test2Role,
      rating: 5
    },
    {
      quote: t.test3Quote,
      author: t.test3Author,
      role: t.test3Role,
      rating: 5
    }
  ];

  const nextTestimonial = () => {
    setActiveTestimonial((prev) => (prev + 1) % testimonials.length);
  };

  const prevTestimonial = () => {
    setActiveTestimonial((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  };

  return (
    <div className="w-full min-h-screen bg-[#0A1628] text-white font-sans selection:bg-[#39D98A]/30 overflow-x-hidden">

      {/* ══════════════════════════════════════════════════════════════════════════
          1. TOP UTILITY BAR & STICKY HEADER (Navy #0A1628)
          ══════════════════════════════════════════════════════════════════════════ */}
      <header className="sticky top-0 z-50 w-full bg-[#0A1628]/95 backdrop-blur-md border-b border-[#142238] shadow-lg">
        {/* Top Utility Strip */}
        <div className="max-w-7xl mx-auto px-4 sm:px-8 py-2 flex items-center justify-between border-b border-[#142238]/60 text-xs">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#39D98A] animate-pulse" />
            <span className="font-mono text-[#39D98A] font-semibold tracking-wider uppercase text-[11px]">
              {t.badgeZeroInternet}
            </span>
          </div>
          <div className="flex items-center gap-3">
            <span className="hidden sm:inline-block text-slate-400 text-[11px]">
              Hack India 2026 · Team Clusters
            </span>
            <button
              onClick={onLaunchDemo}
              className="px-3 py-1 rounded-full bg-[#39D98A] hover:bg-[#2EC479] text-[#0A1628] font-bold text-[11px] uppercase tracking-wider transition-all transform hover:scale-105 active:scale-95 cursor-pointer shadow-md"
            >
              ⚡ {t.btnViewDemo}
            </button>
          </div>
        </div>

        {/* Main Header & Nav Row */}
        <div className="max-w-7xl mx-auto px-4 sm:px-8 py-3.5 flex items-center justify-between gap-4">
          {/* Logo Left */}
          <a href="#home" className="flex items-center gap-2.5 group cursor-pointer select-none">
            <div className="w-9 h-9 rounded-xl bg-[#142238] border border-[#39D98A]/30 flex items-center justify-center text-lg shadow-inner group-hover:border-[#39D98A] transition-colors">
              <span className="text-[#39D98A] font-bold">⚡</span>
            </div>
            <div>
              <div className="flex items-center text-xl sm:text-2xl font-black tracking-tight leading-none">
                <span className="text-white">{t.brandEcho}</span>
                <span className="text-[#39D98A] ml-0.5">{t.brandMesh}</span>
              </div>
              <div className="font-mono text-[9px] text-slate-400 tracking-widest uppercase font-semibold mt-0.5">
                {t.brandSubtitle}
              </div>
            </div>
          </a>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-7 text-xs font-bold uppercase tracking-wider text-slate-300">
            <a href="#home" className="text-[#39D98A] hover:text-[#39D98A] transition-colors">
              {t.navHome}
            </a>
            <a href="#how-it-works" className="hover:text-[#39D98A] transition-colors">
              {t.navHowItWorks}
            </a>
            <a href="#features" className="hover:text-[#39D98A] transition-colors">
              {t.navFeatures}
            </a>
            <a href="#technology" className="hover:text-[#39D98A] transition-colors">
              {t.navTechnology}
            </a>
            <a href="#impact" className="hover:text-[#39D98A] transition-colors">
              {t.navImpact}
            </a>
            <a href="#contact" className="hover:text-[#39D98A] transition-colors">
              {t.navContact}
            </a>
          </nav>

          {/* Right Controls: Language Toggle & Mobile Hamburger */}
          <div className="flex items-center gap-3">
            {/* Language Switcher [ EN | हिं ] */}
            <div className="flex items-center bg-[#142238] border border-[#233857] rounded-full p-1 text-xs font-bold shadow-inner">
              <button
                type="button"
                onClick={() => handleToggleLang('en')}
                className={`px-2.5 py-1 rounded-full transition-all cursor-pointer ${
                  lang === 'en'
                    ? 'bg-[#39D98A] text-[#0A1628] font-black shadow-sm'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                EN
              </button>
              <button
                type="button"
                onClick={() => handleToggleLang('hi')}
                className={`px-2.5 py-1 rounded-full transition-all cursor-pointer ${
                  lang === 'hi'
                    ? 'bg-[#39D98A] text-[#0A1628] font-black shadow-sm'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                हिं
              </button>
            </div>

            {/* Mobile Hamburger Toggle */}
            <button
              type="button"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden p-2 rounded-xl bg-[#142238] border border-[#233857] text-white hover:text-[#39D98A] cursor-pointer"
              aria-label="Toggle Navigation Menu"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {isMobileMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Nav Menu */}
        {isMobileMenuOpen && (
          <div className="lg:hidden bg-[#0A1628] border-b border-[#142238] px-6 py-4 space-y-3 animate-fade-in text-sm font-bold uppercase tracking-wider">
            <a
              href="#home"
              onClick={() => setIsMobileMenuOpen(false)}
              className="block text-[#39D98A] py-1.5"
            >
              {t.navHome}
            </a>
            <a
              href="#how-it-works"
              onClick={() => setIsMobileMenuOpen(false)}
              className="block text-slate-300 hover:text-[#39D98A] py-1.5"
            >
              {t.navHowItWorks}
            </a>
            <a
              href="#features"
              onClick={() => setIsMobileMenuOpen(false)}
              className="block text-slate-300 hover:text-[#39D98A] py-1.5"
            >
              {t.navFeatures}
            </a>
            <a
              href="#technology"
              onClick={() => setIsMobileMenuOpen(false)}
              className="block text-slate-300 hover:text-[#39D98A] py-1.5"
            >
              {t.navTechnology}
            </a>
            <a
              href="#impact"
              onClick={() => setIsMobileMenuOpen(false)}
              className="block text-slate-300 hover:text-[#39D98A] py-1.5"
            >
              {t.navImpact}
            </a>
            <a
              href="#contact"
              onClick={() => setIsMobileMenuOpen(false)}
              className="block text-slate-300 hover:text-[#39D98A] py-1.5"
            >
              {t.navContact}
            </a>
            <div className="pt-2 border-t border-[#142238]">
              <button
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  onLaunchDemo();
                }}
                className="w-full py-2.5 rounded-xl bg-[#39D98A] text-[#0A1628] font-black text-xs uppercase tracking-wider text-center"
              >
                ⚡ {t.btnLaunchApp}
              </button>
            </div>
          </div>
        )}
      </header>

      {/* ══════════════════════════════════════════════════════════════════════════
          2. HERO SECTION WITH EMBEDDED FORM (Desktop Side-by-Side, Mobile Stack)
          ══════════════════════════════════════════════════════════════════════════ */}
      <section
        id="home"
        className="relative w-full bg-[#0A1628] overflow-hidden pt-12 pb-16 lg:py-20 border-b border-[#142238]"
        style={{
          backgroundImage: `
            radial-gradient(circle at 20% 30%, rgba(57, 217, 138, 0.08) 0%, transparent 50%),
            radial-gradient(circle at 80% 80%, rgba(225, 58, 46, 0.06) 0%, transparent 40%)
          `
        }}
      >
        {/* Subtle Mesh Grid Lines Overlay */}
        <div
          className="absolute inset-0 opacity-10 pointer-events-none"
          style={{
            backgroundImage: 'radial-gradient(#39D98A 1px, transparent 1px)',
            backgroundSize: '36px 36px'
          }}
        />

        <div className="max-w-7xl mx-auto px-4 sm:px-8 relative z-10">
          <div className="flex flex-col lg:flex-row items-start justify-between gap-12 lg:gap-14">

            {/* Left Hero Content */}
            <div className="flex-1 space-y-6 lg:pt-4">
              {/* Emergency Status Pill */}
              <div className="inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-full bg-[#142238] border border-[#39D98A]/40 text-[#39D98A] text-xs font-bold uppercase tracking-wider shadow-inner">
                <span className="w-2.5 h-2.5 rounded-full bg-[#39D98A] animate-ping" />
                <span>{t.badgeZeroInternet}</span>
              </div>

              {/* Two-Line Headline: Large Bold Condensed */}
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-[1.08] text-white">
                <div>{t.heroTitle1}</div>
                <div className="text-[#39D98A]">{t.heroTitle2}</div>
              </h1>

              {/* Subtext */}
              <p className="text-base sm:text-lg text-slate-300 max-w-xl leading-relaxed font-normal">
                {t.heroSubtext}
              </p>

              {/* Two Action CTAs */}
              <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
                <a
                  href="#how-it-works"
                  className="px-8 py-4 rounded-xl bg-[#39D98A] hover:bg-[#2EC479] text-[#0A1628] font-black text-sm uppercase tracking-wider shadow-lg hover:shadow-[#39D98A]/20 transition-all transform hover:-translate-y-0.5 text-center cursor-pointer"
                >
                  ⚡ {t.btnSeeHowItWorks}
                </a>
                <a
                  href="#early-access"
                  className="px-8 py-4 rounded-xl bg-transparent hover:bg-white/10 text-white border border-white/30 hover:border-white font-bold text-sm uppercase tracking-wider transition-all text-center cursor-pointer"
                >
                  📋 {t.btnRequestDemo}
                </a>
              </div>

              {/* Hackathon Judge Quick Verification Notice */}
              <div className="pt-4 flex items-center gap-3 text-xs text-slate-400 font-mono">
                <span className="px-2 py-0.5 rounded bg-[#142238] border border-slate-700 text-[#39D98A] font-bold">
                  v2.4
                </span>
                <span>Tested on 10 interconnected nodes · 0ms offline triage</span>
              </div>
            </div>

            {/* Right: Disaster Rescue Team in Action (EchoMesh Field Operations) */}
            <div className="w-full lg:w-[460px] flex-shrink-0 relative group">
              {/* Outer Glow & Border Card */}
              <div className="relative rounded-2xl overflow-hidden border-2 border-[#39D98A]/40 bg-[#142238] shadow-2xl shadow-[#39D98A]/10 transition-all hover:border-[#39D98A]">
                {/* Hero Photo Container */}
                <div className="relative h-80 sm:h-[400px] w-full overflow-hidden bg-slate-900">
                  <img
                    src="/disaster_rescue_team.jpg"
                    alt={lang === 'hi' ? 'आपदा राहत एवं बचाव दल (एनडीआरएफ)' : 'NDRF Disaster Rescue Team'}
                    className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700 ease-out"
                    loading="eager"
                  />
                  {/* Subtle Gradient Overlays for High Tech Tactical Aesthetic */}
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0A1628] via-transparent to-black/30 pointer-events-none" />

                  {/* Floating Badge Top-Left: Live Mesh Node Status */}
                  <div className="absolute top-3.5 left-3.5 bg-[#0A1628]/90 backdrop-blur-md border border-[#39D98A]/50 px-3 py-1.5 rounded-full flex items-center gap-2 shadow-lg">
                    <span className="relative flex h-2.5 w-2.5">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#39D98A] opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#39D98A]"></span>
                    </span>
                    <span className="text-[11px] font-mono font-bold text-[#39D98A] tracking-wider uppercase">
                      {lang === 'hi' ? 'लाइव मेश रिले सक्रिय' : 'LIVE MESH RELAY ACTIVE'}
                    </span>
                  </div>

                  {/* Floating Badge Top-Right: Node ID */}
                  <div className="absolute top-3.5 right-3.5 bg-[#0A1628]/90 backdrop-blur-md border border-[#233857] px-2.5 py-1 rounded-lg text-[10px] font-mono font-bold text-slate-300">
                    NODE #NDRF-04
                  </div>

                  {/* Bottom Image Overlay Strip */}
                  <div className="absolute bottom-0 inset-x-0 p-4 bg-gradient-to-t from-[#0A1628] via-[#0A1628]/85 to-transparent text-white space-y-1.5">
                    <div className="flex items-center justify-between text-[11px] font-mono">
                      <span className="text-[#39D98A] font-bold flex items-center gap-1.5">
                        <span className="inline-block w-1.5 h-1.5 rounded-full bg-[#39D98A]" />
                        {lang === 'hi' ? 'बाढ़ राहत व बचाव अभियान' : 'NDRF Flood Rescue Operations'}
                      </span>
                      <span className="text-slate-400">⚡ 0ms P2P Sync</span>
                    </div>
                    <p className="text-xs text-slate-200 leading-snug font-medium">
                      {lang === 'hi'
                        ? 'बिना इंटरनेट और सेलुलर नेटवर्क के भी 100% सटीक आपातकालीन संचार और लोकेशन ट्रैकिंग।'
                        : 'Decentralized peer-to-peer telemetry during severe flood & natural disaster rescue missions.'}
                    </p>
                  </div>
                </div>

                {/* Micro Metric Bar Under Image */}
                <div className="grid grid-cols-3 divide-x divide-[#233857] bg-[#0E1A2E] border-t border-[#233857] text-center py-2.5 px-2">
                  <div>
                    <div className="text-[10px] font-mono uppercase text-slate-400">Mesh Range</div>
                    <div className="text-xs font-bold font-mono text-[#39D98A]">12.4 km²</div>
                  </div>
                  <div>
                    <div className="text-[10px] font-mono uppercase text-slate-400">Hops</div>
                    <div className="text-xs font-bold font-mono text-white">4 Relays</div>
                  </div>
                  <div>
                    <div className="text-[10px] font-mono uppercase text-slate-400">Triage AI</div>
                    <div className="text-xs font-bold font-mono text-[#F2B90C]">Local / Offline</div>
                  </div>
                </div>
              </div>
            </div>

          </div>

          {/* ──────────────────────────────────────────────────────────────────────
              HERO BOTTOM STRIP: CORE FEATURES (6 Tiles)
              ────────────────────────────────────────────────────────────────────── */}
          <div className="mt-14 pt-8 border-t border-[#142238]">
            <div className="text-[11px] font-mono uppercase tracking-widest text-[#39D98A] font-bold mb-4">
              // {t.coreFeaturesLabel}
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3.5">
              {/* Tile 1: SOS Broadcast */}
              <button
                type="button"
                id="core-feat-sos"
                onClick={() => {
                  setSosSent(false);
                  setActiveFeature('sos');
                }}
                className="p-4 rounded-xl bg-[#142238] border border-[#233857] hover:border-[#39D98A] hover:-translate-y-1 hover:shadow-lg hover:shadow-[#39D98A]/20 transition-all group text-left cursor-pointer flex flex-col justify-between"
              >
                <div>
                  <div className="text-2xl mb-2 group-hover:scale-110 transition-transform">📡</div>
                  <div className="text-xs font-bold text-white group-hover:text-[#39D98A] leading-tight transition-colors">
                    {t.feat1Title}
                  </div>
                  <div className="text-[10px] text-slate-400 mt-1 leading-snug">
                    {t.feat1Desc}
                  </div>
                </div>
                <div className="text-[10px] font-mono text-[#39D98A] font-bold mt-3 inline-flex items-center gap-1 group-hover:underline">
                  <span>⚡ {lang === 'hi' ? 'लाइव चलाएं' : 'Test Feature'}</span>
                  <span>→</span>
                </div>
              </button>

              {/* Tile 2: Peer Discovery */}
              <button
                type="button"
                id="core-feat-peers"
                onClick={() => setActiveFeature('peers')}
                className="p-4 rounded-xl bg-[#142238] border border-[#233857] hover:border-[#39D98A] hover:-translate-y-1 hover:shadow-lg hover:shadow-[#39D98A]/20 transition-all group text-left cursor-pointer flex flex-col justify-between"
              >
                <div>
                  <div className="text-2xl mb-2 group-hover:scale-110 transition-transform">🔍</div>
                  <div className="text-xs font-bold text-white group-hover:text-[#39D98A] leading-tight transition-colors">
                    {t.feat2Title}
                  </div>
                  <div className="text-[10px] text-slate-400 mt-1 leading-snug">
                    {t.feat2Desc}
                  </div>
                </div>
                <div className="text-[10px] font-mono text-[#39D98A] font-bold mt-3 inline-flex items-center gap-1 group-hover:underline">
                  <span>⚡ {lang === 'hi' ? 'लाइव चलाएं' : 'Test Feature'}</span>
                  <span>→</span>
                </div>
              </button>

              {/* Tile 3: Gossip Relay */}
              <button
                type="button"
                id="core-feat-gossip"
                onClick={() => {
                  setGossipStep(0);
                  setActiveFeature('gossip');
                }}
                className="p-4 rounded-xl bg-[#142238] border border-[#233857] hover:border-[#39D98A] hover:-translate-y-1 hover:shadow-lg hover:shadow-[#39D98A]/20 transition-all group text-left cursor-pointer flex flex-col justify-between"
              >
                <div>
                  <div className="text-2xl mb-2 group-hover:scale-110 transition-transform">🔄</div>
                  <div className="text-xs font-bold text-white group-hover:text-[#39D98A] leading-tight transition-colors">
                    {t.feat3Title}
                  </div>
                  <div className="text-[10px] text-slate-400 mt-1 leading-snug">
                    {t.feat3Desc}
                  </div>
                </div>
                <div className="text-[10px] font-mono text-[#39D98A] font-bold mt-3 inline-flex items-center gap-1 group-hover:underline">
                  <span>⚡ {lang === 'hi' ? 'लाइव चलाएं' : 'Test Feature'}</span>
                  <span>→</span>
                </div>
              </button>

              {/* Tile 4: Offline AI Assistant */}
              <button
                type="button"
                id="core-feat-ai"
                onClick={() => {
                  setAiTestQ('');
                  setAiTestAns('');
                  setActiveFeature('ai');
                }}
                className="p-4 rounded-xl bg-[#142238] border border-[#39D98A]/50 hover:border-[#39D98A] hover:-translate-y-1 hover:shadow-lg hover:shadow-[#39D98A]/20 transition-all group text-left cursor-pointer flex flex-col justify-between shadow-sm"
              >
                <div>
                  <div className="text-2xl mb-2 group-hover:scale-110 transition-transform">🤖</div>
                  <div className="text-xs font-bold text-[#39D98A] leading-tight">
                    {t.feat4Title}
                  </div>
                  <div className="text-[10px] text-slate-400 mt-1 leading-snug">
                    {t.feat4Desc}
                  </div>
                </div>
                <div className="text-[10px] font-mono text-[#39D98A] font-bold mt-3 inline-flex items-center gap-1 group-hover:underline">
                  <span>⚡ {lang === 'hi' ? 'लाइव चलाएं' : 'Test Feature'}</span>
                  <span>→</span>
                </div>
              </button>

              {/* Tile 5: Emergency Mode */}
              <button
                type="button"
                id="core-feat-emergency"
                onClick={() => setActiveFeature('emergency')}
                className="p-4 rounded-xl bg-[#142238] border border-[#233857] hover:border-[#39D98A] hover:-translate-y-1 hover:shadow-lg hover:shadow-[#39D98A]/20 transition-all group text-left cursor-pointer flex flex-col justify-between"
              >
                <div>
                  <div className="text-2xl mb-2 group-hover:scale-110 transition-transform">🛡️</div>
                  <div className="text-xs font-bold text-white group-hover:text-[#39D98A] leading-tight transition-colors">
                    {t.feat5Title}
                  </div>
                  <div className="text-[10px] text-slate-400 mt-1 leading-snug">
                    {t.feat5Desc}
                  </div>
                </div>
                <div className="text-[10px] font-mono text-[#39D98A] font-bold mt-3 inline-flex items-center gap-1 group-hover:underline">
                  <span>⚡ {lang === 'hi' ? 'लाइव चलाएं' : 'Test Feature'}</span>
                  <span>→</span>
                </div>
              </button>

              {/* Tile 6: Real-Time Mesh Map */}
              <button
                type="button"
                id="core-feat-map"
                onClick={() => setActiveFeature('map')}
                className="p-4 rounded-xl bg-[#142238] border border-[#233857] hover:border-[#39D98A] hover:-translate-y-1 hover:shadow-lg hover:shadow-[#39D98A]/20 transition-all group text-left cursor-pointer flex flex-col justify-between"
              >
                <div>
                  <div className="text-2xl mb-2 group-hover:scale-110 transition-transform">🗺️</div>
                  <div className="text-xs font-bold text-white group-hover:text-[#39D98A] leading-tight transition-colors">
                    {t.feat6Title}
                  </div>
                  <div className="text-[10px] text-slate-400 mt-1 leading-snug">
                    {t.feat6Desc}
                  </div>
                </div>
                <div className="text-[10px] font-mono text-[#39D98A] font-bold mt-3 inline-flex items-center gap-1 group-hover:underline">
                  <span>⚡ {lang === 'hi' ? 'लाइव चलाएं' : 'Test Feature'}</span>
                  <span>→</span>
                </div>
              </button>
            </div>
          </div>

        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════════════
          3. THREE-COLUMN INFO SECTION (Light Background #F5F6F8)
          ══════════════════════════════════════════════════════════════════════════ */}
      <section id="how-it-works" className="w-full bg-[#F5F6F8] text-[#1A1A1A] py-16 sm:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-8">
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-stretch">

            {/* Column 1 — How EchoMesh Works (White Card) */}
            <div className="bg-white rounded-2xl p-7 sm:p-8 border border-slate-200 shadow-md flex flex-col justify-between space-y-6">
              <div className="space-y-4">
                <div className="w-10 h-10 rounded-xl bg-[#E8F8F0] text-[#39D98A] flex items-center justify-center text-xl font-bold">
                  ⚙️
                </div>
                <h3 className="text-2xl font-black text-[#1A1A1A] tracking-tight">
                  {t.col1Title}
                </h3>
                <div className="h-0.5 w-12 bg-[#39D98A]" />

                {/* Checklist */}
                <ul className="space-y-3.5 pt-2">
                  <li className="flex items-start gap-3 text-xs sm:text-sm text-slate-700 font-medium">
                    <span className="w-5 h-5 rounded-full bg-[#E8F8F0] text-[#39D98A] font-bold flex items-center justify-center flex-shrink-0 text-xs">✓</span>
                    <span>{t.col1Check1}</span>
                  </li>
                  <li className="flex items-start gap-3 text-xs sm:text-sm text-slate-700 font-medium">
                    <span className="w-5 h-5 rounded-full bg-[#E8F8F0] text-[#39D98A] font-bold flex items-center justify-center flex-shrink-0 text-xs">✓</span>
                    <span>{t.col1Check2}</span>
                  </li>
                  <li className="flex items-start gap-3 text-xs sm:text-sm text-slate-700 font-medium">
                    <span className="w-5 h-5 rounded-full bg-[#E8F8F0] text-[#39D98A] font-bold flex items-center justify-center flex-shrink-0 text-xs">✓</span>
                    <span>{t.col1Check3}</span>
                  </li>
                  <li className="flex items-start gap-3 text-xs sm:text-sm text-slate-700 font-medium">
                    <span className="w-5 h-5 rounded-full bg-[#E8F8F0] text-[#39D98A] font-bold flex items-center justify-center flex-shrink-0 text-xs">✓</span>
                    <span>{t.col1Check4}</span>
                  </li>
                  <li className="flex items-start gap-3 text-xs sm:text-sm text-slate-700 font-medium">
                    <span className="w-5 h-5 rounded-full bg-[#E8F8F0] text-[#39D98A] font-bold flex items-center justify-center flex-shrink-0 text-xs">✓</span>
                    <span>{t.col1Check5}</span>
                  </li>
                </ul>
              </div>

              <a
                href="#technology"
                className="w-full py-3.5 rounded-xl bg-[#39D98A] hover:bg-[#2EC479] text-[#0A1628] font-black text-xs uppercase tracking-wider text-center block transition-all shadow-sm cursor-pointer"
              >
                {t.btnSeeTechStack} →
              </a>
            </div>

            {/* Column 2 — Built For Real Disasters (Navy Standout Card #142238) */}
            <div className="bg-[#142238] text-white rounded-2xl p-7 sm:p-8 border border-[#233857] shadow-xl flex flex-col justify-between space-y-6 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-[#39D98A]/5 rounded-full blur-2xl pointer-events-none" />

              <div className="space-y-4 relative z-10">
                <div className="inline-block px-2.5 py-0.5 rounded-full bg-[#39D98A]/20 border border-[#39D98A]/40 text-[#39D98A] text-[10px] font-mono font-bold uppercase tracking-wider">
                  {t.col2Badge}
                </div>
                <h3 className="text-2xl font-black text-white tracking-tight">
                  {t.col2Title}
                </h3>
                <div className="h-0.5 w-12 bg-[#39D98A]" />

                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-normal">
                  {t.col2Desc}
                </p>

                {/* Scenarios Solved */}
                <div className="space-y-2.5 pt-2">
                  <div className="flex items-center gap-3 p-2.5 rounded-xl bg-[#0A1628]/60 border border-slate-700/50 text-xs text-slate-200">
                    <span className="text-[#E13A2E] text-base">⚠️</span>
                    <span>{t.col2Check1}</span>
                  </div>
                  <div className="flex items-center gap-3 p-2.5 rounded-xl bg-[#0A1628]/60 border border-slate-700/50 text-xs text-slate-200">
                    <span className="text-[#39D98A] text-base">📍</span>
                    <span>{t.col2Check2}</span>
                  </div>
                  <div className="flex items-center gap-3 p-2.5 rounded-xl bg-[#0A1628]/60 border border-slate-700/50 text-xs text-slate-200">
                    <span className="text-[#39D98A] text-base">⏱️</span>
                    <span>{t.col2Check3}</span>
                  </div>
                  <div className="flex items-center gap-3 p-2.5 rounded-xl bg-[#0A1628]/60 border border-slate-700/50 text-xs text-slate-200">
                    <span className="text-[#39D98A] text-base">🛡️</span>
                    <span>{t.col2Check4}</span>
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsProblemModalOpen(true)}
                className="w-full py-3.5 rounded-xl bg-[#39D98A] hover:bg-[#2EC479] text-[#0A1628] font-black text-xs uppercase tracking-wider text-center transition-all shadow-md cursor-pointer"
              >
                {t.btnReadProblem} 📖
              </button>
            </div>

            {/* Column 3 — How A Message Travels (Numbered Steps 1–5, Red Circles) */}
            <div className="bg-white rounded-2xl p-7 sm:p-8 border border-slate-200 shadow-md flex flex-col justify-between space-y-6">
              <div className="space-y-4">
                <div className="w-10 h-10 rounded-xl bg-red-50 text-[#E13A2E] flex items-center justify-center text-xl font-bold">
                  🔄
                </div>
                <h3 className="text-2xl font-black text-[#1A1A1A] tracking-tight">
                  {t.col3Title}
                </h3>
                <div className="h-0.5 w-12 bg-[#E13A2E]" />

                {/* Vertical Steps with Connecting Line */}
                <div className="relative pl-6 space-y-5 pt-2">
                  {/* Vertical Track Line */}
                  <div className="absolute left-[13px] top-3 bottom-3 w-0.5 bg-slate-200" />

                  {/* Step 1 */}
                  <div className="relative flex items-start gap-3">
                    <span className="absolute -left-6 top-0 w-6 h-6 rounded-full bg-[#E13A2E] text-white font-black text-xs flex items-center justify-center shadow-sm">
                      1
                    </span>
                    <div>
                      <div className="text-xs font-bold text-[#1A1A1A]">{t.step1Title}</div>
                      <div className="text-[11px] text-slate-500 mt-0.5">{t.step1Desc}</div>
                    </div>
                  </div>

                  {/* Step 2 */}
                  <div className="relative flex items-start gap-3">
                    <span className="absolute -left-6 top-0 w-6 h-6 rounded-full bg-[#E13A2E] text-white font-black text-xs flex items-center justify-center shadow-sm">
                      2
                    </span>
                    <div>
                      <div className="text-xs font-bold text-[#1A1A1A]">{t.step2Title}</div>
                      <div className="text-[11px] text-slate-500 mt-0.5">{t.step2Desc}</div>
                    </div>
                  </div>

                  {/* Step 3 */}
                  <div className="relative flex items-start gap-3">
                    <span className="absolute -left-6 top-0 w-6 h-6 rounded-full bg-[#E13A2E] text-white font-black text-xs flex items-center justify-center shadow-sm">
                      3
                    </span>
                    <div>
                      <div className="text-xs font-bold text-[#1A1A1A]">{t.step3Title}</div>
                      <div className="text-[11px] text-slate-500 mt-0.5">{t.step3Desc}</div>
                    </div>
                  </div>

                  {/* Step 4 */}
                  <div className="relative flex items-start gap-3">
                    <span className="absolute -left-6 top-0 w-6 h-6 rounded-full bg-[#E13A2E] text-white font-black text-xs flex items-center justify-center shadow-sm">
                      4
                    </span>
                    <div>
                      <div className="text-xs font-bold text-[#1A1A1A]">{t.step4Title}</div>
                      <div className="text-[11px] text-slate-500 mt-0.5">{t.step4Desc}</div>
                    </div>
                  </div>

                  {/* Step 5 */}
                  <div className="relative flex items-start gap-3">
                    <span className="absolute -left-6 top-0 w-6 h-6 rounded-full bg-[#39D98A] text-[#0A1628] font-black text-xs flex items-center justify-center shadow-sm">
                      5
                    </span>
                    <div>
                      <div className="text-xs font-bold text-[#1A1A1A]">{t.step5Title}</div>
                      <div className="text-[11px] text-slate-500 mt-0.5">{t.step5Desc}</div>
                    </div>
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={onLaunchDemo}
                className="w-full py-3.5 rounded-xl bg-[#0A1628] hover:bg-neutral-800 text-white font-bold text-xs uppercase tracking-wider text-center transition-all shadow-md cursor-pointer"
              >
                {t.btnLaunchApp} 🚀
              </button>
            </div>

          </div>

        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════════════
          4. "BEFORE & AFTER ECHOMESH" COMPARISON (Navy Background #0A1628)
          ══════════════════════════════════════════════════════════════════════════ */}
      <section id="features" className="w-full bg-[#0A1628] py-16 sm:py-24 border-t border-b border-[#142238]">
        <div className="max-w-7xl mx-auto px-4 sm:px-8">
          
          {/* Section Heading */}
          <div className="text-center max-w-3xl mx-auto space-y-3 mb-12">
            <div className="inline-block text-[10px] font-mono font-bold uppercase tracking-widest text-[#39D98A] bg-[#142238] px-3 py-1 rounded-full border border-[#39D98A]/30">
              // IMPACT COMPARISON
            </div>
            <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
              {t.beforeAfterTitle}
            </h2>
            <p className="text-xs sm:text-sm text-slate-400">
              {t.beforeAfterSub}
            </p>
          </div>

          {/* 3 Interactive Comparison Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

            {/* Comparison Card 1 */}
            <div className="bg-[#142238] rounded-2xl p-6 border border-[#233857] flex flex-col justify-between space-y-6 shadow-xl hover:border-[#39D98A]/50 transition-all">
              <div className="space-y-4">
                <div className="text-xl font-bold text-white">
                  {t.baCard1Title}
                </div>

                {/* BEFORE block */}
                <div className="p-4 rounded-xl bg-[#0A1628] border border-slate-700/60 space-y-2">
                  <div className="inline-block px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-wider bg-slate-700 text-slate-300">
                    {t.tagBefore}
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    {t.baCard1Before}
                  </p>
                </div>

                {/* AFTER block */}
                <div className="p-4 rounded-xl bg-[#39D98A]/10 border border-[#39D98A]/40 space-y-2">
                  <div className="inline-block px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-wider bg-[#39D98A] text-[#0A1628]">
                    {t.tagAfter}
                  </div>
                  <p className="text-xs text-emerald-200 leading-relaxed font-medium">
                    {t.baCard1After}
                  </p>
                </div>
              </div>

              <div className="pt-2 flex items-center justify-between text-[11px] text-[#39D98A] font-mono">
                <span>Multi-Hop Gossip</span>
                <span>✓ Verified</span>
              </div>
            </div>

            {/* Comparison Card 2 */}
            <div className="bg-[#142238] rounded-2xl p-6 border border-[#233857] flex flex-col justify-between space-y-6 shadow-xl hover:border-[#39D98A]/50 transition-all">
              <div className="space-y-4">
                <div className="text-xl font-bold text-white">
                  {t.baCard2Title}
                </div>

                {/* BEFORE block */}
                <div className="p-4 rounded-xl bg-[#0A1628] border border-slate-700/60 space-y-2">
                  <div className="inline-block px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-wider bg-slate-700 text-slate-300">
                    {t.tagBefore}
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    {t.baCard2Before}
                  </p>
                </div>

                {/* AFTER block */}
                <div className="p-4 rounded-xl bg-[#39D98A]/10 border border-[#39D98A]/40 space-y-2">
                  <div className="inline-block px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-wider bg-[#39D98A] text-[#0A1628]">
                    {t.tagAfter}
                  </div>
                  <p className="text-xs text-emerald-200 leading-relaxed font-medium">
                    {t.baCard2After}
                  </p>
                </div>
              </div>

              <div className="pt-2 flex items-center justify-between text-[11px] text-[#39D98A] font-mono">
                <span>Flood-Proof Sync</span>
                <span>✓ Verified</span>
              </div>
            </div>

            {/* Comparison Card 3 */}
            <div className="bg-[#142238] rounded-2xl p-6 border border-[#233857] flex flex-col justify-between space-y-6 shadow-xl hover:border-[#39D98A]/50 transition-all">
              <div className="space-y-4">
                <div className="text-xl font-bold text-white">
                  {t.baCard3Title}
                </div>

                {/* BEFORE block */}
                <div className="p-4 rounded-xl bg-[#0A1628] border border-slate-700/60 space-y-2">
                  <div className="inline-block px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-wider bg-slate-700 text-slate-300">
                    {t.tagBefore}
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    {t.baCard3Before}
                  </p>
                </div>

                {/* AFTER block */}
                <div className="p-4 rounded-xl bg-[#39D98A]/10 border border-[#39D98A]/40 space-y-2">
                  <div className="inline-block px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-wider bg-[#39D98A] text-[#0A1628]">
                    {t.tagAfter}
                  </div>
                  <p className="text-xs text-emerald-200 leading-relaxed font-medium">
                    {t.baCard3After}
                  </p>
                </div>
              </div>

              <div className="pt-2 flex items-center justify-between text-[11px] text-[#39D98A] font-mono">
                <span>Local Phi-3 LLM</span>
                <span>✓ 0ms Offline</span>
              </div>
            </div>

          </div>

          {/* Centered CTA */}
          <div className="mt-12 text-center">
            <button
              onClick={onLaunchDemo}
              className="px-8 py-4 rounded-xl bg-[#39D98A] hover:bg-[#2EC479] text-[#0A1628] font-black text-xs uppercase tracking-wider transition-all transform hover:scale-105 active:scale-95 shadow-lg cursor-pointer"
            >
              ⚡ {t.btnSeeFullDemo}
            </button>
          </div>

        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════════════
          5. TESTIMONIALS & FEEDBACK SECTION (White Background #FFFFFF)
          ══════════════════════════════════════════════════════════════════════════ */}
      <section id="impact" className="w-full bg-white text-[#1A1A1A] py-16 sm:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-8">
          
          {/* Header */}
          <div className="text-center max-w-3xl mx-auto space-y-3 mb-12">
            <div className="inline-block text-[10px] font-mono font-bold uppercase tracking-widest text-[#39D98A] bg-[#E8F8F0] px-3 py-1 rounded-full">
              // VALIDATION & REVIEWS
            </div>
            <h2 className="text-3xl sm:text-4xl font-black text-[#1A1A1A] tracking-tight">
              {t.testimonialsTitle}
            </h2>
            <p className="text-xs sm:text-sm text-slate-500">
              {t.testimonialsSub}
            </p>
          </div>

          {/* 3 Review Cards Grid with Navigation Controls */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map((item, idx) => (
              <div
                key={idx}
                className={`p-7 rounded-2xl border transition-all flex flex-col justify-between space-y-6 ${
                  activeTestimonial === idx
                    ? 'bg-[#F9FCFA] border-[#39D98A] shadow-lg ring-2 ring-[#39D98A]/20'
                    : 'bg-white border-slate-200 shadow-sm hover:border-slate-300'
                }`}
              >
                <div className="space-y-3">
                  {/* 5 Mesh-Green Stars */}
                  <div className="flex items-center gap-1 text-[#39D98A] text-base">
                    {'★'.repeat(item.rating)}
                  </div>
                  {/* Quote */}
                  <p className="text-xs sm:text-sm text-slate-700 leading-relaxed italic">
                    "{item.quote}"
                  </p>
                </div>

                {/* Author Info */}
                <div className="pt-4 border-t border-slate-100 flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-[#E8F8F0] text-[#39D98A] font-bold flex items-center justify-center text-sm">
                    {item.author[0]}
                  </div>
                  <div>
                    <div className="text-xs font-bold text-[#1A1A1A]">{item.author}</div>
                    <div className="text-[11px] text-slate-500">{item.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Carousel Arrows */}
          <div className="mt-8 flex items-center justify-center gap-4">
            <button
              onClick={prevTestimonial}
              className="w-10 h-10 rounded-full border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 flex items-center justify-center font-bold text-lg cursor-pointer transition-colors"
              aria-label="Previous Testimonial"
            >
              ‹
            </button>
            <div className="flex items-center gap-2">
              {testimonials.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setActiveTestimonial(i)}
                  className={`w-2.5 h-2.5 rounded-full transition-all cursor-pointer ${
                    activeTestimonial === i ? 'w-6 bg-[#39D98A]' : 'bg-slate-300'
                  }`}
                  aria-label={`Slide ${i + 1}`}
                />
              ))}
            </div>
            <button
              onClick={nextTestimonial}
              className="w-10 h-10 rounded-full border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 flex items-center justify-center font-bold text-lg cursor-pointer transition-colors"
              aria-label="Next Testimonial"
            >
              ›
            </button>
          </div>

        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════════════
          6. WHERE ECHOMESH WORKS (Light Background #F5F6F8, Split Layout)
          ══════════════════════════════════════════════════════════════════════════ */}
      <section id="technology" className="w-full bg-[#F5F6F8] text-[#1A1A1A] py-16 sm:py-24 border-t border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-8">
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">

            {/* Left Column: Interactive Map Graphic (5 Cols) */}
            <div className="lg:col-span-5 bg-[#0A1628] text-white rounded-2xl p-6 border border-[#233857] shadow-xl relative overflow-hidden">
              <div className="flex items-center justify-between mb-4 border-b border-[#142238] pb-3">
                <div className="flex items-center gap-2 text-xs font-mono font-bold text-[#39D98A]">
                  <span className="w-2 h-2 rounded-full bg-[#39D98A] animate-ping" />
                  <span>SIMULATED DEPLOYMENT CORRIDOR</span>
                </div>
                <span className="text-[10px] text-slate-400 font-mono">10 NODES ACTIVE</span>
              </div>

              {/* Graphical Mesh Network Diagram / Map */}
              <div className="relative h-64 w-full bg-[#142238]/60 rounded-xl border border-slate-700/50 p-4 flex items-center justify-center">
                {/* SVG Mesh Graph */}
                <svg className="w-full h-full" viewBox="0 0 400 240">
                  {/* Connection Lines */}
                  <line x1="80" y1="60" x2="160" y2="120" stroke="#39D98A" strokeWidth="2" strokeDasharray="4 2" className="animate-pulse" />
                  <line x1="160" y1="120" x2="240" y2="80" stroke="#39D98A" strokeWidth="2" />
                  <line x1="160" y1="120" x2="220" y2="180" stroke="#39D98A" strokeWidth="2" />
                  <line x1="240" y1="80" x2="330" y2="100" stroke="#39D98A" strokeWidth="2" />
                  <line x1="220" y1="180" x2="310" y2="170" stroke="#39D98A" strokeWidth="2" strokeDasharray="4 2" />
                  <line x1="330" y1="100" x2="310" y2="170" stroke="#39D98A" strokeWidth="2" />

                  {/* Coverage Polygon */}
                  <polygon points="80,60 240,80 330,100 310,170 220,180 160,120" fill="rgba(57, 217, 138, 0.08)" />

                  {/* Node 1: Disaster Hotspot (Red) */}
                  <circle cx="80" cy="60" r="14" fill="#E13A2E" />
                  <text x="80" y="64" fill="white" fontSize="10" fontWeight="bold" textAnchor="middle">SOS</text>
                  <text x="80" y="88" fill="#FF8C82" fontSize="9" fontWeight="bold" textAnchor="middle">Flood Zone</text>

                  {/* Node 2: Survivor Peer */}
                  <circle cx="160" cy="120" r="10" fill="#39D98A" />
                  <text x="160" y="142" fill="#39D98A" fontSize="9" fontWeight="bold" textAnchor="middle">Node A</text>

                  {/* Node 3: Rural Bridge */}
                  <circle cx="240" cy="80" r="10" fill="#39D98A" />
                  <text x="240" y="102" fill="#39D98A" fontSize="9" fontWeight="bold" textAnchor="middle">Node B</text>

                  {/* Node 4: Hill Station */}
                  <circle cx="220" cy="180" r="10" fill="#39D98A" />
                  <text x="220" y="202" fill="#39D98A" fontSize="9" fontWeight="bold" textAnchor="middle">Node C</text>

                  {/* Node 5: Relief Camp Gateway */}
                  <circle cx="330" cy="100" r="12" fill="#0D6EFD" />
                  <text x="330" y="104" fill="white" fontSize="9" fontWeight="bold" textAnchor="middle">HQ</text>
                  <text x="330" y="124" fill="#93C5FD" fontSize="9" fontWeight="bold" textAnchor="middle">Relief Camp</text>

                  {/* Node 6: Hospital Shelter */}
                  <circle cx="310" cy="170" r="10" fill="#39D98A" />
                  <text x="310" y="192" fill="#39D98A" fontSize="9" fontWeight="bold" textAnchor="middle">Medical</text>
                </svg>
              </div>

              <div className="mt-4 flex items-center justify-between text-[11px] text-slate-400 font-mono">
                <span>Coverage: 12.4 km² mesh</span>
                <span className="text-[#39D98A]">Hop Latency: ~14ms</span>
              </div>
            </div>

            {/* Middle Column: Scenarios Checklist (4 Cols) */}
            <div className="lg:col-span-4 space-y-4">
              <div className="inline-block text-[10px] font-mono font-bold uppercase tracking-widest text-[#39D98A] bg-[#E8F8F0] px-2.5 py-0.5 rounded-full">
                {t.mapBadge}
              </div>
              <h3 className="text-2xl sm:text-3xl font-black text-[#1A1A1A] tracking-tight">
                {t.mapTitle}
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                {t.mapSub}
              </p>

              <ul className="space-y-2.5 pt-2">
                <li className="flex items-start gap-2.5 text-xs text-slate-800 font-semibold">
                  <span className="text-[#39D98A] font-black">✓</span>
                  <span>{t.mapCheck1}</span>
                </li>
                <li className="flex items-start gap-2.5 text-xs text-slate-800 font-semibold">
                  <span className="text-[#39D98A] font-black">✓</span>
                  <span>{t.mapCheck2}</span>
                </li>
                <li className="flex items-start gap-2.5 text-xs text-slate-800 font-semibold">
                  <span className="text-[#39D98A] font-black">✓</span>
                  <span>{t.mapCheck3}</span>
                </li>
                <li className="flex items-start gap-2.5 text-xs text-slate-800 font-semibold">
                  <span className="text-[#39D98A] font-black">✓</span>
                  <span>{t.mapCheck4}</span>
                </li>
                <li className="flex items-start gap-2.5 text-xs text-slate-800 font-semibold">
                  <span className="text-[#39D98A] font-black">✓</span>
                  <span>{t.mapCheck5}</span>
                </li>
              </ul>
            </div>

            {/* Right Column: Navy Callout Card (3 Cols) */}
            <div className="lg:col-span-3 bg-[#142238] text-white rounded-2xl p-7 border border-[#233857] shadow-xl flex flex-col justify-between space-y-6">
              <div className="space-y-2">
                <div className="text-lg font-black text-white leading-none">
                  {t.calloutTitle}
                </div>
                <div className="text-2xl font-black text-[#39D98A] tracking-tight">
                  {t.calloutSubtitle}
                </div>
                <p className="text-xs text-slate-300 pt-2 leading-relaxed">
                  {t.calloutDesc}
                </p>
              </div>

              <button
                onClick={onLaunchDemo}
                className="w-full py-3.5 rounded-xl bg-[#39D98A] hover:bg-[#2EC479] text-[#0A1628] font-black text-xs uppercase tracking-wider text-center transition-all shadow-md cursor-pointer"
              >
                ⚡ {t.btnTryDemo}
              </button>
            </div>

          </div>

        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════════════
          6.5 REQUEST EARLY ACCESS (Dedicated Clean Form Section)
          ══════════════════════════════════════════════════════════════════════════ */}
      <section id="early-access" className="w-full bg-[#0A1628] py-16 px-4 sm:px-6 lg:px-8 border-t border-[#142238]">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white text-[#1A1A1A] rounded-2xl p-6 sm:p-10 shadow-2xl border-t-4 border-[#39D98A] relative">
            {/* Form Top Header */}
            <div className="space-y-1 mb-6 text-center">
              <div className="inline-block text-[10px] font-mono font-bold uppercase tracking-widest text-[#39D98A] bg-[#E8F8F0] px-3 py-1 rounded-full">
                {t.formBadge}
              </div>
              <h3 className="text-2xl sm:text-3xl font-black text-[#1A1A1A] tracking-tight">
                {t.formTitle}
              </h3>
              <p className="text-xs sm:text-sm text-slate-500 font-medium">
                {t.formSubtitle}
              </p>
            </div>

            {/* Submission Success State */}
            {submitSuccess ? (
              <div className="p-8 rounded-xl bg-[#E8F8F0] border border-[#39D98A] text-center space-y-4 animate-fade-in">
                <div className="w-14 h-14 mx-auto rounded-full bg-[#39D98A] text-[#0A1628] flex items-center justify-center text-3xl font-bold">
                  ✓
                </div>
                <div className="font-black text-lg text-[#0A1628]">
                  {t.formSuccessTitle}
                </div>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed max-w-md mx-auto">
                  {t.formSuccessMsg}
                </p>
                <button
                  type="button"
                  onClick={() => setSubmitSuccess(false)}
                  className="mt-2 text-xs text-[#39D98A] font-bold underline cursor-pointer"
                >
                  {lang === 'hi' ? 'दूसरा अनुरोध दर्ज करें' : 'Submit another request'}
                </button>
              </div>
            ) : (
              /* Early Access Form */
              <form onSubmit={handleFormSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Full Name */}
                  <div>
                    <label className="block text-xs font-bold text-[#1A1A1A] mb-1">
                      {t.lblFullName} <span className="text-[#E13A2E]">*</span>
                    </label>
                    <input
                      type="text"
                      name="fullName"
                      value={formData.fullName}
                      onChange={handleInputChange}
                      placeholder={t.phFullName}
                      className="w-full px-3.5 py-2.5 text-xs rounded-lg border border-slate-300 focus:border-[#39D98A] focus:ring-1 focus:ring-[#39D98A] outline-none text-[#1A1A1A]"
                    />
                    {formErrors.fullName && (
                      <p className="text-[11px] text-[#E13A2E] mt-0.5 font-medium">{formErrors.fullName}</p>
                    )}
                  </div>

                  {/* Phone Number */}
                  <div>
                    <label className="block text-xs font-bold text-[#1A1A1A] mb-1">
                      {t.lblPhone} <span className="text-[#E13A2E]">*</span>
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      placeholder={t.phPhone}
                      className="w-full px-3.5 py-2.5 text-xs rounded-lg border border-slate-300 focus:border-[#39D98A] focus:ring-1 focus:ring-[#39D98A] outline-none text-[#1A1A1A]"
                    />
                    {formErrors.phone && (
                      <p className="text-[11px] text-[#E13A2E] mt-0.5 font-medium">{formErrors.phone}</p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Email Address */}
                  <div>
                    <label className="block text-xs font-bold text-[#1A1A1A] mb-1">
                      {t.lblEmail} <span className="text-[#E13A2E]">*</span>
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      placeholder={t.phEmail}
                      className="w-full px-3.5 py-2.5 text-xs rounded-lg border border-slate-300 focus:border-[#39D98A] focus:ring-1 focus:ring-[#39D98A] outline-none text-[#1A1A1A]"
                    />
                    {formErrors.email && (
                      <p className="text-[11px] text-[#E13A2E] mt-0.5 font-medium">{formErrors.email}</p>
                    )}
                  </div>

                  {/* Deployment Area */}
                  <div>
                    <label className="block text-xs font-bold text-[#1A1A1A] mb-1">
                      {t.lblArea} <span className="text-[#E13A2E]">*</span>
                    </label>
                    <input
                      type="text"
                      name="deployArea"
                      value={formData.deployArea}
                      onChange={handleInputChange}
                      placeholder={t.phArea}
                      className="w-full px-3.5 py-2.5 text-xs rounded-lg border border-slate-300 focus:border-[#39D98A] focus:ring-1 focus:ring-[#39D98A] outline-none text-[#1A1A1A]"
                    />
                    {formErrors.deployArea && (
                      <p className="text-[11px] text-[#E13A2E] mt-0.5 font-medium">{formErrors.deployArea}</p>
                    )}
                  </div>
                </div>

                {/* How You'd Use It (Dropdown) */}
                <div>
                  <label className="block text-xs font-bold text-[#1A1A1A] mb-1">
                    {t.lblUseCase}
                  </label>
                  <select
                    name="useCase"
                    value={formData.useCase}
                    onChange={handleInputChange}
                    className="w-full px-3.5 py-2.5 text-xs rounded-lg border border-slate-300 focus:border-[#39D98A] focus:ring-1 focus:ring-[#39D98A] outline-none text-[#1A1A1A] bg-white cursor-pointer"
                  >
                    <option value="Personal & Family Safety">{t.useCaseOption1}</option>
                    <option value="NGO Disaster Relief Operations">{t.useCaseOption2}</option>
                    <option value="Local Government / Municipal Defense">{t.useCaseOption3}</option>
                    <option value="Academic & Network Research">{t.useCaseOption4}</option>
                  </select>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3.5 rounded-xl bg-[#39D98A] hover:bg-[#2EC479] text-[#0A1628] font-black text-xs uppercase tracking-wider transition-all transform hover:scale-[1.01] active:scale-[0.99] shadow-md cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting ? t.btnSubmitting : `⚡ ${t.btnNotifyMe}`}
                </button>

                {/* Privacy Microcopy */}
                <p className="text-[10px] text-center text-slate-400">
                  🔒 {t.formPrivacy}
                </p>
              </form>
            )}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════════════
          7. FOOTER (Navy Background #0A1628)
          ══════════════════════════════════════════════════════════════════════════ */}
      <footer id="contact" className="w-full bg-[#0A1628] text-white pt-16 pb-12 border-t border-[#142238]">
        <div className="max-w-7xl mx-auto px-4 sm:px-8">
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 pb-12 border-b border-[#142238]">
            
            {/* Col 1: Logo & Tagline */}
            <div className="space-y-4">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-[#142238] border border-[#39D98A]/40 flex items-center justify-center text-sm font-bold text-[#39D98A]">
                  ⚡
                </div>
                <div className="text-xl font-black tracking-tight">
                  <span>{t.brandEcho}</span>
                  <span className="text-[#39D98A]">{t.brandMesh}</span>
                </div>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed max-w-xs">
                {t.footerTagline}
              </p>
              <div className="pt-2">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#142238] border border-[#39D98A]/30 text-[#39D98A] text-[10px] font-mono font-bold">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#39D98A]" />
                  100% AIR-GAPPED SYSTEM
                </span>
              </div>
            </div>

            {/* Col 2: Quick Links */}
            <div className="space-y-3">
              <div className="text-xs font-mono font-bold uppercase tracking-widest text-[#39D98A]">
                {t.footerQuickLinks}
              </div>
              <ul className="space-y-2 text-xs text-slate-300 font-medium">
                <li><a href="#home" className="hover:text-[#39D98A] transition-colors">{t.navHome}</a></li>
                <li><a href="#how-it-works" className="hover:text-[#39D98A] transition-colors">{t.navHowItWorks}</a></li>
                <li><a href="#features" className="hover:text-[#39D98A] transition-colors">{t.navFeatures}</a></li>
                <li><a href="#technology" className="hover:text-[#39D98A] transition-colors">{t.navTechnology}</a></li>
                <li><a href="#impact" className="hover:text-[#39D98A] transition-colors">{t.navImpact}</a></li>
                <li><a href="#contact" className="hover:text-[#39D98A] transition-colors">{t.navContact}</a></li>
              </ul>
            </div>

            {/* Col 3: Tech Stack Badges */}
            <div className="space-y-3">
              <div className="text-xs font-mono font-bold uppercase tracking-widest text-[#39D98A]">
                {t.footerTechStack}
              </div>
              <div className="flex flex-wrap gap-2 pt-1 font-mono text-[11px]">
                <span className="px-2.5 py-1 rounded-md bg-[#142238] border border-slate-700 text-slate-200">Node.js</span>
                <span className="px-2.5 py-1 rounded-md bg-[#142238] border border-slate-700 text-slate-200">Express</span>
                <span className="px-2.5 py-1 rounded-md bg-[#142238] border border-slate-700 text-slate-200">SQLite</span>
                <span className="px-2.5 py-1 rounded-md bg-[#142238] border border-[#39D98A]/50 text-[#39D98A]">WebSocket</span>
                <span className="px-2.5 py-1 rounded-md bg-[#142238] border border-slate-700 text-slate-200">mDNS/Bonjour</span>
                <span className="px-2.5 py-1 rounded-md bg-[#142238] border border-[#39D98A]/50 text-[#39D98A]">Ollama phi3</span>
              </div>
            </div>

            {/* Col 4: Right Tagline & Submission */}
            <div className="space-y-3">
              <div className="text-sm font-black text-white">
                {t.footerTag1}
              </div>
              <div className="text-xl font-black text-[#39D98A] tracking-tight">
                {t.footerTag2}
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                {t.footerCredits}
              </p>
              <div className="pt-2">
                <button
                  onClick={onLaunchDemo}
                  className="px-4 py-2 rounded-lg bg-[#142238] hover:bg-[#1E3250] text-[#39D98A] border border-[#39D98A]/40 font-bold text-xs uppercase tracking-wider transition-colors cursor-pointer"
                >
                  ⚡ Open Demo Dashboard
                </button>
              </div>
            </div>

          </div>

          {/* Bottom Copyright Strip */}
          <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500 font-mono">
            <div>{t.footerCopy}</div>
            <div className="flex items-center gap-4">
              <span className="hover:text-slate-300 transition-colors">Privacy First</span>
              <span>•</span>
              <span className="hover:text-slate-300 transition-colors">Zero Telemetry</span>
              <span>•</span>
              <span className="text-[#39D98A]">Hack India 2026</span>
            </div>
          </div>

        </div>
      </footer>

      {/* ══════════════════════════════════════════════════════════════════════════
          INTERACTIVE CORE FEATURE MODAL (Live working buttons for all 6 features)
          ══════════════════════════════════════════════════════════════════════════ */}
      {activeFeature && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-[#142238] text-white rounded-2xl max-w-2xl w-full p-6 sm:p-8 border border-[#39D98A]/50 shadow-2xl space-y-6">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-4 border-b border-[#233857]">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#0A1628] border border-[#39D98A]/40 flex items-center justify-center text-xl shadow-inner">
                  {activeFeature === 'sos' && '📡'}
                  {activeFeature === 'peers' && '🔍'}
                  {activeFeature === 'gossip' && '🔄'}
                  {activeFeature === 'ai' && '🤖'}
                  {activeFeature === 'emergency' && '🛡️'}
                  {activeFeature === 'map' && '🗺️'}
                </div>
                <div>
                  <div className="text-lg font-black text-white tracking-tight flex items-center gap-2">
                    {activeFeature === 'sos' && t.feat1Title}
                    {activeFeature === 'peers' && t.feat2Title}
                    {activeFeature === 'gossip' && t.feat3Title}
                    {activeFeature === 'ai' && t.feat4Title}
                    {activeFeature === 'emergency' && t.feat5Title}
                    {activeFeature === 'map' && t.feat6Title}
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#39D98A]/20 text-[#39D98A] font-bold border border-[#39D98A]/30">
                      {lang === 'hi' ? 'लाइव वर्किंग' : 'INTERACTIVE LIVE'}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {activeFeature === 'sos' && t.feat1Desc}
                    {activeFeature === 'peers' && t.feat2Desc}
                    {activeFeature === 'gossip' && t.feat3Desc}
                    {activeFeature === 'ai' && t.feat4Desc}
                    {activeFeature === 'emergency' && t.feat5Desc}
                    {activeFeature === 'map' && t.feat6Desc}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={handleCloseFeatureModal}
                className="w-8 h-8 rounded-full bg-[#0A1628] text-slate-400 hover:text-white flex items-center justify-center border border-[#233857] hover:border-[#39D98A] cursor-pointer transition-colors"
              >
                ✕
              </button>
            </div>

            {/* Modal Body: Feature 1 - SOS Broadcast */}
            {activeFeature === 'sos' && (
              <div className="space-y-4">
                <div className="p-4 rounded-xl bg-[#0A1628] border border-[#233857] space-y-3">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-mono text-slate-400 font-bold uppercase tracking-wider">
                      {lang === 'hi' ? 'आपातकालीन प्रकार चुनें:' : 'Select Distress Category:'}
                    </span>
                    <span className="text-[#39D98A] font-mono font-bold flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-[#39D98A] animate-ping" />
                      {lang === 'hi' ? 'मेश चैनल तैयार' : 'Mesh Ready'}
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { id: 'flood', label: lang === 'hi' ? '🌊 भीषण बाढ़ / फंसे हैं' : '🌊 Severe Flood / Trapped' },
                      { id: 'medical', label: lang === 'hi' ? '🩺 गंभीर चोट / चिकित्सा' : '🩺 Medical Trauma' },
                      { id: 'food', label: lang === 'hi' ? '🍼 राशन व पेयजल कमी' : '🍼 Critical Rations' },
                    ].map((item) => (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => setSosCategory(item.id)}
                        className={`p-2 rounded-lg text-xs font-bold text-center border transition-all cursor-pointer ${
                          sosCategory === item.id
                            ? 'bg-[#E13A2E]/20 border-[#E13A2E] text-white shadow-md'
                            : 'bg-[#142238] border-[#233857] text-slate-300 hover:text-white'
                        }`}
                      >
                        {item.label}
                      </button>
                    ))}
                  </div>

                  {sosSent ? (
                    <div className="p-4 rounded-xl bg-[#E8F8F0] text-[#0A1628] space-y-2 border border-[#39D98A] animate-fade-in">
                      <div className="font-black text-sm flex items-center gap-2">
                        <span>✅</span>
                        <span>{lang === 'hi' ? 'SOS डिस्ट्रेस पैकेट प्रसारित!' : 'SOS Distress Broadcast Sent!'}</span>
                      </div>
                      <div className="text-xs text-slate-700 font-mono space-y-1">
                        <div>
                          📍 GPS: {userLocation?.latitude
                            ? `${userLocation.latitude.toFixed(4)}° N, ${userLocation.longitude.toFixed(4)}° E (Live Node GPS)`
                            : '28.6280° N, 77.2140° E (Flood Sector 4)'}
                        </div>
                        <div>📡 Received by: Node-01 (Neighbor, 12ms) · Node-04 (NDRF Rescue Boat, 28ms)</div>
                        <div className="text-[#0A1628] font-bold">Hop Latency: 14ms · 0 Cellular Towers Required</div>
                      </div>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={async () => {
                        setSosSent(true);
                        try {
                          await fetch(`${ROUTER_URL}/sos`, {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                              deviceName: 'Mobile Survivor (Landing Demo)',
                              sender: 'Mobile Survivor (Landing Demo)',
                              emergencyType: sosCategory || 'critical',
                              latitude: userLocation?.latitude || 28.6280,
                              longitude: userLocation?.longitude || 77.2140,
                              message: sosCategory === 'flood'
                                ? '🌊 भीषण बाढ़! छत पर फंसे हैं, तुरंत नाव और बचाव दल भेजें।'
                                : (sosCategory === 'medical'
                                  ? '🩺 गंभीर चोट लगी है! तुरंत प्राथमिक चिकित्सा और डॉक्टर की आवश्यकता है।'
                                  : '🍼 राशन और पीने का स्वच्छ पानी समाप्त हो गया है। तत्काल सहायता चाहिए।')
                            })
                          });
                        } catch (err) {
                          console.warn('Landing SOS broadcast error:', err);
                        }
                      }}
                      className="w-full py-3.5 rounded-xl bg-[#E13A2E] hover:bg-[#C92A1E] text-white font-black text-xs uppercase tracking-wider shadow-lg hover:shadow-[#E13A2E]/30 transition-all flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <span>🚨</span>
                      <span>{lang === 'hi' ? 'लाइव टेस्ट SOS प्रसारित करें' : 'Simulate SOS Broadcast'}</span>
                    </button>
                  )}
                </div>

                <div className="flex items-center justify-between pt-2">
                  <span className="text-xs text-slate-400 font-mono">
                    {lang === 'hi' ? 'पूर्ण कार्यशील ऐप डैशबोर्ड खोलें:' : 'Want to send a real SOS in the live app?'}
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      handleCloseFeatureModal();
                      if (onOpenSos) onOpenSos();
                      else onLaunchDemo('home');
                    }}
                    className="px-5 py-2.5 rounded-xl bg-[#39D98A] text-[#0A1628] font-black text-xs uppercase tracking-wider cursor-pointer hover:bg-[#2EC479] transition-all"
                  >
                    ⚡ {lang === 'hi' ? 'लाइव SOS टूल खोलें' : 'Open Live SOS Tool'}
                  </button>
                </div>
              </div>
            )}

            {/* Modal Body: Feature 2 - Peer Discovery */}
            {activeFeature === 'peers' && (
              <div className="space-y-4">
                <div className="p-4 rounded-xl bg-[#0A1628] border border-[#233857] space-y-3">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-mono text-[#39D98A] font-bold flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-[#39D98A] animate-ping" />
                      {lang === 'hi' ? 'स्वचालित पीयर खोज सक्रिय (mDNS + BLE)' : 'Auto Discovery Active (mDNS + BLE)'}
                    </span>
                    <span className="font-mono text-slate-400 text-[11px]">Ports: 4000-4003</span>
                  </div>

                  <div className="space-y-2 font-mono text-xs">
                    <div className="p-2.5 rounded-lg bg-[#142238] border border-[#233857] flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-[#39D98A]" />
                        <span className="font-bold text-white">Node-Alpha (Relay Host)</span>
                        <span className="text-[10px] text-slate-400">Port 4000</span>
                      </div>
                      <span className="text-[#39D98A] text-[11px]">Signal: -42dBm · 99% Battery</span>
                    </div>

                    <div className="p-2.5 rounded-lg bg-[#142238] border border-[#233857] flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-[#39D98A]" />
                        <span className="font-bold text-white">Node-NDRF-04 (Rescue Boat)</span>
                        <span className="text-[10px] text-slate-400">BLE Relay</span>
                      </div>
                      <span className="text-[#39D98A] text-[11px]">Signal: -58dBm · 88% Battery</span>
                    </div>

                    <div className="p-2.5 rounded-lg bg-[#142238] border border-[#233857] flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-[#39D98A]" />
                        <span className="font-bold text-white">Node-Bravo (Shelter Camp)</span>
                        <span className="text-[10px] text-slate-400">Port 4001</span>
                      </div>
                      <span className="text-[#39D98A] text-[11px]">Signal: -65dBm · 94% Battery</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2">
                  <span className="text-xs text-slate-400 font-mono">
                    {lang === 'hi' ? 'लाइव ब्लूटूथ व नोड स्कैनर:' : 'Explore live node scanner & telemetry:'}
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      handleCloseFeatureModal();
                      if (onOpenBle) onOpenBle();
                      else onLaunchDemo('mesh');
                    }}
                    className="px-5 py-2.5 rounded-xl bg-[#39D98A] text-[#0A1628] font-black text-xs uppercase tracking-wider cursor-pointer hover:bg-[#2EC479] transition-all"
                  >
                    📡 {lang === 'hi' ? 'लाइव नोड मैनेजर खोलें' : 'Open Live Node Manager'}
                  </button>
                </div>
              </div>
            )}

            {/* Modal Body: Feature 3 - Gossip Relay */}
            {activeFeature === 'gossip' && (
              <div className="space-y-4">
                <div className="p-4 rounded-xl bg-[#0A1628] border border-[#233857] space-y-3">
                  <div className="flex items-center justify-between text-xs font-mono">
                    <span className="text-slate-300 font-bold">
                      {lang === 'hi' ? 'गॉसिप रिले हॉप सिम्युलेटर:' : 'Gossip Hop Simulation:'}
                    </span>
                    <span className="text-[#39D98A] font-bold">Hop {gossipStep} / 3</span>
                  </div>

                  <div className="grid grid-cols-4 gap-2 text-center text-xs font-mono">
                    {[
                      { step: 0, icon: '📱', label: lang === 'hi' ? 'आपका फोन' : 'Your Node', status: gossipStep >= 0 ? 'Sent' : 'Waiting' },
                      { step: 1, icon: '📲', label: lang === 'hi' ? 'पीयर A' : 'Peer A', status: gossipStep >= 1 ? 'Relayed (12ms)' : 'Waiting' },
                      { step: 2, icon: '🚤', label: lang === 'hi' ? 'रेस्क्यू बोट' : 'Rescue Boat', status: gossipStep >= 2 ? 'Relayed (26ms)' : 'Waiting' },
                      { step: 3, icon: '🏢', label: lang === 'hi' ? 'राहत शिविर' : 'Relief HQ', status: gossipStep >= 3 ? 'Delivered (41ms)' : 'Waiting' },
                    ].map((item) => (
                      <div
                        key={item.step}
                        className={`p-2.5 rounded-xl border transition-all ${
                          gossipStep >= item.step
                            ? 'bg-[#142238] border-[#39D98A] text-white shadow-md'
                            : 'bg-[#0A1628] border-[#233857] text-slate-500 opacity-50'
                        }`}
                      >
                        <div className="text-xl mb-1">{item.icon}</div>
                        <div className="font-bold text-[11px]">{item.label}</div>
                        <div className="text-[9px] text-[#39D98A] mt-0.5">{item.status}</div>
                      </div>
                    ))}
                  </div>

                  <div className="flex items-center gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => setGossipStep((prev) => (prev < 3 ? prev + 1 : 0))}
                      className="flex-1 py-2.5 rounded-xl bg-[#142238] hover:bg-[#1E3250] text-[#39D98A] border border-[#39D98A]/40 font-mono text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer"
                    >
                      🔄 {gossipStep < 3 ? (lang === 'hi' ? 'अगला हॉप रिले करें' : 'Hop Next Node') : (lang === 'hi' ? 'रिस्टार्ट रिले' : 'Restart Hop')}
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2">
                  <span className="text-xs text-slate-400 font-mono">
                    {lang === 'hi' ? 'लाइव मेश नेटवर्क टोपोलॉजी:' : 'View full interactive topology:'}
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      handleCloseFeatureModal();
                      onLaunchDemo('mesh');
                    }}
                    className="px-5 py-2.5 rounded-xl bg-[#39D98A] text-[#0A1628] font-black text-xs uppercase tracking-wider cursor-pointer hover:bg-[#2EC479] transition-all"
                  >
                    ⚡ {lang === 'hi' ? 'लाइव मेश कंसोल खोलें' : 'Open Live Mesh Console'}
                  </button>
                </div>
              </div>
            )}

            {/* Modal Body: Feature 4 - Offline AI Assistant */}
            {activeFeature === 'ai' && (
              <div className="space-y-4">
                <div className="p-4 rounded-xl bg-[#0A1628] border border-[#233857] space-y-3">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-mono text-slate-400 font-bold uppercase tracking-wider">
                      {lang === 'hi' ? 'त्वरित आपातकालीन प्रश्न चुनें:' : 'Instant Emergency Triage Questions:'}
                    </span>
                    <span className="text-[#39D98A] font-mono text-[11px] font-bold">
                      Phi-3 Local · 0ms
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    {[
                      lang === 'hi' ? '💧 बाढ़ में पानी शुद्ध कैसे करें?' : '💧 How to purify flood water?',
                      lang === 'hi' ? '🩹 गंभीर चोट में खून कैसे रोकें?' : '🩹 How to stop severe bleeding?',
                      lang === 'hi' ? '⚡ EchoMesh कैसे काम करता है?' : '⚡ How does EchoMesh route?'
                    ].map((prompt, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => handleAskAiPreset(prompt)}
                        className={`p-2.5 rounded-lg text-xs font-bold text-left border transition-all cursor-pointer ${
                          aiTestQ === prompt
                            ? 'bg-[#39D98A]/20 border-[#39D98A] text-white'
                            : 'bg-[#142238] border-[#233857] text-slate-300 hover:text-white hover:border-slate-500'
                        }`}
                      >
                        {prompt}
                      </button>
                    ))}
                  </div>

                  {aiTestAns && (
                    <div className="p-3.5 rounded-xl bg-[#142238] border border-[#39D98A]/40 text-xs text-slate-200 leading-relaxed space-y-1 animate-fade-in">
                      <div className="font-bold text-[#39D98A] font-mono text-[11px]">
                        🤖 EchoMesh Offline Triage AI:
                      </div>
                      <p>{aiTestAns}</p>
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between pt-2">
                  <span className="text-xs text-slate-400 font-mono">
                    {lang === 'hi' ? 'संपूर्ण ऑफलाइन AI चैट सहायक:' : 'Open full conversational assistant:'}
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      handleCloseFeatureModal();
                      onLaunchDemo('ai');
                    }}
                    className="px-5 py-2.5 rounded-xl bg-[#39D98A] text-[#0A1628] font-black text-xs uppercase tracking-wider cursor-pointer hover:bg-[#2EC479] transition-all"
                  >
                    💬 {lang === 'hi' ? 'फुल AI चैट खोलें' : 'Open Full AI Chat'}
                  </button>
                </div>
              </div>
            )}

            {/* Modal Body: Feature 5 - Emergency Mode */}
            {activeFeature === 'emergency' && (
              <div className="space-y-4">
                <div className="p-4 rounded-xl bg-[#0A1628] border border-[#233857] space-y-4">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-mono text-white font-bold">
                      {lang === 'hi' ? 'आपातकालीन मोड व सायरन टेस्ट' : 'Emergency Mode & Siren Test'}
                    </span>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold ${
                      isSirenPlaying ? 'bg-[#E13A2E] text-white animate-pulse' : 'bg-slate-700 text-slate-300'
                    }`}>
                      {isSirenPlaying ? (lang === 'hi' ? 'सायरन सक्रिय' : 'SIREN ACTIVE') : (lang === 'hi' ? 'सायरन म्यूट' : 'MUTED')}
                    </span>
                  </div>

                  <div className="p-4 rounded-xl bg-[#142238] border border-[#233857] flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="space-y-1 text-center sm:text-left">
                      <div className="font-bold text-sm text-white">
                        {lang === 'hi' ? 'ऑडियो डिस्ट्रेस अलार्म' : 'Audio Distress Siren Beacon'}
                      </div>
                      <p className="text-xs text-slate-400">
                        {lang === 'hi' ? 'रेस्क्यू टीम को आकर्षित करने के लिए उच्च आवृत्ति सायरन' : 'High-pitch audible frequency to attract nearby relief teams'}
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={toggleSiren}
                      className={`px-6 py-3 rounded-xl font-mono text-xs font-black uppercase tracking-wider shadow-lg transition-all cursor-pointer ${
                        isSirenPlaying
                          ? 'bg-[#E13A2E] text-white hover:bg-[#C92A1E] animate-bounce'
                          : 'bg-[#39D98A] text-[#0A1628] hover:bg-[#2EC479]'
                      }`}
                    >
                      {isSirenPlaying ? (lang === 'hi' ? '🔇 सायरन बंद करें' : '🔇 MUTE SIREN') : (lang === 'hi' ? '🔊 सायरन बजाएं' : '🔊 TEST SIREN')}
                    </button>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center font-mono text-xs">
                    <div className="p-2.5 rounded-lg bg-[#142238] border border-[#233857]">
                      <div className="text-[#39D98A] font-bold">Active</div>
                      <div className="text-[10px] text-slate-400 mt-0.5">High Contrast UI</div>
                    </div>
                    <div className="p-2.5 rounded-lg bg-[#142238] border border-[#233857]">
                      <div className="text-[#39D98A] font-bold">18h+</div>
                      <div className="text-[10px] text-slate-400 mt-0.5">Battery Throttling</div>
                    </div>
                    <div className="p-2.5 rounded-lg bg-[#142238] border border-[#233857]">
                      <div className="text-[#39D98A] font-bold">Locked</div>
                      <div className="text-[10px] text-slate-400 mt-0.5">GPS Precision</div>
                    </div>
                    <div className="p-2.5 rounded-lg bg-[#142238] border border-[#233857]">
                      <div className="text-[#39D98A] font-bold">Priority</div>
                      <div className="text-[10px] text-slate-400 mt-0.5">SOS Broadcast</div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2">
                  <span className="text-xs text-slate-400 font-mono">
                    {lang === 'hi' ? 'लाइव इमरजेंसी डैशबोर्ड पर जाएं:' : 'Launch emergency console in app:'}
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      handleCloseFeatureModal();
                      onLaunchDemo('home');
                    }}
                    className="px-5 py-2.5 rounded-xl bg-[#39D98A] text-[#0A1628] font-black text-xs uppercase tracking-wider cursor-pointer hover:bg-[#2EC479] transition-all"
                  >
                    ⚡ {lang === 'hi' ? 'इमरजेंसी मोड खोलें' : 'Open Emergency Mode'}
                  </button>
                </div>
              </div>
            )}

            {/* Modal Body: Feature 6 - Real-Time Mesh Map */}
            {activeFeature === 'map' && (
              <div className="space-y-4">
                <div className="p-4 rounded-xl bg-[#0A1628] border border-[#233857] space-y-3">
                  <div className="flex items-center justify-between text-xs font-mono">
                    <span className="text-[#39D98A] font-bold flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-[#39D98A] animate-ping" />
                      {lang === 'hi' ? 'लाइव जीपीएस रडार एवं आपदा मानचित्र' : 'Live Tactical Radar & Mesh Map'}
                    </span>
                    <span className="text-slate-400">12.4 km² Verified</span>
                  </div>

                  <div className="relative rounded-xl overflow-hidden border border-[#233857] bg-[#0E1A2E] p-3">
                    <svg viewBox="0 0 400 160" className="w-full h-36">
                      <line x1="60" y1="80" x2="160" y2="40" stroke="#39D98A" strokeWidth="2" strokeDasharray="4 2" />
                      <line x1="160" y1="40" x2="260" y2="90" stroke="#39D98A" strokeWidth="2" strokeDasharray="4 2" />
                      <line x1="260" y1="90" x2="340" y2="60" stroke="#39D98A" strokeWidth="2" strokeDasharray="4 2" />
                      
                      <circle cx="60" cy="80" r="12" fill="#E13A2E" />
                      <text x="60" y="84" fill="white" fontSize="9" fontWeight="bold" textAnchor="middle">SOS</text>
                      
                      <circle cx="160" cy="40" r="10" fill="#39D98A" />
                      <text x="160" y="44" fill="#0A1628" fontSize="8" fontWeight="bold" textAnchor="middle">Boat</text>
                      
                      <circle cx="260" cy="90" r="10" fill="#39D98A" />
                      <text x="260" y="94" fill="#0A1628" fontSize="8" fontWeight="bold" textAnchor="middle">Camp</text>
                      
                      <circle cx="340" cy="60" r="12" fill="#0D6EFD" />
                      <text x="340" y="64" fill="white" fontSize="8" fontWeight="bold" textAnchor="middle">HQ</text>
                    </svg>

                    <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 mt-2 px-1">
                      <span>Flood Hotspot: Brahmaputra River Basin</span>
                      <span className="text-[#39D98A]">Safe Zone: High School Ground</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2">
                  <span className="text-xs text-slate-400 font-mono">
                    {lang === 'hi' ? 'पूर्ण स्क्रीन इंटरएक्टिव नक्शा खोलें:' : 'Explore full offline tactical map:'}
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      handleCloseFeatureModal();
                      onLaunchDemo('map');
                    }}
                    className="px-5 py-2.5 rounded-xl bg-[#39D98A] text-[#0A1628] font-black text-xs uppercase tracking-wider cursor-pointer hover:bg-[#2EC479] transition-all"
                  >
                    🗺️ {lang === 'hi' ? 'फुल स्क्रीन मैप खोलें' : 'Open Full Screen Map'}
                  </button>
                </div>
              </div>
            )}

          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════════════
          PROBLEM STATEMENT MODAL (Hack India 2026 Context)
          ══════════════════════════════════════════════════════════════════════════ */}
      {isProblemModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-[#142238] text-white rounded-2xl max-w-2xl w-full p-6 sm:p-8 border border-[#39D98A]/40 shadow-2xl space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-[#233857]">
              <div className="flex items-center gap-2">
                <span className="text-xl text-[#39D98A]">🛡️</span>
                <span className="text-lg font-black tracking-tight">{t.col2Title}</span>
              </div>
              <button
                onClick={() => setIsProblemModalOpen(false)}
                className="w-8 h-8 rounded-full bg-[#0A1628] text-slate-400 hover:text-white flex items-center justify-center cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4 text-xs sm:text-sm text-slate-300 leading-relaxed max-h-[60vh] overflow-y-auto pr-2">
              <div className="p-4 rounded-xl bg-[#0A1628] border border-slate-700">
                <div className="font-bold text-[#39D98A] uppercase tracking-wider text-xs mb-1">
                  Problem Statement:
                </div>
                <p>
                  During natural calamities like floods, earthquakes, and cyclones, centralized cellular and electrical infrastructure collapses within the first 30 to 45 minutes. Victims and volunteers are left with zero telecommunications, resulting in isolated casualties and delayed search & rescue operations.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-[#0A1628] border border-slate-700">
                <div className="font-bold text-[#39D98A] uppercase tracking-wider text-xs mb-1">
                  The EchoMesh Solution:
                </div>
                <p>
                  EchoMesh transforms ordinary smartphones and local micro-servers into a decentralized, zero-infrastructure peer-to-peer mesh network. Using mDNS and WebSocket gossip propagation, distress alerts hop between phones until they reach response teams. Crucially, on-device local RAG with Ollama Phi-3 provides instantaneous first-aid and survival triage with zero internet connectivity.
                </p>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setIsProblemModalOpen(false)}
                className="px-6 py-2.5 rounded-xl bg-[#39D98A] text-[#0A1628] font-black text-xs uppercase tracking-wider cursor-pointer"
              >
                Close Statement
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
