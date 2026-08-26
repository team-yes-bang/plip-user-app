import type { DestinationId } from "@/components/molecules/DestinationToggle";
import { CaptureFlowSection } from "@/components/organisms/CaptureFlowSection";

type CaptureVideoTemplateProps = {
  initialAgitUuid?: string;
  initialTopicUuid?: string;
  initialThemeId?: string;
  initialDestinationKind?: DestinationId;
};

export function CaptureVideoTemplate({
  initialAgitUuid,
  initialTopicUuid,
  initialThemeId,
  initialDestinationKind,
}: CaptureVideoTemplateProps) {
  return (
    <CaptureFlowSection
      initialAgitUuid={initialAgitUuid}
      initialTopicUuid={initialTopicUuid}
      initialThemeId={initialThemeId}
      initialDestinationKind={initialDestinationKind}
    />
  );
}
