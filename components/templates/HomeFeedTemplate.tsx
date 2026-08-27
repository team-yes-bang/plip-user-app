import { HomeFeedSection } from "@/components/organisms/HomeFeedSection";
import { BottomNavigation, FeedTopBar } from "@/components/molecules";

export function HomeFeedTemplate() {
  return (
    <div className="relative md:!w-full md:!max-w-none flex h-full min-h-0 w-full max-w-none mx-auto flex-col overflow-hidden bg-[var(--plip-tt-bg)] text-[var(--plip-tt-text)]">
      <div className="flex min-h-0 min-w-0 w-full flex-1 flex-col overflow-hidden pb-[80px]">
        <main className="flex min-h-0 w-full flex-1 flex-col overflow-hidden">
          <HomeFeedSection />
        </main>
      </div>
      <FeedTopBar />
      <BottomNavigation active="feed" variant="feed" />
    </div>
  );
}
