"use client";

import {
  createCaptureThemeAction,
  createCaptureTopicAction,
  listCaptureAgitsAction,
  listCaptureThemesAction,
  listCaptureTopicsAction,
} from "@/actions/captureDestinationActions";
import { publishVideoDestinationAction } from "@/actions/videoActions";
import { CaptureClipOverlays } from "@/components/molecules/CaptureClipOverlays";
import type { DestinationId } from "@/components/molecules/DestinationToggle";
import { CaptureCameraStage } from "@/components/organisms/CaptureCameraStage";
import { CapturePreviewStage } from "@/components/organisms/CapturePreviewStage";
import { CaptureUploadSettingsStage } from "@/components/organisms/CaptureUploadSettingsStage";
import { toast } from "@/components/ui/toast";
import { ROUTES } from "@/config/routes";
import { usePreviewFrameMetrics } from "@/hooks/usePreviewFrameMetrics";
import { useVideoCaptureFlow } from "@/hooks/useVideoCaptureFlow";
import { extractActionError } from "@/lib/video/actionPayload";
import { VIDEO_DESTINATION_NOT_WIRED } from "@/lib/video/actionErrors";
import { playShutterSound } from "@/lib/video/playShutterSound";
import { captureVideoFrame, prepareThumbnailImage } from "@/lib/video/prepareThumbnail";
import { shouldMirrorVideo } from "@/lib/video/shouldMirrorVideo";
import { toKstDateString } from "@/lib/topic/selectAgitTopic";
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
  initialDestinationKind?: DestinationId;
};

type PreviewStep = "confirm" | "settings";
type ThumbnailSource = "file" | "frame";

function pickId<T extends { id: string }>(items: T[], preferred: string): string {
  if (preferred && items.some((item) => item.id === preferred)) {
    return preferred;
  }
  return items[0]?.id ?? "";
}

function isTopicSelectable(topic: UiTopicListItem): boolean {
  return topic.uploadedByMe !== true;
}

function pickTopicId(topics: UiTopicListItem[], preferred: string): string {
  const selectable = topics.filter(isTopicSelectable);
  if (preferred && selectable.some((topic) => topic.id === preferred)) {
    return preferred;
  }
  return selectable[0]?.id ?? "";
}

function resolveInitialDestinationKind(
  initialDestinationKind: DestinationId | undefined,
  initialAgitUuid: string,
  initialThemeId: string,
): DestinationId {
  if (initialAgitUuid) {
    return "agit";
  }
  if (initialDestinationKind === "diary" || initialThemeId) {
    return "diary";
  }
  return "agit";
}

