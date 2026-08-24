import { CaptureVideoTemplate } from "@/components/templates/CaptureVideoTemplate";

type PageProps = {
  searchParams: Promise<{
    agitUuid?: string;
    topicUuid?: string;
    themeId?: string;
  }>;
};

export default async function CaptureVideoPage({ searchParams }: PageProps) {
  const query = await searchParams;
  return (
    <CaptureVideoTemplate
      initialAgitUuid={query.agitUuid}
      initialTopicUuid={query.topicUuid}
      initialThemeId={query.themeId}
    />
  );
}
