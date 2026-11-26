/** Tiny synthesized sound effects. No audio files to load. */

type Sfx = "correct" | "otherCorrect" | "close" | "tick" | "turn" | "reveal" | "win" | "join" | "pop" | "scribble" | "squeak" | "boing" | "giggle" | "grumble" | "whoosh";

const MUTE_KEY = "sketchy:muted";
let ctx: AudioContext | null = null;
let muted = (() => {
  try {
    return localStorage.getItem(MUTE_KEY) === "1";
  } catch {
    return false;
  }
})();
const listeners = new Set<() => void>();

export function isMuted() {
  return muted;
}

export function setMuted(value: boolean) {
  muted = value;
  try {
    localStorage.setItem(MUTE_KEY, value ? "1" : "0");
  } catch {
    /* ignore */
  }
  listeners.forEach((l) => l());
}

export function onMuteChange(fn: () => void) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

function audio(): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (!ctx) {
    const Ctor = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!Ctor) return null;
    ctx = new Ctor();
  }
  if (ctx.state === "suspended") void ctx.resume();
  return ctx;
}

function tone(freq: number, start: number, duration: number, type: OscillatorType = "triangle", gain = 0.12) {
  const a = audio();
  if (!a) return;
  const osc = a.createOscillator();
  const g = a.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, a.currentTime + start);
  g.gain.setValueAtTime(0, a.currentTime + start);
  g.gain.linearRampToValueAtTime(gain, a.currentTime + start + 0.01);
  g.gain.exponentialRampToValueAtTime(0.0001, a.currentTime + start + duration);
  osc.connect(g).connect(a.destination);
  osc.start(a.currentTime + start);
  osc.stop(a.currentTime + start + duration + 0.02);
}

function glide(from: number, to: number, duration: number, type: OscillatorType = "sine", gain = 0.1) {
  const a = audio();
  if (!a) return;
  const osc = a.createOscillator();
  const g = a.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(from, a.currentTime);
  osc.frequency.exponentialRampToValueAtTime(to, a.currentTime + duration);
  g.gain.setValueAtTime(gain, a.currentTime);
  g.gain.exponentialRampToValueAtTime(0.0001, a.currentTime + duration);
  osc.connect(g).connect(a.destination);
  osc.start();
  osc.stop(a.currentTime + duration + 0.02);
}

let noiseBuf: AudioBuffer | null = null;

/** A short scratch of a felt-tip on paper: band-passed noise. */
function scratch(duration: number, gain: number, freq = 2600 + Math.random() * 1400) {
  const a = audio();
  if (!a) return;
  if (!noiseBuf) {
    noiseBuf = a.createBuffer(1, Math.ceil(a.sampleRate * 0.2), a.sampleRate);
    const d = noiseBuf.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
  }
  const src = a.createBufferSource();
  src.buffer = noiseBuf;
  const band = a.createBiquadFilter();
  band.type = "bandpass";
  band.frequency.setValueAtTime(freq, a.currentTime);
  band.Q.value = 1.4;
  const g = a.createGain();
  g.gain.setValueAtTime(0, a.currentTime);
  g.gain.linearRampToValueAtTime(gain, a.currentTime + 0.012);
  g.gain.exponentialRampToValueAtTime(0.0001, a.currentTime + duration);
  src.connect(band).connect(g).connect(a.destination);
  src.start();
  src.stop(a.currentTime + duration + 0.02);
}

export function play(sfx: Sfx) {
  if (muted) return;
  switch (sfx) {
    case "correct":
      tone(659, 0, 0.12);
      tone(880, 0.08, 0.14);
      tone(1319, 0.16, 0.28);
      break;
    case "otherCorrect":
      tone(784, 0, 0.1, "sine", 0.07);
      tone(1047, 0.07, 0.16, "sine", 0.07);
      break;
    case "close":
      glide(440, 520, 0.18, "sine", 0.08);
      break;
    case "tick":
      tone(1200, 0, 0.04, "square", 0.025);
      break;
    case "turn":
      glide(300, 620, 0.16, "triangle", 0.09);
      break;
    case "reveal":
      tone(523, 0, 0.12);
      tone(392, 0.1, 0.22);
      break;
    case "win":
      [523, 659, 784, 1047, 1319].forEach((f, i) => tone(f, i * 0.09, 0.3, "triangle", 0.1));
      break;
    case "join":
      tone(880, 0, 0.06, "sine", 0.05);
      break;
    case "pop":
      glide(900, 400, 0.08, "sine", 0.06);
      break;
    case "scribble":
      scratch(0.09, 0.12);
      break;
    case "squeak":
      glide(900, 1500, 0.09, "sine", 0.07);
      break;
    case "boing":
      glide(160, 520, 0.18, "triangle", 0.1);
      glide(520, 260, 0.22, "sine", 0.05);
      break;
    case "giggle":
      [988, 1175, 988, 1319].forEach((f, i) => tone(f, i * 0.075, 0.07, "sine", 0.05));
      break;
    case "grumble":
      glide(170, 105, 0.38, "sawtooth", 0.035);
      break;
    case "whoosh":
      scratch(0.26, 0.09, 800);
      break;
  }
}

/** Browsers only allow audio after a user gesture; call this from one. */
export function unlockAudio() {
  audio();
}
