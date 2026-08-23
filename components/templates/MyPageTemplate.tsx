import { BottomNavigation } from "@/components/molecules";
import { ProfileHubSection } from "@/components/organisms/ProfileHubSection";
import { DailyLoopAuthTemplate } from "@/components/templates/DailyLoopAuthTemplate";
import type { ReactNode } from "react";

type MyPageTemplateProps = {
  headerTitle?: string;
  showBottomNav?: boolean;
  children?: ReactNode;
};

export function MyPageTemplate({
  showBottomNav = true,
  children,
}: MyPageTemplateProps) {
  return (
    <div className="relative flex h-full min-h-0 w-full flex-1 flex-col overflow-hidden">
      <div className={`min-h-0 flex-1 overflow-y-auto ${showBottomNav ? "pb-[80px]" : ""}`}>
        <DailyLoopAuthTemplate>
          {children ?? <ProfileHubSection />}
        </DailyLoopAuthTemplate>
      </div>
      {showBottomNav ? <BottomNavigation active="mypage" variant="light" /> : null}
    </div>
  );
}
