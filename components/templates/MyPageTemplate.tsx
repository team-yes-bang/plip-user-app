import { BottomNavigation } from "@/components/molecules";
import { ProfileHubSection } from "@/components/organisms/ProfileHubSection";
import { DailyLoopAuthTemplate } from "@/components/templates/DailyLoopAuthTemplate";
import type { UiUserProfile } from "@/types/user/ui";
import type { ReactNode } from "react";

type MyPageTemplateProps = {
  showBottomNav?: boolean;
  profile: UiUserProfile | null;
  children?: ReactNode;
};

export function MyPageTemplate({
  showBottomNav = true,
  profile,
  children,
}: MyPageTemplateProps) {
  return (
    <div className="relative flex h-full min-h-0 w-full flex-1 flex-col overflow-hidden">
      <div className={`min-h-0 flex-1 overflow-y-auto ${showBottomNav ? "pb-[120px]" : ""}`}>
        <DailyLoopAuthTemplate>
          {children ?? <ProfileHubSection profile={profile} />}
        </DailyLoopAuthTemplate>
      </div>
      {showBottomNav ? <BottomNavigation active="mypage" variant="light" /> : null}
    </div>
  );
}
