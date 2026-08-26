"use client";

import { joinAgitAction } from "@/actions/agitActions";
import { getMyProfileAction } from "@/actions/userActions";
import { SubmitButton } from "@/components/atoms";
import { AuthField } from "@/components/molecules";
import { ROUTES } from "@/config/routes";
import {
  AGIT_NICKNAME_MAX_LENGTH,
  AGIT_NICKNAME_MIN_LENGTH,
} from "@/types/agit/schema";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

type InviteJoinProfileFormProps = {
  code: string;
  defaultNickname?: string;
};

export function InviteJoinProfileForm({
  code,
  defaultNickname: initialNickname = "",
}: InviteJoinProfileFormProps) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [defaultNickname, setDefaultNickname] = useState(initialNickname);

  useEffect(() => {
    if (!initialNickname) {
      void getMyProfileAction().then((res) => {
        if (res.ok && res.data?.nickname) {
          setDefaultNickname(res.data.nickname);
        }
      });
    }
  }, [initialNickname]);

  async function handleSubmit(formData: FormData) {
    if (pending) {
      return;
    }

    setError(null);
    setPending(true);

    const result = await joinAgitAction(code, String(formData.get("nickname") ?? ""));

    setPending(false);

    if (!result.ok) {
      setError(result.error);
      return;
    }

    router.push(ROUTES.agit.detail(result.data.agitUuid));
    router.refresh();
  }

  return (
    <form className="flex w-full flex-col gap-3.5" action={handleSubmit}>
      <AuthField
        key={defaultNickname}
        id="invite-join-nickname"
        name="nickname"
        label="닉네임"
        defaultValue={defaultNickname}
        hint={`영문·숫자·한글 ${AGIT_NICKNAME_MIN_LENGTH}~${AGIT_NICKNAME_MAX_LENGTH}자`}
        placeholder="닉네임"
        maxLength={AGIT_NICKNAME_MAX_LENGTH}
        pattern="[0-9A-Za-z가-힣]{2,12}"
        title="영문·숫자·한글 2~12자, 특수문자와 공백 불가"
        required
      />

      {error ? <p className="m-0 text-[12px] text-red-600">{error}</p> : null}

      <div className="flex w-full flex-col gap-[14px] mt-auto">
        <SubmitButton variant="brand" disabled={pending}>
          {pending ? "참여하는 중..." : "이 프로필로 참여"}
        </SubmitButton>
      </div>
    </form>
  );
}
