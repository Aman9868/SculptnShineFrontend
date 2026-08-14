'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import { X, Plus, Minus, Trash2, ShoppingBag, ArrowRight } from 'lucide-react';
import { useStore } from '@/context/StoreContext';
import { shippingAPI, ShippingData } from '@/lib/api/shipping';

export const CartDrawer: React.FC = () => {
  const {
    isCartOpen,
    closeCart,
    cart,
    removeFromCart,
    updateQuantity,
    cartSubtotal,
    cartTotalCount,
  } = useStore();
  const [shippingSettings, setShippingSettings] = useState<ShippingData | null>(null);

  useEffect(() => {
    if (!isCartOpen) return;

    const fetchShippingSettings = async () => {
      try {
        const res = await shippingAPI.getSettings();
        if (res.success) {
          setShippingSettings(res.data);
        }
      } catch (error) {
        console.error('Failed to fetch shipping settings:', error);
      }
    };

    fetchShippingSettings();
  }, [isCartOpen]);

  if (!isCartOpen) return null;

  const freeShippingThreshold = shippingSettings?.threshold ?? 1000;
  const defaultShippingCharge =
    shippingSettings?.rules.find((rule) => rule.isDefault)?.charge ??
    shippingSettings?.rules[0]?.charge ??
    0;
  const isFreeShipping = cartSubtotal >= freeShippingThreshold;
  const amountForFreeShipping = Math.max(0, freeShippingThreshold - cartSubtotal);
  const estimatedShipping = shippingSettings ? (isFreeShipping ? 0 : defaultShippingCharge) : null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
        onClick={closeCart}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white shadow-2xl border-l border-cream-300 flex flex-col justify-between z-10 animate-in slide-in-from-right duration-300">
          
          {/* Header */}
          <div className="p-4 sm:p-6 border-b border-cream-300 flex items-center justify-between bg-cream-100">
            <div className="flex items-center gap-2">
              <ShoppingBag size={20} className="text-gold-600" />
              <h3 className="font-serif text-lg font-bold text-gray-900">
                Your Shopping Cart ({cartTotalCount})
              </h3>
            </div>
            <button
              onClick={closeCart}
              className="p-2 text-gray-500 hover:text-gray-900 rounded-full hover:bg-cream-200"
              aria-label="Close Cart"
            >
              <X size={20} />
            </button>
          </div>

          {/* Free Shipping Progress Indicator */}
          <div className="bg-gold-600/10 px-4 py-2.5 border-b border-gold-600/20 text-center">
            {isFreeShipping ? (
              <p className="text-xs font-bold text-gold-700">
                🎉 Congratulations! You unlocked <span className="underline">FREE Delivery</span>!
              </p>
            ) : (
              <p className="text-xs font-semibold text-gray-700">
                Add <strong className="text-gold-700">₹{amountForFreeShipping.toLocaleString('en-IN')}</strong> more for FREE shipping!
              </p>
            )}
          </div>

          {/* Cart Items List */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 divide-y divide-cream-200">
            {cart.length === 0 ? (
              <div className="py-12 text-center space-y-3">
                <ShoppingBag size={48} className="mx-auto text-cream-300" />
                <p className="text-sm font-semibold text-gray-600">Your cart is currently empty</p>
                <button
                  onClick={closeCart}
                  className="bg-gold-600 text-white text-xs font-bold px-6 py-2 rounded-full"
                >
                  Start Shopping
                </button>
              </div>
            ) : (
              cart.map((item) => (
                <div key={item.product.id} className="pt-4 first:pt-0 flex gap-4">
                  {/* Thumbnail */}
                  <div className="relative w-20 h-20 rounded-xl bg-cream-100 border border-cream-200 shrink-0 overflow-hidden p-1">
                    <Image
                      src={item.product.image}
                      alt={item.product.name}
                      fill
                      className="object-contain"
                      sizes="80px"
                    />
                  </div>

                  {/* Info */}
                  <div className="flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-start">
                        <h4 className="text-xs font-bold text-gray-900 line-clamp-1">
                          {item.product.name}
                        </h4>
                        <button
                          onClick={() => removeFromCart(item.product.id)}
                          className="text-gray-400 hover:text-red-500 transition-colors p-1"
                          aria-label="Remove item"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                      <p className="text-[11px] text-gray-500 font-medium">
                        {item.product.category}
                      </p>
                    </div>

                    {/* Quantity controls & price */}
                    <div className="flex items-center justify-between mt-2">
                      <div className="flex items-center border border-cream-300 rounded-lg overflow-hidden bg-cream-50">
                        <button
                          onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                          className="p-1 text-gray-600 hover:bg-cream-200 transition-colors"
                        >
                          <Minus size={12} />
                        </button>
                        <span className="px-3 text-xs font-bold text-gray-800">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                          className="p-1 text-gray-600 hover:bg-cream-200 transition-colors"
                        >
                          <Plus size={12} />
                        </button>
                      </div>

                      <span className="text-xs font-extrabold text-gray-900">
                        ₹{(item.product.price * item.quantity).toLocaleString('en-IN')}
                      </span>
                    </div>

                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer Checkout Summary */}
          {cart.length > 0 && (
            <div className="p-4 sm:p-6 border-t border-cream-300 bg-cream-50 space-y-4">
              <div className="space-y-1.5 text-xs text-gray-600">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="font-bold text-gray-900">
                    ₹{cartSubtotal.toLocaleString('en-IN')}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Estimated Shipping</span>
                  <span className="font-bold text-gray-900">
                    {estimatedShipping === null
                      ? 'Calculated at checkout'
                      : isFreeShipping
                      ? 'FREE'
                      : `From ₹${estimatedShipping.toLocaleString('en-IN')}`}
                  </span>
                </div>
                <div className="flex justify-between text-sm font-extrabold text-gray-900 pt-2 border-t border-cream-300">
                  <span>Total</span>
                  <span className="text-gold-700">
                    ₹{(cartSubtotal + (estimatedShipping ?? 0)).toLocaleString('en-IN')}
                  </span>
                </div>
              </div>

              <button
                onClick={() => {
                  alert('Proceeding to Secure Checkout!');
                  closeCart();
                }}
                className="w-full bg-gold-600 hover:bg-gold-700 text-white font-bold py-3 px-4 rounded-xl shadow-lg shadow-gold-600/30 flex items-center justify-center gap-2 text-sm transition-all"
              >
                <span>PROCEED TO CHECKOUT</span>
                <ArrowRight size={16} />
              </button>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};
