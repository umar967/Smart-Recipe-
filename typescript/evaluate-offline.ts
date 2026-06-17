/**
 * Evaluates offline recipe deconstruction against held-out test recipes.
 * Run: npx tsx typescript/evaluate-offline.ts
 */
import { readFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import { parseRecipeText } from "./ml/recipeParser.ts";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");

// Node has no fetch for local files — load model directly
const modelPath = join(ROOT, "public", "models", "category_model.json");
const modelJson = readFileSync(modelPath, "utf-8");

const originalFetch = globalThis.fetch;
globalThis.fetch = async (input: RequestInfo | URL) => {
  const url = String(input);
  if (url.includes("category_model.json")) {
    return new Response(modelJson, { status: 200, headers: { "Content-Type": "application/json" } });
  }
  return originalFetch(input);
};

interface RecipeTestCase {
  id: string;
  recipeText: string;
  expected: {
    recipeName: string;
    yieldText: string;
    ingredientCount: number;
    stepCount: number;
    ingredients: Array<{ nameContains: string; category: string; numericValue?: number; unit?: string }>;
    steps: Array<{ titleContains: string; timerDuration: number }>;
  };
}

function scoreRecipe(test: RecipeTestCase, result: Awaited<ReturnType<typeof parseRecipeText>>) {
  let points = 0;
  let total = 0;

  total += 1;
  if (result.recipeName.toLowerCase().includes(test.expected.recipeName.toLowerCase().split(" ")[0])) {
    points += 1;
  }

  total += 1;
  if (result.yieldText.toLowerCase().includes(test.expected.yieldText.toLowerCase().replace(/\s/g, "")) ||
      test.expected.yieldText.toLowerCase().includes(result.yieldText.toLowerCase().replace(/\s/g, ""))) {
    points += 1;
  }

  total += 1;
  if (result.ingredients.length === test.expected.ingredientCount) points += 1;
  else if (Math.abs(result.ingredients.length - test.expected.ingredientCount) <= 1) points += 0.5;

  total += 1;
  if (result.steps.length === test.expected.stepCount) points += 1;
  else if (Math.abs(result.steps.length - test.expected.stepCount) <= 1) points += 0.5;

  for (const expIng of test.expected.ingredients) {
    total += 2;
    const match = result.ingredients.find((ing) =>
      ing.name.toLowerCase().includes(expIng.nameContains.toLowerCase())
    );
    if (match) {
      points += 1;
      if (match.category === expIng.category) points += 1;
    }
  }

  for (const expStep of test.expected.steps) {
    total += 2;
    const match = result.steps.find((step) =>
      step.title.toLowerCase().includes(expStep.titleContains.toLowerCase()) ||
      step.description.toLowerCase().includes(expStep.titleContains.toLowerCase())
    );
    if (match) {
      points += 1;
      const timer = match.timerDuration ?? 0;
      if (timer === expStep.timerDuration || (expStep.timerDuration > 0 && timer > 0)) {
        points += 1;
      } else if (expStep.timerDuration === 0) {
        points += 1;
      }
    }
  }

  return { points, total, accuracy: (points / total) * 100 };
}

async function main() {
  const testPath = join(ROOT, "ml", "data", "recipe_test.json");
  const tests: RecipeTestCase[] = JSON.parse(readFileSync(testPath, "utf-8"));

  const latencies: number[] = [];
  let totalPoints = 0;
  let totalMax = 0;
  const perRecipe: Array<{ id: string; accuracyPercent: number }> = [];

  for (const test of tests) {
    const start = performance.now();
    const result = await parseRecipeText(test.recipeText);
    latencies.push(performance.now() - start);

    const { points, total, accuracy } = scoreRecipe(test, result);
    totalPoints += points;
    totalMax += total;
    perRecipe.push({ id: test.id, accuracyPercent: Math.round(accuracy * 100) / 100 });
  }

  latencies.sort((a, b) => a - b);
  const avgMs = latencies.reduce((a, b) => a + b, 0) / latencies.length;
  const p95Ms = latencies[Math.floor(latencies.length * 0.95)] ?? latencies[latencies.length - 1];

  const output = {
    overallTaskAccuracyPercent: Math.round((totalPoints / totalMax) * 10000) / 100,
    testRecipes: tests.length,
    perRecipe,
    latency: {
      avgMs: Math.round(avgMs * 100) / 100,
      p95Ms: Math.round(p95Ms * 100) / 100,
      minMs: Math.round(latencies[0] * 100) / 100,
      maxMs: Math.round(latencies[latencies.length - 1] * 100) / 100,
    },
  };

  console.log(JSON.stringify(output));
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
