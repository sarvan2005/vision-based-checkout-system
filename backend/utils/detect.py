from ultralytics import YOLO
import numpy as np
import os

# Load your trained YOLO model (update path after training completes)
# For now, fallback to pretrained if trained model doesn't exist
model_path = "runs/detect/checkout_final/weights/best.pt"
if os.path.exists(model_path):
    print(f"[INFO] Loading trained model from: {model_path}")
    model = YOLO(model_path)
else:
    print(f"[WARNING] Trained model not found at {model_path}, using pretrained model")
    print("[WARNING] This pretrained model won't detect your custom products!")
    model = YOLO("models/yolov8n.pt")


def run_detection(image, conf_threshold=0.25):
    """
    Runs YOLO object detection on a PIL image.
    Returns a list of detections with bbox + confidence + class_name.
    
    Args:
        image: PIL Image
        conf_threshold: Minimum confidence threshold (default: 0.25)
    """

    # Run model with VERY low confidence so we can catch "hand" even if weak
    # We will filter other objects by conf_threshold manually later
    # Passing the PIL image directly allows YOLO to handle RGB/BGR correctly
    results = model.predict(image, conf=0.1, verbose=False)

    detections = []

    print(f"[DEBUG] Raw detections: {len(results[0].boxes)}")
    for box in results[0].boxes:
        x1, y1, x2, y2 = box.xyxy[0].tolist()
        conf = float(box.conf[0])
        class_id = int(box.cls[0])
        
        # Get class name from model
        class_name = model.names[class_id] if hasattr(model, 'names') else "object"
        print(f"[DEBUG] Found: {class_name} ({conf:.2f})")
        
        # HAND DETECTION RULE:
        # If it's a "hand", we KEEP it regardless of confidence (or with very low conf).
        # For everything else, we enforce the passed `conf_threshold`.
        if class_name.lower() == "hand":
            pass # Keep it!
        elif conf < conf_threshold:
            print(f"[DEBUG] Skipped {class_name} due to low confidence")
            continue # Skip weak detections for other objects

        detections.append({
            "bbox": [x1, y1, x2, y2],  # JSON-friendly
            "confidence": conf,
            "class_name": class_name,
            "class_id": class_id
        })

    detection_names = [d['class_name'] for d in detections]
    print(f"[DEBUG] Final detections: {detection_names}")
    
    # Write to file for debugging (Agent access)
    try:
        with open("debug_log.txt", "w") as f:
            f.write(f"Raw Box Count: {len(results[0].boxes)}\n")
            for box in results[0].boxes:
                cls_id = int(box.cls[0])
                name = model.names[cls_id] if hasattr(model, 'names') else str(cls_id)
                conf = float(box.conf[0])
                f.write(f"Found: {name} ({conf:.2f})\n")
    except Exception:
        pass

    return detections
