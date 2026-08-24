import { ClipViewerSection } from "@/components/organisms/ClipViewerSection";
import { FullpageVideoViewer } from "@/components/organisms/FullpageVideoViewer";
import { FullpageViewerTemplate } from "@/components/templates/FullpageViewerTemplate";
import { AppChromeTemplate } from "@/components/templates/AppChromeTemplate";

export function ClipViewerTemplate({ clipId }: { clipId: string }) {
  return (
    <FullpageViewerTemplate isOpen isStandalone>
      <FullpageVideoViewer initialClipId={clipId} videoList={[{ clipId }]} isStandalone />
    </FullpageViewerTemplate>
  );
}

export function ClipEditTemplate({ clipId }: { clipId: string }) {
  return (
    <AppChromeTemplate showNav={false} variant="feed" className="bg-[var(--plip-feed-bg)] text-[var(--plip-feed-text)]">
      <ClipViewerSection clipId={clipId} mode="edit" />
    </AppChromeTemplate>
  );
}
