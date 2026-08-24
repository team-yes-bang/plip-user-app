export type ActionResult<T> =
  | { ok: true; data: T }
  | { ok: false; error: string; sessionExpired?: boolean };

export function actionSuccess<T>(data: T): ActionResult<T> {
  return { ok: true, data };
}

export function actionFailure(error: string): ActionResult<never> {
  return { ok: false, error };
}

export function actionSessionExpired(): ActionResult<never> {
  return { ok: false, error: "", sessionExpired: true };
}
