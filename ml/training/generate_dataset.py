"""Generate synthetic ingredient category training data for the offline model."""
import json
import random
from pathlib import Path

CATEGORIES = ["Produce", "Pantry", "Dairy", "Meat", "Bakery", "Other"]

SEEDS = {
    "Produce": [
        "Organic Heirloom Tomatoes", "Fresh Sweet Basil", "Garlic Cloves", "Baby Spinach",
        "Fresh Rosemary Sprigs", "Yellow Onion", "Red Bell Pepper", "Lemon Zest",
        "Fresh Cilantro", "Ginger Root", "Avocado", "Cherry Tomatoes", "Kale Leaves",
        "Fresh Thyme", "Scallions", "Jalapeño Pepper", "Fresh Parsley", "Lime Juice",
        "Mushrooms", "Zucchini", "Carrots", "Celery Stalk", "Fresh Mint", "Shallots",
    ],
    "Pantry": [
        "Strong Bread Flour", "Filtered Water", "Sea Salt", "Cold Pressed Olive Oil",
        "Arborio Rice", "Canola Oil", "Pasta Noodles", "Black Pepper", "Sugar",
        "All-Purpose Flour", "Chicken Stock", "Soy Sauce", "Honey", "Balsamic Vinegar",
        "Canned Tomatoes", "Rolled Oats", "Coconut Milk", "Maple Syrup", "Paprika",
        "Cumin", "Bay Leaves", "Vanilla Extract", "Baking Powder", "Cornstarch",
    ],
    "Dairy": [
        "Unsalted Grass-fed Butter", "Heavy Cream", "Whole Milk", "Parmesan Cheese",
        "Greek Yogurt", "Sour Cream", "Cream Cheese", "Mozzarella", "Cheddar Cheese",
        "Buttermilk", "Mascarpone", "Ricotta", "Feta Cheese", "Goat Cheese",
    ],
    "Meat": [
        "Prime Ribeye Steaks", "Chicken Breast", "Ground Beef", "Pork Tenderloin",
        "Salmon Fillet", "Bacon Strips", "Italian Sausage", "Lamb Chops",
        "Turkey Breast", "Shrimp", "Duck Breast", "Prosciutto",
    ],
    "Bakery": [
        "Sourdough Loaf", "Brioche Buns", "Pita Bread", "Tortilla Wraps",
        "Baguette", "Croissants", "English Muffins", "Naan Bread",
    ],
    "Other": [
        "Active Sourdough Starter", "Nutritional Yeast", "Tofu Block", "Wine",
        "Beer", "Capers", "Olives", "Pickles", "Miso Paste",
    ],
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


def generate_samples(per_category: int = 120) -> list[dict]:
    samples: list[dict] = []
    for category, names in SEEDS.items():
        for _ in range(per_category):
            base = random.choice(names)
            samples.append({"text": augment_name(base), "category": category})
    random.shuffle(samples)
    return samples


def main() -> None:
    random.seed(42)
    all_samples = generate_samples()
    split = int(len(all_samples) * 0.8)
    train = all_samples[:split]
    test = all_samples[split:]

    data_dir = Path(__file__).resolve().parent.parent / "data"
    data_dir.mkdir(parents=True, exist_ok=True)

    (data_dir / "train.json").write_text(json.dumps(train, indent=2), encoding="utf-8")
    (data_dir / "test.json").write_text(json.dumps(test, indent=2), encoding="utf-8")
    print(f"Wrote {len(train)} train / {len(test)} test samples to {data_dir}")


if __name__ == "__main__":
    main()
