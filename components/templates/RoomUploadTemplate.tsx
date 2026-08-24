import { redirect } from "next/navigation";
import { ROUTES } from "@/config/routes";

type RoomUploadTemplateProps = {
  agitId: string;
};

export function RoomUploadTemplate({ agitId }: RoomUploadTemplateProps): never {
  redirect(ROUTES.capture.videoWith({ agitUuid: agitId }));
}
