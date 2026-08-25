"use client";

import { createTopicAction } from "@/actions/topicActions";
import { SubmitButton } from "@/components/atoms";
import { AuthField, TopicDatePicker } from "@/components/molecules";
import { NoticeCard } from "@/components/molecules/NoticeCard";
import { toast } from "@/components/ui/toast";
import { ROUTES } from "@/config/routes";
import { TOPIC_FORBIDDEN, TOPIC_LOGIN_REQUIRED } from "@/lib/topic/actionErrors";
import { toKstDateString } from "@/lib/topic/selectAgitTopic";
import { TOPIC_TITLE_MAX_LENGTH } from "@/types/topic/schema";
import { useRouter } from "next/navigation";
import { useState } from "react";

type TopicCreateFormProps = {
  agitId: string;
};

export function TopicCreateForm({ agitId }: TopicCreateFormProps) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const today = toKstDateString(new Date());

  async function handleSubmit(formData: FormData) {
    if (pending) return;
    setError(null);
    setPending(true);

    const result = await createTopicAction(agitId, {
      title: formData.get("title"),
      startDate: formData.get("startDate"),
    });

    setPending(false);

    if (!result.ok) {
      if (result.error === TOPIC_FORBIDDEN || result.error === TOPIC_LOGIN_REQUIRED) {
        toast.add({ type: "error", title: result.error });
        return;
      }
      setError(result.error);
      return;
    }

    toast.add({ type: "success", title: "토픽을 만들었습니다" });
    router.push(ROUTES.agit.detail(agitId));
    router.refresh();
  }

  return (
    <form className="flex w-full flex-col gap-3.5" action={handleSubmit}>
      <AuthField
        id="topic-name"
        name="title"
        label="토픽 이름"
        hint={`최대 ${TOPIC_TITLE_MAX_LENGTH}자`}
        placeholder="점심 메뉴"
        maxLength={TOPIC_TITLE_MAX_LENGTH}
        required
      />
      <TopicDatePicker
        id="topic-date"
        name="startDate"
        defaultValue={today}
        required
      />

      <NoticeCard
        tone="brand"
        title="등록 규칙"
        body="한 사용자는 이 토픽에 영상 1개만 등록할 수 있어요. 진행 날짜는 하루입니다."
      />

      {error ? <p className="m-0 text-[12px] text-red-600">{error}</p> : null}

      <div className="flex w-full flex-col gap-[14px] mt-auto">
        <SubmitButton variant="brand" disabled={pending}>
          {pending ? "만드는 중..." : "토픽 만들기"}
        </SubmitButton>
      </div>
    </form>
  );
}
