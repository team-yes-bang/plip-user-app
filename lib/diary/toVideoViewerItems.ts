import type { VideoViewerItem } from "@/components/providers/VideoViewerProvider";
import type { UiDiaryClip } from "@/types/diary/ui";

/** 다이어리 클립 목록 → 풀스크린 뷰어용 VideoViewerItem (재생 가능 clip만) */
export function toDiaryVideoViewerItems(
  clips: UiDiaryClip[],
  themeName: string,
): VideoViewerItem[] {
  return clips
    .filter((clip) => Boolean(clip.videoUuid?.trim()))
    .map((clip) => ({
      clipId: clip.id,
      videoUuid: clip.videoUuid,
      title: clip.caption || themeName || "다이어리 영상",
      themeName,
      uploadedAt: clip.createdAt ?? clip.date,
      thumbnailUrl: clip.thumbnailSrc,
    }));
}
