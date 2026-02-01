# Vision Checkout - AI-Powered Self-Checkout System

A smart self-checkout system that uses computer vision to identify products, prevent fraud, and streamline the retail experience.

## Features

- **Real-time Object Detection**: Uses YOLOv8 to detect products in the camera feed.
- **Fraud Prevention**: Detects hands in the frame to prevent theft or tampering.
- **Confidence-Aware Checkout**: distinguishing between "Auto-Checkout" (high confidence) and "Verification Needed" (low confidence) items.
- **Strict Decision Hierarchy**: REJECT (Hand) -> VERIFY (Low Conf) -> ACCEPT (High Conf).
- **Local Database**: SQLite database for product lookup and price management.
- **Modern UI**: React-based frontend with a responsive design.

## Project Structure

- `backend/`: FastAPI server, YOLO model integration, decision logic, and database management.
- `components/`: React frontend components.
- `dataset/`: Training data for the YOLO model.

## Setup & Running Locally

### Prerequisites
- Node.js
- Python 3.8+
- Git

### 1. Backend Setup
```bash
cd backend
python -m venv venv
.\venv\Scripts\activate  # On Windows
pip install -r requirements.txt
python main.py
```
The backend will run on `http://127.0.0.1:8000`.

### 2. Frontend Setup
```bash
# In the root directory
npm install
npm run dev
```
The frontend will run on `http://localhost:5173`.

## Custom Model Training
To train the model on your own dataset:
1. Place your dataset in `dataset/` (ensure `data.yaml` is correct).
2. Run `python backend/train.py`.
