import { issueAgitThumbnailUploadUrlAction } from "@/actions/agitActions";
import { agitThumbnailContentType } from "@/lib/agit/thumbnailImage";
import { putPresignedUpload } from "@/lib/video/putPresigned";

export async function uploadAgitThumbnailFile(
  file: File,
  options?: { agitUuid?: string },
): Promise<string> {
  const contentType = agitThumbnailContentType();
  const issued = await issueAgitThumbnailUploadUrlAction(
    file.size,
    contentType,
    options?.agitUuid,
  );
  if (!issued.ok) {
    throw new Error(issued.error);
  }

  await putPresignedUpload(issued.data.uploadUrl, file, contentType);
  return issued.data.thumbnailPath;
}
