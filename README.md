<div align="center">

# Smart Recipe Constructor

Offline edge AI — privacy-first recipe parsing with no API calls.

</div>

## Project structure

```
Smart-Recipe-/
├── typescript/          ← ALL application code (show this to your teacher)
│   ├── App.tsx
│   ├── main.tsx
│   ├── types.ts
│   ├── presets.ts
│   ├── components/      UI screens
│   ├── ml/              On-device AI inference
│   ├── server.ts        Dev server
│   └── evaluate-offline.ts
├── ml/                  Python training pipeline
├── public/models/       Trained model + evaluation metrics
├── android/             Android APK (Capacitor)
├── config/              Vite build config
├── index.html           Web entry HTML
└── package.json
```

## Open in web browser

**Prerequisites:** [Node.js](https://nodejs.org/) installed

```bash
npm install
npm run ml:all    # optional: train model (first time)
npm run dev
```

Open in your browser: **http://localhost:3000**

No API keys required. Recipe construction runs fully on-device.

## Assignment deliverables

| Requirement | Result |
|-------------|--------|
| Model < 50 MB | ~0.10 MB (`public/models/category_model.json`) |
| 100% offline | Browser / Android WebView |
| ≥ 90% accuracy | 94.64% (see `public/models/evaluation_metrics.json`) |
| < 2 s latency | ~75 ms p95 |
| Demo + metrics + model | Web app + Android project + JSON metrics |

## Android APK

```bash
npm run build
npx cap sync
npx cap open android
```

Build APK in Android Studio: **Build → Build APK**.

## ML pipeline (Python)

```bash
pip install -r ml/requirements.txt
npm run ml:all
```

See `typescript/README.md` for a full file-by-file guide to the TypeScript code.
