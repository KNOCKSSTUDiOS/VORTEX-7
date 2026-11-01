import { ParametricBand, VisemePhoneme } from '../types';

class KnockStudioAudioEngine {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private analyser: AnalyserNode | null = null;
  private filterNodes: BiquadFilterNode[] = [];
  private pannerNode: StereoPannerNode | null = null;
  private isSynthesizing = false;
  private loopTimer: number | null = null;

  public init() {
    if (!this.ctx) {
      const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioContextClass();
      this.analyser = this.ctx.createAnalyser();
      this.analyser.fftSize = 256;
      this.analyser.smoothingTimeConstant = 0.8;

      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(0.7, this.ctx.currentTime);

      try {
        this.pannerNode = this.ctx.createStereoPanner();
      } catch {
        // Fallback for browsers without StereoPanner
        this.pannerNode = null;
      }

      // Connect nodes: filters chain -> panner -> masterGain -> analyser -> destination
      this.setupFilters([
        { id: 1, type: 'lowshelf', freq: 65, gain: 4, q: 0.7 },
        { id: 2, type: 'peaking', freq: 250, gain: -2, q: 1.2 },
        { id: 3, type: 'peaking', freq: 1200, gain: 1, q: 1.0 },
        { id: 4, type: 'peaking', freq: 4500, gain: 3, q: 1.5 },
        { id: 5, type: 'highshelf', freq: 11000, gain: 5, q: 0.7 },
      ]);
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public setupFilters(bands: ParametricBand[]) {
    if (!this.ctx || !this.masterGain || !this.analyser) return;

    // Disconnect old filters
    this.filterNodes.forEach(f => {
      try { f.disconnect(); } catch { /* ignore */ }
    });
    this.filterNodes = [];

    // Connect filters in series
    for (let i = 0; i < bands.length; i++) {
      const b = bands[i];
      const filter = this.ctx.createBiquadFilter();
      filter.type = b.type;
      filter.frequency.setValueAtTime(b.freq, this.ctx.currentTime);
      filter.gain.setValueAtTime(b.gain, this.ctx.currentTime);
      filter.Q.setValueAtTime(b.q, this.ctx.currentTime);
      this.filterNodes.push(filter);

      if (i > 0) {
        this.filterNodes[i - 1].connect(filter);
      }
    }

    if (this.filterNodes.length > 0) {
      const lastFilter = this.filterNodes[this.filterNodes.length - 1];
      if (this.pannerNode) {
        lastFilter.connect(this.pannerNode);
        this.pannerNode.connect(this.masterGain);
      } else {
        lastFilter.connect(this.masterGain);
      }
      this.masterGain.connect(this.analyser);
      this.analyser.connect(this.ctx.destination);
    }
  }

  public updateFilterBand(bandId: number, freq: number, gain: number, q: number) {
    if (this.filterNodes[bandId - 1] && this.ctx) {
      const node = this.filterNodes[bandId - 1];
      node.frequency.setTargetAtTime(freq, this.ctx.currentTime, 0.05);
      node.gain.setTargetAtTime(gain, this.ctx.currentTime, 0.05);
      node.Q.setTargetAtTime(q, this.ctx.currentTime, 0.05);
    }
  }

  public updateSpatialPan(xPercent: number) {
    if (this.pannerNode && this.ctx) {
      // xPercent is -100 to 100
      const panVal = Math.max(-1, Math.min(1, xPercent / 100));
      this.pannerNode.pan.setTargetAtTime(panVal, this.ctx.currentTime, 0.05);
    }
  }

  public setMasterVolume(vol: number) {
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setTargetAtTime(Math.max(0, Math.min(1, vol)), this.ctx.currentTime, 0.05);
    }
  }

  /**
   * Real 808 Sub-Bass synthesis trigger
   */
  public trigger808Bass(freq = 55, decay = 1.2, drive = 0.5) {
    this.init();
    if (!this.ctx || this.filterNodes.length === 0) return;

    const osc = this.ctx.createOscillator();
    const oscGain = this.ctx.createGain();
    const distortion = this.ctx.createWaveShaper();

    // Make distortion curve based on drive
    const nSamples = 256;
    const curve = new Float32Array(nSamples);
    const k = drive * 20;
    for (let i = 0; i < nSamples; i++) {
      const x = (i * 2) / nSamples - 1;
      curve[i] = ((1 + k) * x) / (1 + k * Math.abs(x));
    }
    distortion.curve = curve;
    distortion.oversample = '2x';

    osc.type = 'sine';
    const now = this.ctx.currentTime;

    // 808 Pitch Drop Envelope (starts high and drops to sub)
    osc.frequency.setValueAtTime(freq * 3, now);
    osc.frequency.exponentialRampToValueAtTime(freq, now + 0.08);

    // Amplitude envelope
    oscGain.gain.setValueAtTime(1.0, now);
    oscGain.gain.exponentialRampToValueAtTime(0.001, now + decay);

    osc.connect(distortion);
    distortion.connect(oscGain);
    oscGain.connect(this.filterNodes[0]);

    osc.start(now);
    osc.stop(now + decay);
  }

  /**
   * Futuristic Cinematic Pulse Sound
   */
  public triggerCinematicPulse() {
    this.init();
    if (!this.ctx || this.filterNodes.length === 0) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const now = this.ctx.currentTime;

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(120, now);
    osc.frequency.exponentialRampToValueAtTime(40, now + 0.6);

    gain.gain.setValueAtTime(0.4, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.6);

    osc.connect(gain);
    gain.connect(this.filterNodes[0]);

    osc.start(now);
    osc.stop(now + 0.6);
  }

  /**
   * Continuous Cyber Loop synthesizer for Timeline Playback / Ambient Monitor
   */
  public startAmbientLoop(bpm = 124, onBeat?: (step: number) => void) {
    if (this.isSynthesizing) return;
    this.init();
    this.isSynthesizing = true;
    let step = 0;
    const intervalMs = (60 / bpm / 2) * 1000; // 8th notes

    this.loopTimer = window.setInterval(() => {
      if (!this.isSynthesizing) return;
      if (step % 8 === 0) {
        this.trigger808Bass(50, 0.8, 0.4);
      } else if (step % 4 === 2) {
        this.triggerSnareNoise();
      } else if (step % 2 === 1) {
        this.triggerHiHat();
      }
      onBeat?.(step % 16);
      step++;
    }, intervalMs);
  }

  public stopAmbientLoop() {
    this.isSynthesizing = false;
    if (this.loopTimer) {
      clearInterval(this.loopTimer);
      this.loopTimer = null;
    }
  }

  private triggerHiHat() {
    if (!this.ctx || this.filterNodes.length === 0) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'square';
    osc.frequency.setValueAtTime(8000, now);
    gain.gain.setValueAtTime(0.05, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);
    osc.connect(gain);
    gain.connect(this.filterNodes[0]);
    osc.start(now);
    osc.stop(now + 0.05);
  }

  private triggerSnareNoise() {
    if (!this.ctx || this.filterNodes.length === 0) return;
    const bufferSize = this.ctx.sampleRate * 0.1;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }
    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;
    const gain = this.ctx.createGain();
    const now = this.ctx.currentTime;
    gain.gain.setValueAtTime(0.15, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);
    noise.connect(gain);
    gain.connect(this.filterNodes[0]);
    noise.start(now);
  }

