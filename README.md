<div align="center">

# Smart Recipe Constructor

Offline edge AI — privacy-first recipe parsing with zero API calls.

**Course Assignment — Tiny, High-Accuracy Offline AI Model for Embedded App Use**

</div>

## Overview

Smart Recipe Constructor is a fully offline, on-device AI app that takes unstructured recipe text and breaks it down into structured ingredients (with category labels), step-by-step cooking instructions (with interactive timers), and a categorized shopping list — all running in the browser or as an Android APK with no internet dependency.

The core ML model is a TF-IDF + Logistic Regression ingredient category classifier (~0.1 MB), trained in Python/scikit-learn and exported as compact JSON for pure TypeScript inference.

---

## Key Constraints & Deliverables

| Requirement | Result | Location |
|---|---|---|
| **Model < 50 MB** | ✅ **~0.10 MB** | `public/models/category_model.json` |
| **100% offline** | ✅ No API calls, no internet needed | Runs in browser WebView |
| **≥ 90% task accuracy** | ✅ **94.64%** | `public/models/evaluation_metrics.json` |
| **< 2s latency** | ✅ **~65 ms p95** | Measured on 5 test recipes |
| **Working demo + metrics + model** | ✅ Web app + Android project + JSON | All in this repo |

### Cloud Benchmark Comparison

| Model | Accuracy | Latency | Internet | Cost/1K req |
|---|---|---|---|---|
| **SmartRecipeEdge (ours)** | **94.64%** | **~14 ms** | ❌ No | **$0.00** |
| Gemini 1.5 Flash | 96.5% | ~3,200 ms | ✅ Yes | $0.15 |
| GPT-4o Mini | 95.8% | ~2,800 ms | ✅ Yes | $0.30 |

---

## Quick Start

### Prerequisites

- [Node.js](https://nodejs.org/) v18+
- Python 3.10+ (only for ML training — optional)
- Java 17+ (only for Android APK build)

### Run in Browser (fully offline)

```bash
# 1. Install dependencies
npm install

# 2. (Optional) Train the ML model from scratch
pip install -r ml/requirements.txt
npm run ml:all

# 3. Start the dev server
npm run dev
```

Open **http://localhost:3000** — no API keys, no internet required.

### Build Android APK

```bash
# 1. Build the web app
npm run build

# 2. Sync with Capacitor
npx cap sync

# 3. Open in Android Studio
npx cap open android

# 4. In Android Studio: Build → Build APK(s)
#    APK output: android/app/build/outputs/apk/debug/
```

---

## Project Structure

```
Smart-Recipe-/
├── typescript/                ALL application source code
│   ├── main.tsx               React entry point
│   ├── App.tsx                Main app (navigation, state, routing)
│   ├── types.ts               TypeScript interfaces
│   ├── presets.ts             3 demo recipe presets
│   ├── gradient.ts            Offline gradient utility (replaces external images)
│   ├── server.ts              Express dev server
│   ├── evaluate-offline.ts    Offline evaluation runner (Node.js)
│   ├── components/
│   │   ├── InputScreen.tsx    Recipe paste input & preset loader
│   │   ├── DashboardScreen.tsx  Ingredient list, timers, yield scaling, export
│   │   └── ShoppingListScreen.tsx  Categorized shopping list
│   └── ml/
│       ├── deconstructRecipe.ts  Public API
│       ├── recipeParser.ts       Core text parser (regex + section split)
│       └── categoryClassifier.ts  TF-IDF + Logistic Regression inference
├── ml/                        Python ML training pipeline
│   ├── requirements.txt       scikit-learn, numpy, joblib
│   ├── data/                  train.json (2,306), test.json (578), recipe_test.json (5)
│   ├── training/
│   │   ├── generate_dataset.py  Synthetic data generator
│   │   ├── train.py             TF-IDF + Logistic Regression trainer
│   │   └── evaluate.py          Evaluation pipeline
│   └── artifacts/              Trained model (joblib)
├── public/models/             Exported model + evaluation metrics
├── android/                   Capacitor Android project
├── config/                    Vite + Tailwind build config
├── dist/                      Production build output
├── index.html                 Web entry point
└── package.json               Dependencies & scripts
```

---

## ML Pipeline (Python)

```bash
pip install -r ml/requirements.txt

# Run entire pipeline: generate data → train → evaluate
npm run ml:all

# Or step by step:
npm run ml:generate-data   # Generate synthetic ingredient samples
npm run ml:train           # Train TF-IDF + Logistic Regression model
npm run ml:evaluate        # Evaluate accuracy + latency
```

### Model Architecture

- **Vectorizer:** TF-IDF with n-gram range (1,2), max 800 features
- **Classifier:** Logistic Regression (C=4.0, max_iter=1000)
- **Classes:** Produce, Pantry, Dairy, Meat, Bakery, Other
- **Size:** ~0.1 MB (JSON export for browser)

### Evaluation

- 5 held-out test recipes (sourdough, pasta, steak, cookies, salad)
- Metrics: per-recipe accuracy, overall accuracy, latency (avg/p95/min/max)
- Cloud benchmark comparison against Gemini 1.5 Flash & GPT-4o Mini

---

## NPM Scripts

| Script | Description |
|---|---|
| `npm run dev` | Start dev server on port 3000 |
| `npm run build` | Production build (Vite + esbuild) |
| `npm run lint` | TypeScript type check |
| `npm run ml:all` | Full ML pipeline (train + evaluate) |
| `npm run cap:sync` | Build + sync Android project |
| `npm run cap:android` | Open Android project in Android Studio |

---

## Features

- **100% Offline** — No internet required after initial load
- **Recipe Parsing** — Extracts name, yield, ingredients (with amounts), and steps from unstructured text
- **Ingredient Categorization** — ML model classifies each ingredient into 6 categories
- **Interactive Timers** — Start/pause/reset per-step countdown timers with speech alerts
- **Yield Scaling** — Scale ingredients by 0.5x, 1x, or 2x
- **Shopping List** — Auto-generated categorized shopping list with manual add
- **Recipe Export** — Download recipes as plain text files
- **Recipe History** — Sidebar with saved/previous recipes
- **Persistent Storage** — All data saved to localStorage
- **Offline Visuals** — All images are CSS gradients (no external URLs)
- **Minimal Model Size** — Only ~0.1 MB for the entire ML model

See `typescript/README.md` for a detailed file-by-file guide.
