/**
 * Áudio SINTETIZADO (WebAudio): bipe do monitor, alarmes distintos e sons de ausculta ILUSTRATIVOS.
 * Não são gravações clínicas validadas e não devem fundamentar avaliação diagnóstica.
 */
let ctx: AudioContext | null = null;

function ac(): AudioContext | null {
  try {
    ctx ??= new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
    if (ctx.state === "suspended") void ctx.resume();
    return ctx;
  } catch {
    return null;
  }
}

function tone(freq: number, dur: number, vol: number, type: OscillatorType = "sine", when = 0): void {
  const a = ac();
  if (!a || vol <= 0) return;
  const t0 = a.currentTime + when;
  const o = a.createOscillator();
  const gn = a.createGain();
  o.type = type;
  o.frequency.setValueAtTime(freq, t0);
  gn.gain.setValueAtTime(0, t0);
  gn.gain.linearRampToValueAtTime(vol, t0 + 0.01);
  gn.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
  o.connect(gn).connect(a.destination);
  o.start(t0);
  o.stop(t0 + dur + 0.02);
}

/** bipe sincronizado ao QRS; tom mais grave com SpO₂ menor (convenção de monitores) */
export function qrsBeep(spo2: number | null, vol: number): void {
  const f = spo2 == null ? 880 : 440 + Math.max(0, Math.min(60, spo2 - 40)) * 8;
  tone(f, 0.07, vol * 0.25, "sine");
}

export type AlarmLevel = "alta" | "media";
export function alarm(level: AlarmLevel, vol: number): void {
  if (level === "alta") {
    for (let i = 0; i < 3; i++) tone(988, 0.12, vol * 0.35, "square", i * 0.16);
  } else {
    tone(660, 0.2, vol * 0.3, "triangle");
    tone(523, 0.2, vol * 0.3, "triangle", 0.25);
  }
}

function noiseBuffer(a: AudioContext, seconds: number): AudioBuffer {
  const b = a.createBuffer(1, Math.floor(a.sampleRate * seconds), a.sampleRate);
  const d = b.getChannelData(0);
  let seed = 12345;
  for (let i = 0; i < d.length; i++) {
    seed = (seed * 1103515245 + 12345) & 0x7fffffff;
    d[i] = (seed / 0x7fffffff) * 2 - 1;
  }
  return b;
}

/** Ausculta ilustrativa (≈4 s). */
export function playAuscultation(kind: string, vol: number, rate = 75, rr = 16): void {
  const a = ac();
  if (!a || vol <= 0) return;
  const now = a.currentTime;
  const dur = 4;
  const breath = (filterFreq: number, gainV: number) => {
    const src = a.createBufferSource();
    src.buffer = noiseBuffer(a, dur);
    const f = a.createBiquadFilter();
    f.type = "bandpass";
    f.frequency.value = filterFreq;
    f.Q.value = 0.8;
    const gn = a.createGain();
    gn.gain.setValueAtTime(0, now);
    const cycle = 60 / Math.max(6, rr);
    for (let t = 0; t < dur; t += cycle) {
      gn.gain.linearRampToValueAtTime(gainV * vol, now + t + cycle * 0.35);
      gn.gain.linearRampToValueAtTime(gainV * vol * 0.2, now + t + cycle * 0.4);
      gn.gain.linearRampToValueAtTime(0.0001, now + t + cycle * 0.95);
    }
    src.connect(f).connect(gn).connect(a.destination);
    src.start(now);
    src.stop(now + dur);
  };
  switch (kind) {
    case "murmurio_normal":
      breath(400, 0.25);
      break;
    case "murmurio_abolido":
      breath(300, 0.03);
      break;
    case "sibilos": {
      breath(400, 0.12);
      const cycle = 60 / Math.max(6, rr);
      for (let t = cycle * 0.4; t < dur; t += cycle) {
        const o = a.createOscillator();
        const gn = a.createGain();
        o.frequency.setValueAtTime(620, now + t);
        o.frequency.linearRampToValueAtTime(520, now + t + cycle * 0.5);
        gn.gain.setValueAtTime(0, now + t);
        gn.gain.linearRampToValueAtTime(0.12 * vol, now + t + 0.05);
        gn.gain.linearRampToValueAtTime(0.0001, now + t + cycle * 0.55);
        o.connect(gn).connect(a.destination);
        o.start(now + t);
        o.stop(now + t + cycle * 0.6);
      }
      break;
    }
    case "estertores":
      breath(400, 0.15);
      for (let i = 0; i < 40; i++) tone(180 + (i % 7) * 40, 0.015, 0.18 * vol, "square", (i * 0.097) % dur);
      break;
    case "estridor": {
      const cycle = 60 / Math.max(6, rr);
      for (let t = 0; t < dur; t += cycle) tone(780, cycle * 0.35, 0.18 * vol, "sawtooth", t);
      break;
    }
    case "b3":
    case "bulhas_normais":
    case "bulhas_abafadas":
    case "sopro":
    default: {
      const beat = 60 / Math.max(30, rate);
      const v = kind === "bulhas_abafadas" ? 0.12 : 0.4;
      for (let t = 0; t < dur; t += beat) {
        tone(55, 0.09, v * vol, "sine", t);
        tone(70, 0.07, v * 0.8 * vol, "sine", t + 0.3 * beat);
        if (kind === "b3") tone(40, 0.06, v * 0.5 * vol, "sine", t + 0.45 * beat);
        if (kind === "sopro") {
          const src = a.createBufferSource();
          src.buffer = noiseBuffer(a, 0.25);
          const f = a.createBiquadFilter();
          f.type = "bandpass";
          f.frequency.value = 250;
          const gn = a.createGain();
          gn.gain.value = 0.08 * vol;
          src.connect(f).connect(gn).connect(a.destination);
          src.start(now + t + 0.05);
        }
      }
      break;
    }
  }
}