  /**
   * Get FFT byte frequency data for live visualizers
   */
  public getByteFrequencyData(outputArray: Uint8Array): void {
    if (this.analyser) {
      this.analyser.getByteFrequencyData(outputArray as unknown as Uint8Array<ArrayBuffer>);
    } else {
      // Simulated procedural harmonics if audio context is not yet started
      const t = Date.now() / 200;
      for (let i = 0; i < outputArray.length; i++) {
        outputArray[i] = Math.floor(Math.sin(t + i * 0.3) * 60 + Math.cos(t * 1.5 + i * 0.1) * 40 + 70);
      }
    }
  }
}

export const audioEngine = new KnockStudioAudioEngine();

/**
 * Phoneme-to-Viseme Dictionary for Facial Mesh Lip-Sync Mapping
 */
export const PHONEME_VISEME_MAP: Record<string, VisemePhoneme> = {
  A: { phoneme: 'A', viseme: 'AA', jawOpen: 0.85, mouthPucker: 0.1, mouthWide: 0.4, lipPress: 0.0 },
  E: { phoneme: 'E', viseme: 'EE', jawOpen: 0.35, mouthPucker: 0.0, mouthWide: 0.9, lipPress: 0.0 },
  I: { phoneme: 'I', viseme: 'EE', jawOpen: 0.4, mouthPucker: 0.05, mouthWide: 0.8, lipPress: 0.0 },
  O: { phoneme: 'O', viseme: 'OH', jawOpen: 0.65, mouthPucker: 0.8, mouthWide: 0.1, lipPress: 0.0 },
  U: { phoneme: 'U', viseme: 'UH', jawOpen: 0.25, mouthPucker: 0.95, mouthWide: 0.0, lipPress: 0.0 },
  M: { phoneme: 'M', viseme: 'MBP', jawOpen: 0.0, mouthPucker: 0.1, mouthWide: 0.2, lipPress: 0.95 },
  B: { phoneme: 'B', viseme: 'MBP', jawOpen: 0.05, mouthPucker: 0.15, mouthWide: 0.2, lipPress: 0.9 },
  P: { phoneme: 'P', viseme: 'MBP', jawOpen: 0.05, mouthPucker: 0.15, mouthWide: 0.2, lipPress: 0.9 },
  F: { phoneme: 'F', viseme: 'FV', jawOpen: 0.2, mouthPucker: 0.3, mouthWide: 0.4, lipPress: 0.7 },
  V: { phoneme: 'V', viseme: 'FV', jawOpen: 0.2, mouthPucker: 0.3, mouthWide: 0.4, lipPress: 0.7 },
  L: { phoneme: 'L', viseme: 'L', jawOpen: 0.45, mouthPucker: 0.1, mouthWide: 0.5, lipPress: 0.0 },
  T: { phoneme: 'T', viseme: 'TH', jawOpen: 0.25, mouthPucker: 0.1, mouthWide: 0.5, lipPress: 0.1 },
  S: { phoneme: 'S', viseme: 'TH', jawOpen: 0.15, mouthPucker: 0.1, mouthWide: 0.6, lipPress: 0.0 },
  K: { phoneme: 'K', viseme: 'GK', jawOpen: 0.4, mouthPucker: 0.2, mouthWide: 0.3, lipPress: 0.0 },
  REST: { phoneme: 'SIL', viseme: 'REST', jawOpen: 0.05, mouthPucker: 0.05, mouthWide: 0.2, lipPress: 0.05 },
};

export function parseTextToVisemes(text: string): VisemePhoneme[] {
  const letters = text.toUpperCase().replace(/[^A-Z]/g, '');
  if (!letters) return [PHONEME_VISEME_MAP.REST];
  const list: VisemePhoneme[] = [];
  for (let i = 0; i < letters.length; i++) {
    const char = letters[i];
    const match = PHONEME_VISEME_MAP[char] || PHONEME_VISEME_MAP.REST;
    list.push(match);
  }
  return list;
}
