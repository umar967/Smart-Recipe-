"""Train a lightweight TF-IDF + logistic regression ingredient category classifier."""
import json
from pathlib import Path

import joblib
import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.pipeline import Pipeline

ROOT = Path(__file__).resolve().parent.parent
DATA_DIR = ROOT / "data"
ARTIFACTS_DIR = ROOT / "artifacts"
PUBLIC_MODEL_DIR = Path(__file__).resolve().parent.parent.parent / "public" / "models"


def export_for_typescript(pipeline: Pipeline, out_path: Path) -> None:
    """Export model weights as compact JSON for on-device TypeScript inference."""
    vectorizer: TfidfVectorizer = pipeline.named_steps["tfidf"]
    clf: LogisticRegression = pipeline.named_steps["clf"]

    vocab = vectorizer.vocabulary_
    idf = vectorizer.idf_.tolist()
    feature_names = vectorizer.get_feature_names_out().tolist()
    coefficients = clf.coef_.tolist()
    intercept = clf.intercept_.tolist()
    classes = clf.classes_.tolist()

    # Reverse vocabulary: token -> index
    token_to_idx = {token: int(idx) for token, idx in vocab.items()}

    payload = {
        "modelVersion": "1.0.0",
        "modelType": "tfidf-logistic-regression",
        "classes": classes,
        "vocabulary": token_to_idx,
        "idf": idf,
        "featureNames": feature_names,
        "coefficients": coefficients,
        "intercept": intercept,
        "ngramRange": list(vectorizer.ngram_range),
        "lowercase": vectorizer.lowercase,
    }

    out_path.parent.mkdir(parents=True, exist_ok=True)
    out_path.write_text(json.dumps(payload, separators=(",", ":")), encoding="utf-8")
    size_kb = out_path.stat().st_size / 1024
    print(f"Exported TypeScript model to {out_path} ({size_kb:.1f} KB)")


def main() -> None:
    train_path = DATA_DIR / "train.json"
    if not train_path.exists():
        from generate_dataset import main as gen_main
        gen_main()

    train_data = json.loads(train_path.read_text(encoding="utf-8"))
    texts = [row["text"] for row in train_data]
    labels = [row["category"] for row in train_data]

    pipeline = Pipeline([
        ("tfidf", TfidfVectorizer(ngram_range=(1, 2), min_df=1, max_features=800)),
        ("clf", LogisticRegression(max_iter=1000, C=4.0)),
    ])
    pipeline.fit(texts, labels)

    ARTIFACTS_DIR.mkdir(parents=True, exist_ok=True)
    joblib.dump(pipeline, ARTIFACTS_DIR / "category_classifier.joblib")

    export_for_typescript(pipeline, PUBLIC_MODEL_DIR / "category_model.json")
    print("Training complete.")


if __name__ == "__main__":
    main()
