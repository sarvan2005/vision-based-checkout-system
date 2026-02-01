import React, { useCallback, useState } from 'react';
import { Alert } from './components/Alert.tsx';
import { CameraView } from './components/CameraView.tsx';
import { Header } from './components/Header.tsx';
import { ImageUploader } from './components/ImageUploader.tsx';
import { Loader } from './components/Loader.tsx';
import { Receipt } from './components/Receipt.tsx';
import { ShoppingCart } from './components/ShoppingCart.tsx';
import { Welcome } from './components/Welcome.tsx';
// Removed unused imports since you are using fetch directly
import type { AppState, CartItem, FraudCheckResult } from './types/index.ts';
import { AppStateEnum } from './types/index.ts';

const App: React.FC = () => {
  const [appState, setAppState] = useState<AppState>(AppStateEnum.WELCOME);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [image, setImage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [fraudCheck, setFraudCheck] = useState<FraudCheckResult | null>(null);
  const [rejectionReason, setRejectionReason] = useState<string>('');


  const resetState = () => {
    setAppState(AppStateEnum.WELCOME);
    setCartItems([]);
    setImage(null);
    setErrorMessage('');
    setFraudCheck(null);
    setRejectionReason('');

  };

  const handleImageAnalysis = useCallback(async (fileOrFiles: File | File[]) => {
    setAppState(AppStateEnum.ANALYZING);
    setErrorMessage('');


    // Handle both single file (upload) and multiple files (camera)
    const files = Array.isArray(fileOrFiles) ? fileOrFiles : [fileOrFiles];
    const imageUrl = URL.createObjectURL(files[0]); // Use first frame for preview
    setImage(imageUrl);

    const formData = new FormData();
    // Send multiple files for camera (multi-frame detection)
    // For single file uploads, send as "file" for backward compatibility
    // Always send as "files" (supports both single and multiple)
    files.forEach((file) => {
      formData.append("files", file);
    });

    try {
      const response = await fetch("http://localhost:8000/process-image", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (data.fraud?.isSuspicious) {
        setFraudCheck(data.fraud);
        setAppState(AppStateEnum.FRAUD_DETECTED);
        return;
      }

      // Check overall decision from backend
      const decision = data.decision || "AUTO_CHECKOUT";



      if (decision === "REJECT") {
        // Condition 1 & 3: Reject entire checkout
        setRejectionReason(data.reason || "Checkout rejected due to quality issues.");
        setAppState(AppStateEnum.REJECTED);
        return;
      }

      // Note: Backend might return items even if VERIFY.
      if (data.items) {
        setCartItems(data.items);

        if (decision === "VERIFY") {
          // Condition 2: Manual verification needed
          // Even if items found, we verify.
          setAppState(AppStateEnum.VERIFY);
        } else if (data.items.length > 0) {
          // AUTO_CHECKOUT: Proceed to checkout
          setAppState(AppStateEnum.CHECKOUT);
        } else {
          // Decision is accept but no items? Should act as ERROR or VERIFY
          // But valid backend logic shouldn't return ACCEPT with empty items if expected > 0
          setErrorMessage("No products identified. Please try again.");
          setAppState(AppStateEnum.ERROR);
        }
      } else {
        setErrorMessage("We couldn't identify any products. Please try again.");
        setAppState(AppStateEnum.ERROR);
      }

    } catch (error) {
      console.error("Backend Error:", error);
      setErrorMessage('Server error. Make sure your backend is running.');
      setAppState(AppStateEnum.ERROR);
    }
  }, []);

  const handleCheckout = () => {
    setAppState(AppStateEnum.PAID);
  };

  const handleAddItem = (newItem: CartItem) => {
    setCartItems(prev => [...prev, newItem]);
  };

  const handleRemoveItem = (indexToRemove: number) => {
    setCartItems(prev => prev.filter((_, index) => index !== indexToRemove));
  };

  const renderContent = () => {
    switch (appState) {
      case AppStateEnum.WELCOME:
        return <Welcome onStart={() => setAppState(AppStateEnum.UPLOADING)} />;
      case AppStateEnum.UPLOADING:
        return (
          <ImageUploader
            onImageUpload={handleImageAnalysis}
            onUseCamera={() => setAppState(AppStateEnum.TAKING_PICTURE)}
          />
        );
      case AppStateEnum.TAKING_PICTURE:
        return (
          <CameraView
            onCapture={handleImageAnalysis}
            onCancel={() => setAppState(AppStateEnum.UPLOADING)}
          />
        );
      case AppStateEnum.ANALYZING:
        return <Loader message="Scanning your items and checking for issues..." />;
      case AppStateEnum.FRAUD_DETECTED:
        return (
          <Alert
            type="error"
            title="Suspicious Activity Detected!"
            message={fraudCheck?.reason || "Potential fraud detected. Checkout has been aborted for security reasons."}
            onReset={resetState}
          />
        );
      case AppStateEnum.REJECTED:
        return (
          <Alert
            type="error"
            title="Checkout Rejected"
            message={rejectionReason || "One or more products failed quality check. Please try again with better lighting or clearer images."}
            onReset={resetState}
          />
        );
      case AppStateEnum.VERIFY:
        return (
          <ShoppingCart
            image={image!}
            cartItems={cartItems}
            onCheckout={handleCheckout}
            onCancel={resetState}
            onAddItem={handleAddItem}
            onRemoveItem={handleRemoveItem}
            isVerification={true}

          />
        );
      case AppStateEnum.ERROR:
        return (
          <Alert
            type="error"
            title="An Error Occurred"
            message={errorMessage}
            onReset={resetState}
          />
        );
      case AppStateEnum.CHECKOUT:
        return <ShoppingCart image={image!} cartItems={cartItems} onCheckout={handleCheckout} onCancel={resetState} />;
      case AppStateEnum.PAID:
        return <Receipt cartItems={cartItems} onNewTransaction={resetState} />;
      default:
        return <Welcome onStart={() => setAppState(AppStateEnum.UPLOADING)} />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 text-gray-800">
      <Header />
      <main className="container mx-auto p-4 md:p-8">
        <div className="bg-white rounded-2xl shadow-xl p-6 md:p-10 min-h-[70vh] flex items-center justify-center">
          {renderContent()}
        </div>
      </main>
      <footer className="text-center p-4 text-gray-500 text-sm">
        <p>&copy; {new Date().getFullYear()} Smart Vision-Based Checkout. An AI-Powered Retail Solution.</p>
      </footer>
    </div>
  );
};

export default App;