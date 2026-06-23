import { Recipe } from "./types";

export interface PresetRecipe {
  name: string;
  description: string;
  rawText: string;
  fallbackRecipe: Recipe; // realistic fallback if offline/no API key is detected
}

export const PRESETS: PresetRecipe[] = [
  {
    name: "Artisanal Sourdough",
    description: "Classic wild-yeast sourdough bread with a crispy golden crust.",
    rawText: `Artisanal Sourdough Bread Recipe
Yield: 1x Batch

Ingredients:
- 500g Strong Bread Flour (Pantry)
- 350g Filtered Water (Pantry)
- 100g Active Sourdough Starter (Other)
- 10g Sea Salt (Pantry)

Cooking Steps:
1. Autolyse: Mix the flour and water together in a large bowl until no dry flour remains. Cover and let it rest for 30 minutes to allow the flour to fully hydrate before adding yeast/starter. TIMER: 1800s.
2. Incorporate Starter: Gently dimple the active starter into the dough using wet hands. Fold the dough over itself for 15 minutes until fully integrated. TIMER: 900s.
3. Adding Salt: Sprinkle the sea salt over the dough. Fold and squeeze the dough to thoroughly distribute the salt throughout. Knead gently for 5 minutes. TIMER: 300s.
4. Keep & Bulk Ferment: Let the dough ferment at warm room temperature. Perform stretch-and-folds every 30 minutes for 2 hours to develop high gluten structure. TIMER: 7200s.
5. Shape and Retard: Shape the dough into a tight round boule, place inside a floured banneton basket, cover with a towel, and let proof in the refrigerator overnight. TIMER: 28800s.`,
    fallbackRecipe: {
      id: "artisanal-sourdough",
      recipeName: "Artisanal Sourdough",
      yieldText: "1x Batch",
      imageUrl: undefined,
      ingredients: [
        { name: "Strong Bread Flour", amountText: "500g", numericValue: 500, unit: "g", category: "Pantry" },
        { name: "Filtered Water", amountText: "350g", numericValue: 350, unit: "g", category: "Pantry" },
        { name: "Active Sourdough Starter", amountText: "100g", numericValue: 100, unit: "g", category: "Other" },
        { name: "Sea Salt", amountText: "10g", numericValue: 10, unit: "g", category: "Pantry" },
      ],
      steps: [
        { stepNumber: 1, title: "Autolyse", description: "Mix the flour and water together in a large bowl until no dry flour remains. Cover and let it rest to allow the flour to fully hydrate and build gluten before adding the starter.", timerDuration: 1800 },
        { stepNumber: 2, title: "Incorporate Starter", description: "Gently dimple the active starter into the dough using wet hands. Fold the dough over itself for 15 minutes until fully integrated.", timerDuration: 900 },
        { stepNumber: 3, title: "Adding Salt", description: "Sprinkle the sea salt over the dough. Fold and squeeze the dough to thoroughly distribute the salt throughout. Knead gently for 5 minutes.", timerDuration: 300 },
        { stepNumber: 4, title: "Stretch and Folds", description: "Let the dough ferment. Perform stretch-and-folds every 30 minutes for 2 hours to develop high gluten structure.", timerDuration: 7200 },
        { stepNumber: 5, title: "Shape & Proof", description: "Shape the dough into a tight boule, place inside a floured banneton basket, and let proof overnight in the refrigerator.", timerDuration: 28800 },
      ]
    }
  },
  {
    name: "Tuscan Garlic Pasta",
    description: "A decadent creamy garlic pasta with fresh spinach and heirloom cherry tomatoes.",
    rawText: `Creamy Tuscan Garlic Pasta
Yield: 4 Servings

Ingredients:
- 350g Specialty Pasta Noodles (Pantry)
- 3 large Organic Heirloom Tomatoes (Produce)
- 1 bunch Fresh Sweet Basil (Produce)
- 6 Cloves of Garlic (Produce)
- 250g Baby Spinach (Produce)
- 30ml Cold Pressed Olive Oil (Pantry)
- 250g Unsalted Grass-fed Butter (Dairy)
- 1.5 cups Heavy Cream (Dairy)

Cooking Steps:
1. Prep Vegetables: Halve the cherry tomatoes, chop the fresh sweet basil leaves, mince the fresh garlic, and wash the baby spinach. TIMER: 300s.
2. Cook Pasta: In a large pot of boiling salted water, cook the pasta for 9 minutes until al dente. Drain, reserving 1/2 cup pasta water. TIMER: 540s.
3. Cook Aromatics: Heat the cold pressed olive oil and melt half the butter in a large skillet. Add minced garlic and sauté over medium heat for 2 minutes until fragrant. TIMER: 120s.
4. Sauté Tomatoes & Spinach: Add the heirloom cherry tomatoes to the skillet, cook for 4 minutes till soft. Then toss in the baby spinach and basil, sautéing for 3 minutes until spinach is wilted. TIMER: 420s.
5. Finish Cream Sauce: Pour in heavy cream and the remaining butter. Simmer for 5 minutes until thick. Season, toss in your pasta noodles, and mix nicely to combine. TIMER: 300s.`,
    fallbackRecipe: {
      id: "tuscan-pasta",
      recipeName: "Tuscan Garlic Pasta",
      yieldText: "4 Servings",
      imageUrl: undefined,
      ingredients: [
        { name: "Garlic Cloves", amountText: "6 cloves", numericValue: 6, unit: "cloves", category: "Produce" },
        { name: "Organic Heirloom Tomatoes", amountText: "3 large", numericValue: 3, unit: "large", category: "Produce" },
        { name: "Fresh Sweet Basil", amountText: "1 bunch", numericValue: 1, unit: "bunch", category: "Produce" },
        { name: "Baby Spinach", amountText: "250g", numericValue: 250, unit: "g", category: "Produce" },
        { name: "Specialty Pasta Noodles", amountText: "350g", numericValue: 350, unit: "g", category: "Pantry" },
        { name: "Cold Pressed Olive Oil", amountText: "30ml", numericValue: 30, unit: "ml", category: "Pantry" },
        { name: "Unsalted Grass-fed Butter", amountText: "250g", numericValue: 250, unit: "g", category: "Dairy" },
        { name: "Heavy Cream", amountText: "1.5 cups", numericValue: 1.5, unit: "cups", category: "Dairy" },
      ],
      steps: [
        { stepNumber: 1, title: "Prep Vegetables", description: "Halve the organic heirloom tomatoes, slice the basil, mince the garlic cloves, and wash the baby spinach.", timerDuration: 300 },
        { stepNumber: 2, title: "Cook Pasta", description: "Cook the noodles in a large pot of boiling salted water for 9 minutes until al dente.", timerDuration: 540 },
        { stepNumber: 3, title: "Sauté Garlic & Herbs", description: "Sauté the minced garlic in warm olive oil and melted butter for 2 minutes.", timerDuration: 120 },
        { stepNumber: 4, title: "Cook Tomatoes & Spinach", description: "Add tomatoes to the skillet for 4 minutes, then add the baby spinach and sweet basil until wilted.", timerDuration: 420 },
        { stepNumber: 5, title: "Finish Tuscan Sauce", description: "Pour in heavy cream and melt remaining butter. Toss with the pasta until beautifully creamy.", timerDuration: 300 },
      ]
    }
  },
  {
    name: "Matured Ribeye Steak",
    description: "An incredibly tender cast-iron seared ribeye basted in garlic and fresh rosemary butter.",
    rawText: `Cast Iron Basted Ribeye Steak
Yield: 2 Servings

Ingredients:
- 2 prime Ribeye Steaks (Meat)
- 4 sprigs Fresh Rosemary (Produce)
- 5 cloves Garlic (Produce)
- 50g Unsalted Grass-fed Butter (Dairy)
- 30ml Canola Oil (Pantry)
- 10g Fresh Ground Sea Salt (Pantry)

Cooking Steps:
1. Dry & Season: Place ribeye steaks on a paper towel, pat them completely dry on all surfaces. Generously coat both sides with sea salt. Let sit for 15 minutes. TIMER: 900s.
2. Heat Pan: Preheat your cast iron skillet over high heat until smoking. Pour in canola oil, wait until shimmering. TIMER: 120s.
3. Sear Steak: Lay steaks gently in the pan. Sear on high heat for 2 minutes without moving, flip and sear the other side for 2 minutes to lock in juices. TIMER: 240s.
4. Butter Bastes: Lower the heat to medium. Toss in butter, crushed whole garlic cloves, and fresh rosemary sprigs. Tilt the pan and continuously baste the warm foaming butter over the steaks for 3 minutes. TIMER: 180s.
5. Rest Meat: Plate the steaks, pour remaining pan juices over them, and let rest for 6 minutes before slicing. TIMER: 360s.`,
    fallbackRecipe: {
      id: "ribeye-steak",
      recipeName: "Matured Ribeye Steak",
      yieldText: "2 Servings",
      imageUrl: undefined,
      ingredients: [
        { name: "Prime Ribeye Steaks", amountText: "2 steaks", numericValue: 2, unit: "steaks", category: "Meat" },
        { name: "Fresh Rosemary Sprigs", amountText: "4 sprigs", numericValue: 4, unit: "sprigs", category: "Produce" },
        { name: "Garlic Cloves", amountText: "5 cloves", numericValue: 5, unit: "cloves", category: "Produce" },
        { name: "Unsalted Grass-fed Butter", amountText: "50g", numericValue: 50, unit: "g", category: "Dairy" },
        { name: "Canola Oil", amountText: "30ml", numericValue: 30, unit: "ml", category: "Pantry" },
        { name: "Fresh Ground Sea Salt", amountText: "10g", numericValue: 10, unit: "g", category: "Pantry" },
      ],
      steps: [
        { stepNumber: 1, title: "Dry & Season", description: "Pat steaks totally dry, season heavily with sea salt, and let them absorb the flavor for 15 minutes.", timerDuration: 900 },
        { stepNumber: 2, title: "Preheat Cast Iron", description: "Heat cast iron skillet over high heat until smoking, add canola oil.", timerDuration: 120 },
        { stepNumber: 3, title: "Sear Medium-Rare", description: "Laying steaks in pan, sear for 2 minutes per side undisturbed.", timerDuration: 240 },
        { stepNumber: 4, title: "Aromatic Butter Basting", description: "Reduce heat to medium, toss in butter, crushed garlic, and rosemary sprigs. Baste butter over top for 3 minutes.", timerDuration: 180 },
        { stepNumber: 5, title: "Rest Meat", description: "Remove to board, pour juices over steaks, and rest for 6 minutes before serving.", timerDuration: 360 },
      ]
    }
  }
];
