import React, { useState, useMemo, useEffect } from 'react';
import { API_URL } from '../config';
import type { CartItem } from '../types/index.ts';

interface ShoppingCartProps {
    image: string;
    cartItems: CartItem[];
    onCheckout: () => void;
    onCancel: () => void;
    onAddItem?: (item: CartItem) => void;
    onRemoveItem?: (index: number) => void;
    isVerification?: boolean;

}

export const ShoppingCart: React.FC<ShoppingCartProps> = ({ image, cartItems, onCheckout, onCancel, onAddItem, onRemoveItem, isVerification }) => {
    // Local state to track which low-confidence items have been manually confirmed by the user
    const [confirmedIndices, setConfirmedIndices] = useState<Set<number>>(new Set());

    // Split items into categories
    const { attentionItems, confirmedItems } = useMemo(() => {
        const attention: { item: CartItem; originalIndex: number }[] = [];
        const confirmed: { item: CartItem; originalIndex: number }[] = [];

        cartItems.forEach((item, index) => {
            // Logic: Needs attention if confidence < 0.75 AND not yet manually confirmed
            // Also if it was added manually (no confidence), it's confirmed by default
            const isLowConfidence = item.confidence !== undefined && item.confidence < 0.75;
            const isManuallyConfirmed = confirmedIndices.has(index);

            if (isLowConfidence && !isManuallyConfirmed) {
                attention.push({ item, originalIndex: index });
            } else {
                confirmed.push({ item, originalIndex: index });
            }
        });

        return { attentionItems: attention, confirmedItems: confirmed };
    }, [cartItems, confirmedIndices]);

    const subtotal = cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0);
    const taxRate = 0.08; // 8% tax
    const tax = subtotal * taxRate;
    const total = subtotal + tax;

    const [isAdding, setIsAdding] = React.useState(false);
    const [newItem, setNewItem] = React.useState<Partial<CartItem>>({ name: '', price: 0, quantity: 1 });
    const [searchResults, setSearchResults] = React.useState<any[]>([]);
    const [showSuggestions, setShowSuggestions] = React.useState(false);

    const handleConfirmItem = (originalIndex: number) => {
        setConfirmedIndices(prev => {
            const next = new Set(prev);
            next.add(originalIndex);
            return next;
        });
    };

    const handleAddItem = () => {
        if (newItem.name && newItem.quantity! > 0 && onAddItem) {
            // Allow price to be 0
            onAddItem({
                name: newItem.name,
                price: Number(newItem.price || 0),
                quantity: Number(newItem.quantity),
            });
            setNewItem({ name: '', price: 0, quantity: 1 });
            setIsAdding(false);
        } else {
            alert("Please enter a product name and quantity.");
        }
    };

    // Calculate if checkout is allowed
    const canCheckout = attentionItems.length === 0;

    return (
        <div className="w-full max-w-6xl mx-auto">
            <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
                {isVerification ? "Verify Your Cart" : "Your Cart"}
            </h2>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
                <div className="flex flex-col items-center">
                    <h3 className="text-xl font-semibold text-gray-700 mb-4">Your Items</h3>
                    <img src={image} alt="Shopping items" className="rounded-lg shadow-lg object-contain max-h-96 w-full" />
                </div>

                <div className="bg-gray-50 p-6 rounded-lg shadow-inner">
                    <h3 className="text-xl font-semibold text-gray-800 mb-4 border-b pb-3">Order Summary</h3>

                    {/* Needs Attention Section */}
                    {attentionItems.length > 0 && (
                        <div className="mb-6 bg-amber-50 border border-amber-200 rounded-lg overflow-hidden">
                            <div className="bg-amber-100 px-4 py-2 flex items-center justify-between">
                                <h4 className="font-bold text-amber-800 flex items-center gap-2">
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
                                    Needs Attention ({attentionItems.length})
                                </h4>
                                <span className="text-xs text-amber-700 font-semibold uppercase">Action Required</span>
                            </div>
                            <ul className="divide-y divide-amber-200">
                                {attentionItems.map(({ item, originalIndex }) => (
                                    <li key={originalIndex} className="p-4 flex items-center gap-4">
                                        <img
                                            src={"https://placehold.co/64x64/fcd34d/92400e?text=?"}
                                            alt={item.name}
                                            className="w-12 h-12 rounded-md object-cover bg-amber-200"
                                        />
                                        <div className="flex-1">
                                            <p className="font-bold text-gray-800">{item.name}</p>
                                            <p className="text-xs text-amber-700">Low confidence detection ({(item.confidence! * 100).toFixed(0)}%)</p>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            {onRemoveItem && (
                                                <button
                                                    onClick={() => onRemoveItem(originalIndex)}
                                                    className="text-xs text-red-600 hover:text-red-800 font-semibold px-2 py-1"
                                                >
                                                    Reject
                                                </button>
                                            )}
                                            <button
                                                onClick={() => handleConfirmItem(originalIndex)}
                                                className="bg-emerald-600 text-white text-xs font-bold px-3 py-1.5 rounded hover:bg-emerald-700 shadow-sm transition"
                                            >
                                                Confirm
                                            </button>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}

                    {/* Confirmed Items Section */}
                    {confirmedItems.length > 0 ? (
                        <div className="mb-6">
                            <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-2">Confirmed Items</h4>
                            <ul className="divide-y divide-gray-200 bg-white rounded-lg border border-gray-200">
                                {confirmedItems.map(({ item, originalIndex }) => (
                                    <li key={originalIndex} className="p-4 flex items-center gap-4">
                                        <img
                                            src={item.imageUrl || "https://placehold.co/64x64/e2e8f0/94a3b8?text=Product"}
                                            alt={item.name}
                                            className="w-16 h-16 rounded-md object-cover bg-gray-200 shadow"
                                            onError={(e) => { e.currentTarget.src = "https://placehold.co/64x64/e2e8f0/94a3b8?text=Product"; }}
                                        />
                                        <div className="flex-1">
                                            <p className="font-medium text-gray-800">{item.name} (x{item.quantity})</p>
                                            <p className="text-sm text-gray-600 mt-1">{item.description}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="font-mono text-gray-700">₹{(item.price * item.quantity).toFixed(2)}</p>
                                            {onRemoveItem && (
                                                <button
                                                    onClick={() => onRemoveItem(originalIndex)}
                                                    className="text-xs text-red-500 hover:text-red-700 font-medium mt-1 flex items-center justify-end gap-1"
                                                >
                                                    Remove
                                                </button>
                                            )}
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ) : (
                        <div className="p-6 text-center text-gray-500 italic bg-gray-50 rounded-lg border border-dashed border-gray-300">
                            No confirmed items yet.
                        </div>
                    )}



                    {onAddItem && (
                        <div className="mt-4 border-t pt-4">
                            {!isAdding ? (
                                <button
                                    onClick={() => setIsAdding(true)}
                                    className="text-sm text-emerald-600 font-semibold hover:text-emerald-700 flex items-center gap-1"
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path></svg>
                                    Add Item Manually
                                </button>
                            ) : (
                                <div className="bg-gray-100 p-4 rounded-md animate-fade-in relative">
                                    <h4 className="text-sm font-semibold text-gray-700 mb-2">Add New Item</h4>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                        <div className="md:col-span-2 relative">
                                            <input
                                                type="text"
                                                placeholder="Product Name (Type to search)"
                                                className="w-full border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                                value={newItem.name}
                                                onChange={(e) => {
                                                    const val = e.target.value;
                                                    setNewItem({ ...newItem, name: val });

                                                    // Autocomplete search
                                                    if (val.length > 1) {
                                                        fetch(`${API_URL}/products/search?q=${val}`)
                                                            .then(res => res.json())
                                                            .then(data => {
                                                                console.log("Search results:", data);
                                                                setSearchResults(data);
                                                                setShowSuggestions(true);
                                                            })
                                                            .catch(err => {
                                                                console.error("Search error:", err);
                                                            });
                                                    } else {
                                                        setShowSuggestions(false);
                                                    }
                                                }}
                                                onFocus={() => {
                                                    if (newItem.name && newItem.name.length > 1) setShowSuggestions(true);
                                                }}
                                                onBlur={() => setTimeout(() => setShowSuggestions(false), 200)} // Delay to allow click
                                            />
                                            {/* Autocomplete Dropdown */}
                                            {showSuggestions && searchResults.length > 0 && (
                                                <ul className="absolute z-10 w-full bg-white border border-gray-200 rounded-md shadow-lg max-h-48 overflow-y-auto mt-1">
                                                    {searchResults.map((res, idx) => (
                                                        <li
                                                            key={idx}
                                                            className="px-4 py-2 hover:bg-emerald-50 cursor-pointer text-sm flex justify-between"
                                                            onMouseDown={(e) => {
                                                                // Use onMouseDown to prevent onBlur from firing before click
                                                                e.preventDefault();
                                                                console.log("Selected item:", res);
                                                                setNewItem({ ...newItem, name: res.name, price: res.price });
                                                                setShowSuggestions(false);
                                                            }}
                                                        >
                                                            <span>{res.name}</span>
                                                            <span className="text-gray-500 text-xs">₹{res.price}</span>
                                                        </li>
                                                    ))}
                                                </ul>
                                            )}
                                        </div>
                                        <div>
                                            <input
                                                type="number"
                                                placeholder="Price"
                                                className="w-full border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                                value={newItem.price || ''}
                                                onChange={(e) => setNewItem({ ...newItem, price: Number(e.target.value) })}
                                            />
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-3">
                                        <div>
                                            <input
                                                type="number"
                                                placeholder="Qty"
                                                className="w-full border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                                value={newItem.quantity || 1}
                                                onChange={(e) => setNewItem({ ...newItem, quantity: Number(e.target.value) })}
                                            />
                                        </div>
                                        <div className="md:col-span-2 flex justify-end gap-2">
                                            <button
                                                onClick={() => {
                                                    setIsAdding(false);
                                                    setNewItem({ name: '', price: 0, quantity: 1 });
                                                    setSearchResults([]);
                                                    setShowSuggestions(false);
                                                }}
                                                className="text-sm text-gray-600 hover:text-gray-800 px-3 py-2"
                                            >
                                                Cancel
                                            </button>
                                            <button
                                                onClick={handleAddItem}
                                                className="bg-emerald-600 text-white text-sm px-4 py-2 rounded hover:bg-emerald-700 transition"
                                            >
                                                Add Item
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    <div className="mt-6 pt-4 border-t-2 border-dashed">
                        <div className="flex justify-between text-gray-600 mb-2">
                            <span>Subtotal</span>
                            <span className="font-mono">₹{subtotal.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between text-gray-600 mb-3">
                            <span>Tax ({(taxRate * 100).toFixed(0)}%)</span>
                            <span className="font-mono">₹{tax.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between text-gray-900 font-bold text-lg">
                            <span>Total</span>
                            <span className="font-mono">₹{total.toFixed(2)}</span>
                        </div>
                    </div>
                    <div className="mt-8 flex flex-col sm:flex-row gap-4">
                        <button
                            onClick={onCheckout}
                            disabled={!canCheckout}
                            className={`w-full font-bold py-3 px-6 rounded-lg shadow-md transition-all duration-200 transform
                                ${canCheckout
                                    ? 'bg-emerald-600 text-white hover:bg-emerald-700 hover:scale-105'
                                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'}`}
                        >
                            {!canCheckout ? `Review ${attentionItems.length} Item(s)` : (isVerification ? "Confirm & Pay" : "Pay Now")}
                        </button>
                        <button
                            onClick={onCancel}
                            className="w-full bg-gray-200 text-gray-700 font-bold py-3 px-6 rounded-lg hover:bg-gray-300 transition-all duration-200"
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};