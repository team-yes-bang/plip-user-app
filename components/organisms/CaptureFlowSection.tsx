"use client";

import { listMyAgitsAction } from "@/actions/agitActions";
import { listDiaryThemesAction } from "@/actions/diaryActions";
import { listAgitTopicsAction } from "@/actions/topicActions";
import { publishVideoDestinationAction } from "@/actions/videoActions";
import { CaptureClipOverlays } from "@/components/molecules/CaptureClipOverlays";
import type { DestinationId } from "@/components/molecules/DestinationToggle";
import { CaptureCameraStage } from "@/components/organisms/CaptureCameraStage";
import { CapturePreviewStage } from "@/components/organisms/CapturePreviewStage";
import { CaptureUploadSettingsStage } from "@/components/organisms/CaptureUploadSettingsStage";
import { ROUTES } from "@/config/routes";
import { usePreviewFrameMetrics } from "@/hooks/usePreviewFrameMetrics";
import { useVideoCaptureFlow } from "@/hooks/useVideoCaptureFlow";
import { extractActionError } from "@/lib/video/actionPayload";
import { OVERLAY_DURATION_PX } from "@/lib/video/constants";
import { formatRecordCountdown } from "@/lib/video/formatRecordTimer";
import { playShutterSound } from "@/lib/video/playShutterSound";
import { shouldMirrorVideo } from "@/lib/video/shouldMirrorVideo";
import type { UiAgit } from "@/types/agit/ui";
import type { UiDiaryTheme } from "@/types/diary/ui";
import type { UiTopicListItem } from "@/types/topic/ui";
import type { VideoDestination } from "@/types/video/destination";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";

type CaptureFlowSectionProps = {
  initialAgitUuid?: string;
  initialTopicUuid?: string;
  initialThemeId?: string;
};

type PreviewStep = "confirm" | "settings";

function pickId<T extends { id: string }>(items: T[], preferred: string): string {
  if (preferred && items.some((item) => item.id === preferred)) {
    return preferred;
  }
  return items[0]?.id ?? "";
}

