import { CaptureFlowSection } from "@/components/organisms/CaptureFlowSection";

type CaptureVideoTemplateProps = {
  initialAgitUuid?: string;
  initialTopicUuid?: string;
  initialThemeId?: string;
};

export function CaptureVideoTemplate({
  initialAgitUuid,
  initialTopicUuid,
  initialThemeId,
}: CaptureVideoTemplateProps) {
  return (
    <CaptureFlowSection
      initialAgitUuid={initialAgitUuid}
      initialTopicUuid={initialTopicUuid}
      initialThemeId={initialThemeId}
    />
  );
}
