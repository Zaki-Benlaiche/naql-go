"use client";
// Short chime + buzz played whenever a new notification arrives, so a driver
// with the phone in a pocket and a client waiting on a bid both actually
// notice. The tone is synthesized via Web Audio (no asset to ship) and works
// the same on web and inside the Capacitor WebView. Vibration uses native
// Haptics on Android, falling back to navigator.vibrate on web.

const MUTE_KEY = "naqlgo_sound_muted";

type AudioCtor = typeof AudioContext;
type CapacitorWindow = { Capacitor?: { isNativePlatform: () => boolean } };

let _ctx: AudioContext | null = null;
let _unlocked = false;
let _unlockAttached = false;

function getCtx(): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (_ctx) return _ctx;
  const w = window as unknown as { AudioContext?: AudioCtor; webkitAudioContext?: AudioCtor };
  const Ctor = w.AudioContext || w.webkitAudioContext;
  if (!Ctor) return null;
  try {
    _ctx = new Ctor();
  } catch {
    return null;
  }
  return _ctx;
}

// Browsers and the Android WebView block AudioContext playback until the
// first user gesture. We register one-shot listeners so the first tap/key
// resumes the context for the rest of the session.
function attachUnlock() {
  if (typeof window === "undefined" || _unlockAttached) return;
  _unlockAttached = true;
  const unlock = () => {
    const ctx = getCtx();
    if (ctx && ctx.state === "suspended") ctx.resume().catch(() => {});
    _unlocked = true;
    window.removeEventListener("pointerdown", unlock);
    window.removeEventListener("keydown", unlock);
    window.removeEventListener("touchstart", unlock);
  };
  window.addEventListener("pointerdown", unlock);
  window.addEventListener("keydown", unlock);
  window.addEventListener("touchstart", unlock);
}

/** Call once on app boot to prime the autoplay-unlock listeners. */
export function initNotificationSound() {
  attachUnlock();
}

export function isMuted(): boolean {
  if (typeof window === "undefined") return false;
  try {
    return window.localStorage.getItem(MUTE_KEY) === "1";
  } catch {
    return false;
  }
}

export function setMuted(muted: boolean) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(MUTE_KEY, muted ? "1" : "0");
  } catch {}
}

// Two-tone "ding-ding" — friendly but distinct enough to cut through ambient
// noise inside a car. Frequencies use the A5 → E6 interval (perfect fifth).
function playChime(ctx: AudioContext) {
  const now = ctx.currentTime;
  const notes = [
    { freq: 880, start: 0,    dur: 0.20 },
    { freq: 1320, start: 0.17, dur: 0.32 },
  ];
  const master = ctx.createGain();
  master.gain.value = 0.28;
  master.connect(ctx.destination);

  for (const n of notes) {
    const osc = ctx.createOscillator();
    osc.type = "sine";
    osc.frequency.value = n.freq;
    const g = ctx.createGain();
    // Tiny attack + exponential decay = clean tone without clicks.
    g.gain.setValueAtTime(0.0001, now + n.start);
    g.gain.exponentialRampToValueAtTime(1.0, now + n.start + 0.02);
    g.gain.exponentialRampToValueAtTime(0.0001, now + n.start + n.dur);
    osc.connect(g);
    g.connect(master);
    osc.start(now + n.start);
    osc.stop(now + n.start + n.dur + 0.02);
  }
}

async function vibrate() {
  try {
    const w = window as unknown as CapacitorWindow;
    if (w.Capacitor?.isNativePlatform()) {
      const { Haptics, ImpactStyle } = await import("@capacitor/haptics");
      await Haptics.impact({ style: ImpactStyle.Medium });
      // Quick double-tap so a driver in pocket actually feels it.
      setTimeout(() => {
        Haptics.impact({ style: ImpactStyle.Medium }).catch(() => {});
      }, 180);
      return;
    }
  } catch {}
  try {
    if (typeof navigator !== "undefined" && "vibrate" in navigator) {
      (navigator as Navigator & { vibrate: (p: number | number[]) => boolean }).vibrate([100, 60, 100]);
    }
  } catch {}
}

/**
 * Fire-and-forget. Honors the mute flag and silently no-ops if audio is
 * blocked (e.g. no user gesture yet) — the visual toast remains the
 * source of truth for the user; the sound is an attention-grabber.
 */
export function playNotificationSound() {
  if (isMuted()) return;
  const ctx = getCtx();
  if (ctx) {
    if (ctx.state === "suspended") ctx.resume().catch(() => {});
    if (_unlocked || ctx.state === "running") {
      try { playChime(ctx); } catch {}
    }
  }
  void vibrate();
}
