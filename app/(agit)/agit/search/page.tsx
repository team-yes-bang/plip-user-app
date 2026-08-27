import { AgitSearchTemplate } from "@/components/templates";
import { listMyAgits } from "@/services/agitService";

export default async function AgitSearchPage() {
  let myAgitIds: string[] = [];

  try {
    myAgitIds = (await listMyAgits()).map((agit) => agit.id);
  } catch {
    myAgitIds = [];
  }

  return <AgitSearchTemplate myAgitIds={myAgitIds} />;
}