export function CaptureFlowSection({
  initialAgitUuid = "",
  initialTopicUuid = "",
  initialThemeId = "",
}: CaptureFlowSectionProps) {
  const router = useRouter();
  const {
    videoRef,
    status,
    flowPhase,
    flowError,
    elapsedMs,
    maxDurationMs,
    facingMode,
    pixelsMirrored,
    capturedAt,
    uploading,
    startRecording,
    flipCamera,
    retake,
    uploadCapture,
  } = useVideoCaptureFlow();
  const [previewStep, setPreviewStep] = useState<PreviewStep>("confirm");
  const [caption, setCaption] = useState("");
  const [destinationKind, setDestinationKind] = useState<DestinationId>(
    initialThemeId && !initialAgitUuid ? "diary" : "agit",
  );
  const [agits, setAgits] = useState<UiAgit[]>([]);
  const [topics, setTopics] = useState<UiTopicListItem[]>([]);
  const [themes, setThemes] = useState<UiDiaryTheme[]>([]);
  const [selectedAgitUuid, setSelectedAgitUuid] = useState(initialAgitUuid);
  const [selectedTopicUuid, setSelectedTopicUuid] = useState(initialTopicUuid);
  const [selectedThemeId, setSelectedThemeId] = useState(initialThemeId);
  const [destinationError, setDestinationError] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [originalView, setOriginalView] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);
  const slotRef = useRef<HTMLDivElement>(null);

  const isPreview = status === "preview" || flowPhase === "uploading" || flowPhase === "complete";
  const showSettings = isPreview && previewStep === "settings";
  const showConfirm = isPreview && previewStep === "confirm";
  const containPreview = showConfirm && !originalView;
  const mirrorVideo = shouldMirrorVideo(facingMode, status, pixelsMirrored);
  const frameMetrics = usePreviewFrameMetrics(containPreview, sectionRef, slotRef);
  const overlayScale = containPreview && frameMetrics.scale > 0 ? frameMetrics.scale : 1;

  const loadTopics = useCallback(async (agitUuid: string, preferredTopicId = "") => {
    if (!agitUuid) {
      setTopics([]);
      setSelectedTopicUuid("");
      return;
    }

    const result = await listAgitTopicsAction(agitUuid);
    if (!result.ok) {
      setTopics([]);
      setDestinationError(result.error);
      return;
    }

    setTopics(result.data);
    setSelectedTopicUuid(pickId(result.data, preferredTopicId));
  }, []);

  useEffect(() => {
    let cancelled = false;

    void (async () => {
      const [agitResult, themeResult] = await Promise.all([listMyAgitsAction(), listDiaryThemesAction()]);
      if (cancelled) {
        return;
      }

      if (agitResult.ok) {
        setAgits(agitResult.data);
        const nextAgitUuid = pickId(agitResult.data, initialAgitUuid);
        setSelectedAgitUuid(nextAgitUuid);
        if (nextAgitUuid) {
          await loadTopics(nextAgitUuid, initialTopicUuid);
        }
      } else {
        setDestinationError(agitResult.error);
      }

      if (cancelled) {
        return;
      }

      if (themeResult.ok) {
        setThemes(themeResult.data);
        setSelectedThemeId(pickId(themeResult.data, initialThemeId));
      } else if (!agitResult.ok) {
        setDestinationError(themeResult.error);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [initialAgitUuid, initialThemeId, initialTopicUuid, loadTopics]);

  const handleStartRecording = useCallback(() => {
    playShutterSound();
    void startRecording();
  }, [startRecording]);

  const handleRetake = useCallback(() => {
    setCaption("");
    setSaveError(null);
    setOriginalView(false);
    setPreviewStep("confirm");
    void retake();
  }, [retake]);

  const resolveDestination = useCallback((): VideoDestination | null => {
    if (destinationKind === "diary") {
      const theme = themes.find((item) => item.id === selectedThemeId);
      if (!theme?.themeUuid) {
        return null;
      }
      return { kind: "diary", themeId: theme.id, themeUuid: theme.themeUuid };
    }

    if (!selectedAgitUuid || !selectedTopicUuid) {
      return null;
    }

    return {
      kind: "topic",
      agitUuid: selectedAgitUuid,
      topicUuid: selectedTopicUuid,
    };
  }, [destinationKind, selectedAgitUuid, selectedThemeId, selectedTopicUuid, themes]);

  const handleSave = useCallback(async () => {
    const destination = resolveDestination();
    if (!destination) {
      setSaveError("저장 대상을 선택해 주세요.");
      return;
    }

    setSaveError(null);
    const uploaded = await uploadCapture(caption.trim() || undefined);
    if (!uploaded) {
      setSaveError("업로드에 실패했습니다.");
      return;
    }

    const published = await publishVideoDestinationAction(
      uploaded.videoUuid,
      destination,
      caption.trim() || undefined,
    );
    const publishError = extractActionError(published);
    if (publishError) {
      setSaveError(publishError);
      return;
    }

    if (destination.kind === "topic") {
      router.push(ROUTES.agit.topicDetail(destination.agitUuid, destination.topicUuid));
      return;
    }

    router.push(ROUTES.diary.themes.detail(destination.themeId));
  }, [caption, resolveDestination, router, uploadCapture]);

  const videoSlot = (
    <div
      ref={slotRef}
      className={
        showSettings
          ? "hidden"
          : containPreview
            ? "relative order-2 flex min-h-0 flex-1 items-center justify-center"
            : "absolute inset-0"
      }
    >
      <div
        className={
          containPreview
            ? "relative overflow-hidden rounded-[12px] bg-black"
            : "absolute inset-0 overflow-hidden bg-black"
        }
        style={
          containPreview
            ? frameMetrics.width > 0
              ? { width: frameMetrics.width, height: frameMetrics.height }
              : { height: "100%", maxWidth: "100%", aspectRatio: "9 / 19.5" }
            : undefined
        }
      >
        <video
          ref={videoRef}
          className={`h-full w-full object-cover ${mirrorVideo ? "-scale-x-100" : ""}`}
          autoPlay
          playsInline
          loop={status === "preview"}
          muted={status !== "preview"}
          controls={false}
          disablePictureInPicture
          disableRemotePlayback
          controlsList="nodownload nofullscreen noremoteplayback nopictureinpicture"
          onContextMenu={(event) => event.preventDefault()}
          onEnded={(event) => {
            if (status !== "preview") {
              return;
            }
            event.currentTarget.currentTime = 0;
            void event.currentTarget.play();
          }}
        />
        {showConfirm ? (
          <>
            <CaptureClipOverlays capturedAt={capturedAt} caption={caption} scale={overlayScale} />
            <span
              className="absolute z-[1] font-semibold text-white"
              style={{
                right: 16 * overlayScale,
                bottom: 16 * overlayScale,
                fontSize: OVERLAY_DURATION_PX * overlayScale,
              }}
            >
              {formatRecordCountdown(0, maxDurationMs)}
            </span>
          </>
        ) : null}
      </div>
    </div>
  );

  return (
    <section
      ref={sectionRef}
      className={
        showSettings
          ? "h-full min-h-0 bg-[var(--dl-color-bg-elevated)]"
          : containPreview
            ? "flex h-full min-h-0 flex-col overflow-hidden bg-[var(--dl-color-bg-elevated)] text-[var(--dl-color-text-primary)]"
            : "relative h-full min-h-0 overflow-hidden bg-black"
      }
      aria-label={showSettings ? "업로드 설정" : showConfirm ? "영상 확인" : "영상 촬영"}
    >
      {videoSlot}

      {showConfirm ? (
        <CapturePreviewStage
          caption={caption}
          uploading={uploading}
          originalView={originalView}
          onCaptionChange={setCaption}
          onBack={handleRetake}
          onViewOriginal={() => setOriginalView(true)}
          onCloseOriginal={() => setOriginalView(false)}
          onContinue={() => {
            setOriginalView(false);
            setPreviewStep("settings");
          }}
        />
      ) : null}

      {showSettings ? (
        <CaptureUploadSettingsStage
          destinationKind={destinationKind}
          agits={agits}
          topics={topics}
          themes={themes}
          selectedAgitUuid={selectedAgitUuid}
          selectedTopicUuid={selectedTopicUuid}
          selectedThemeId={selectedThemeId}
          destinationError={destinationError}
          uploading={uploading}
          saveError={saveError ?? flowError}
          onDestinationKindChange={setDestinationKind}
          onAgitChange={(agitUuid) => {
            setSelectedAgitUuid(agitUuid);
            setSelectedTopicUuid("");
            void loadTopics(agitUuid);
          }}
          onTopicChange={setSelectedTopicUuid}
          onThemeChange={setSelectedThemeId}
          onBack={() => setPreviewStep("confirm")}
          onSave={() => void handleSave()}
        />
      ) : null}

      {!isPreview ? (
        <CaptureCameraStage
          status={status}
          error={flowError}
          elapsedMs={elapsedMs}
          maxDurationMs={maxDurationMs}
          onBack={() => router.back()}
          onStartRecording={handleStartRecording}
          onFlipCamera={flipCamera}
        />
      ) : null}
    </section>
  );
}
