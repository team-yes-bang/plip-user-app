import { AppChromeTemplate } from "@/components/templates/AppChromeTemplate";
import { ProfileHubSection } from "@/components/organisms/ProfileHubSection";
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
    <AppChromeTemplate
      activeTab="mypage"
      variant="light"
      showNav={showBottomNav}
      mainOverflow="hidden"
    >
      {children ?? <ProfileHubSection profile={profile} />}
    </AppChromeTemplate>
  );
}
