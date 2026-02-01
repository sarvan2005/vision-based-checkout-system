import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';

interface ImageUploaderProps {
  onImageUpload: (file: File) => void;
  onUseCamera: () => void;
}

export const ImageUploader: React.FC<ImageUploaderProps> = ({ onImageUpload, onUseCamera }) => {
  const [preview, setPreview] = useState<string | null>(null);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      const file = acceptedFiles[0];
      setPreview(URL.createObjectURL(file));
      onImageUpload(file);
    }
  }, [onImageUpload]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/*': ['.jpeg', '.png', '.jpg', '.webp'] },
    multiple: false,
    onDragEnter: undefined,
    onDragOver: undefined,
    onDragLeave: undefined,
  });

  return (
    <div className="w-full max-w-lg mx-auto flex flex-col items-center">
      <h2 className="text-2xl font-bold text-gray-800 mb-4">Upload a Photo of Your Items</h2>
      <p className="text-gray-600 mb-6 text-center">Place your items on a flat surface and take a clear picture from above.</p>

      <div
        {...getRootProps()}
        className={`w-full p-8 border-4 border-dashed rounded-xl cursor-pointer transition-colors duration-300 ease-in-out
            ${isDragActive ? 'border-emerald-500 bg-emerald-50' : 'border-gray-300 hover:border-emerald-400 bg-gray-50'}`}
      >
        <input {...getInputProps()} />
        <div className="flex flex-col items-center text-center">
          <svg className="w-16 h-16 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"></path></svg>
          {isDragActive ? (
            <p className="text-lg font-semibold text-emerald-600">Drop the image here ...</p>
          ) : (
            <p className="text-lg text-gray-600">Drag & drop an image, or click to select</p>
          )}
          <p className="text-sm text-gray-500 mt-2">PNG, JPG, WEBP up to 10MB</p>
        </div>
      </div>
      <div className="my-6 flex items-center w-full">
        <div className="flex-grow border-t border-gray-300"></div>
        <span className="flex-shrink mx-4 text-gray-500 font-semibold">OR</span>
        <div className="flex-grow border-t border-gray-300"></div>
      </div>
      <button
        onClick={onUseCamera}
        className="w-full flex items-center justify-center gap-3 px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
        Use Camera
      </button>
    </div>
  );
};