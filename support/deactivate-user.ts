import { apiFetch } from "./didaxis-api";

export type DeactivateUserResult = {
  id: string;
  ok: boolean;
  status: number;
  message: string;
};

export async function deactivateUserById(
  id: string,
): Promise<DeactivateUserResult> {
  const response = await apiFetch(`/api/users/${id}`, {
    method: "PATCH",
    body: JSON.stringify({ is_active: false }),
  });
  const text = await response.text();
  let message = text;

  try {
    const parsed = JSON.parse(text) as { message?: string; error?: string };
    message = parsed.message ?? parsed.error ?? text;
  } catch {
    // keep raw text
  }

  return {
    id,
    ok: response.ok || response.status === 404,
    status: response.status,
    message,
  };
}

export async function deactivateUsersByIds(
  ids: string[],
): Promise<DeactivateUserResult[]> {
  const uniqueIds = [...new Set(ids)];
  const results: DeactivateUserResult[] = [];

  for (const id of uniqueIds) {
    results.push(await deactivateUserById(id));
  }

  return results;
}
