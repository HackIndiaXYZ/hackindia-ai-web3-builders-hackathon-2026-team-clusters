// Offline & Web Speech API Voice Recognition & Synthesis Engine
// Specially tuned for Native Hindi (हिंदी) & Indian English speech!

class VoiceAssistantEngine {
  constructor() {
    this.recognition = null;
    this.isListening = false;
    this.isSpeaking = false;
    this.synthesis = typeof window !== 'undefined' ? window.speechSynthesis : null;
    this.currentUtterance = null;
    this.availableVoices = [];

    if (this.synthesis) {
      this.loadVoices();
      if (typeof window !== 'undefined') {
        window.speechSynthesis.onvoiceschanged = () => this.loadVoices();
      }
    }
  }

  loadVoices() {
    if (!this.synthesis) return;
    this.availableVoices = this.synthesis.getVoices() || [];
  }

  getBestHindiVoice() {
    this.loadVoices();
    if (!this.availableVoices || this.availableVoices.length === 0) return null;

    // 1. First priority: Exact native Hindi voice (Google हिन्दी, Microsoft Swara, Microsoft Madhur, etc.)
    const hindiVoice = this.availableVoices.find(v => 
      v.lang === 'hi-IN' || v.lang === 'hi_IN' || v.lang.toLowerCase().startsWith('hi') || /hindi|swara|madhur|hemant/i.test(v.name)
    );

    if (hindiVoice) return hindiVoice;

    // 2. Second priority: Indian English (en-IN) which pronounces Hindi/Hinglish accurately
    const indianVoice = this.availableVoices.find(v => 
      v.lang === 'en-IN' || v.lang === 'en_IN' || /india|neerja|prabhat|ravi/i.test(v.name)
    );

    if (indianVoice) return indianVoice;

    return null;
  }

  isSupported() {
    if (typeof window === 'undefined') return false;
    return !!(window.SpeechRecognition || window.webkitSpeechRecognition);
  }

  // Start speech-to-text recognition in Hindi / English with mic permissions & fallback
  async startListening({ onResult, onError, onEnd, lang = 'hi-IN' }) {
    if (!this.isSupported()) {
      if (onError) onError('Speech recognition is not supported in this browser. Please use Chrome, Edge, or Brave.', false);
      return;
    }

    // 1. Explicitly prompt user for Microphone Permission via getUserMedia if available
    try {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        // Close temporary stream immediately — we just needed the browser permission unlock
        stream.getTracks().forEach(track => track.stop());
      }
    } catch (micErr) {
      this.isListening = false;
      const isBlocked = micErr.name === 'NotAllowedError' || micErr.name === 'PermissionDeniedError';
      if (onError) {
        if (isBlocked) {
          onError('Microphone access denied. Please allow mic in browser address bar (🔒 icon).', true);
        } else {
          onError('Microphone hardware not detected or in use by another app.', false);
        }
      }
      return;
    }

    // 2. Initialize Web Speech API engine
    try {
      if (this.recognition) {
        try { this.recognition.abort(); } catch (e) {}
      }

      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      this.recognition = new SpeechRecognition();
      this.recognition.continuous = true;
      this.recognition.interimResults = true;
      this.recognition.maxAlternatives = 1;
      this.recognition.lang = lang; // 'hi-IN' by default

      this.isListening = true;

      this.recognition.onresult = (event) => {
        let finalTranscript = '';
        let interimTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          const item = event.results[i];
          if (item.isFinal) {
            finalTranscript += item[0].transcript;
          } else {
            interimTranscript += item[0].transcript;
          }
        }

        const currentText = (finalTranscript || interimTranscript).trim();
        if (onResult && currentText) {
          onResult({
            transcript: currentText,
            isFinal: !!finalTranscript
          });
        }
      };

      this.recognition.onerror = (event) => {
        console.warn('Speech recognition event error:', event.error);
        if (event.error === 'no-speech') {
          // Silent ignore — keep listening or let onend handle it
          return;
        }
        this.isListening = false;
        const isBlocked = event.error === 'not-allowed';
        if (onError) {
          if (isBlocked) {
            const isHttp = typeof window !== 'undefined' && window.location.protocol !== 'https:' && window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1';
            if (isHttp) {
              onError('फोन में अनुमति ऑन है, लेकिन Chrome HTTP पर माइक रोकता है। कृपया HTTPS (पोर्ट 4443) लिंक खोलें या 1-टैप संदेश चुनें।', true);
            } else {
              onError('Microphone permission blocked. Click URL bar 🔒/tune icon to allow.', true);
            }
          } else if (event.error === 'language-not-supported') {
            onError('Hindi voice pack missing in browser. Try speaking in English.', false);
          } else {
            onError(`Voice error: ${event.error}`, false);
          }
        }
      };

      this.recognition.onend = () => {
        this.isListening = false;
        if (onEnd) onEnd();
      };

      this.recognition.start();
    } catch (err) {
      this.isListening = false;
      const isBlocked = /not-allowed|permission/i.test(err.message || '');
      if (onError) onError(err.message || 'Could not start microphone', isBlocked);
    }
  }

  async requestPermission() {
    try {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        stream.getTracks().forEach(t => t.stop());
        return { success: true };
      }
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (SpeechRecognition) {
        return new Promise((resolve) => {
          try {
            const sr = new SpeechRecognition();
            sr.onstart = () => { sr.stop(); resolve({ success: true }); };
            sr.onerror = (e) => { resolve({ success: false, error: e.error }); };
            sr.start();
          } catch (e) {
            resolve({ success: false, error: e.message });
          }
        });
      }
      return { success: false, error: 'not_supported' };
    } catch (err) {
      return { success: false, error: err.name || err.message };
    }
  }

  stopListening() {
    this.isListening = false;
    if (this.recognition) {
      try {
        this.recognition.stop();
      } catch (e) {}
    }
  }

  // Text-To-Speech: Reads out answer in pure, natural Indian Hindi voice!
  speak(text, { onStart, onEnd, lang = 'hi-IN', rate = 0.95 } = {}) {
    if (!this.synthesis) return;
    this.stopSpeaking();

    // Clean text of symbols, bullets, brackets, and markdown for ultra clear speech
    const cleanText = text
      .replace(/[*_~`#\[\]\(\)\{\}]/g, '')
      .replace(/•/g, ' ')
      .replace(/\n+/g, '. ')
      .trim();

    if (!cleanText) return;

    this.currentUtterance = new SpeechSynthesisUtterance(cleanText);
    this.currentUtterance.rate = rate; // Slightly slower, crisp cadence for emergency instructions
    this.currentUtterance.pitch = 1.0;
    this.currentUtterance.lang = 'hi-IN';

    // Find and assign native Hindi voice
    const bestHindiVoice = this.getBestHindiVoice();
    if (bestHindiVoice) {
      this.currentUtterance.voice = bestHindiVoice;
      this.currentUtterance.lang = bestHindiVoice.lang;
    }

    this.currentUtterance.onstart = () => {
      this.isSpeaking = true;
      if (onStart) onStart();
    };

    this.currentUtterance.onend = () => {
      this.isSpeaking = false;
      if (onEnd) onEnd();
    };

    this.currentUtterance.onerror = () => {
      this.isSpeaking = false;
      if (onEnd) onEnd();
    };

    this.synthesis.speak(this.currentUtterance);
  }

  stopSpeaking() {
    this.isSpeaking = false;
    if (this.synthesis) {
      try {
        this.synthesis.cancel();
      } catch (e) {}
    }
  }
}

export const voiceAssistant = new VoiceAssistantEngine();
