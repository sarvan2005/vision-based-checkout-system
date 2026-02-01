import React from 'react';

interface LoaderProps {
  message: string;
}

export const Loader: React.FC<LoaderProps> = ({ message }) => {
  return (
    <div className="flex flex-col items-center justify-center text-center">
      <div className="w-16 h-16 border-8 border-dashed rounded-full animate-spin border-emerald-600"></div>
      <p className="mt-6 text-xl font-semibold text-gray-700">{message}</p>
    </div>
  );
};
