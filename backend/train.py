from ultralytics import YOLO

model = YOLO("yolov8s.pt") 

# FINAL TECH VERDICT CONFIGURATION
model.train(
    data="../dataset/data.yaml",
    epochs=40,
    imgsz=640,
    batch=8,          
    workers=4,
    optimizer="AdamW", # Industry standard for stability
    lr0=0.001,        # Optimal starting point for AdamW
    name="checkout_final",
    patience=10,      # Give it room to recover; 12 is too aggressive
    dropout=0.0,      # YOLOv8 handles regularization via weight_decay
    weight_decay=0.0005, # The actual fix for overfitting
    cos_lr=True       # Smooth learning rate schedule
)
