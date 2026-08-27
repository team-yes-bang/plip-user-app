import { MainLandingSection } from "@/components/organisms/MainLandingSection";
import type { UiAgit } from "@/types/agit/ui";

export function IntroTemplate({
  latest = [],
  recommended = [],
  isLoggedIn = false,
}: {
  latest?: UiAgit[];
  recommended?: UiAgit[];
  isLoggedIn?: boolean;
}) {
  return (
    <main className="min-h-0 h-full w-full overflow-y-auto bg-[var(--dl-color-bg-elevated)] text-[var(--dl-color-text-primary)]">
      <MainLandingSection latest={latest} recommended={recommended} isLoggedIn={isLoggedIn} />
    </main>
  );
}
