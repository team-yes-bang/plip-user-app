import { ROUTES } from "@/config/routes";
import { redirect } from "next/navigation";

type PageProps = {
  params: Promise<{ agitId: string; topicId: string }>;
};

/**
 * 기존 독립 뷰어 라우트 접속 시 아지트 피드로 이동 후 뷰어를 모달 오버레이로 띄우도록 리다이렉트합니다.
 */
export default async function AgitTopicViewerPage({ params }: PageProps) {
  const { agitId, topicId } = await params;
  redirect(ROUTES.agit.topicFeed(agitId, topicId));
}
