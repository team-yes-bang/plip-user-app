export function isStubPresignedPutUrl(uploadUrl: string): boolean {
  return uploadUrl.includes("/stub-presigned-put/");
}

export function isBrokenPresignedPutUrl(uploadUrl: string): boolean {
  try {
    const decoded = decodeURIComponent(uploadUrl);
    return decoded.includes("${") || decoded.includes("AWS_S3_RAW_BUCKET");
  } catch {
    return uploadUrl.includes("${") || uploadUrl.includes("AWS_S3_RAW_BUCKET");
  }
}

export type PresignedPutResult = "uploaded" | "skipped-stub";

export async function putPresignedUpload(
  uploadUrl: string,
  blob: Blob,
  contentType: string,
): Promise<PresignedPutResult> {
  if (isStubPresignedPutUrl(uploadUrl)) {
    // NoOp S3: HeadObject stub succeeds without uploading the blob body.
    return "skipped-stub";
  }

  if (isBrokenPresignedPutUrl(uploadUrl)) {
    throw new Error(
      "업로드 URL에 버킷 이름이 비어 있습니다 (${AWS_S3_RAW_BUCKET}). video 백엔드 환경변수를 확인하세요.",
    );
  }

  try {
    const response = await fetch(uploadUrl, {
      method: "PUT",
      body: blob,
      headers: { "Content-Type": contentType },
    });

    if (!response.ok) {
      throw new Error(`Presigned PUT failed (${response.status})`);
    }

    return "uploaded";
  } catch (error) {
    if (error instanceof Error && error.message.startsWith("Presigned PUT failed")) {
      throw error;
    }

    throw new Error(
      "S3 업로드가 브라우저 CORS에 막혔습니다. 버킷 CORS에 localhost origin, PUT, OPTIONS가 있는지 백엔드에 요청하세요.",
    );
  }
}
