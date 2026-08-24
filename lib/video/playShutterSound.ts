import { SHUTTER_SOUND_SRC } from "@/lib/video/constants";

/**
 * Web pages cannot use Android STREAM_SYSTEM_ENFORCED or the iOS camera shutter
 * session. HTMLAudio and Web Audio both follow media volume / the silent switch.
 * We still: preload, play inside the tap gesture, and vibrate so capture is never quiet.
 */

type WebAudioContext = AudioContext;

let audioContext: WebAudioContext | null = null;
let shutterBuffer: AudioBuffer | null = null;
let loadPromise: Promise<AudioBuffer | null> | null = null;

function AudioContextCtor(): (new (options?: AudioContextOptions) => AudioContext) | undefined {
  if (typeof window === "undefined") {
    return undefined;
  }
  return (
    window.AudioContext ??
    (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
  );
}

function getAudioContext(): WebAudioContext | null {
  const Ctor = AudioContextCtor();
  if (!Ctor) {
    return null;
  }
  if (!audioContext) {
    audioContext = new Ctor({ latencyHint: "interactive" });
  }
  return audioContext;
}

function loadShutterBuffer(context: WebAudioContext): Promise<AudioBuffer | null> {
  if (shutterBuffer) {
    return Promise.resolve(shutterBuffer);
  }
  if (!loadPromise) {
    loadPromise = fetch(SHUTTER_SOUND_SRC)
      .then((response) => {
        if (!response.ok) {
          throw new Error("shutter sample missing");
        }
        return response.arrayBuffer();
      })
      .then((data) => context.decodeAudioData(data.slice(0)))
      .then((buffer) => {
        shutterBuffer = buffer;
        return buffer;
      })
      .catch(() => null);
  }
  return loadPromise;
}

function playBuffer(context: WebAudioContext, buffer: AudioBuffer): void {
  const source = context.createBufferSource();
  const gain = context.createGain();
  source.buffer = buffer;
  gain.gain.value = 1;
  source.connect(gain);
  gain.connect(context.destination);
  source.start(0);
}

function playFallbackClick(context: WebAudioContext): void {
  const oscillator = context.createOscillator();
  const gain = context.createGain();
  oscillator.type = "square";
  oscillator.frequency.value = 1800;
  gain.gain.setValueAtTime(0.35, context.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, context.currentTime + 0.12);
  oscillator.connect(gain);
  gain.connect(context.destination);
  oscillator.start();
  oscillator.stop(context.currentTime + 0.12);
}

function vibrateShutter(): void {
  try {
    navigator.vibrate?.([90, 40, 90]);
  } catch {
    /* iOS has no vibrate; ignore */
  }
}

/** Warm the audio graph on an earlier tap so the shutter click is not delayed. */
export function unlockShutterAudio(): void {
  const context = getAudioContext();
  if (!context) {
    return;
  }
  if (context.state === "suspended") {
    void context.resume();
  }
  void loadShutterBuffer(context);
}

/**
 * Must run in the shutter tap handler (user gesture).
 * Media volume 0 / iOS silent switch still mute web audio — that is an OS limit.
 */
export function playShutterSound(): void {
  vibrateShutter();

  const context = getAudioContext();
  if (!context) {
    return;
  }

  if (context.state === "suspended") {
    void context.resume();
  }

  if (shutterBuffer) {
    playBuffer(context, shutterBuffer);
    return;
  }

  void loadShutterBuffer(context);
  playFallbackClick(context);
}
