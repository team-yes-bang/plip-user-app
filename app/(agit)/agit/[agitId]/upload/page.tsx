import { RoomUploadTemplate } from "@/components/templates";

type PageProps = {
  params: Promise<{ agitId: string }>;
};

export default async function AgitUploadPage({ params }: PageProps) {
  const { agitId } = await params;
  return RoomUploadTemplate({ agitId });
}