export function CaptureFlowSection({
  initialAgitUuid = "",
  initialTopicUuid = "",
  initialThemeId = "",
  initialDestinationKind,
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
    capturedAt,
    uploading,
    startRecording,
    flipCamera,
    retake,
    uploadCapture,
    loadFromFile,
  } = useVideoCaptureFlow();
  const [previewStep, setPreviewStep] = useState<PreviewStep>("confirm");
  const [caption, setCaption] = useState("");
  const [overlayCaption, setOverlayCaption] = useState("");
  const [destinationKind, setDestinationKind] = useState<DestinationId>(
    resolveInitialDestinationKind(initialDestinationKind, initialAgitUuid, initialThemeId),
  );
  const [agits, setAgits] = useState<UiAgit[]>([]);
  const [topics, setTopics] = useState<UiTopicListItem[]>([]);
  const [themes, setThemes] = useState<UiDiaryTheme[]>([]);
  const [selectedAgitUuid, setSelectedAgitUuid] = useState(initialAgitUuid);
  const [selectedTopicUuid, setSelectedTopicUuid] = useState(initialTopicUuid);
  const [selectedThemeId, setSelectedThemeId] = useState(initialThemeId);
  const [destinationError, setDestinationError] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [inlineCreateError, setInlineCreateError] = useState<string | null>(null);
  const [destinationsLoading, setDestinationsLoading] = useState(true);
  const [creatingInline, setCreatingInline] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [pendingPublishVideoUuid, setPendingPublishVideoUuid] = useState<string | null>(null);
  const [originalView, setOriginalView] = useState(false);
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [thumbnailPreviewUrl, setThumbnailPreviewUrl] = useState<string | null>(null);
  const [thumbnailSource, setThumbnailSource] = useState<ThumbnailSource | null>(null);
  const [thumbnailError, setThumbnailError] = useState<string | null>(null);
  const sectionRef = useRef<HTMLElement>(null);
  const slotRef = useRef<HTMLDivElement>(null);
  const previewVideoElRef = useRef<HTMLVideoElement | null>(null);

  const bindCaptureVideoRef = useCallback(
    (node: HTMLVideoElement | null) => {
      videoRef(node);
      previewVideoElRef.current = node;
    },
    [videoRef],
  );

  const isPreview = status === "preview" || flowPhase === "uploading" || flowPhase === "complete";
  const showSettings = isPreview && previewStep === "settings";
  const showConfirm = isPreview && previewStep === "confirm";
  const containPreview = showConfirm && !originalView;
  const mirrorVideo = shouldMirrorVideo(facingMode, status);
  const frameMetrics = usePreviewFrameMetrics(containPreview, sectionRef, slotRef, {
    freeze: containPreview,
  });
  const loadTopics = useCallback(async (agitUuid: string, preferredTopicId = "") => {
    if (!agitUuid) {
      setTopics([]);
      setSelectedTopicUuid("");
      return;
    }

    const result = await listCaptureTopicsAction(agitUuid);
    if (!result.ok) {
      setTopics([]);
      setDestinationError(result.error);
      return;
    }

    setTopics(result.data);
    setSelectedTopicUuid(pickTopicId(result.data, preferredTopicId));
  }, []);

  const loadDestinations = useCallback(async () => {
    setDestinationsLoading(true);
    setDestinationError(null);

    const [agitResult, themeResult] = await Promise.all([
      listCaptureAgitsAction(),
      listCaptureThemesAction(),
    ]);

    if (agitResult.ok) {
      setAgits(agitResult.data);
      const nextAgitUuid = pickId(agitResult.data, initialAgitUuid);
      setSelectedAgitUuid(nextAgitUuid);
      if (nextAgitUuid) {
        await loadTopics(nextAgitUuid, initialTopicUuid);
      } else {
        setTopics([]);
        setSelectedTopicUuid("");
      }
    } else {
      setDestinationError(agitResult.error);
    }

    if (themeResult.ok) {
      setThemes(themeResult.data);
      setSelectedThemeId(pickId(themeResult.data, initialThemeId));
    } else if (!agitResult.ok) {
      setDestinationError(themeResult.error);
    }

    setDestinationsLoading(false);
  }, [initialAgitUuid, initialThemeId, initialTopicUuid, loadTopics]);

  useEffect(() => {
    queueMicrotask(() => {
      void loadDestinations();
    });
  }, [loadDestinations]);

  const replaceThumbnail = useCallback((file: File, source: ThumbnailSource) => {
    setThumbnailPreviewUrl((current) => {
      if (current) {
        URL.revokeObjectURL(current);
      }
      return URL.createObjectURL(file);
    });
    setThumbnailFile(file);
    setThumbnailSource(source);
    setThumbnailError(null);
  }, []);

  const clearThumbnail = useCallback(() => {
    setThumbnailPreviewUrl((current) => {
      if (current) {
        URL.revokeObjectURL(current);
      }
      return null;
    });
    setThumbnailFile(null);
    setThumbnailSource(null);
    setThumbnailError(null);
  }, []);

  const thumbnailPreviewUrlRef = useRef<string | null>(null);

  useEffect(() => {
    thumbnailPreviewUrlRef.current = thumbnailPreviewUrl;
  }, [thumbnailPreviewUrl]);

  useEffect(() => {
    return () => {
      if (thumbnailPreviewUrlRef.current) {
        URL.revokeObjectURL(thumbnailPreviewUrlRef.current);
      }
    };
  }, []);

  const handleStartRecording = useCallback(() => {
    playShutterSound();
    void startRecording();
  }, [startRecording]);

  const handleRetake = useCallback(() => {
    setCaption("");
    setOverlayCaption("");
    setSaveError(null);
    setInlineCreateError(null);
    setPendingPublishVideoUuid(null);
    setOriginalView(false);
    setPreviewStep("confirm");
    clearThumbnail();
    void retake();
  }, [clearThumbnail, retake]);

  const navigateAfterPublish = useCallback(
    (destination: VideoDestination) => {
      toast.add({
        type: "success",
        title: "업로드 완료",
        description: "목록에 반영까지 잠시 걸릴 수 있어요.",
      });

      if (destination.kind === "topic") {
        router.push(ROUTES.agit.topicDetail(destination.agitUuid, destination.topicUuid));
      } else {
        router.push(ROUTES.diary.themes.detail(destination.themeId));
      }
      router.refresh();
    },
    [router],
  );

  const publishDestination = useCallback(
    async (videoUuid: string, destination: VideoDestination) => {
      setPublishing(true);
      setSaveError(null);

      const published = await publishVideoDestinationAction(
        videoUuid,
        destination,
        caption.trim() || undefined,
      );
      setPublishing(false);

      const publishError = extractActionError(published);
      if (publishError) {
        setPendingPublishVideoUuid(videoUuid);
        setSaveError(`영상은 저장됐습니다. 목록 연결에 실패했어요. ${publishError}`);
        return false;
      }

      if (published.ok && published.data.status === "not_wired") {
        setPendingPublishVideoUuid(videoUuid);
        setSaveError(VIDEO_DESTINATION_NOT_WIRED);
        return false;
      }

      setPendingPublishVideoUuid(null);
      navigateAfterPublish(destination);
      return true;
    },
    [caption, navigateAfterPublish],
  );

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

    if (!thumbnailFile) {
      setSaveError("썸네일을 등록해 주세요. 이전 화면에서 이미지를 고르거나 장면을 담을 수 있어요.");
      return;
    }

    setSaveError(null);
    const uploadOutcome = await uploadCapture(caption.trim() || undefined, thumbnailFile);
    if (!uploadOutcome.ok) {
      setSaveError(uploadOutcome.error);
      return;
    }

    await publishDestination(uploadOutcome.result.videoUuid, destination);
  }, [caption, publishDestination, resolveDestination, thumbnailFile, uploadCapture]);

  const handlePickThumbnailFile = useCallback(
    async (file: File) => {
      try {
        const prepared = await prepareThumbnailImage(file);
        replaceThumbnail(prepared, "file");
      } catch (error) {
        setThumbnailError(error instanceof Error ? error.message : "썸네일 이미지를 준비하지 못했습니다.");
      }
    },
    [replaceThumbnail],
  );

  const handleCaptureThumbnailFrame = useCallback(async () => {
    const video = previewVideoElRef.current;
    if (!video) {
      setThumbnailError("영상을 찾을 수 없습니다.");
      return;
    }

    try {
      const captured = await captureVideoFrame(video);
      replaceThumbnail(captured, "frame");
    } catch (error) {
      setThumbnailError(error instanceof Error ? error.message : "영상 장면을 담지 못했습니다.");
    }
  }, [replaceThumbnail]);

  const commitOverlayCaption = useCallback(() => {
    setOverlayCaption(caption.trim());
  }, [caption]);

  const handleContinueToSettings = useCallback(() => {
    if (!thumbnailFile) {
      setThumbnailError("썸네일을 등록해 주세요. 이미지를 고르거나 현재 장면을 담아 주세요.");
      return;
    }

    setThumbnailError(null);
    setOverlayCaption(caption.trim());
    setOriginalView(false);
    setPreviewStep("settings");
  }, [caption, thumbnailFile]);

  const handleRetryPublish = useCallback(async () => {
    if (!pendingPublishVideoUuid) {
      return;
    }

    const destination = resolveDestination();
    if (!destination) {
      setSaveError("저장 대상을 선택해 주세요.");
      return;
    }

    await publishDestination(pendingPublishVideoUuid, destination);
  }, [pendingPublishVideoUuid, publishDestination, resolveDestination]);

  const handleCreateTheme = useCallback(async (name: string) => {
    setInlineCreateError(null);
    setCreatingInline(true);

    const result = await createCaptureThemeAction(name);
    if (!result.ok) {
      setCreatingInline(false);
      setInlineCreateError(result.error);
      return;
    }

    const themesResult = await listCaptureThemesAction();
    setCreatingInline(false);
    if (!themesResult.ok) {
      setInlineCreateError(themesResult.error);
      return;
    }

    setThemes(themesResult.data);
    setSelectedThemeId(result.data.id);
  }, []);

  const handleCreateTopic = useCallback(
    async (title: string) => {
      if (!selectedAgitUuid) {
        return;
      }

      setInlineCreateError(null);
      setCreatingInline(true);

      const result = await createCaptureTopicAction(
        selectedAgitUuid,
        title,
        toKstDateString(new Date()),
      );
      if (!result.ok) {
        setCreatingInline(false);
        setInlineCreateError(result.error);
        return;
      }

      await loadTopics(selectedAgitUuid, result.data.id);
      setCreatingInline(false);
    },
    [loadTopics, selectedAgitUuid],
  );

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
          ref={bindCaptureVideoRef}
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
          <CaptureClipOverlays capturedAt={capturedAt} caption={overlayCaption} />
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
          thumbnailPreviewUrl={thumbnailPreviewUrl}
          thumbnailSource={thumbnailSource}
          thumbnailError={thumbnailError}
          onCaptionChange={setCaption}
          onCaptionCommit={commitOverlayCaption}
          onPickThumbnailFile={(file) => void handlePickThumbnailFile(file)}
          onCaptureThumbnailFrame={() => void handleCaptureThumbnailFrame()}
          onBack={handleRetake}
          onViewOriginal={() => setOriginalView(true)}
          onCloseOriginal={() => setOriginalView(false)}
          onContinue={handleContinueToSettings}
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
          destinationsLoading={destinationsLoading}
          destinationError={destinationError}
          inlineCreateError={inlineCreateError}
          creatingInline={creatingInline}
          uploading={uploading || publishing}
          saveError={saveError ?? (flowError && !pendingPublishVideoUuid ? flowError : null)}
          thumbnailPreviewUrl={thumbnailPreviewUrl}
          pendingPublishVideoUuid={pendingPublishVideoUuid}
          onDestinationKindChange={(kind) => {
            setInlineCreateError(null);
            setDestinationKind(kind);
          }}
          onAgitChange={(agitUuid) => {
            setInlineCreateError(null);
            setSelectedAgitUuid(agitUuid);
            setSelectedTopicUuid("");
            void loadTopics(agitUuid);
          }}
          onTopicChange={setSelectedTopicUuid}
          onThemeChange={setSelectedThemeId}
          onCreateTopic={handleCreateTopic}
          onCreateTheme={handleCreateTheme}
          onReloadDestinations={() => void loadDestinations()}
          onBack={() => setPreviewStep("confirm")}
          onSave={() => void handleSave()}
          onRetryPublish={() => void handleRetryPublish()}
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
          onFileSelected={loadFromFile}
        />
      ) : null}
    </section>
  );
}
