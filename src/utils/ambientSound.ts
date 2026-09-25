/**
 * Procedural Ambient Focus Sound Engine using Web Audio API
 * Generates continuous soothing soundscapes (Gentle Rain, Cozy Cafe, Pink Noise, Forest Breeze)
 * with zero external assets, pristine loops, and smooth fade in/out transitions.
 */

export type FocusSoundType = 'rain' | 'cafe' | 'pink-noise' | 'breeze';

export interface FocusSoundOption {
  id: FocusSoundType;
  label: string;
  emoji: string;
  description: string;
}

export const FOCUS_SOUND_OPTIONS: FocusSoundOption[] = [
  {
    id: 'rain',
    label: 'Gentle Rain',
    emoji: '🌧️',
    description: 'Soft rhythmic raindrops with calming patter',
  },
  {
    id: 'cafe',
    label: 'Cozy Cafe',
    emoji: '☕',
    description: 'Warm ambient room tone with soft acoustic texture',
  },
  {
    id: 'pink-noise',
    label: 'Pink Noise',
    emoji: '🌊',
    description: 'Balanced frequency noise engineered for deep focus',
  },
  {
    id: 'breeze',
    label: 'Forest Breeze',
    emoji: '🍃',
    description: 'Gentle undulating wind through mountain trees',
  },
];

class AmbientSoundEngine {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private activeSource: AudioBufferSourceNode | null = null;
  private lfoOsc: OscillatorNode | null = null;
  private isRunning: boolean = false;
  private currentType: FocusSoundType = 'rain';
  private currentVolume: number = 0.5;
  private bufferCache: Map<FocusSoundType, AudioBuffer> = new Map();

