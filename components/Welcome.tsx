import React from 'react';

interface WelcomeProps {
  onStart: () => void;
}

export const Welcome: React.FC<WelcomeProps> = ({ onStart }) => {
  return (
    <div className="text-center max-w-2xl mx-auto">
      <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
        Welcome to the Future of Retail
      </h2>
      <p className="mt-4 text-lg text-gray-600">
        Our Smart Checkout System uses advanced AI to identify your products from an image, making your shopping experience faster, easier, and barcode-free.
      </p>
      <div className="mt-8">
        <button
          onClick={onStart}
          className="inline-flex items-center justify-center px-8 py-4 border border-transparent text-base font-medium rounded-full shadow-lg text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 transition-transform transform hover:scale-105"
        >
          Start Shopping
        </button>
      </div>
    </div>
  );
};
