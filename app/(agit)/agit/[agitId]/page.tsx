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

  const [detail, initialWindow] = await Promise.all([
    getAgitAndMembers(agitId).catch(() => null),
    getTopicFeedWindow({
      agitUuid: agitId,
      date: toKstDateString(new Date()),
      before: 3,
      after: 3,
    }).catch(() => EMPTY_WINDOW),
  ]);

  if (!detail) {
    redirect(ROUTES.agit.root);
  }

  const initialVideos: Record<string, UiTopicVideo[]> = {};

  if (initialWindow.currentId) {
    try {
      initialVideos[initialWindow.currentId] = await getTopicVideos(
        initialWindow.currentId,
        detail.members,
      );
    } catch {
      // ignore
    }
  }

  return (
    <AgitTopicFeedTemplate
      agit={detail.agit}
      members={detail.members}
      initialWindow={initialWindow}
      initialVideos={initialVideos}
    />
  );
}
