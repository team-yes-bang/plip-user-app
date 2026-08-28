import { getDownloadUrlAction } from "@/actions/videoActions";
import { DOWNLOAD_URL_MAX_ATTEMPTS } from "@/lib/video/constants";
import type { VideoDownloadUrlActionData } from "@/types/video/action";

export type DownloadUrlPollResult = {
  data: VideoDownloadUrlActionData;
  attempts: number;
};

function wait(ms: number): Promise<void> {
  return new Promise((resolve) => {
    window.setTimeout(resolve, ms);
  });
}

export async function pollDownloadUrl(
  videoUuid: string,
  maxAttempts = DOWNLOAD_URL_MAX_ATTEMPTS,
): Promise<DownloadUrlPollResult> {
  let lastResult: VideoDownloadUrlActionData | null = null;

  for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
    const response = await getDownloadUrlAction(videoUuid);

    if (!response.ok) {
      throw new Error(response.error || "download-url failed");
    }

    lastResult = response.data;

    if (response.data.status === "ready") {
      return { data: response.data, attempts: attempt };
    }

    if (attempt < maxAttempts) {
      const delayMs = Math.max(response.data.retryAfterSeconds, 1) * 1000;
      await wait(delayMs);
    }
  }

  if (!lastResult) {
    throw new Error("download-url poll exhausted with no response");
  }

  return { data: lastResult, attempts: maxAttempts };
}
