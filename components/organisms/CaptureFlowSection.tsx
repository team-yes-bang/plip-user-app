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
};

type PreviewStep = "confirm" | "settings";

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
    loadFromFile,
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
  const [inlineCreateError, setInlineCreateError] = useState<string | null>(null);
  const [destinationsLoading, setDestinationsLoading] = useState(true);
  const [creatingInline, setCreatingInline] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [pendingPublishVideoUuid, setPendingPublishVideoUuid] = useState<string | null>(null);
  const [originalView, setOriginalView] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);
  const slotRef = useRef<HTMLDivElement>(null);

  const isPreview = status === "preview" || flowPhase === "uploading" || flowPhase === "complete";
  const showSettings = isPreview && previewStep === "settings";
  const showConfirm = isPreview && previewStep === "confirm";
  const containPreview = showConfirm && !originalView;
  const mirrorVideo = shouldMirrorVideo(facingMode, status, pixelsMirrored);
  const frameMetrics = usePreviewFrameMetrics(containPreview, sectionRef, slotRef);
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

  const handleStartRecording = useCallback(() => {
    playShutterSound();
    void startRecording();
  }, [startRecording]);

  const handleRetake = useCallback(() => {
    setCaption("");
    setSaveError(null);
    setInlineCreateError(null);
    setPendingPublishVideoUuid(null);
    setOriginalView(false);
    setPreviewStep("confirm");
    void retake();
  }, [retake]);

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

    setSaveError(null);
    const uploaded = await uploadCapture(caption.trim() || undefined);
    if (!uploaded) {
      setSaveError("업로드에 실패했습니다.");
      return;
    }

    await publishDestination(uploaded.videoUuid, destination);
  }, [caption, publishDestination, resolveDestination, uploadCapture]);

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
          <CaptureClipOverlays capturedAt={capturedAt} caption={caption} />
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
          destinationsLoading={destinationsLoading}
          destinationError={destinationError}
          inlineCreateError={inlineCreateError}
          creatingInline={creatingInline}
          uploading={uploading || publishing}
          saveError={saveError ?? (flowError && !pendingPublishVideoUuid ? flowError : null)}
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
