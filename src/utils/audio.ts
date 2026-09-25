// Audio Synthesis Engine for Study Timer & Stopwatch using native Web Audio API
// Zero external sound assets needed, 100% offline, zero latency

let sharedAudioCtx: AudioContext | null = null;

function getAudioContext(): AudioContext | null {
  try {
    if (!sharedAudioCtx) {
      const AudioCtxClass =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtxClass) {
        sharedAudioCtx = new AudioCtxClass();
      }
    }
    if (sharedAudioCtx && sharedAudioCtx.state === 'suspended') {
      sharedAudioCtx.resume().catch(() => {});
    }
    return sharedAudioCtx;
  } catch {
    return null;
  }
}

export type TickSoundStyle = 'clock' | 'wood' | 'subtle';

/**
 * Play realistic timer / stopwatch ticking sounds
 */
export const playTimerTick = (style: TickSoundStyle = 'clock', volume = 0.25) => {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    const t = ctx.currentTime;
    const vol = Math.max(0.01, Math.min(1, volume));

    if (style === 'clock') {
      // Crisp mechanical clock tick: High-frequency filtered noise impulse
      const bufferSize = Math.floor(ctx.sampleRate * 0.025); // 25ms
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.25));
      }

      const noise = ctx.createBufferSource();
      noise.buffer = buffer;

      const filter = ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(2400, t);
      filter.Q.setValueAtTime(2.5, t);

      const gain = ctx.createGain();
      gain.gain.setValueAtTime(vol * 0.35, t);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.025);

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);
      noise.start(t);
      return;
    }

    if (style === 'wood') {
      // Warm organic woodblock tap: fast frequency drop
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(850, t);
      osc.frequency.exponentialRampToValueAtTime(420, t + 0.03);

      gain.gain.setValueAtTime(vol * 0.3, t);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.035);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(t);
      osc.stop(t + 0.04);
      return;
    }

    if (style === 'subtle') {
      // Modern subtle pulse
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(540, t);

      gain.gain.setValueAtTime(vol * 0.18, t);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.02);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(t);
      osc.stop(t + 0.025);
      return;
    }
  } catch (err) {
    console.debug('Unable to play tick sound:', err);
  }
};

/**
 * Play dedicated stopwatch feedback sounds (start, pause, reset, lap split)
 */
export const playStopwatchSound = (
  action: 'start' | 'pause' | 'reset' | 'lap',
  volume = 0.35
) => {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    const t = ctx.currentTime;
    const vol = Math.max(0.01, Math.min(1, volume));

    if (action === 'start') {
      // Double crisp athletic start click
      [0, 0.04].forEach((offset, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(idx === 0 ? 880 : 1320, t + offset);

        gain.gain.setValueAtTime(vol * 0.35, t + offset);
        gain.gain.exponentialRampToValueAtTime(0.001, t + offset + 0.035);

        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(t + offset);
        osc.stop(t + offset + 0.04);
      });
      return;
    }

    if (action === 'pause') {
      // Soft descending dual click
      [0, 0.05].forEach((offset, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(idx === 0 ? 900 : 620, t + offset);

        gain.gain.setValueAtTime(vol * 0.3, t + offset);
        gain.gain.exponentialRampToValueAtTime(0.001, t + offset + 0.04);

        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(t + offset);
        osc.stop(t + offset + 0.045);
      });
      return;
    }

    if (action === 'lap') {
      // Crisp high split bell blip (instant positive feedback on lap recorded)
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(1480, t);
      osc.frequency.exponentialRampToValueAtTime(1760, t + 0.08);

      gain.gain.setValueAtTime(0.001, t);
      gain.gain.exponentialRampToValueAtTime(vol * 0.45, t + 0.01);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.18);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(t);
      osc.stop(t + 0.2);
      return;
    }

    if (action === 'reset') {
      // Mechanical reset ratchet click
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(400, t);
      osc.frequency.exponentialRampToValueAtTime(700, t + 0.06);

      gain.gain.setValueAtTime(vol * 0.25, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.07);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(t);
      osc.stop(t + 0.08);
      return;
    }
  } catch (err) {
    console.debug('Unable to play stopwatch sound:', err);
  }
};

/**
 * Play countdown warning beeps (e.g., 3.. 2.. 1.. GO / TIME UP)
 */
export const playCountdownBeep = (isFinal = false, volume = 0.35) => {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    const t = ctx.currentTime;
    const vol = Math.max(0.01, Math.min(1, volume));

    if (!isFinal) {
      // Standard short warning beep (A5 880Hz)
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, t);

      gain.gain.setValueAtTime(0.001, t);
      gain.gain.exponentialRampToValueAtTime(vol * 0.3, t + 0.01);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.08);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(t);
      osc.stop(t + 0.09);
    } else {
      // Final longer higher beep (1760Hz)
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(1760, t);

      gain.gain.setValueAtTime(0.001, t);
      gain.gain.exponentialRampToValueAtTime(vol * 0.45, t + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.45);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(t);
      osc.stop(t + 0.5);
    }
  } catch (err) {
    console.debug('Countdown beep error:', err);
  }
};

/**
 * Standard chime notifications for timer events
 */
export const playChime = (type: 'complete' | 'break' | 'start' = 'complete') => {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    if (type === 'start') {
      // Soft single rising tone
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(440, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(659.25, ctx.currentTime + 0.15); // E5

      gain.gain.setValueAtTime(0.001, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.12, ctx.currentTime + 0.03);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.4);
      return;
    }

    if (type === 'break') {
      // Relaxing descending two-note chime
      const notes = [659.25, 523.25]; // E5, C5
      notes.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        const startTime = ctx.currentTime + idx * 0.22;

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, startTime);

        gain.gain.setValueAtTime(0.001, startTime);
        gain.gain.exponentialRampToValueAtTime(0.15, startTime + 0.04);
        gain.gain.exponentialRampToValueAtTime(0.0001, startTime + 0.8);

        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(startTime);
        osc.stop(startTime + 0.85);
      });
      return;
    }

    // Default 'complete' - Harmonic triple chime (G5, B5, D6)
    const chords = [783.99, 987.77, 1174.66];
    chords.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const startTime = ctx.currentTime + idx * 0.14;

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, startTime);

      gain.gain.setValueAtTime(0.001, startTime);
      gain.gain.exponentialRampToValueAtTime(0.15, startTime + 0.04);
      gain.gain.exponentialRampToValueAtTime(0.0001, startTime + 1.2);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(startTime);
      osc.stop(startTime + 1.25);
    });
  } catch (err) {
    console.debug('Audio chime unable to play in background:', err);
  }
};
