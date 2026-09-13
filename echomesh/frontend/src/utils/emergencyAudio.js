// Offline Web Audio API Emergency Siren & SOS Alarm Synthesizer
// Zero external files or MP3 downloads needed — runs 100% offline on any browser!

class EmergencyAudioEngine {
  constructor() {
    this.audioCtx = null;
    this.isPlaying = false;
    this.intervalId = null;
    this.unlocked = false;
  }

  async initContext() {
    try {
      if (!this.audioCtx) {
        const AudioContextClass = window.AudioContext || window.webkitAudioContext;
        if (AudioContextClass) {
          this.audioCtx = new AudioContextClass();
        }
      }
      if (this.audioCtx && this.audioCtx.state === 'suspended') {
        await this.audioCtx.resume();
      }
      this.unlocked = true;
    } catch (e) {
      console.warn('AudioContext init error:', e);
    }
  }

  // Register click/tap listener to unlock audio on modern mobile/desktop browsers
  setupAutoUnlock() {
    if (typeof window === 'undefined') return;
    const unlock = async () => {
      await this.initContext();
      window.removeEventListener('click', unlock);
      window.removeEventListener('keydown', unlock);
      window.removeEventListener('touchstart', unlock);
    };
    window.addEventListener('click', unlock, { once: true });
    window.addEventListener('keydown', unlock, { once: true });
    window.addEventListener('touchstart', unlock, { once: true });
  }

  // Play a single pulsed beep
  async playBeep(freq = 880, duration = 0.15, type = 'square', volume = 0.5) {
    try {
      await this.initContext();
      if (!this.audioCtx) return;
      const ctx = this.audioCtx;
      if (ctx.state === 'suspended') await ctx.resume();

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = type;
      osc.frequency.setValueAtTime(freq, ctx.currentTime);

      gain.gain.setValueAtTime(volume, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + duration);
    } catch (e) {
      console.warn('Audio play error:', e);
    }
  }

  // Start continuous European / US disaster emergency siren (oscillating Hi-Lo)
  async startSiren() {
    try {
      await this.initContext();
      if (this.isPlaying) return;
      this.isPlaying = true;

      const ctx = this.audioCtx;
      if (!ctx) return;
      if (ctx.state === 'suspended') await ctx.resume();

      let high = true;

      // Play initial loud triple warning pulse
      this.playBeep(1200, 0.2, 'sawtooth', 0.6);
      setTimeout(() => this.playBeep(1200, 0.2, 'sawtooth', 0.6), 250);
      setTimeout(() => this.playBeep(1200, 0.2, 'sawtooth', 0.6), 500);

      this.intervalId = setInterval(async () => {
        if (!this.isPlaying || !this.audioCtx) return;

        if (this.audioCtx.state === 'suspended') {
          try { await this.audioCtx.resume(); } catch (e) {}
        }

        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'sawtooth';
        const targetFreq = high ? 1050 : 580;
        const duration = 0.55;

        osc.frequency.setValueAtTime(high ? 580 : 1050, ctx.currentTime);
        osc.frequency.linearRampToValueAtTime(targetFreq, ctx.currentTime + duration);

        gain.gain.setValueAtTime(0.5, ctx.currentTime);
        gain.gain.linearRampToValueAtTime(0.5, ctx.currentTime + duration - 0.05);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start();
        osc.stop(ctx.currentTime + duration);

        high = !high;
      }, 600);
    } catch (e) {
      console.warn('Siren start error:', e);
    }
  }

  stopSiren() {
    this.isPlaying = false;
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }
}

export const emergencyAudio = new EmergencyAudioEngine();
if (typeof window !== 'undefined') {
  emergencyAudio.setupAutoUnlock();
}


