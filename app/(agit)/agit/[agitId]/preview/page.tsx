import { AgitPreviewTemplate } from "@/components/templates";
import { getAgitPreview } from "@/services/agitService";
import type { ApiAgitPreview } from "@/types/agit/api";

type PageProps = {
  params: Promise<{ agitId: string }>;
};

export default async function AgitPreviewPage({ params }: PageProps) {
  const { agitId } = await params;
  let preview: ApiAgitPreview | null = null;
  let error: string | undefined;

  try {
    preview = await getAgitPreview(agitId);
  } catch (caught) {
    error = caught instanceof Error ? caught.message : "아지트를 불러오지 못했습니다.";
  }

  return <AgitPreviewTemplate preview={preview} error={error} />;
}
