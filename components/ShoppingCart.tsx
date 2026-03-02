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
        <div className="w-full max-w-6xl mx-auto p-4 animate-fade-in relative">
            <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 -z-10 animate-blob"></div>
            <div className="absolute top-0 left-0 w-64 h-64 bg-teal-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 -z-10 animate-blob animation-delay-2000"></div>

            <h2 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-teal-500 mb-10 text-center tracking-tight drop-shadow-sm">
                {isVerification ? "Verify Your Cart" : "Your Awesome Cart"}
            </h2>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-14">
                <div className="flex flex-col items-center group perspective">
                    <div className="w-full flex justify-between items-center mb-5 px-2">
                        <h3 className="text-2xl font-bold text-gray-800 tracking-wide">Live Feed</h3>
                        <span className="flex h-3 w-3 relative">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
                        </span>
                    </div>
                    <div className="relative rounded-2xl overflow-hidden shadow-2xl transition-transform duration-500 group-hover:scale-[1.02] bg-gray-900 border border-gray-100/20 max-w-full w-full">
                        <img
                            src={image}
                            alt="Shopping items"
                            className="object-contain max-h-[450px] w-full mix-blend-screen"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-gray-900/60 to-transparent pointer-events-none"></div>
                    </div>
                </div>

                <div className="bg-white/80 backdrop-blur-xl p-8 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.06)] border border-white/50 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-emerald-100 to-teal-100 opacity-50 rounded-bl-full -z-10"></div>

                    <h3 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                        <svg className="w-6 h-6 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"></path></svg>
                        Order Summary
                    </h3>

                    {/* Needs Attention Section */}
                    {attentionItems.length > 0 && (
                        <div className="mb-8 bg-amber-50/80 backdrop-blur-sm border-l-4 border-amber-400 rounded-r-2xl overflow-hidden shadow-sm transition-all hover:shadow-md">
                            <div className="bg-amber-100/50 px-5 py-3 flex items-center justify-between border-b border-amber-200/50">
                                <h4 className="font-bold text-amber-900 flex items-center gap-2">
                                    <span className="bg-amber-200 text-amber-800 rounded-full w-6 h-6 flex items-center justify-center text-xs animate-pulse">!</span>
                                    Needs Attention ({attentionItems.length})
                                </h4>
                            </div>
                            <ul className="divide-y divide-amber-200/30">
                                {attentionItems.map(({ item, originalIndex }) => (
                                    <li key={originalIndex} className="p-5 flex items-center gap-4 hover:bg-amber-100/30 transition-colors">
                                        <div className="relative group/img">
                                            <img
                                                src={"https://placehold.co/64x64/fcd34d/92400e?text=?"}
                                                alt={item.name}
                                                className="w-14 h-14 rounded-xl object-cover bg-amber-200 shadow-sm transition-transform group-hover/img:scale-110"
                                            />
                                            <div className="absolute inset-0 rounded-xl bg-amber-500/10 block group-hover/img:hidden"></div>
                                        </div>
                                        <div className="flex-1">
                                            <p className="font-bold text-gray-900 text-lg">{item.name}</p>
                                            <div className="flex items-center gap-2 mt-1">
                                                <div className="w-full bg-amber-200 rounded-full h-1.5 max-w-[100px]">
                                                    <div className="bg-amber-500 h-1.5 rounded-full" style={{ width: `${item.confidence! * 100}%` }}></div>
                                                </div>
                                                <p className="text-xs text-amber-700 font-medium">{(item.confidence! * 100).toFixed(0)}% Match</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            {onRemoveItem && (
                                                <button
                                                    onClick={() => onRemoveItem(originalIndex)}
                                                    className="text-sm text-red-500 hover:text-red-700 font-semibold px-2 py-1 transition-colors hover:bg-red-50 rounded-lg"
                                                >
                                                    Reject
                                                </button>
                                            )}
                                            <button
                                                onClick={() => handleConfirmItem(originalIndex)}
                                                className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white text-sm font-bold px-4 py-2 rounded-xl hover:from-emerald-600 hover:to-teal-600 shadow-md hover:shadow-lg transition-all transform hover:-translate-y-0.5"
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
                        <div className="mb-8">
                            <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3 ml-1">Confirmed Items</h4>
                            <ul className="space-y-3">
                                {confirmedItems.map(({ item, originalIndex }) => (
                                    <li key={originalIndex} className="p-4 flex items-center gap-5 bg-white/60 hover:bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all group">
                                        <img
                                            src={item.imageUrl || "https://placehold.co/64x64/f8fafc/94a3b8?text=Product"}
                                            alt={item.name}
                                            className="w-16 h-16 rounded-xl object-cover bg-gray-50 shadow-sm"
                                            onError={(e) => { e.currentTarget.src = "https://placehold.co/64x64/f8fafc/94a3b8?text=Product"; }}
                                        />
                                        <div className="flex-1">
                                            <p className="font-bold text-gray-800 text-lg group-hover:text-emerald-700 transition-colors">{item.name}</p>
                                            <div className="flex items-center gap-2 mt-1">
                                                <span className="text-sm font-medium text-emerald-600/80 bg-emerald-50 inline-block px-2 py-0.5 rounded-md">Qty: {item.quantity}</span>
                                                {item.confidence !== undefined && (
                                                    <span className="text-xs font-bold text-blue-600/80 bg-blue-50 inline-block px-2 py-0.5 rounded-md">
                                                        {(item.confidence * 100).toFixed(0)}% Match
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                        <div className="text-right flex flex-col justify-center items-end">
                                            <p className="font-bold text-xl text-gray-900 tracking-tight">₹{(item.price * item.quantity).toFixed(2)}</p>
                                            {onRemoveItem && (
                                                <button
                                                    onClick={() => onRemoveItem(originalIndex)}
                                                    className="text-xs text-red-400 hover:text-red-600 font-medium mt-1 transition-colors opacity-0 group-hover:opacity-100 flex items-center gap-1"
                                                >
                                                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                                                    Remove
                                                </button>
                                            )}
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ) : (
                        <div className="py-12 px-6 text-center text-gray-400 bg-gray-50/50 rounded-3xl border-2 border-dashed border-gray-200 flex flex-col items-center justify-center gap-3">
                            <svg className="w-12 h-12 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"></path></svg>
                            <span className="font-medium">No confirmed items yet</span>
                        </div>
                    )}

                    {onAddItem && (
                        <div className="mt-8">
                            {!isAdding ? (
                                <button
                                    onClick={() => setIsAdding(true)}
                                    className="w-full py-3 flex items-center justify-center gap-2 text-sm text-emerald-600 font-bold bg-emerald-50/50 hover:bg-emerald-50 rounded-xl transition-colors border border-emerald-100 border-dashed"
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path></svg>
                                    Add Custom Item
                                </button>
                            ) : (
                                <div className="bg-white p-5 rounded-2xl shadow-lg border border-gray-100 animate-slide-up relative z-20 ring-4 ring-emerald-50">
                                    <h4 className="text-sm font-bold text-gray-800 mb-4 flex items-center gap-2">
                                        <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                                        Add New Item
                                    </h4>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        <div className="md:col-span-2 relative">
                                            <input
                                                type="text"
                                                placeholder="Product Name"
                                                className="w-full border-2 border-gray-100 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-emerald-400 focus:ring-4 focus:ring-emerald-50 transition-all bg-gray-50 focus:bg-white font-medium text-gray-800 placeholder-gray-400"
                                                value={newItem.name}
                                                onChange={(e) => {
                                                    const val = e.target.value;
                                                    setNewItem({ ...newItem, name: val });

                                                    if (val.length > 1) {
                                                        fetch(`${API_URL}/products/search?q=${val}`)
                                                            .then(res => res.json())
                                                            .then(data => {
                                                                setSearchResults(data);
                                                                setShowSuggestions(true);
                                                            })
                                                            .catch(err => console.error("Search error:", err));
                                                    } else {
                                                        setShowSuggestions(false);
                                                    }
                                                }}
                                                onFocus={() => {
                                                    if (newItem.name && newItem.name.length > 1) setShowSuggestions(true);
                                                }}
                                                onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                                            />
                                            {showSuggestions && searchResults.length > 0 && (
                                                <ul className="absolute z-30 w-full bg-white border border-gray-100 rounded-xl shadow-[0_10px_40px_-10px_rgba(0,0,0,0.1)] max-h-56 overflow-y-auto mt-2 p-1 overflow-hidden">
                                                    {searchResults.map((res, idx) => (
                                                        <li
                                                            key={idx}
                                                            className="px-4 py-3 hover:bg-emerald-50 cursor-pointer text-sm flex justify-between rounded-lg font-medium text-gray-700 transition-colors"
                                                            onMouseDown={(e) => {
                                                                e.preventDefault();
                                                                setNewItem({ ...newItem, name: res.name, price: res.price });
                                                                setShowSuggestions(false);
                                                            }}
                                                        >
                                                            <span>{res.name}</span>
                                                            <span className="text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md">₹{res.price}</span>
                                                        </li>
                                                    ))}
                                                </ul>
                                            )}
                                        </div>
                                        <div>
                                            <input
                                                type="number"
                                                placeholder="Price (₹)"
                                                className="w-full border-2 border-gray-100 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-emerald-400 focus:ring-4 focus:ring-emerald-50 transition-all bg-gray-50 focus:bg-white font-medium text-gray-800"
                                                value={newItem.price || ''}
                                                onChange={(e) => setNewItem({ ...newItem, price: Number(e.target.value) })}
                                            />
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                                        <div>
                                            <div className="flex items-center border-2 border-gray-100 rounded-xl bg-gray-50 focus-within:bg-white focus-within:border-emerald-400 focus-within:ring-4 focus-within:ring-emerald-50 transition-all overflow-hidden h-full">
                                                <div className="px-3 text-gray-400 text-sm font-bold border-r border-gray-100 bg-gray-100/50 h-full flex items-center">Qty</div>
                                                <input
                                                    type="number"
                                                    className="w-full px-3 py-3 text-sm focus:outline-none bg-transparent font-bold text-gray-800"
                                                    value={newItem.quantity || 1}
                                                    onChange={(e) => setNewItem({ ...newItem, quantity: Number(e.target.value) })}
                                                />
                                            </div>
                                        </div>
                                        <div className="md:col-span-2 flex justify-end gap-3 h-full">
                                            <button
                                                onClick={() => {
                                                    setIsAdding(false);
                                                    setNewItem({ name: '', price: 0, quantity: 1 });
                                                    setSearchResults([]);
                                                    setShowSuggestions(false);
                                                }}
                                                className="text-sm font-bold text-gray-500 hover:text-gray-800 px-4 py-2 hover:bg-gray-100 rounded-xl transition-colors"
                                            >
                                                Cancel
                                            </button>
                                            <button
                                                onClick={handleAddItem}
                                                className="bg-gray-900 text-white text-sm font-bold px-6 py-2 rounded-xl hover:bg-emerald-600 shadow-md hover:shadow-lg transition-all transform hover:-translate-y-0.5"
                                            >
                                                Add to Cart
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    <div className="mt-8 pt-6 border-t border-gray-100">
                        <div className="space-y-3">
                            <div className="flex justify-between text-gray-500 font-medium">
                                <span>Subtotal</span>
                                <span>₹{subtotal.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between text-gray-500 font-medium">
                                <span>Tax <span className="text-xs bg-gray-100 px-1.5 py-0.5 rounded text-gray-400 ml-1">{(taxRate * 100).toFixed(0)}%</span></span>
                                <span>₹{tax.toFixed(2)}</span>
                            </div>
                            <div className="pt-4 border-t border-gray-100 flex justify-between items-end">
                                <div>
                                    <span className="block text-sm text-gray-500 font-bold mb-1">Total Amount</span>
                                    <span className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-teal-600 tracking-tight">₹{total.toFixed(2)}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="mt-8 flex flex-col sm:flex-row gap-4 relative z-10">
                        <button
                            onClick={onCheckout}
                            disabled={!canCheckout}
                            className={`flex-1 font-bold py-4 px-6 rounded-2xl shadow-xl transition-all duration-300 transform flex justify-center items-center gap-2
                                ${canCheckout
                                    ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white hover:from-emerald-600 hover:to-teal-600 hover:scale-[1.02] hover:shadow-emerald-500/30 ring-4 ring-emerald-50'
                                    : 'bg-gray-100 text-gray-400 cursor-not-allowed shadow-none border border-gray-200'}`}
                        >
                            {!canCheckout ? (
                                <>
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
                                    Review {attentionItems.length} Item(s)
                                </>
                            ) : (
                                <>
                                    {isVerification ? "Confirm & Pay" : "Pay Now"}
                                    <svg className="w-5 h-5 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M17 8l4 4m0 0l-4 4m4-4H3"></path></svg>
                                </>
                            )}
                        </button>
                        <button
                            onClick={onCancel}
                            className="bg-white text-gray-700 font-bold py-4 px-8 rounded-2xl hover:bg-gray-50 border border-gray-200 transition-all duration-200 shadow-sm hover:shadow"
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};