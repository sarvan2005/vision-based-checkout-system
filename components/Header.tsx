import React from 'react';

export const Header: React.FC = () => {
  return (
    <header className="bg-gradient-to-r from-emerald-600 to-green-800 text-white shadow-lg">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-center">
          Smart Vision-Based Checkout System
        </h1>
      </div>
    </header>
  );
};
