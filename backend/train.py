from ultralytics import YOLO

# Load YOLOv8 model (nano is best for CPU)
model = YOLO("yolov8n.pt")

# Train the model
model.train(
    data="../dataset/data.yaml",
    epochs=50,
    imgsz=640,
    batch=8,          # reduce to 4 if RAM is low     # change to 0 if you have NVIDIA GPU
    workers=4,
    name="checkout_v1",
    patience=10
)
