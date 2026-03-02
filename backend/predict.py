from ultralytics import YOLO
import cv2
from decision import apply_strict_checkout_rules  # ✅ IMPORT DECISION LOGIC

model = YOLO("runs/detect/checkout_final/weights/best.pt")
results = model("../dataset/valid/images", conf=0.25, iou=0.5)

for r in results:
    img = r.plot()

    detections = []
    for box in r.boxes:
        conf = float(box.conf[0])
        cls = int(box.cls[0])
        class_name = model.names[cls] if hasattr(model, 'names') else "object"
        detections.append({"class_name": class_name, "confidence": conf})
        
    decision, reason = apply_strict_checkout_rules(detections)
    print(f"decision={decision} → {reason}")

    cv2.imshow("Prediction", img)
    cv2.waitKey(0)

cv2.destroyAllWindows()
