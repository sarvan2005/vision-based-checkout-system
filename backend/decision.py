def apply_strict_checkout_rules(detections):
    """
    Apply STRICT decision hierarchy for checkout.
    
    States:
    - REJECT (Hand detected)
    - VERIFY (Confidence < 0.75)
    - AUTO_CHECKOUT (Confidence >= 0.75)

    Args:
        detections: List of dicts with keys 'class_name', 'confidence'.

    Returns:
        tuple: (decision_string, reason_string)
    """
    
    # ---------------------------------------------------
    # 1. REJECT RULES (HIGHEST PRIORITY)
    # ---------------------------------------------------
    # Check for hand or suspicious objects
    for det in detections:
        if det["class_name"] == "hand":
            return "REJECT", "Hand detected in frame. Please keep hands away."
    
    # ---------------------------------------------------
    # 2. VERIFY RULES (UNCERTAINTY HANDLING)
    # ---------------------------------------------------
    # If any detected product has low confidence" -> VERIFY
    # Threshold: 0.75
    
    for det in detections:
        conf = det["confidence"]
        if conf < 0.75:
            return "VERIFY", f"Low confidence detection for '{det['class_name']}' ({conf:.2f}). Please verify your cart."

    # ---------------------------------------------------
    # 3. ACCEPT RULES (AUTO CHECKOUT)
    # ---------------------------------------------------
    # If we are here:
    # - No hand
    # - All items have high confidence (>= 0.75)
    
    return "AUTO_CHECKOUT", "Checkout approved."
