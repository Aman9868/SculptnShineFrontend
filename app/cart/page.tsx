'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ShoppingBag, ArrowRight, Trash2, Plus, Minus, ArrowLeft } from 'lucide-react';
import { useStore } from '@/context/StoreContext';
import { cartAPI } from '@/lib/api/cart';
import { shippingAPI, ShippingData } from '@/lib/api/shipping';

export default function CartPage() {
  const { cart, removeFromCart, updateQuantity, cartSubtotal, cartTotalCount } = useStore();
  const router = useRouter();
  const [cartItems, setCartItems] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [shippingSettings, setShippingSettings] = useState<ShippingData | null>(null);

  useEffect(() => {
    const fetchCartAndSettings = async () => {
      try {
        const [cartRes, shippingRes] = await Promise.all([
          cartAPI.getCart(),
          shippingAPI.getSettings()
        ]);
        
        if (cartRes.success && cartRes.data && cartRes.data.items) {
          setCartItems(cartRes.data.items);
        }
        
        if (shippingRes.success) {
          setShippingSettings(shippingRes.data);
        }
      } catch (error) {
        console.error("Failed to fetch cart or shipping settings:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCartAndSettings();
  }, []);

  return (
    <div className="min-h-screen bg-cream-50 pt-8 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header Section */}
        <div className="flex items-center gap-2 text-sm text-gray-500 mb-6">
          <Link href="/" className="hover:text-gold-600 transition-colors">Home</Link>
          <span>/</span>
          <span className="text-gray-900 font-medium">Your Cart</span>
        </div>

        <div className="flex items-end justify-between mb-10 pb-6 border-b border-cream-300">
          <div>
            <h1 className="font-serif text-3xl sm:text-4xl text-brandDark mb-2">Shopping Cart</h1>
            <p className="text-gray-600 text-sm sm:text-base">
              You have {cart.length} {cart.length === 1 ? 'item' : 'items'} in your cart.
            </p>
          </div>
          <Link href="/" className="hidden sm:flex items-center gap-2 text-sm font-semibold text-gold-700 hover:text-gold-800 transition-colors">
            <ArrowLeft size={16} />
            Continue Shopping
          </Link>
        </div>

        {/* Content Section */}
        {cart.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 px-4 bg-white rounded-3xl shadow-sm border border-cream-200/50 text-center">
            <div className="w-24 h-24 bg-cream-100 rounded-full flex items-center justify-center mb-6 text-gold-500">
              <ShoppingBag size={48} />
            </div>
            <h2 className="font-serif text-2xl text-brandDark mb-3">Your cart is empty</h2>
            <p className="text-gray-500 max-w-md mb-8">
              Looks like you haven't added anything to your cart yet. Discover our premium supplements and start your fitness journey today.
            </p>
            <Link 
              href="/"
              className="inline-flex items-center gap-2 bg-brandDark hover:bg-black text-white font-bold py-3.5 px-8 rounded-xl transition-all shadow-md hover:shadow-xl hover:-translate-y-1"
            >
              Start Shopping
              <ArrowRight size={18} />
            </Link>
          </div>
        ) : (
          <div className="flex flex-col lg:flex-row gap-8 lg:gap-12">
            
            {/* Cart Items */}
            <div className="lg:w-2/3">
              <div className="bg-white rounded-3xl shadow-sm border border-cream-200/50 overflow-hidden">
                <div className="hidden sm:grid grid-cols-12 gap-4 p-6 bg-cream-100/50 border-b border-cream-200 text-xs font-bold text-gray-500 uppercase tracking-wider">
                  <div className="col-span-6">Product</div>
                  <div className="col-span-3 text-center">Quantity</div>
                  <div className="col-span-3 text-right">Total</div>
                </div>
                
                <div className="divide-y divide-cream-200">
                  {cart.map((item) => {
                    const product = item.product;
                    if (!product) return null;

                    const originalPrice = item.variant ? item.variant.unitPrice : (product.unitPrice || 0);
                    let finalPrice = originalPrice;
                    if (item.variant && item.variant.discountPercentage > 0) {
                      finalPrice = item.variant.unitPrice * (1 - item.variant.discountPercentage / 100);
                    } else if (product.discountPercentage > 0) {
                      finalPrice = product.unitPrice * (1 - product.discountPercentage / 100);
                    }
                    
                    return (
                      <div key={item.id} className="p-4 sm:p-6 grid grid-cols-1 sm:grid-cols-12 gap-4 sm:gap-6 items-center hover:bg-cream-50/50 transition-colors">
                        
                        {/* Product Info */}
                        <div className="col-span-1 sm:col-span-6 flex items-center gap-4">
                          <div className="w-20 h-20 sm:w-24 sm:h-24 bg-cream-100 rounded-md overflow-hidden shrink-0 border border-cream-200">
                            <img 
                              src={product.images?.[0] || '/product-placeholder.png'} 
                              alt={product.title} 
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div>
                            <Link href={`/product/${product.id}`} className="font-bold text-brandDark hover:text-gold-600 transition-colors line-clamp-2">
                              {product.title}
                            </Link>
                            
                            {item.variant && (
                              <div className="text-xs text-gray-500 mt-1 space-y-0.5">
                                {item.variant.flavor && <p><span className="font-semibold">Flavor:</span> {item.variant.flavor}</p>}
                                {item.variant.weight && <p><span className="font-semibold">Size:</span> {item.variant.weight}</p>}
                              </div>
                            )}

                            <div className="flex items-center gap-2 mt-1.5 sm:mt-2">
                              <span className="text-sm font-bold text-brandDark">
                                ₹{finalPrice.toLocaleString('en-IN')}
                              </span>
                              {originalPrice > finalPrice && (
                                <span className="text-xs text-gray-400 line-through">
                                  ₹{originalPrice.toLocaleString('en-IN')}
                                </span>
                              )}
                            </div>
                            
                            {/* Mobile Remove */}
                            <button 
                              onClick={() => removeFromCart(item.id)}
                              className="sm:hidden text-xs text-red-500 font-medium flex items-center gap-1 hover:text-red-600"
                            >
                              <Trash2 size={12} /> Remove
                            </button>
                          </div>
                        </div>

                        {/* Quantity */}
                        <div className="col-span-1 sm:col-span-3 flex items-center sm:justify-center justify-between mt-2 sm:mt-0">
                          <span className="sm:hidden text-sm text-gray-500 font-medium">Quantity:</span>
                          <div className="flex items-center bg-cream-100 rounded-full p-1 border border-cream-200">
                            <button 
                              onClick={() => updateQuantity(item.id, Math.max(1, item.quantity - 1))}
                              className="w-8 h-8 rounded-full flex items-center justify-center text-gray-600 hover:bg-white hover:shadow-sm transition-all"
                            >
                              <Minus size={14} />
                            </button>
                            <span className="w-8 text-center text-sm font-bold text-brandDark">
                              {item.quantity}
                            </span>
                            <button 
                              onClick={() => updateQuantity(item.id, item.quantity + 1)}
                              className="w-8 h-8 rounded-full flex items-center justify-center text-gray-600 hover:bg-white hover:shadow-sm transition-all"
                            >
                              <Plus size={14} />
                            </button>
                          </div>
                        </div>

                        {/* Total & Desktop Remove */}
                        <div className="col-span-1 sm:col-span-3 flex items-center sm:justify-end justify-between mt-2 sm:mt-0">
                          <span className="sm:hidden text-sm text-gray-500 font-medium">Total:</span>
                          <div className="flex items-center gap-4">
                            <span className="font-bold text-brandDark text-lg">
                              ₹{(finalPrice * item.quantity).toLocaleString('en-IN')}
                            </span>
                            <button 
                              onClick={() => removeFromCart(item.id)}
                              className="hidden sm:flex w-8 h-8 rounded-full items-center justify-center text-gray-400 hover:text-red-500 hover:bg-red-50 transition-all"
                              aria-label="Remove item"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </div>

                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Order Summary */}
            {(() => {
              const originalTotal = cart.reduce((acc, item) => {
                const price = item.variant?.unitPrice || item.product?.unitPrice || 0;
                return acc + price * item.quantity;
              }, 0);

              const discountTotal = cart.reduce((acc, item) => {
                let disc = 0;
                if (item.variant && item.variant.discountPercentage > 0) {
                   disc = item.variant.unitPrice * (item.variant.discountPercentage / 100);
                } else if (item.product && item.product.discountPercentage > 0) {
                   disc = item.product.unitPrice * (item.product.discountPercentage / 100);
                }
                return acc + disc * item.quantity;
              }, 0);

              const gstTotal = cart.reduce((acc, item) => {
                let priceAfterDisc = item.variant?.unitPrice || item.product?.unitPrice || 0;
                let gstRate = item.variant?.gst || item.product?.gst || 18;
                
                if (item.variant && item.variant.discountPercentage > 0) {
                   priceAfterDisc = item.variant.unitPrice * (1 - item.variant.discountPercentage / 100);
                } else if (item.product && item.product.discountPercentage > 0) {
                   priceAfterDisc = item.product.unitPrice * (1 - item.product.discountPercentage / 100);
                }

                return acc + (priceAfterDisc * (gstRate / 100)) * item.quantity;
              }, 0);

              // We calculate subtotal with GST included
              const finalTotal = (originalTotal - discountTotal) + gstTotal;
              
              let shippingDisplay = 'Calculated at checkout';
              if (shippingSettings && finalTotal >= shippingSettings.threshold) {
                shippingDisplay = 'Free';
              }

              return (
                <div className="lg:w-1/3">
                  <div className="bg-white rounded-3xl shadow-sm border border-cream-200/50 p-6 sm:p-8 sticky top-28">
                    <h2 className="font-serif text-2xl text-brandDark mb-6 pb-4 border-b border-cream-200">Order Summary</h2>
                    
                    <div className="space-y-4 mb-6">
                      <div className="flex justify-between text-gray-600">
                        <span>Original Price</span>
                        <span className="font-medium text-gray-500">₹{originalTotal.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</span>
                      </div>
                      {discountTotal > 0 && (
                        <div className="flex justify-between text-orange-600">
                          <span>Discount</span>
                          <span className="font-medium">-₹{discountTotal.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</span>
                        </div>
                      )}
                      <div className="flex justify-between text-gray-600">
                        <span>GST</span>
                        <span className="font-medium">₹{gstTotal.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</span>
                      </div>
                      <div className="flex justify-between text-gray-600">
                        <span>Shipping</span>
                        <span className={`font-medium ${shippingDisplay === 'Free' ? 'text-green-600' : 'text-gray-500 text-sm'}`}>
                          {shippingDisplay}
                        </span>
                      </div>
                    </div>

                    <div className="pt-6 border-t border-cream-200 mb-8">
                      <div className="flex justify-between items-end mb-2">
                        <span className="font-bold text-gray-900 text-lg">Subtotal</span>
                        <span className="font-bold text-brandDark text-2xl">
                          ₹{finalTotal.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                        </span>
                      </div>
                  <p className="text-xs text-gray-500 text-right">Price is after discount and inclusive of GST</p>
                </div>

                <button 
                  onClick={() => router.push('/checkout')}
                  className="w-full bg-gold-600 hover:bg-gold-700 text-white font-bold py-4 rounded-xl transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2 group"
                >
                  Proceed to Checkout
                  <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                </button>

                <div className="mt-6 flex items-center justify-center gap-3">
                  <span className="h-6 px-2.5 rounded border border-gray-200 bg-white flex items-center justify-center font-sans text-xs font-black italic tracking-tighter text-[#1434cb]">
                    VISA
                  </span>
                  <span className="h-6 px-2 rounded border border-gray-200 bg-white flex items-center justify-center gap-0.5">
                    <span className="relative inline-flex h-3.5 w-6 items-center">
                      <span className="absolute left-0 h-3.5 w-3.5 rounded-full bg-[#eb001b]" />
                      <span className="absolute right-0 h-3.5 w-3.5 rounded-full bg-[#f79e1b] mix-blend-multiply" />
                    </span>
                  </span>
                  <span className="h-6 px-2 rounded border border-gray-200 bg-white flex items-center justify-center font-sans text-[11px] font-black italic tracking-tight text-gray-700">
                    UPI
                    <span className="ml-1 inline-flex items-center gap-px">
                      <span className="h-0 w-0 border-y-[4px] border-l-[6px] border-y-transparent border-l-[#1f9d55]" />
                      <span className="h-0 w-0 border-y-[4px] border-l-[6px] border-y-transparent border-l-[#f97316]" />
                    </span>
                  </span>
                </div>
                </div>
              </div>
            );
          })()}

          </div>
        )}

      </div>
    </div>
  );
}
