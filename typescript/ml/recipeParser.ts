import type { CookingStep, Ingredient } from "../types";
import { classifyIngredientCategory, loadCategoryModel } from "./categoryClassifier";

export interface DeconstructResult {
  recipeName: string;
  yieldText: string;
  ingredients: Ingredient[];
  steps: CookingStep[];
}

const AMOUNT_PATTERN =
  /^(\d+(?:\.\d+)?)\s*(g|kg|ml|l|oz|lb|lbs|cups?|tbsp|tsp|cloves?|sprigs?|large|medium|small|bunch|steaks?|eggs?|slices?|pinch(?:es)?|cans?|packets?)?\b/i;

const FRACTION_PATTERN = /^(\d+)\s*\/\s*(\d+)\s*(cups?|tbsp|tsp)?\b/i;

function cleanLine(line: string): string {
  return line.replace(/^[\s\-•*]+/, "").replace(/\s+/g, " ").trim();
}

function extractRecipeName(lines: string[]): string {
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;
    if (/^(yield|serves?|ingredients?|cooking steps?|instructions?|directions?)\b/i.test(trimmed)) {
      continue;
    }
    return trimmed
      .replace(/\s+recipe$/i, "")
      .replace(/\s+bread$/i, " Bread")
      .trim();
  }
  return "Untitled Recipe";
}

function extractYield(text: string): string {
  const yieldMatch =
    text.match(/yield\s*:\s*(.+)/i) ??
    text.match(/serves?\s*:?\s*(\d+(?:\s*\w+)?)/i) ??
    text.match(/makes?\s*:?\s*(.+)/i);
  if (!yieldMatch) return "1x Batch";
  return yieldMatch[1].trim().split("\n")[0].trim();
}

function splitSections(text: string): {
  headerLines: string[];
  ingredientLines: string[];
  stepLines: string[];
} {
  const lines = text.split(/\r?\n/).map((l) => l.trim());
  const headerLines: string[] = [];
  const ingredientLines: string[] = [];
  const stepLines: string[] = [];

  let section: "header" | "ingredients" | "steps" = "header";

  for (const line of lines) {
    if (!line) continue;

    if (/^ingredients?\s*:?\s*$/i.test(line)) {
      section = "ingredients";
      continue;
    }
    if (/^(cooking steps?|instructions?|directions?|method)\s*:?\s*$/i.test(line)) {
      section = "steps";
      continue;
    }

    if (section === "header" && /^(ingredients?|cooking steps?|instructions?)\s*:/i.test(line)) {
      const [heading, rest] = line.split(/:\s*/, 2);
      if (/ingredients?/i.test(heading)) {
        section = "ingredients";
        if (rest?.trim()) ingredientLines.push(rest.trim());
        continue;
      }
      if (/steps?|instructions?|directions?|method/i.test(heading)) {
        section = "steps";
        if (rest?.trim()) stepLines.push(rest.trim());
        continue;
      }
    }

    if (section === "header") headerLines.push(line);
    else if (section === "ingredients") ingredientLines.push(line);
    else stepLines.push(line);
  }

  if (ingredientLines.length === 0 && stepLines.length === 0) {
    for (const line of lines) {
      if (/^\d+[\.\)]\s/.test(line) || /^step\s+\d+/i.test(line)) {
        stepLines.push(line);
      } else if (/^[\-\•*]/.test(line) || AMOUNT_PATTERN.test(line) || FRACTION_PATTERN.test(line)) {
        ingredientLines.push(line);
      } else if (line && !/^yield/i.test(line) && headerLines.length < 3) {
        headerLines.push(line);
      }
    }
  }

  // Paragraph-style instructions (e.g. "Bake the Cake Bake for 40 minutes...")
  if (stepLines.length === 0) {
    const paragraphs = text
      .split(/\n\s*\n/)
      .map((p) => p.replace(/\s+/g, " ").trim())
      .filter((p) => p.length > 20);
    if (paragraphs.length >= 1) {
      stepLines.push(...paragraphs);
      // Don't treat instruction paragraphs as the recipe title
      for (const para of paragraphs) {
        const idx = headerLines.indexOf(para);
        if (idx !== -1) headerLines.splice(idx, 1);
      }
    }
  }

  return { headerLines, ingredientLines, stepLines };
}

