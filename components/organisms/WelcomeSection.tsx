import { TextLink } from "@/components/atoms";
import { ui } from "@/components/atoms/styles";
import { SocialAuthButtons } from "@/components/molecules";
import { cn } from "@/lib/utils";
import { ROUTES } from "@/config/routes";
import Image from "next/image";

export function WelcomeSection() {
  return (
    <section className="flex w-full flex-col gap-6" aria-label="시작하기">
      <div className="relative flex min-h-[410px] flex-col justify-end overflow-hidden rounded-[28px] p-[28px] bg-[linear-gradient(131deg,_#6b4af5_14%,_#52d4b8_86%)] text-[#fff]">
        <Image src="/plip/v13/welcome-orb.svg" alt="" width={210} height={210} className="absolute top-[80px] left-[110px] w-[210px] h-[210px]" />
        <p className="relative m-0 text-[42px] font-bold leading-[51px]">PLIP</p>
        <p className="relative m-[14px_0_0] text-lg font-semibold leading-[26px]">
          일상을 강요하지 않고,
          <br />
          목적에 맞게 함께 기록해요.
        </p>
      </div>
      <div className="flex w-full flex-col gap-3.5">
        <SocialAuthButtons actionLabel="시작" />
        <TextLink href={ROUTES.signup} className={cn(ui.btn, ui.btnSecondary)}>
          이메일로 시작
        </TextLink>
        <p className="text-center text-[13px] font-medium text-[var(--dl-color-text-brand)]">
          이미 계정이 있나요?{" "}
          <TextLink href={ROUTES.login} className={cn(ui.link, "text-[13px]")}>
            로그인
          </TextLink>
        </p>
      </div>
      <p className="mt-auto text-center text-[10px] leading-[12px] text-[var(--dl-color-text-tertiary)]">
        계속하면 서비스 약관과 개인정보 처리방침에 동의합니다.
      </p>
    </section>
  );
}
