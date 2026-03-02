from fastapi import FastAPI, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from typing import List, Optional
from utils.detect import run_detection
from utils.db import lookup_product, insert_product, search_products
from decision import apply_strict_checkout_rules
from PIL import Image
import io
import base64

from fastapi.staticfiles import StaticFiles
import uuid
import os

app = FastAPI()

# Ensure static/crops directory exists
os.makedirs("static/crops", exist_ok=True)

# Mount the static directory to serve images
app.mount("/static", StaticFiles(directory="static"), name="static")

# Allow the Vite frontend to call this API locally.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


def get_overall_decision(decisions):
    """
    Determine overall checkout decision based on individual product decisions.
    
    Condition 1 & 2: If ANY product is REJECT → reject entire checkout
    Condition 3: If no detections → reject (handled before calling this)
    
    Priority: REJECT > VERIFY > AUTO_CHECKOUT
    """
    if "REJECT" in decisions:
        return "REJECT"
    elif "VERIFY" in decisions:
        return "VERIFY"
    else:
        return "AUTO_CHECKOUT"


@app.get("/products/search")
def search_products_endpoint(q: str):
    """
    Search for products by name for autocomplete.
    """
    if not q:
        return []
    return search_products(q)



@app.post("/detect-preview")
async def detect_preview(file: UploadFile = File(...)):
    """
    Fast endpoint for live preview. 
    Returns raw detections (bbox, label, confidence) for overlay.
    """
    try:
        image_bytes = await file.read()
        image = Image.open(io.BytesIO(image_bytes)).convert("RGB")
        
        # Run detection (maybe lower resolution or faster config if needed)
        # Lower threshold for preview to show user what the model is "thinking"
        detections = run_detection(image, conf_threshold=0.15)
        
        # Format for frontend overlay
        results = []
        for det in detections:
            results.append({
                "bbox": det["bbox"], # [x1, y1, x2, y2]
                "label": f"{det['class_name']} {det['confidence']:.2f}",
                "class_name": det["class_name"],
                "confidence": det["confidence"]
            })
            
        return {"detections": results}
    except Exception as e:
        print(f"Preview Error: {e}")
        return {"detections": []}

@app.post("/process-image")
async def process_image(
    files: List[UploadFile] = File(...)
):
    """
    Process multiple frames (3-5 consecutive frames) using YOLO.
    Applies STRICT decision hierarchy: REJECT -> VERIFY -> ACCEPT
    """
    # Handle files list
    file_list = files
    
    if not file_list:
        return {
            "items": [],
            "fraud": None,
            "decision": "REJECT",
            "reason": "No images provided"
        }
    
    all_detections = {}  # Use dict to merge: {class_name: best_detection}
    
    # Process each frame
    for file in file_list:
        image_bytes = await file.read()
        image = Image.open(io.BytesIO(image_bytes)).convert("RGB")
        
        # Run detection on this frame
        frame_detections = run_detection(image, conf_threshold=0.25)
        
        # Merge detections: if product appears in ANY frame, keep the best one (highest confidence)
        for det in frame_detections:
            class_name = det["class_name"]
            # SPECIAL CASE: Hands are transient, if seen once, we flag it.
            # But for merging, we just store it. Logic handles it later.
            if class_name not in all_detections:
                all_detections[class_name] = det
            else:
                # Keep detection with higher confidence
                if det["confidence"] > all_detections[class_name]["confidence"]:
                    all_detections[class_name] = det
    
    # Convert merged detections to list
    detections = list(all_detections.values())
    
    # ---------------------------------------------------------
    # DECISION LOGIC
    # ---------------------------------------------------------
    overall_decision, reason = apply_strict_checkout_rules(detections)

    # If REJECT, return early (don't even build cart effectively, or just empty cart)
    # The prompt says: "REJECT -> Rescan required (no billing)"
    if overall_decision == "REJECT":
        # Check if it was fraud (hand) or just general reject?
        # The decision logic gave a reason.
        # We can populate fraud object if it was a hand.
        is_fraud = "Hand detected" in reason
        return {
            "items": [],
            "fraud": {
                "isSuspicious": True,
                "reason": reason
            } if is_fraud else None,
            "decision": "REJECT",
            "reason": reason
        }

    # Build cart items
    cart_items = []
    
    # Only detected products (excluding 'hand' if it somehow passed logic, but apply_strict rejects hands)
    # We should filter out non-products if any. Assuming YOLO classes are products + hand.
    
    product_detections = [d for d in detections if d["class_name"].lower() != "hand"]

    for det in product_detections:
        confidence = det["confidence"]
        class_name = det.get("class_name", "object")
        
        # Look up price in the local DB
        db_entry = lookup_product(class_name)
        if db_entry:
            price = db_entry.price
        else:
            price = 0.0
            insert_product(class_name, price)

        # Image URL removed
        image_url = None

        cart_items.append({
            "name": class_name,
            "price": float(price),
            "quantity": 1,           
            "imageUrl": image_url, 
            "confidence": confidence,
            # Individual decision is less relevant now that we have global state, 
            # but we can keep it for UI color coding if needed.
            "decision": "VERIFY" if confidence < 0.75 else "AUTO_CHECKOUT" 
        })
    
    # Return final response
    return {
        "items": cart_items,
        "fraud": None,
        "decision": overall_decision,
        "reason": reason
    }
