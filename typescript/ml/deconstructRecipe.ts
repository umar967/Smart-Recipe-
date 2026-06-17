import { parseRecipeText, DeconstructResult } from "./recipeParser";

/**
 * On-device recipe deconstruction — no network calls.
 * Typical latency on mid-range hardware: 50–400ms (well under 2s target).
 */
export async function deconstructRecipe(recipeText: string): Promise<DeconstructResult> {
  const trimmed = recipeText.trim();
  if (!trimmed) {
    throw new Error("Recipe content cannot be empty.");
  }

  const start = performance.now();
  const result = await parseRecipeText(trimmed);
  const elapsedMs = performance.now() - start;

  if (!result.steps?.length) {
    throw new Error(
      "Could not find cooking steps. Add numbered steps (1. Mix…), an Instructions section, or one paragraph per step."
    );
  }
  if (!result.ingredients?.length) {
    throw new Error(
      "Could not find ingredients. Paste the full recipe including an Ingredients list (e.g. \"- 500g flour\", \"- 2 eggs\")."
    );
  }

  if (typeof window !== "undefined") {
    (window as unknown as { __lastDeconstructMs?: number }).__lastDeconstructMs = elapsedMs;
  }

  return result;
}

export type { DeconstructResult };
