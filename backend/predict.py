from ultralytics import YOLO
import cv2
from decision import checkout_decision  # ✅ IMPORT DECISION LOGIC

model = YOLO("runs/detect/checkout_v1/weights/best.pt")
results = model("../dataset/valid/images", conf=0.25, iou=0.5)

for r in results:
    img = r.plot()

    for box in r.boxes:
        conf = float(box.conf[0])
        decision = checkout_decision(conf)
        print(f"confidence={conf:.2f} → decision={decision}")

    cv2.imshow("Prediction", img)
    cv2.waitKey(0)

cv2.destroyAllWindows()
