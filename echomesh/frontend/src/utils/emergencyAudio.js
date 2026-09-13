// Offline Web Audio API Emergency Siren & SOS Alarm Synthesizer
// Zero external files or MP3 downloads needed — runs 100% offline on any browser!

class EmergencyAudioEngine {
  constructor() {
    this.audioCtx = null;
    this.masterGain = null;
    this.isPlaying = false;
    this.isMuted = false;
    this.intervalId = null;
    this.unlocked = false;
    this.pendingTimeouts = [];
    this.activeNodes = new Set();
  }

  async initContext() {
    try {
      if (!this.audioCtx) {
        const AudioContextClass = window.AudioContext || window.webkitAudioContext;
        if (AudioContextClass) {
          this.audioCtx = new AudioContextClass();
          this.masterGain = this.audioCtx.createGain();
          this.masterGain.gain.setValueAtTime(1, this.audioCtx.currentTime);
          this.masterGain.connect(this.audioCtx.destination);
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

  mute() {
    this.isMuted = true;
    this.stopSiren();
  }

  unmute() {
    this.isMuted = false;
    if (this.audioCtx && this.masterGain) {
      try {
        this.masterGain.gain.setValueAtTime(1, this.audioCtx.currentTime);
      } catch (e) {}
    }
  }

  // Play a single pulsed beep
  async playBeep(freq = 880, duration = 0.15, type = 'square', volume = 0.5) {
    if (this.isMuted) return;
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
      if (this.masterGain) {
        gain.connect(this.masterGain);
      } else {
        gain.connect(ctx.destination);
      }

      this.activeNodes.add(osc);
      osc.onended = () => this.activeNodes.delete(osc);

      osc.start();
      osc.stop(ctx.currentTime + duration);
    } catch (e) {
      console.warn('Audio play error:', e);
    }
  }

  playNotification() {
    if (this.isMuted) return;
    this.playBeep(880, 0.1, 'sine', 0.4);
    setTimeout(() => this.playBeep(1320, 0.15, 'sine', 0.5), 100);
  }

  // Start continuous disaster emergency siren (oscillating Hi-Lo)
  async startSiren(force = false) {
    if (this.isMuted && !force) return;
    if (force) {
      this.isMuted = false;
    }

    try {
      await this.initContext();
      if (this.isPlaying) return;
      this.isPlaying = true;

      const ctx = this.audioCtx;
      if (!ctx) return;
      if (ctx.state === 'suspended') await ctx.resume();

      if (this.masterGain) {
        this.masterGain.gain.setValueAtTime(1, ctx.currentTime);
      }

      let high = true;

      // Clear any stale timeouts
      this.pendingTimeouts.forEach(t => clearTimeout(t));
      this.pendingTimeouts = [];

      // Initial pulses
      this.playBeep(1200, 0.2, 'sawtooth', 0.6);
      this.pendingTimeouts.push(setTimeout(() => this.playBeep(1200, 0.2, 'sawtooth', 0.6), 250));
      this.pendingTimeouts.push(setTimeout(() => this.playBeep(1200, 0.2, 'sawtooth', 0.6), 500));

      this.intervalId = setInterval(async () => {
        if (!this.isPlaying || this.isMuted || !this.audioCtx) return;

        if (this.audioCtx.state === 'suspended') {
          try { await this.audioCtx.resume(); } catch (e) {}
        }

        try {
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
          if (this.masterGain) {
            gain.connect(this.masterGain);
          } else {
            gain.connect(ctx.destination);
          }

          this.activeNodes.add(osc);
          osc.onended = () => this.activeNodes.delete(osc);

          osc.start();
          osc.stop(ctx.currentTime + duration);

          high = !high;
        } catch (oscErr) {}
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

    // Cancel all scheduled beeps
    this.pendingTimeouts.forEach(t => clearTimeout(t));
    this.pendingTimeouts = [];

    // Immediately stop & disconnect all active oscillators
    for (const node of this.activeNodes) {
      try {
        node.stop();
        node.disconnect();
      } catch (e) {}
    }
    this.activeNodes.clear();

    // Zero out gain immediately
    if (this.audioCtx && this.masterGain) {
      try {
        this.masterGain.gain.setValueAtTime(0, this.audioCtx.currentTime);
      } catch (e) {}
    }
  }
}

export const emergencyAudio = new EmergencyAudioEngine();
if (typeof window !== 'undefined') {
  emergencyAudio.setupAutoUnlock();
}
