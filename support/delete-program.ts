import { apiFetch } from "./didaxis-api";

export type ProgramSummary = {
  id: string;
  name: string;
};

export type DeleteProgramResult = {
  id: string;
  ok: boolean;
  status: number;
  message: string;
};

export async function getAllPrograms(): Promise<ProgramSummary[]> {
  const response = await apiFetch("/api/programs");
  const body = (await response.json()) as {
    data?: ProgramSummary[];
    message?: string;
  };

  if (!response.ok) {
    throw new Error(
      `GET /api/programs failed (${response.status}): ${JSON.stringify(body)}`,
    );
  }

  return body.data ?? [];
}

export async function deleteProgramById(id: string): Promise<DeleteProgramResult> {
  const response = await apiFetch(`/api/programs/${id}`, { method: "DELETE" });
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

export async function deleteProgramsByIds(
  ids: string[],
): Promise<DeleteProgramResult[]> {
  const uniqueIds = [...new Set(ids)];
  const results: DeleteProgramResult[] = [];

  for (const id of uniqueIds) {
    results.push(await deleteProgramById(id));
  }

  return results;
}
