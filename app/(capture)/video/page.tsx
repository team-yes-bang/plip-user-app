import { CaptureVideoTemplate } from "@/components/templates/CaptureVideoTemplate";

type PageProps = {
  searchParams: Promise<{
    agitUuid?: string;
    topicUuid?: string;
    themeId?: string;
    destination?: string;
  }>;
};

function parseDestinationKind(value?: string): "diary" | "agit" | undefined {
  if (value === "diary" || value === "agit") {
    return value;
  }
  return undefined;
}

export default async function CaptureVideoPage({ searchParams }: PageProps) {
  const query = await searchParams;
  return (
    <CaptureVideoTemplate
      initialAgitUuid={query.agitUuid}
      initialTopicUuid={query.topicUuid}
      initialThemeId={query.themeId}
      initialDestinationKind={parseDestinationKind(query.destination)}
    />
  );
}
