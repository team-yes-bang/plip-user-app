import { auth } from "@/auth";
import { IntroTemplate } from "@/components/templates/IntroTemplate";
import { searchDiscoverAgits } from "@/services/agitService";
import type { UiAgit } from "@/types/agit/ui";

async function loadDiscover(sort: "new" | "popular"): Promise<UiAgit[]> {
  try {
    return await searchDiscoverAgits({ sort, size: 6 });
  } catch {
    return [];
  }
}

export default async function IntroPage() {
  const session = await auth();
  const isLoggedIn = Boolean(session?.isLoggedIn);
  const [latest, recommended] = await Promise.all([
    loadDiscover("new"),
    loadDiscover("popular"),
  ]);

  return (
    <IntroTemplate latest={latest} recommended={recommended} isLoggedIn={isLoggedIn} />
  );
}
