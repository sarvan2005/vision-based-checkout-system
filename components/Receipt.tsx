import React from 'react';
import type { CartItem } from '../types/index.ts';

interface ReceiptProps {
  cartItems: CartItem[];
  onNewTransaction: () => void;
}

export const Receipt: React.FC<ReceiptProps> = ({ cartItems, onNewTransaction }) => {
  const subtotal = cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const taxRate = 0.08;
  const tax = subtotal * taxRate;
  const total = subtotal + tax;

  return (
    <div className="max-w-md mx-auto bg-white p-8 rounded-xl shadow-lg border">
      <div className="text-center mb-6">
        <svg className="w-16 h-16 mx-auto text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
        <h2 className="text-2xl font-bold text-gray-800 mt-2">Payment Successful!</h2>
        <p className="text-gray-500">Thank you for your purchase.</p>
      </div>

      <div className="border-t border-b py-4">
        <h3 className="text-lg font-semibold text-gray-700 mb-3">Invoice Details</h3>
        <ul className="divide-y divide-gray-200">
          {cartItems.map((item, index) => (
            <li key={index} className="py-3 flex items-center gap-3 text-sm text-gray-600">
              <img
                src={item.imageUrl || "https://placehold.co/40x40/f1f5f9/94a3b8?text=Item"}
                alt={item.name}
                className="w-10 h-10 rounded object-cover bg-gray-100"
                onError={(e) => { e.currentTarget.src = "https://placehold.co/40x40/f1f5f9/94a3b8?text=Item"; }}
              />
              <span className="flex-1">{item.name} x {item.quantity}</span>
              <span className="font-mono">₹{(item.price * item.quantity).toFixed(2)}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="mt-4 space-y-2">
        <div className="flex justify-between text-sm text-gray-600">
          <span>Subtotal</span>
          <span className="font-mono">₹{subtotal.toFixed(2)}</span>
        </div>
        <div className="flex justify-between text-sm text-gray-600">
          <span>Tax</span>
          <span className="font-mono">₹{tax.toFixed(2)}</span>
        </div>
        <div className="flex justify-between text-base font-bold text-gray-800">
          <span>Total Paid</span>
          <span className="font-mono">₹{total.toFixed(2)}</span>
        </div>
      </div>

      <div className="mt-8 text-center">
        <button
          onClick={onNewTransaction}
          className="w-full bg-emerald-600 text-white font-bold py-3 px-6 rounded-lg shadow-md hover:bg-emerald-700 transition-all duration-200"
        >
          Start New Transaction
        </button>
      </div>
    </div>
  );
};