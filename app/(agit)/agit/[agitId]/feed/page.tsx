import { AgitTopicFeedTemplate } from "@/components/templates";
import { ROUTES } from "@/config/routes";
import { toKstDateString } from "@/lib/topic/selectAgitTopic";
import { getAgitAndMembers } from "@/services/agitService";
import { getTopicFeedWindow, getTopicVideos } from "@/services/topicService";
import type { UiAgit } from "@/types/agit/ui";
import type { UiTopicFeedWindow, UiTopicVideo } from "@/types/topic/ui";
import { redirect } from "next/navigation";

type PageProps = {
  params: Promise<{ agitId: string }>;
  searchParams: Promise<{ topic?: string }>;
};

export default async function AgitTopicFeedPage({ params, searchParams }: PageProps) {
  const { agitId } = await params;
  const { topic: topicUuid } = await searchParams;

  let agit: UiAgit | null = null;
  let initialWindow: UiTopicFeedWindow = {
    topics: [],
    currentId: null,
    hasMoreBefore: false,
    hasMoreAfter: false,
  };
  const initialVideos: Record<string, UiTopicVideo[]> = {};

  try {
    const detail = await getAgitAndMembers(agitId);
    agit = detail.agit;
    initialWindow = await getTopicFeedWindow({
      agitUuid: agitId,
      topicUuid,
      date: topicUuid ? undefined : toKstDateString(new Date()),
      before: 3,
      after: 3,
    });
    const center = initialWindow.topics.findIndex((item) => item.id === initialWindow.currentId);
    const loadIds = [initialWindow.topics[center - 1]?.id, initialWindow.topics[center]?.id, initialWindow.topics[center + 1]?.id].filter(
      (id): id is string => Boolean(id),
    );
    await Promise.all(
      loadIds.map(async (id) => {
        initialVideos[id] = await getTopicVideos(id, detail.members);
      }),
    );
  } catch {
    redirect(ROUTES.agit.topics(agitId));
  }

  return (
    <AgitTopicFeedTemplate agit={agit} initialWindow={initialWindow} initialVideos={initialVideos} />
  );
}
