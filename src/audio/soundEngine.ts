/**
 * Procedural sound engine using Web Audio API.
 * All sounds are generated with oscillators — no audio files needed.
 * Theme: Neo-Crystal / cyberpunk — minor key BGM, crystal shimmer SFX.
 */

let ctx: AudioContext | null = null;
let masterGain: GainNode | null = null;
let bgmGain: GainNode | null = null;
let seGain: GainNode | null = null;
let bgmNodes: { osc: OscillatorNode; gain: GainNode }[] = [];
let bgmPlaying = false;
let muted = false;

function getCtx(): AudioContext {
  if (!ctx) {
    ctx = new AudioContext();
    masterGain = ctx.createGain();
    masterGain.gain.value = 0.3;
    masterGain.connect(ctx.destination);

    bgmGain = ctx.createGain();
    bgmGain.gain.value = 0.15;
    bgmGain.connect(masterGain);

    seGain = ctx.createGain();
    seGain.gain.value = 0.5;
    seGain.connect(masterGain);
  }
  if (ctx.state === 'suspended') {
    ctx.resume();
  }
  return ctx;
}

export function isMuted(): boolean {
  return muted;
}

export function toggleMute(): boolean {
  muted = !muted;
  if (masterGain) {
    masterGain.gain.value = muted ? 0 : 0.3;
  }
  return muted;
}

// === SE (Sound Effects) ===

function playTone(
  freq: number,
  duration: number,
  type: OscillatorType = 'square',
  volume = 0.5,
  freqEnd?: number,
): void {
  const c = getCtx();
  if (!seGain) return;

  const osc = c.createOscillator();
  const gain = c.createGain();

  osc.type = type;
  osc.frequency.setValueAtTime(freq, c.currentTime);
  if (freqEnd !== undefined) {
    osc.frequency.linearRampToValueAtTime(freqEnd, c.currentTime + duration);
  }

  gain.gain.setValueAtTime(volume, c.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, c.currentTime + duration);

  osc.connect(gain);
  gain.connect(seGain);

  osc.start(c.currentTime);
  osc.stop(c.currentTime + duration);
}

function playNoise(duration: number, volume: number): void {
  const c = getCtx();
  if (!seGain) return;

  const bufferSize = c.sampleRate * duration;
  const buffer = c.createBuffer(1, bufferSize, c.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < bufferSize; i++) {
    data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / bufferSize, 2);
  }

  const source = c.createBufferSource();
  source.buffer = buffer;

  const gain = c.createGain();
  gain.gain.setValueAtTime(volume, c.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, c.currentTime + duration);

  // High-pass filter for glass-like sound
  const filter = c.createBiquadFilter();
  filter.type = 'highpass';
  filter.frequency.value = 3000;

  source.connect(filter);
  filter.connect(gain);
  gain.connect(seGain);

  source.start(c.currentTime);
}

export function playPlaceSound(): void {
  // Crystal shimmer — high frequency sweep
  playTone(2000, 0.1, 'sine', 0.25, 3000);
  setTimeout(() => playTone(2500, 0.12, 'sine', 0.2, 3500), 40);
  setTimeout(() => playTone(3000, 0.08, 'sine', 0.15), 80);
}

export function playSellSound(): void {
  playTone(1500, 0.1, 'sine', 0.2, 800);
  setTimeout(() => playTone(600, 0.15, 'sine', 0.2, 300), 60);
}

export function playUpgradeSound(): void {
  playTone(1200, 0.08, 'sine', 0.25);
  setTimeout(() => playTone(1600, 0.08, 'sine', 0.25), 60);
  setTimeout(() => playTone(2400, 0.15, 'sine', 0.3, 3200), 120);
}

export function playShootSound(towerType: string): void {
  switch (towerType) {
    case 'archer':
      playTone(1800, 0.05, 'sine', 0.15, 2200);
      break;
    case 'cannon':
      playTone(120, 0.2, 'sawtooth', 0.35, 50);
      break;
    case 'ice':
      playTone(2500, 0.1, 'sine', 0.12, 1800);
      break;
    case 'thunder':
      playTone(80, 0.04, 'sawtooth', 0.25);
      setTimeout(() => playTone(3500, 0.06, 'square', 0.15, 600), 25);
      break;
  }
}

