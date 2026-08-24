import { MAX_UPLOAD_BYTES, MAX_UPLOAD_MB } from "@/lib/video/constants";

export function formatByteSize(bytes: number): string {
  if (bytes < 1024) {
    return `${bytes} B`;
  }

  const kb = bytes / 1024;
  if (kb < 1024) {
    return `${Math.round(kb)} KB`;
  }

  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function isWithinUploadLimit(bytes: number): boolean {
  return bytes > 0 && bytes <= MAX_UPLOAD_BYTES;
}

export function createOversizeUploadBlob(): Blob {
  return new Blob([new Uint8Array(MAX_UPLOAD_BYTES + 1)], { type: "video/mp4" });
}

export function assertUploadSize(blob: Blob): void {
  if (blob.size === 0) {
    throw new Error("녹화 데이터가 비어 있습니다.");
  }

  if (blob.size > MAX_UPLOAD_BYTES) {
    throw new Error(
      `영상 용량이 ${MAX_UPLOAD_MB}MB를 초과합니다 (${formatByteSize(blob.size)}).`,
    );
  }
}
