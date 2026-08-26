import type { RecorderStatus } from "@/hooks/useVideoRecorder";

/** CSS-mirror the live selfie preview only. Recorded/preview/upload pixels are not flipped. */
export function shouldMirrorVideo(
  facingMode: "user" | "environment",
  status: RecorderStatus,
): boolean {
  if (facingMode !== "user") {
    return false;
  }

  return status === "requesting" || status === "ready" || status === "recording";
}
