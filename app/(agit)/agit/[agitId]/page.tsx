import { AgitTopicFeedTemplate } from "@/components/templates";
import { ROUTES } from "@/config/routes";
import { toKstDateString } from "@/lib/topic/selectAgitTopic";
import { getAgitAndMembers } from "@/services/agitService";
import { getTopicFeedWindow, getTopicVideos } from "@/services/topicService";
import type { UiTopicFeedWindow, UiTopicVideo } from "@/types/topic/ui";
import { redirect } from "next/navigation";

type AgitDetailPageProps = {
  params: Promise<{ agitId: string }>;
};

const EMPTY_WINDOW: UiTopicFeedWindow = {
  topics: [],
  currentId: null,
  hasMoreBefore: false,
  hasMoreAfter: false,
};

export default async function AgitDetailPage({ params }: AgitDetailPageProps) {
  const { agitId } = await params;

  const detail = await getAgitAndMembers(agitId).catch(() => null);
  if (!detail) {
    redirect(ROUTES.agit.root);
  }

  let initialWindow: UiTopicFeedWindow = EMPTY_WINDOW;
  const initialVideos: Record<string, UiTopicVideo[]> = {};

  try {
    initialWindow = await getTopicFeedWindow({
      agitUuid: agitId,
      date: toKstDateString(new Date()),
      before: 3,
      after: 3,
    });
    const center = initialWindow.topics.findIndex((item) => item.id === initialWindow.currentId);
    const loadIds = [
      initialWindow.topics[center - 1]?.id,
      initialWindow.topics[center]?.id,
      initialWindow.topics[center + 1]?.id,
    ].filter((id): id is string => Boolean(id));

    await Promise.all(
      loadIds.map(async (id) => {
        initialVideos[id] = await getTopicVideos(id, detail.members);
      }),
    );
  } catch {
    initialWindow = EMPTY_WINDOW;
  }

  return (
    <AgitTopicFeedTemplate
      agit={detail.agit}
      initialWindow={initialWindow}
      initialVideos={initialVideos}
    />
  );
}
