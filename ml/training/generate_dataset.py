"""Generate synthetic ingredient category training data for the offline model.
Test set uses entirely unseen ingredient names to measure true generalization."""
import json
import random
from pathlib import Path

CATEGORIES = ["Produce", "Pantry", "Dairy", "Meat", "Bakery", "Other"]

# Split each category into seen (train) and unseen (test) ingredient names.
# ~25% of names per category are held out so the model must generalize.
SEEDS = {
    "Produce": {
        "seen": [
            "Organic Heirloom Tomatoes", "Fresh Sweet Basil", "Baby Spinach",
            "Fresh Rosemary Sprigs", "Red Bell Pepper", "Lemon Zest",
            "Ginger Root", "Avocado", "Cherry Tomatoes", "Kale Leaves",
            "Scallions", "Jalapeño Pepper", "Fresh Parsley", "Lime Juice",
            "Mushrooms", "Zucchini", "Carrots", "Celery Stalk",
        ],
        "unseen": [
            "Garlic Cloves", "Yellow Onion", "Fresh Cilantro",
            "Fresh Thyme", "Fresh Mint", "Shallots",
        ],
    },
    "Pantry": {
        "seen": [
            "Strong Bread Flour", "Filtered Water", "Sea Salt",
            "Arborio Rice", "Canola Oil", "Pasta Noodles", "Black Pepper",
            "All-Purpose Flour", "Chicken Stock", "Soy Sauce", "Honey",
            "Canned Tomatoes", "Rolled Oats", "Coconut Milk", "Maple Syrup",
            "Cumin", "Bay Leaves", "Vanilla Extract",
        ],
        "unseen": [
            "Cold Pressed Olive Oil", "Sugar", "Balsamic Vinegar",
            "Paprika", "Baking Powder", "Cornstarch",
        ],
    },
    "Dairy": {
        "seen": [
            "Unsalted Grass-fed Butter", "Heavy Cream", "Whole Milk",
            "Greek Yogurt", "Sour Cream", "Cream Cheese",
            "Buttermilk", "Mascarpone", "Ricotta",
        ],
        "unseen": [
            "Parmesan Cheese", "Mozzarella", "Cheddar Cheese",
            "Feta Cheese", "Goat Cheese",
        ],
    },
    "Meat": {
        "seen": [
            "Prime Ribeye Steaks", "Chicken Breast", "Ground Beef",
            "Salmon Fillet", "Bacon Strips", "Italian Sausage",
            "Turkey Breast", "Shrimp",
        ],
        "unseen": [
            "Pork Tenderloin", "Lamb Chops", "Duck Breast", "Prosciutto",
        ],
    },
    "Bakery": {
        "seen": [
            "Sourdough Loaf", "Brioche Buns", "Pita Bread",
            "Baguette", "Croissants",
        ],
        "unseen": [
            "Tortilla Wraps", "English Muffins", "Naan Bread",
        ],
    },
    "Other": {
        "seen": [
            "Active Sourdough Starter", "Nutritional Yeast", "Tofu Block",
            "Capers", "Olives",
        ],
        "unseen": [
            "Wine", "Beer", "Pickles", "Miso Paste",
        ],
    },
}

MODIFIERS = [
    "", "Organic ", "Fresh ", "Premium ", "Artisan ", "Wild ", "Free-Range ",
    "Cold-Pressed ", "Extra-Virgin ", "Unsalted ", "Grass-Fed ", "Heirloom ",
]


def augment_name(name: str) -> str:
    prefix = random.choice(MODIFIERS)
    if prefix and name.lower().startswith(prefix.strip().lower()):
        return name
    return f"{prefix}{name}"


def generate_samples(per_category: int = 120, use_unseen: bool = False) -> list[dict]:
    samples: list[dict] = []
    key = "unseen" if use_unseen else "seen"
    for category, names in SEEDS.items():
        pool = names[key]
        for _ in range(per_category):
            base = random.choice(pool)
            samples.append({"text": augment_name(base), "category": category})
    random.shuffle(samples)
    return samples


def main() -> None:
    random.seed(42)
    train = generate_samples(per_category=500, use_unseen=False)
    test = generate_samples(per_category=30, use_unseen=True)

    data_dir = Path(__file__).resolve().parent.parent / "data"
    data_dir.mkdir(parents=True, exist_ok=True)

    (data_dir / "train.json").write_text(json.dumps(train, indent=2), encoding="utf-8")
    (data_dir / "test.json").write_text(json.dumps(test, indent=2), encoding="utf-8")
    print(f"Wrote {len(train)} train (seen seeds) / {len(test)} test (unseen seeds) samples to {data_dir}")


if __name__ == "__main__":
    main()
