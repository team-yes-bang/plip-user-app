"use client";

import { requestJoinAgitAction } from "@/actions/agitActions";
import { SubmitButton, TextLink } from "@/components/atoms";
import { AuthField, HeaderBackLink, PageContainer, ScreenHeader } from "@/components/molecules";
import { ROUTES } from "@/config/routes";
import { publishSearchMetricAction } from "@/actions/agitActions";
import { AGIT_NICKNAME_MAX_LENGTH } from "@/types/agit/schema";
import type { ApiAgitPreview } from "@/types/agit/api";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export function AgitPreviewSection({
  preview,
  error,
}: {
  preview: ApiAgitPreview | null;
  error?: string;
}) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    if (preview?.agitUuid) {
      void publishSearchMetricAction("DETAIL_VIEW", preview.agitUuid);
    }
  }, [preview?.agitUuid]);

  async function handleRequest(formData: FormData) {
    if (!preview || pending) return;
    setPending(true);
    setFormError(null);
    const result = await requestJoinAgitAction(preview.agitUuid, formData.get("nickname"));
    setPending(false);
    if (!result.ok) {
      setFormError(result.error);
      return;
    }
    router.refresh();
  }

  return (
    <div className="flex h-full min-h-0 flex-1 flex-col overflow-hidden">
      <ScreenHeader
        leading={<HeaderBackLink href={ROUTES.agit.search} />}
        title="아지트"
        titleAlign="center"
      />
      <PageContainer aria-label="아지트 미리보기" className="flex-1">
        {error ? (
          <p className="m-0 text-sm text-[var(--dl-color-text-secondary)]" role="alert">
            {error}
          </p>
        ) : null}
        {preview ? (
          <>
            <h1 className="m-0 text-xl font-semibold text-[var(--dl-color-text-primary)]">
              {preview.agitName}
            </h1>
            <p className="m-[8px_0_0] text-sm text-[var(--dl-color-text-secondary)]">
              {preview.description || "소개가 아직 없어요."}
            </p>
            <p className="m-[8px_0_0] text-xs text-[var(--dl-color-text-tertiary)]">
              방장 {preview.hostNickname} · {preview.currentMemberCount}/{preview.maximumCapacity}명
            </p>

            {preview.myStatus === "ACTIVE" ? (
              <TextLink
                href={ROUTES.agit.detail(preview.agitUuid)}
                className="mt-4 inline-flex text-sm font-semibold text-[var(--dl-color-text-brand)]"
              >
                아지트 입장
              </TextLink>
            ) : preview.myStatus === "PENDING" ? (
              <p className="mt-4 text-sm text-[var(--dl-color-text-secondary)]">입장 요청이 대기 중입니다.</p>
            ) : preview.myStatus === "BANNED" ? (
              <p className="mt-4 text-sm text-[var(--dl-color-text-secondary)]">이 아지트에서 내보내진 상태입니다.</p>
            ) : (
              <form className="mt-4 flex flex-col gap-3" action={handleRequest}>
                <AuthField
                  id="join-request-nickname"
                  name="nickname"
                  label="닉네임"
                  placeholder="아지트에서 쓸 이름"
                  maxLength={AGIT_NICKNAME_MAX_LENGTH}
                  required
                />
                {formError ? (
                  <p className="m-0 text-sm text-[var(--dl-color-text-secondary)]" role="alert">
                    {formError}
                  </p>
                ) : null}
                <SubmitButton disabled={pending}>{pending ? "요청 중…" : "입장 요청"}</SubmitButton>
              </form>
            )}
          </>
        ) : null}
      </PageContainer>
    </div>
  );
}
