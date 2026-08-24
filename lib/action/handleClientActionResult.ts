"use client";

import { logoutAction } from "@/actions/authActions";
import { toast } from "@/components/ui/toast";
import { ROUTES } from "@/config/routes";
import type { ActionResult } from "@/types/action-result";
import type { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";

type HandleClientActionResultOptions = {
  errorTitle?: string;
};

export async function handleClientActionResult<T>(
  result: ActionResult<T>,
  router: AppRouterInstance,
  options?: HandleClientActionResultOptions,
): Promise<boolean> {
  if (result.ok) {
    return true;
  }

  if (result.sessionExpired) {
    await logoutAction().catch(() => undefined);
    router.push(ROUTES.login);
    router.refresh();
    return false;
  }

  if (result.error) {
    toast.add({
      type: "error",
      title: options?.errorTitle ?? "요청에 실패했습니다",
      description: result.error,
    });
  }

  return false;
}
