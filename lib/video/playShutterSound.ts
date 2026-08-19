const SHUTTER_SOUND_SRC = "/plip/sounds/camera/shutter.mp3";

let shutterAudio: HTMLAudioElement | null = null;

/** 촬영 버튼 — `public/plip/sounds/camera/shutter.mp3` 재생 */
export function playShutterSound(): void {
  if (typeof window === "undefined") {
    return;
  }

  try {
    if (!shutterAudio) {
      shutterAudio = new Audio(SHUTTER_SOUND_SRC);
    }
    shutterAudio.currentTime = 0;
    void shutterAudio.play().catch(() => {
      // 파일 미추가 · autoplay 정책 등 — 촬영은 계속 진행
    });
  } catch {
    // ignore
  }
}
