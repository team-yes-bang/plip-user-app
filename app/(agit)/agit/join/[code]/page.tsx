import type { Metadata } from "next";
import { InviteJoinLandingTemplate } from "@/components/templates";
import { ApiError } from "@/lib/api/apiFetch";
import { getAgitLanding } from "@/services/agitService";
import type { UiAgit } from "@/types/agit/ui";

type PageProps = {
  params: Promise<{ code: string }>;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { code } = await params;
  const inviteCode = decodeURIComponent(code).trim();

  try {
    const agit = await getAgitLanding(inviteCode);
    if (!agit) {
      return {
        title: "아지트 초대 - PLIP",
        description: "PLIP 아지트 초대 페이지입니다.",
      };
    }

    const title = `${agit.name} - 아지트 초대 | PLIP`;
    const description =
      agit.description || `${agit.name} 아지트에 초대를 받았습니다. PLIP에서 함께 일상을 공유해보세요.`;

    return {
      title,
      description,
      openGraph: {
        title: `${agit.name} 아지트에 초대되었습니다`,
        description,
        images: agit.thumbnailSrc ? [{ url: agit.thumbnailSrc }] : [],
      },
      twitter: {
        card: "summary_large_image",
        title: `${agit.name} 아지트에 초대되었습니다`,
        description,
        images: agit.thumbnailSrc ? [agit.thumbnailSrc] : [],
      },
    };
  } catch {
    return {
      title: "아지트 초대 - PLIP",
      description: "PLIP 아지트 초대 페이지입니다.",
    };
  }
}

export default async function AgitInviteJoinPage({ params }: PageProps) {
  const { code } = await params;
  const inviteCode = decodeURIComponent(code).trim();
  let agit: UiAgit | null = null;
  let error: string | undefined;

  try {
    agit = await getAgitLanding(inviteCode);
  } catch (caught) {
    agit = null;
    if (caught instanceof ApiError) {
      error = `[API Error ${caught.status}] ${caught.message}`;
    } else if (caught instanceof Error) {
      error = `[Error] ${caught.message}`;
    } else {
      error = "아지트를 불러오지 못했습니다.";
    }
  }

  return <InviteJoinLandingTemplate agit={agit} error={error} />;
}

