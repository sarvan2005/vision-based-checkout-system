import React, { useRef, useEffect, useState } from 'react';

interface CameraViewProps {
  onCapture: (files: File[]) => void;
  onCancel: () => void;
}

export const CameraView: React.FC<CameraViewProps> = ({ onCapture, onCancel }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);

  useEffect(() => {
    let mediaStream: MediaStream;

    const startCamera = async () => {
      try {
        mediaStream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'environment' },
          audio: false,
        });
        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;
          setStream(mediaStream);
        }
      } catch (err) {
        console.error("Camera Error:", err);
        setError("Could not access the camera. Please check your browser permissions.");
      }
    };

    startCamera();

    return () => {
      if (mediaStream) {
        mediaStream.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const handleCapture = async () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const context = canvas.getContext('2d');

      if (!context) return;

      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      // Capture 5 consecutive frames with small delays
      const frames: File[] = [];
      const frameCount = 5;
      const delayBetweenFrames = 100; // 100ms between frames

      for (let i = 0; i < frameCount; i++) {
        // Draw current video frame to canvas
        context.drawImage(video, 0, 0, video.videoWidth, video.videoHeight);

        // Convert to blob/file
        const blob = await new Promise<Blob | null>((resolve) => {
          canvas.toBlob(resolve, 'image/jpeg', 0.95);
        });

        if (blob) {
          const file = new File([blob], `frame-${i}-${Date.now()}.jpg`, { type: 'image/jpeg' });
          frames.push(file);
        }

        // Wait before next frame (except for last frame)
        if (i < frameCount - 1) {
          await new Promise(resolve => setTimeout(resolve, delayBetweenFrames));
        }
      }

      // Send all captured frames to parent component
      if (frames.length > 0) {
        onCapture(frames);
      }
    }
  };

  if (error) {
    return (
      <div className="text-center">
        <p className="text-red-600 font-semibold">{error}</p>
        <button
          onClick={onCancel}
          className="mt-4 bg-gray-200 text-gray-700 font-bold py-2 px-4 rounded-lg hover:bg-gray-300"
        >
          Back to Upload
        </button>
      </div>
    );
  }

  return (
    <div className="w-full max-w-2xl mx-auto flex flex-col items-center">
      <h2 className="text-2xl font-bold text-gray-800 mb-4">Position Your Items</h2>
      <p className="text-gray-600 mb-6 text-center">Center your items in the frame below and press the capture button. We'll capture 5 frames for better detection accuracy.</p>

      <div className="relative w-full aspect-[4/3] bg-gray-900 rounded-lg overflow-hidden shadow-lg">
        <video
          ref={videoRef}
          autoPlay
          playsInline
          className="w-full h-full object-cover"
        />
        {!stream && (
          <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50">
            <p className="text-white text-lg">Starting camera...</p>
          </div>
        )}
      </div>
      <canvas ref={canvasRef} style={{ display: 'none' }} />
      <div className="mt-6 flex items-center justify-center gap-4 w-full">
        <button
          onClick={onCancel}
          className="px-6 py-3 bg-gray-200 text-gray-700 font-bold rounded-lg hover:bg-gray-300"
        >
          Cancel
        </button>
        <button
          onClick={handleCapture}
          disabled={!stream}
          className="w-20 h-20 bg-emerald-600 rounded-full p-2 shadow-lg ring-4 ring-white disabled:bg-gray-400 flex items-center justify-center transition-transform transform hover:scale-110"
          aria-label="Take Picture"
        >
          <svg className="w-10 h-10 text-white" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fillRule="evenodd" d="M4 5a2 2 0 00-2 2v6a2 2 0 002 2h12a2 2 0 002-2V7a2 2 0 00-2-2H4zm10.5 4.5a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" clipRule="evenodd"></path></svg>
        </button>
      </div>
    </div>
  );
};
