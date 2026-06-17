import type { Ingredient } from "../types";

export type IngredientCategory = Ingredient["category"];

interface CategoryModel {
  modelVersion: string;
  modelType: string;
  classes: IngredientCategory[];
  vocabulary: Record<string, number>;
  idf: number[];
  featureNames: string[];
  coefficients: number[][];
  intercept: number[];
  ngramRange: [number, number];
  lowercase: boolean;
}

let cachedModel: CategoryModel | null = null;

const KEYWORD_RULES: Array<{ pattern: RegExp; category: IngredientCategory }> = [
  { pattern: /\b(chicken|beef|pork|steak|lamb|turkey|bacon|sausage|salmon|shrimp|meat|ribeye|prosciutto|duck)\b/i, category: "Meat" },
  { pattern: /\b(milk|butter|cream|cheese|yogurt|egg|feta|mozzarella|cheddar|ricotta|mascarpone|buttermilk)\b/i, category: "Dairy" },
  { pattern: /\b(bread|bun|baguette|croissant|tortilla|naan|brioche|loaf|muffin)\b/i, category: "Bakery" },
  { pattern: /\b(tomato|basil|garlic|spinach|onion|pepper|lemon|lime|herb|rosemary|thyme|parsley|cilantro|ginger|avocado|mushroom|carrot|celery|zucchini|kale|shallot|jalapeño|cucumber)\b/i, category: "Produce" },
  { pattern: /\b(starter|yeast|tofu|wine|beer|miso)\b/i, category: "Other" },
];

function tokenize(text: string, lowercase: boolean): string[] {
  const normalized = lowercase ? text.toLowerCase() : text;
  return normalized.match(/[a-z0-9]+/gi) ?? [];
}

function buildNgrams(tokens: string[], ngramRange: [number, number]): string[] {
  const ngrams: string[] = [];
  for (let n = ngramRange[0]; n <= ngramRange[1]; n++) {
    for (let i = 0; i <= tokens.length - n; i++) {
      ngrams.push(tokens.slice(i, i + n).join(" "));
    }
  }
  return ngrams;
}

function softmax(logits: number[]): number[] {
  const max = Math.max(...logits);
  const exps = logits.map((v) => Math.exp(v - max));
  const sum = exps.reduce((a, b) => a + b, 0);
  return exps.map((v) => v / sum);
}

export async function loadCategoryModel(): Promise<CategoryModel> {
  if (cachedModel) return cachedModel;
  const response = await fetch("/models/category_model.json");
  if (!response.ok) {
    throw new Error("Failed to load on-device category model.");
  }
  cachedModel = (await response.json()) as CategoryModel;
  return cachedModel;
}

export function classifyIngredientCategory(name: string, model: CategoryModel): IngredientCategory {
  const hinted = name.match(/\((Produce|Pantry|Dairy|Meat|Bakery|Other)\)/i);
  if (hinted) {
    return hinted[1] as IngredientCategory;
  }

  for (const rule of KEYWORD_RULES) {
    if (rule.pattern.test(name)) {
      return rule.category;
    }
  }

  const tokens = tokenize(name, model.lowercase);
  const ngrams = buildNgrams(tokens, model.ngramRange);
  const tf = new Map<string, number>();
  for (const gram of ngrams) {
    tf.set(gram, (tf.get(gram) ?? 0) + 1);
  }

  const logits = model.intercept.map((bias, classIdx) => {
    let score = bias;
    for (const [gram, count] of tf) {
      const vocabIdx = model.vocabulary[gram];
      if (vocabIdx === undefined) continue;
      const tfidf = (1 + Math.log(count)) * model.idf[vocabIdx];
      score += tfidf * model.coefficients[classIdx][vocabIdx];
    }
    return score;
  });

  const probs = softmax(logits);
  const bestIdx = probs.indexOf(Math.max(...probs));
  return model.classes[bestIdx];
}
