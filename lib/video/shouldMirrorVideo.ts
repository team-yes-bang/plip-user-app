import type { RecorderStatus } from "@/hooks/useVideoRecorder";

export function shouldMirrorVideo(
  facingMode: "user" | "environment",
  status: RecorderStatus,
  pixelsMirrored: boolean,
): boolean {
  if (facingMode !== "user") {
    return false;
  }

  const isLive = status === "requesting" || status === "ready" || status === "recording";
  return isLive || !pixelsMirrored;
}
