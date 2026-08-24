import { ui } from "@/components/atoms/styles";
import { AuthTopBar } from "@/components/molecules";
import { LoginForm } from "@/components/organisms";
import { DailyLoopAuthTemplate } from "@/components/templates/DailyLoopAuthTemplate";
import { ROUTES } from "@/config/routes";
import { Suspense } from "react";

export function LoginTemplate() {
  return (
    <DailyLoopAuthTemplate>
      <AuthTopBar title="로그인" backHref={ROUTES.intro} />
      <p className={ui.subtitle}>다시 만나 반가워요</p>
      <Suspense fallback={null}>
        <LoginForm />
      </Suspense>
    </DailyLoopAuthTemplate>
  );
}
