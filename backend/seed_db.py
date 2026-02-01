from utils.db import insert_product
from pathlib import Path


def seed_products_from_dataset():
    """
    Seed the SQLite database with products based on your YOLO dataset.

    We read 'dataset/data.yaml' to get the class names and create
    one product per class with a demo price.
    """
    dataset_yaml = Path(__file__).resolve().parent.parent / "dataset" / "data.yaml"

    if not dataset_yaml.exists():
        print(f"data.yaml not found at: {dataset_yaml}")
        return

    try:
        import yaml  # type: ignore
    except ImportError:
        print("pyyaml is not installed. Run 'pip install pyyaml' in the backend venv.")
        return

    with open(dataset_yaml, "r", encoding="utf-8") as f:
        data = yaml.safe_load(f)

    class_names = data.get("names", [])
    if isinstance(class_names, dict):
        # When names is a dict like {0: 'object', 1: 'other'}
        class_names = [class_names[k] for k in sorted(class_names.keys())]

    if not class_names:
        print("No class names found in data.yaml")
        return

    # Simple demo pricing: 100, 110, 120, ... per class
    products = []
    base_price = 100.0
    for idx, name in enumerate(class_names):
        products.append((name, base_price + idx * 10.0))

    for name, price in products:
        insert_product(name, price)
        print(f"Inserted dataset-based product: {name} -> ₹{price}")


if __name__ == "__main__":
    seed_products_from_dataset()
    print("✅ Dataset-based products seeded into SQLite (database.db)")