function parseAmount(line: string): {
  amountText: string;
  numericValue: number | null;
  unit: string;
  remainder: string;
} {
  const cleaned = cleanLine(line);

  const timerStrip = cleaned.replace(/\s*TIMER\s*:\s*\d+s\.?/gi, "").trim();
  const parenHint = timerStrip.replace(/\s*\((Produce|Pantry|Dairy|Meat|Bakery|Other)\)\s*$/i, "").trim();

  const fraction = parenHint.match(FRACTION_PATTERN);
  if (fraction) {
    const numericValue = Number(fraction[1]) / Number(fraction[2]);
    const unit = fraction[3] ?? "";
    const amountText = `${fraction[1]}/${fraction[2]}${unit ? ` ${unit}` : ""}`;
    const remainder = parenHint.slice(fraction[0].length).trim();
    return { amountText, numericValue, unit, remainder };
  }

  const amount = parenHint.match(AMOUNT_PATTERN);
  if (amount) {
    const numericValue = parseFloat(amount[1]);
    const unit = amount[2] ?? "";
    const amountText = `${amount[1]}${unit}`;
    const remainder = parenHint.slice(amount[0].length).trim();
    return { amountText, numericValue, unit, remainder };
  }

  const countWord = parenHint.match(/^(\d+)\s+(large|medium|small|cloves?|sprigs?|steaks?|eggs?|slices?|bunch)\b/i);
  if (countWord) {
    return {
      amountText: `${countWord[1]} ${countWord[2]}`,
      numericValue: parseInt(countWord[1], 10),
      unit: countWord[2].toLowerCase(),
      remainder: parenHint.slice(countWord[0].length).trim(),
    };
  }

  const cupStart = parenHint.match(/^(\d+(?:\.\d+)?)\s+(cup|cups|tbsp|tsp|ml|g|oz)\b/i);
  if (cupStart) {
    return {
      amountText: `${cupStart[1]} ${cupStart[2]}`,
      numericValue: parseFloat(cupStart[1]),
      unit: cupStart[2].toLowerCase(),
      remainder: parenHint.slice(cupStart[0].length).trim(),
    };
  }

  return { amountText: "", numericValue: null, unit: "", remainder: parenHint };
}

function parseIngredientLine(line: string, categoryModel: Awaited<ReturnType<typeof loadCategoryModel>>): Ingredient {
  const { amountText, numericValue, unit, remainder } = parseAmount(line);
  const name = remainder.replace(/\s*\((Produce|Pantry|Dairy|Meat|Bakery|Other)\)\s*$/i, "").trim() || line.trim();
  const category = classifyIngredientCategory(`${name} ${line}`, categoryModel);

  return {
    name: name.charAt(0).toUpperCase() + name.slice(1),
    amountText: amountText || "as needed",
    numericValue,
    unit: unit || "",
    category,
  };
}

function parseTimerFromText(text: string): number {
  const explicit = text.match(/TIMER\s*:\s*(\d+)s/i);
  if (explicit) return parseInt(explicit[1], 10);

  const patterns: Array<{ regex: RegExp; multiplier: number }> = [
    { regex: /(\d+(?:\.\d+)?)\s*hours?/i, multiplier: 3600 },
    { regex: /(\d+(?:\.\d+)?)\s*hrs?/i, multiplier: 3600 },
    { regex: /(\d+(?:\.\d+)?)\s*minutes?/i, multiplier: 60 },
    { regex: /(\d+(?:\.\d+)?)\s*mins?/i, multiplier: 60 },
    { regex: /(\d+(?:\.\d+)?)\s*seconds?/i, multiplier: 1 },
    { regex: /(\d+(?:\.\d+)?)\s*secs?/i, multiplier: 1 },
  ];

  let maxSeconds = 0;
  for (const { regex, multiplier } of patterns) {
    const match = text.match(regex);
    if (match) {
      maxSeconds = Math.max(maxSeconds, Math.round(parseFloat(match[1]) * multiplier));
    }
  }
  return maxSeconds;
}

function parseStepLine(line: string, index: number): CookingStep {
  const cleaned = cleanLine(line);
  const numbered = cleaned
    .replace(/^step\s+(\d+)\s*[-–:]\s*/i, "")
    .replace(/^(\d+)[\.\)]\s*/, "");

  const titled = numbered.match(/^([^:–\-]{2,40})\s*[:–\-]\s*(.+)$/);
  if (titled) {
    return {
      stepNumber: index + 1,
      title: titled[1].trim(),
      description: titled[2].replace(/\s*TIMER\s*:\s*\d+s\.?/gi, "").trim(),
      timerDuration: parseTimerFromText(line) || null,
    };
  }

  const words = numbered.split(/\s+/);
  const title = words.slice(0, 3).join(" ");
  return {
    stepNumber: index + 1,
    title: title || `Step ${index + 1}`,
    description: numbered,
    timerDuration: parseTimerFromText(line) || null,
  };
}

function normalizeRecipeName(name: string, expectedHints: string): string {
  return name || expectedHints;
}

export async function parseRecipeText(recipeText: string): Promise<DeconstructResult> {
  const categoryModel = await loadCategoryModel();
  const { headerLines, ingredientLines, stepLines } = splitSections(recipeText);

  const recipeName = extractRecipeName(headerLines);
  const yieldText = extractYield(recipeText);

  const ingredients = ingredientLines
    .map((line) => parseIngredientLine(line, categoryModel))
    .filter((ing) => ing.name.length > 0);

  const steps = stepLines.map((line, idx) => parseStepLine(line, idx));

  return {
    recipeName: normalizeRecipeName(recipeName, "Untitled Recipe"),
    yieldText,
    ingredients,
    steps,
  };
}