  private getAudioContext(): AudioContext | null {
    if (!this.ctx) {
      const AudioContextClass =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioContextClass) {
        this.ctx = new AudioContextClass();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
    return this.ctx;
  }

  /**
   * Procedurally generates a seamless 6-second stereo loop for the specified sound type
   */
  private generateBuffer(type: FocusSoundType, ctx: AudioContext): AudioBuffer {
    if (this.bufferCache.has(type)) {
      return this.bufferCache.get(type)!;
    }

    const sampleRate = ctx.sampleRate;
    const durationSeconds = 6;
    const frameCount = sampleRate * durationSeconds;
    const buffer = ctx.createBuffer(2, frameCount, sampleRate);

    const left = buffer.getChannelData(0);
    const right = buffer.getChannelData(1);

    // Pink noise state filter variables (Paul Kellet's filter method)
    let b0L = 0, b1L = 0, b2L = 0, b3L = 0, b4L = 0, b5L = 0, b6L = 0;
    let b0R = 0, b1R = 0, b2R = 0, b3R = 0, b4R = 0, b5R = 0, b6R = 0;

    for (let i = 0; i < frameCount; i++) {
      // White noise base
      const whiteL = Math.random() * 2 - 1;
      const whiteR = Math.random() * 2 - 1;

      // Pink noise approximation
      b0L = 0.99886 * b0L + whiteL * 0.0555179;
      b1L = 0.99332 * b1L + whiteL * 0.0750759;
      b2L = 0.96900 * b2L + whiteL * 0.1538520;
      b3L = 0.86650 * b3L + whiteL * 0.3104856;
      b4L = 0.55000 * b4L + whiteL * 0.5329522;
      b5L = -0.7616 * b5L - whiteL * 0.0168980;
      const pinkL = (b0L + b1L + b2L + b3L + b4L + b5L + b6L + whiteL * 0.5362) * 0.11;
      b6L = whiteL * 0.115926;

      b0R = 0.99886 * b0R + whiteR * 0.0555179;
      b1R = 0.99332 * b1R + whiteR * 0.0750759;
      b2R = 0.96900 * b2R + whiteR * 0.1538520;
      b3R = 0.86650 * b3R + whiteR * 0.3104856;
      b4R = 0.55000 * b4R + whiteR * 0.5329522;
      b5R = -0.7616 * b5R - whiteR * 0.0168980;
      const pinkR = (b0R + b1R + b2R + b3R + b4R + b5R + b6R + whiteR * 0.5362) * 0.11;
      b6R = whiteR * 0.115926;

      if (type === 'pink-noise') {
        left[i] = pinkL * 0.9;
        right[i] = pinkR * 0.9;
      } else if (type === 'rain') {
        // Rain: Pink base + randomized raindrop impulses
        const dropL = Math.random() < 0.003 ? (Math.random() * 0.6) : 0;
        const dropR = Math.random() < 0.003 ? (Math.random() * 0.6) : 0;
        left[i] = pinkL * 0.7 + dropL;
        right[i] = pinkR * 0.7 + dropR;
      } else if (type === 'cafe') {
        // Cafe: Warm low-frequency emphasis with subtle room chatter resonance
        const warmHum = Math.sin((i / sampleRate) * 2 * Math.PI * 60) * 0.03;
        const clink = Math.random() < 0.0006 ? (Math.random() * 0.35) : 0;
        left[i] = (pinkL * 0.65 + warmHum + clink) * 0.85;
        right[i] = (pinkR * 0.65 + warmHum + clink) * 0.85;
      } else if (type === 'breeze') {
        // Breeze: subtle pink noise, dynamic sweeping will be handled by BiquadFilter LFO
        left[i] = pinkL * 0.8;
        right[i] = pinkR * 0.8;
      }
    }

    // Apply loop edge smoothing (50ms crossfade at boundaries to avoid clicks)
    const fadeSamples = Math.floor(sampleRate * 0.05);
    for (let i = 0; i < fadeSamples; i++) {
      const alpha = i / fadeSamples;
      left[i] = left[i] * alpha + left[frameCount - fadeSamples + i] * (1 - alpha);
      right[i] = right[i] * alpha + right[frameCount - fadeSamples + i] * (1 - alpha);
    }

    this.bufferCache.set(type, buffer);
    return buffer;
  }

  public play(type: FocusSoundType = this.currentType, volume: number = this.currentVolume): void {
    try {
      const ctx = this.getAudioContext();
      if (!ctx) return;

      this.currentType = type;
      this.currentVolume = Math.max(0, Math.min(1, volume));

      // Stop any existing playback smoothly
      this.stop(false);

      const buffer = this.generateBuffer(type, ctx);
      const source = ctx.createBufferSource();
      source.buffer = buffer;
      source.loop = true;

      // Master gain node with smooth fade-in
      const masterGain = ctx.createGain();
      const targetGain = this.currentVolume * 0.4; // Comfort ceiling
      masterGain.gain.setValueAtTime(0.0001, ctx.currentTime);
      masterGain.gain.exponentialRampToValueAtTime(Math.max(0.001, targetGain), ctx.currentTime + 0.8);

      // Filtering customized per sound profile
      const filter = ctx.createBiquadFilter();

      if (type === 'rain') {
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(1400, ctx.currentTime);
        filter.Q.setValueAtTime(0.8, ctx.currentTime);
      } else if (type === 'cafe') {
        filter.type = 'bandpass';
        filter.frequency.setValueAtTime(650, ctx.currentTime);
        filter.Q.setValueAtTime(0.5, ctx.currentTime);
      } else if (type === 'pink-noise') {
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(2200, ctx.currentTime);
        filter.Q.setValueAtTime(0.5, ctx.currentTime);
      } else if (type === 'breeze') {
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(600, ctx.currentTime);

        // LFO oscillator to modulate breeze intensity slowly (0.12 Hz)
        const lfo = ctx.createOscillator();
        const lfoGain = ctx.createGain();
        lfo.frequency.setValueAtTime(0.12, ctx.currentTime);
        lfoGain.gain.setValueAtTime(350, ctx.currentTime);
        lfo.connect(lfoGain);
        lfoGain.connect(filter.frequency);
        lfo.start();
        this.lfoOsc = lfo;
      }

      source.connect(filter);
      filter.connect(masterGain);
      masterGain.connect(ctx.destination);

      source.start(ctx.currentTime);

      this.activeSource = source;
      this.masterGain = masterGain;
      this.isRunning = true;
    } catch (err) {
      console.warn('Could not start ambient focus sound:', err);
    }
  }

  public stop(smooth: boolean = true): void {
    if (!this.isRunning && !this.activeSource) return;

    try {
      const source = this.activeSource;
      const gain = this.masterGain;
      const lfo = this.lfoOsc;
      const ctx = this.ctx;

      this.activeSource = null;
      this.masterGain = null;
      this.lfoOsc = null;
      this.isRunning = false;

      if (ctx && gain && smooth) {
        gain.gain.setValueAtTime(gain.gain.value, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.4);
        setTimeout(() => {
          try {
            source?.stop();
            source?.disconnect();
            lfo?.stop();
            lfo?.disconnect();
          } catch (e) {}
        }, 450);
      } else {
        source?.stop();
        source?.disconnect();
        lfo?.stop();
        lfo?.disconnect();
      }
    } catch (err) {
      console.warn('Error stopping focus sound:', err);
    }
  }

  public setVolume(volume: number): void {
    this.currentVolume = Math.max(0, Math.min(1, volume));
    if (this.masterGain && this.ctx) {
      const targetGain = this.currentVolume * 0.4;
      this.masterGain.gain.setValueAtTime(this.masterGain.gain.value, this.ctx.currentTime);
      this.masterGain.gain.exponentialRampToValueAtTime(
        Math.max(0.0001, targetGain),
        this.ctx.currentTime + 0.1
      );
    }
  }

  public setType(type: FocusSoundType): void {
    if (type === this.currentType) return;
    this.currentType = type;
    if (this.isRunning) {
      this.play(type, this.currentVolume);
    }
  }

  public getIsPlaying(): boolean {
    return this.isRunning;
  }

  public getCurrentType(): FocusSoundType {
    return this.currentType;
  }

  public getCurrentVolume(): number {
    return this.currentVolume;
  }
}

// Global singleton instance
export const ambientSound = new AmbientSoundEngine();
