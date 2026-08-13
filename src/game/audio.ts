let ctx: AudioContext | null = null;

function ac(): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (!ctx) {
    const Ctor =
      window.AudioContext ??
      (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!Ctor) return null;
    ctx = new Ctor();
  }
  return ctx;
}

export function beep(freq: number, dur = 0.08, type: OscillatorType = "square", vol = 0.06) {
  const a = ac();
  if (!a) return;
  if (a.state === "suspended") void a.resume();
  const osc = a.createOscillator();
  const gain = a.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, a.currentTime);
  gain.gain.setValueAtTime(vol, a.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.0001, a.currentTime + dur);
  osc.connect(gain).connect(a.destination);
  osc.start();
  osc.stop(a.currentTime + dur);
}

export const sfx = {
  pickup: () => {
    beep(880, 0.06);
    setTimeout(() => beep(1320, 0.07), 60);
  },
  hit: () => {
    beep(160, 0.22, "sawtooth", 0.09);
    setTimeout(() => beep(90, 0.28, "sawtooth", 0.09), 90);
  },
  quack: () => {
    beep(420, 0.09, "sawtooth", 0.07);
    setTimeout(() => beep(300, 0.12, "sawtooth", 0.07), 80);
  },
  level: () => {
    [523, 659, 784, 1047].forEach((f, i) => setTimeout(() => beep(f, 0.1), i * 90));
  },
  over: () => {
    [400, 330, 260, 160].forEach((f, i) => setTimeout(() => beep(f, 0.25, "square", 0.08), i * 180));
  },
  start: () => {
    [392, 523, 659].forEach((f, i) => setTimeout(() => beep(f, 0.12), i * 100));
  },
};
