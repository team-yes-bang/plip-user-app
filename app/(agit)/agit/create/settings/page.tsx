import { CreateRoomAccessTemplate } from "@/components/templates";
import * as userService from "@/services/userService";

export default async function CreateRoomSettingsPage() {
  let defaultNickname = "";
  try {
    const profile = await userService.getMyProfile();
    defaultNickname = profile.nickname || "";
  } catch {
    defaultNickname = "";
  }

  return <CreateRoomAccessTemplate defaultNickname={defaultNickname} />;
}
