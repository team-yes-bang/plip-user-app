import { ChangePasswordTemplate } from "@/components/templates";
import * as userService from "@/services/userService";

export default async function ChangePasswordPage() {
  let email = "";

  try {
    const profile = await userService.getMyProfile();
    email = profile.email;
  } catch {
    email = "";
  }

  return <ChangePasswordTemplate email={email} />;
}
