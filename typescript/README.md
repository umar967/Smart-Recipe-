# TypeScript Application Code

All application logic lives in this folder. Open this directory to review the full Smart Recipe Deconstructor codebase.

## File map

| File / folder | Purpose |
|---------------|---------|
| `main.tsx` | App entry point — mounts React to the page |
| `App.tsx` | Main app: navigation, state, recipe history, shopping list |
| `types.ts` | TypeScript interfaces (`Recipe`, `Ingredient`, `CookingStep`, etc.) |
| `presets.ts` | Demo recipe presets (Sourdough, Pasta, Steak) |
| `index.css` | Global styles and color theme |
| `components/` | UI screens (Input, Dashboard, Shopping List) |
| `ml/` | On-device AI: recipe parser + ingredient category classifier |
| `server.ts` | Local dev server (hosts the web app) |
| `evaluate-offline.ts` | ML accuracy evaluation script |

## ML module (`ml/`)

| File | Purpose |
|------|---------|
| `deconstructRecipe.ts` | Public API — called when user clicks "Deconstruct Recipe" |
| `recipeParser.ts` | Parses unstructured recipe text into structured JSON |
| `categoryClassifier.ts` | Classifies ingredients (Produce, Pantry, Dairy, etc.) |

## UI components (`components/`)

| File | Purpose |
|------|---------|
| `InputScreen.tsx` | Recipe paste input and presets |
| `DashboardScreen.tsx` | Ingredients, steps, timers, yield scaling |
| `ShoppingListScreen.tsx` | Categorized shopping list |

## Run in browser

From the project root:

```bash
npm install
npm run dev
```

Then open **http://localhost:3000** in your browser.

## Other project folders (not TypeScript)

| Folder | Purpose |
|--------|---------|
| `../ml/` | Python model training scripts |
| `../public/` | Trained model files and evaluation metrics |
| `../android/` | Android APK build (Capacitor) |
| `../config/` | Vite build configuration |
