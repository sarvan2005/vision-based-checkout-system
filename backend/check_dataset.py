import os
import yaml
from pathlib import Path
from PIL import Image

def check_dataset():
    base_dir = Path("../dataset").resolve()
    yaml_path = base_dir / "data.yaml"
    
    if not yaml_path.exists():
        print(f"Error: {yaml_path} not found.")
        return

    with open(yaml_path, "r") as f:
        data = yaml.safe_load(f)

    print(f"Classes ({data.get('nc')}): {data.get('names')}")
    
    # Check paths
    splits = ['train', 'val', 'test']
    for split in splits:
        if split not in data:
            continue
        rel_path = data[split]
        # YOLO resolves relative to data.yaml
        split_path = (base_dir / rel_path).resolve()
        
        print(f"\nChecking split: {split}")
        print(f"Resolved path: {split_path}")
        
        if not split_path.exists():
            print(f"  [ERROR] Path does not exist: {split_path}")
            print(f"  Suggestion: Update {split} path in data.yaml!")
            continue
            
        # Count images
        images = list(split_path.glob("*.jpg")) + list(split_path.glob("*.png")) + list(split_path.glob("*.jpeg"))
        print(f"  Found {len(images)} images.")
        
        # Check corrupt images and labels
        label_dir = split_path.parent / "labels"
        if not label_dir.exists():
            print(f"  [WARNING] Labels directory not found at: {label_dir}")
        else:
            labels = list(label_dir.glob("*.txt"))
            print(f"  Found {len(labels)} labels.")
            if len(images) != len(labels):
                print(f"  [WARNING] Mismatch: {len(images)} images vs {len(labels)} labels")

        corrupt = 0
        for img_path in images:
            try:
                with Image.open(img_path) as img:
                    img.verify()
            except Exception as e:
                print(f"  [ERROR] Corrupt image: {img_path} - {e}")
                corrupt += 1
        if corrupt == 0 and len(images)>0:
            print("  All images are readable.")

if __name__ == "__main__":
    check_dataset()
