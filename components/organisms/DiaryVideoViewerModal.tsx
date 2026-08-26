"use client";

import { getVideoAction } from "@/actions/videoActions";
import { DailyIcon, IconButton } from "@/components/atoms";
import { extractDate } from "@/lib/video/formatOverlayClock";
import { resolveRemotePlaybackUrl } from "@/lib/video/playback";
import { safeVideoPlay } from "@/lib/video/safeVideoPlay";
import { useEffect, useRef, useState } from "react";

type DiaryVideoViewerModalProps = {
  open: boolean;
  clipId: string | null;
  videoUuid?: string;
  date?: string;
  caption?: string;
  thumbnailUrl?: string;
  onClose: () => void;
};

export function DiaryVideoViewerModal({
  open,
  clipId,
  videoUuid,
  date,
  caption,
  thumbnailUrl,
  onClose,
}: DiaryVideoViewerModalProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [playbackUrl, setPlaybackUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    if (!open || !videoUuid?.trim()) {
      Promise.resolve().then(() => {
        if (isMounted) {
          setPlaybackUrl(null);
          setLoading(false);
          setError(null);
        }
      });
      return;
    }

    Promise.resolve().then(() => {
      if (isMounted) {
        setLoading(true);
        setError(null);
        setPlaybackUrl(null);
      }
    });

    getVideoAction(videoUuid)
      .then((res) => {
        if (!isMounted) return;
        if (!res.ok) {
          setError(res.error || "영상 상세 정보를 불러오지 못했습니다.");
          return;
        }

        const url = resolveRemotePlaybackUrl(res.data.rawPlaybackUrl);
        if (url) {
          setPlaybackUrl(url);
        } else {
          setError("재생 가능한 영상 주소가 아직 준비되지 않았습니다.");
        }
      })
      .catch(() => {
        if (isMounted) {
          setError("영상 정보를 불러오는 중 오류가 발생했습니다.");
        }
      })
      .finally(() => {
        if (isMounted) {
          setLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [open, videoUuid]);

  if (!open || !clipId) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 text-white animate-fadeIn">
      {/* 닫기 버튼 */}
      <div className="absolute top-4 right-4 z-20">
        <IconButton variant="surface" label="닫기" onClick={onClose}>
          <DailyIcon name="x" size={24} className="brightness-0 invert" />
        </IconButton>
      </div>

      {/* 헤더 날짜 정보 */}
      {date && (
        <div className="absolute top-5 left-6 z-20 font-semibold text-base text-white/90">
          {extractDate(date)}
        </div>
      )}

      {/* 비디오 재생 영역 */}
      <div className="relative flex h-full w-full max-w-lg flex-col items-center justify-center overflow-hidden">
        {playbackUrl ? (
          <video
            ref={videoRef}
            src={playbackUrl}
            controls
            autoPlay
            playsInline
            className="h-full w-full object-contain"
            poster={thumbnailUrl}
            onCanPlay={() => {
              if (videoRef.current) {
                safeVideoPlay(videoRef.current);
              }
            }}
          />
        ) : thumbnailUrl ? (
          <div className="relative h-full w-full flex items-center justify-center bg-black">
            <img
              src={thumbnailUrl}
              alt="비디오 썸네일"
              className="h-full w-full object-contain opacity-60"
            />
            {loading && (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-black/40">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-white/30 border-t-white" />
                <span className="text-xs text-white/80">영상을 불러오는 중...</span>
              </div>
            )}
            {error && (
              <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center bg-black/70 text-sm font-medium text-red-400">
                <p>{error}</p>
              </div>
            )}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center gap-3 text-center p-6 text-white/60">
            {loading ? (
              <>
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-white/30 border-t-white" />
                <span className="text-xs">영상을 불러오는 중...</span>
              </>
            ) : (
              <span className="text-sm font-medium">{error || "영상을 재생할 수 없습니다."}</span>
            )}
          </div>
        )}

        {/* 캡션 바텀 오버레이 */}
        {caption && (
          <div className="absolute bottom-10 inset-x-6 z-20 rounded-xl bg-black/60 backdrop-blur-md p-4 text-center text-sm font-medium text-white shadow-lg border border-white/10">
            {caption}
          </div>
        )}
      </div>
    </div>
  );
}
