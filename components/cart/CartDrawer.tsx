'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { X, Plus, Minus, Trash2, ShoppingBag, ArrowRight, Tag, Check, Sparkles, AlertCircle } from 'lucide-react';
import { useStore } from '@/context/StoreContext';
import { shippingAPI, ShippingData } from '@/lib/api/shipping';
import { couponAPI, CouponData, CouponValidationResult } from '@/lib/api/coupon';

export const CartDrawer: React.FC = () => {
  const router = useRouter();
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

  // Coupon State
  const [couponInput, setCouponInput] = useState('');
  const [appliedDiscount, setAppliedDiscount] = useState<CouponValidationResult | null>(null);
  const [couponError, setCouponError] = useState<string | null>(null);
  const [isApplyingCoupon, setIsApplyingCoupon] = useState(false);
  const [availableCoupons, setAvailableCoupons] = useState<CouponData[]>([]);
  const [showOffers, setShowOffers] = useState(false);

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

    const fetchOffers = async () => {
      try {
        const res = await couponAPI.getPublicVouchers();
        if (res.success && res.data) {
          setAvailableCoupons(res.data);
        }
      } catch (err) {
        console.error('Failed to fetch public coupons', err);
      }
    };

    fetchShippingSettings();
    fetchOffers();

    // Auto-check if user already clipped a coupon
    const savedCode = localStorage.getItem('sculptnshine_active_coupon');
    if (savedCode && !appliedDiscount && cart.length > 0) {
      handleApplyCoupon(savedCode);
    }
  }, [isCartOpen, cartSubtotal]);

  const handleApplyCoupon = async (codeToApply?: string) => {
    const code = (codeToApply || couponInput).trim();
    if (!code) return;

    setIsApplyingCoupon(true);
    setCouponError(null);

    try {
      const res = await couponAPI.validateCoupon(code, cart, cartSubtotal);
      if (res.success && res.data) {
        setAppliedDiscount(res.data);
        setCouponInput('');
        try {
          localStorage.setItem('sculptnshine_active_coupon', res.data.coupon.code);
        } catch {}
      }
    } catch (err: any) {
      setCouponError(err.message || 'Failed to apply coupon');
      setAppliedDiscount(null);
    } finally {
      setIsApplyingCoupon(false);
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedDiscount(null);
    setCouponError(null);
    try {
      localStorage.removeItem('sculptnshine_active_coupon');
    } catch {}
  };

  if (!isCartOpen) return null;

  const freeShippingThreshold = shippingSettings?.threshold ?? 1000;
  const defaultShippingCharge =
    shippingSettings?.rules.find((rule) => rule.isDefault)?.charge ??
    shippingSettings?.rules[0]?.charge ??
    0;
  const isFreeShipping = cartSubtotal >= freeShippingThreshold;
  const amountForFreeShipping = Math.max(0, freeShippingThreshold - cartSubtotal);
  const estimatedShipping = shippingSettings ? (isFreeShipping ? 0 : defaultShippingCharge) : null;
  const discountAmount = appliedDiscount ? appliedDiscount.discountAmount : 0;
  const payableSubtotal = Math.max(0, cartSubtotal - discountAmount);

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
              className="p-2 text-gray-500 hover:text-gray-900 rounded-full hover:bg-cream-200 cursor-pointer"
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
                  className="bg-gold-600 text-white text-xs font-bold px-6 py-2 rounded-full cursor-pointer"
                >
                  Start Shopping
                </button>
              </div>
            ) : (
              cart.map((item) => {
                const product = item.product || {};
                const variant = item.variant;
                const itemId = item.id;
                
                // Determine display image with safe fallback
                const imgSrc = (variant?.images && variant.images.length > 0 ? variant.images[0] : null) ||
                  product.thumbnail ||
                  (product.images && product.images.length > 0 ? product.images[0] : null) ||
                  product.image ||
                  '/assets/images/category-placeholder.jpg';

                const title = product.title || product.name || 'Product';
                const subtitle = variant 
                  ? [variant.flavor, variant.weight].filter(Boolean).join(' • ')
                  : (product.category?.name || product.category || 'Sculpt & Shine');

                const unitPrice = variant 
                  ? (variant.discountPercentage > 0 ? variant.unitPrice * (1 - variant.discountPercentage / 100) : variant.unitPrice)
                  : (product.discountPercentage > 0 ? product.unitPrice * (1 - product.discountPercentage / 100) : (product.unitPrice || product.price || 0));

                return (
                  <div key={itemId || product.id} className="pt-4 first:pt-0 flex gap-4">
                    {/* Thumbnail */}
                    <div className="relative w-20 h-20 rounded-xl bg-cream-100 border border-cream-200 shrink-0 overflow-hidden p-1 flex items-center justify-center">
                      <img
                        src={imgSrc || '/assets/images/category-placeholder.jpg'}
                        alt={title}
                        className="w-full h-full object-contain mix-blend-multiply"
                      />
                    </div>

                    {/* Info */}
                    <div className="flex-1 flex flex-col justify-between">
                      <div>
                        <div className="flex justify-between items-start">
                          <h4 className="text-xs font-bold text-gray-900 line-clamp-1">
                            {title}
                          </h4>
                          <button
                            onClick={() => removeFromCart(itemId)}
                            className="text-gray-400 hover:text-red-500 transition-colors p-1 cursor-pointer"
                            aria-label="Remove item"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                        <p className="text-[11px] text-gray-500 font-medium line-clamp-1">
                          {subtitle}
                        </p>
                      </div>

                      {/* Quantity controls & price */}
                      <div className="flex items-center justify-between mt-2">
                        <div className="flex items-center border border-cream-300 rounded-lg overflow-hidden bg-cream-50">
                          <button
                            onClick={() => updateQuantity(itemId, item.quantity - 1)}
                            className="p-1 text-gray-600 hover:bg-cream-200 transition-colors cursor-pointer"
                            aria-label="Decrease quantity"
                          >
                            <Minus size={12} />
                          </button>
                          <span className="px-3 text-xs font-bold text-gray-800">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => updateQuantity(itemId, item.quantity + 1)}
                            className="p-1 text-gray-600 hover:bg-cream-200 transition-colors cursor-pointer"
                            aria-label="Increase quantity"
                          >
                            <Plus size={12} />
                          </button>
                        </div>

                        <span className="text-xs font-extrabold text-gray-900">
                          ₹{(unitPrice * item.quantity).toLocaleString('en-IN')}
                        </span>
                      </div>

                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Coupon & Voucher Input Box */}
          {cart.length > 0 && (
            <div className="px-4 sm:px-6 py-3 border-t border-cream-200 bg-white space-y-2">
              {appliedDiscount ? (
                <div className="p-2.5 bg-gold-50 border border-gold-300 rounded-xl flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-gold-600 text-white flex items-center justify-center">
                      <Check size={14} />
                    </div>
                    <div>
                      <span className="font-mono font-extrabold text-gold-950 uppercase">
                        {appliedDiscount.coupon.code}
                      </span>
                      <p className="text-[10px] text-gold-800 font-bold">
                        Applied! You save ₹{appliedDiscount.discountAmount.toLocaleString('en-IN')}
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={handleRemoveCoupon}
                    className="text-gray-400 hover:text-red-500 text-xs font-bold px-2 py-1 cursor-pointer"
                  >
                    Remove
                  </button>
                </div>
              ) : (
                <div className="space-y-1.5">
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <Tag size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input
                        type="text"
                        value={couponInput}
                        onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') handleApplyCoupon();
                        }}
                        placeholder="ENTER PROMO CODE"
                        className="w-full pl-8 pr-3 py-2 border border-cream-300 rounded-xl text-xs uppercase font-mono font-bold tracking-wider focus:ring-1 focus:ring-gold-500 focus:border-gold-500 outline-none"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => handleApplyCoupon()}
                      disabled={isApplyingCoupon || !couponInput.trim()}
                      className="px-4 py-2 bg-gray-900 hover:bg-gold-600 disabled:opacity-50 text-white text-xs font-bold rounded-xl transition-all active:scale-95 cursor-pointer shrink-0"
                    >
                      {isApplyingCoupon ? '...' : 'APPLY'}
                    </button>
                  </div>

                  {couponError && (
                    <p className="text-[11px] text-red-600 font-semibold flex items-center gap-1">
                      <AlertCircle size={12} />
                      <span>{couponError}</span>
                    </p>
                  )}

                  {/* Available Offers Accordion */}
                  {availableCoupons.length > 0 && (
                    <div className="pt-1">
                      <button
                        type="button"
                        onClick={() => setShowOffers(!showOffers)}
                        className="text-[11px] font-bold text-gold-700 hover:underline flex items-center gap-1 cursor-pointer"
                      >
                        <Sparkles size={12} />
                        <span>{showOffers ? 'Hide Available Offers' : `View ${availableCoupons.length} Available Offers`}</span>
                      </button>

                      {showOffers && (
                        <div className="mt-2 space-y-1.5 max-h-32 overflow-y-auto p-1 bg-cream-50 rounded-xl border border-cream-200">
                          {availableCoupons.map((c) => (
                            <div
                              key={c.id}
                              onClick={() => handleApplyCoupon(c.code)}
                              className="p-2 bg-white rounded-lg border border-cream-200 hover:border-gold-400 cursor-pointer flex items-center justify-between text-xs transition-colors"
                            >
                              <div>
                                <span className="font-mono font-bold text-gray-900">{c.code}</span>
                                <p className="text-[10px] text-gray-500">{c.title}</p>
                              </div>
                              <span className="text-[10px] font-bold text-gold-700 bg-gold-50 px-2 py-0.5 rounded">
                                Apply
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

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

                {appliedDiscount && (
                  <div className="flex justify-between text-emerald-700 font-bold">
                    <span>Coupon Discount ({appliedDiscount.coupon.code})</span>
                    <span>-₹{discountAmount.toLocaleString('en-IN')}</span>
                  </div>
                )}

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
                    ₹{(payableSubtotal + (estimatedShipping ?? 0)).toLocaleString('en-IN')}
                  </span>
                </div>
              </div>

              <button
                onClick={() => {
                  closeCart();
                  router.push('/checkout');
                }}
                className="w-full bg-gold-600 hover:bg-gold-700 text-white font-bold py-3 px-4 rounded-xl shadow-lg shadow-gold-600/30 flex items-center justify-center gap-2 text-sm transition-all active:scale-95 cursor-pointer"
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