export function playEnemyDeathSound(): void {
  // Crystal shatter — noise burst + high tone
  playNoise(0.12, 0.15);
  playTone(2000, 0.06, 'sine', 0.12, 800);
}

export function playWaveStartSound(): void {
  playTone(440, 0.1, 'sine', 0.25);
  setTimeout(() => playTone(550, 0.1, 'sine', 0.25), 100);
  setTimeout(() => playTone(660, 0.15, 'sine', 0.3), 200);
}

export function playWinSound(): void {
  const notes = [523, 659, 784, 1047];
  notes.forEach((freq, i) => {
    setTimeout(() => playTone(freq, 0.25, 'sine', 0.3), i * 120);
  });
}

export function playLoseSound(): void {
  playTone(300, 0.3, 'sawtooth', 0.25, 100);
  setTimeout(() => playTone(200, 0.5, 'sawtooth', 0.2, 80), 300);
}

export function playHitBaseSound(): void {
  playTone(200, 0.15, 'sawtooth', 0.25, 100);
}

// === BGM — Minor Key Crystal Theme ===

const BGM_TEMPO = 130; // BPM — slightly calmer
const BEAT_MS = (60 / BGM_TEMPO) * 1000;

// Minor chord progression: Am → G → Fm → Em7
const CHORDS = [
  [220, 262, 330],  // Am
  [196, 247, 294],  // G (low)
  [175, 220, 262],  // Fm
  [196, 247, 330],  // Em7
];

let bgmInterval: number | null = null;
let bgmBeat = 0;

export function startBGM(): void {
  if (bgmPlaying) return;
  getCtx(); // ensure context exists
  bgmPlaying = true;
  bgmBeat = 0;

  bgmInterval = window.setInterval(() => {
    if (!ctx || !bgmGain) return;

    const chordIdx = Math.floor(bgmBeat / 4) % CHORDS.length;
    const chord = CHORDS[chordIdx];
    const noteIdx = bgmBeat % chord.length;
    const freq = chord[noteIdx];

    // Main voice — clean sine wave
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.value = freq;
    gain.gain.setValueAtTime(0.1, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + BEAT_MS / 1000 * 0.8);
    osc.connect(gain);
    gain.connect(bgmGain);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + BEAT_MS / 1000);

    // Sub-octave shimmer on every other beat
    if (bgmBeat % 2 === 0) {
      const shimOsc = ctx.createOscillator();
      const shimGain = ctx.createGain();
      shimOsc.type = 'sine';
      shimOsc.frequency.value = freq * 2; // One octave up
      shimGain.gain.setValueAtTime(0.04, ctx.currentTime);
      shimGain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + BEAT_MS / 1000 * 0.5);
      shimOsc.connect(shimGain);
      shimGain.connect(bgmGain);
      shimOsc.start(ctx.currentTime);
      shimOsc.stop(ctx.currentTime + BEAT_MS / 1000 * 0.6);
    }

    // Deep bass on beat 0 of each chord
    if (bgmBeat % 4 === 0) {
      const bassOsc = ctx.createOscillator();
      const bassGain = ctx.createGain();
      bassOsc.type = 'sine';
      bassOsc.frequency.value = freq / 2;
      bassGain.gain.setValueAtTime(0.18, ctx.currentTime);
      bassGain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + BEAT_MS / 1000 * 2.5);
      bassOsc.connect(bassGain);
      bassGain.connect(bgmGain);
      bassOsc.start(ctx.currentTime);
      bassOsc.stop(ctx.currentTime + BEAT_MS / 1000 * 2.5);
    }

    bgmBeat++;
  }, BEAT_MS / 2);
}

export function stopBGM(): void {
  if (bgmInterval !== null) {
    clearInterval(bgmInterval);
    bgmInterval = null;
  }
  for (const node of bgmNodes) {
    try { node.osc.stop(); } catch { /* already stopped */ }
  }
  bgmNodes = [];
  bgmPlaying = false;
}
