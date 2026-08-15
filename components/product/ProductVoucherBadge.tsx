'use client';

import React, { useState, useEffect } from 'react';
import { Tag, Check, Sparkles, Info } from 'lucide-react';
import { CouponData, couponAPI } from '@/lib/api/coupon';

interface ProductVoucherBadgeProps {
  productId?: string;
  categoryId?: string;
  brandId?: string;
  variant?: 'compact' | 'full';
  onClip?: (coupon: CouponData) => void;
}

export const ProductVoucherBadge: React.FC<ProductVoucherBadgeProps> = ({
  productId,
  categoryId,
  brandId,
  variant = 'compact',
  onClip,
}) => {
  const [coupons, setCoupons] = useState<CouponData[]>([]);
  const [clippedCodes, setClippedCodes] = useState<Record<string, boolean>>({});
  const [showTerms, setShowTerms] = useState<string | null>(null);

  useEffect(() => {
    // Load previously clipped coupons from localStorage
    try {
      const saved = localStorage.getItem('sculptnshine_clipped_coupons');
      if (saved) {
        setClippedCodes(JSON.parse(saved));
      }
    } catch {}

    const fetchVouchers = async () => {
      try {
        const res = await couponAPI.getPublicVouchers({
          productId,
          categoryId,
          brandId,
        });
        if (res.success && res.data) {
          setCoupons(res.data);
        }
      } catch (err) {
        console.error('Failed to load product vouchers', err);
      }
    };

    fetchVouchers();
  }, [productId, categoryId, brandId]);

  if (coupons.length === 0) return null;

  const handleClip = (e: React.MouseEvent, coupon: CouponData) => {
    e.preventDefault();
    e.stopPropagation();

    const isCurrentlyClipped = !!clippedCodes[coupon.code];
    const newClipped = { ...clippedCodes };

    if (isCurrentlyClipped) {
      // Toggle OFF / Deselect
      delete newClipped[coupon.code];
      setClippedCodes(newClipped);
      try {
        localStorage.setItem('sculptnshine_clipped_coupons', JSON.stringify(newClipped));
        const activeCoupon = localStorage.getItem('sculptnshine_active_coupon');
        if (activeCoupon === coupon.code) {
          localStorage.removeItem('sculptnshine_active_coupon');
        }
      } catch {}
    } else {
      // Toggle ON / Clip
      newClipped[coupon.code] = true;
      setClippedCodes(newClipped);
      try {
        localStorage.setItem('sculptnshine_clipped_coupons', JSON.stringify(newClipped));
        localStorage.setItem('sculptnshine_active_coupon', coupon.code);
      } catch {}

      if (onClip) {
        onClip(coupon);
      }
    }
  };

  const topCoupon = coupons[0];
  const isClipped = !!clippedCodes[topCoupon.code];

  if (variant === 'compact') {
    return (
      <div className="inline-flex items-center gap-1.5 bg-gold-50 text-gold-900 border border-gold-300 px-2 py-0.5 rounded-md text-[11px] font-bold shadow-2xs">
        <span className="bg-gold-600 text-white text-[9px] font-extrabold px-1 py-0.2 rounded uppercase">
          Coupon
        </span>
        <span className="truncate">
          {topCoupon.badgeText || (topCoupon.discountType === 'PERCENTAGE' ? `Save ${topCoupon.discountValue}%` : `Save ₹${topCoupon.discountValue}`)}
        </span>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {coupons.slice(0, 2).map((c) => {
        const clipped = !!clippedCodes[c.code];
        const isDetailsOpen = showTerms === c.code;

        return (
          <div
            key={c.id}
            className={`p-3 rounded-xl border transition-all ${
              clipped
                ? 'bg-gold-50/80 border-gold-500 ring-1 ring-gold-400/40 text-brandDark'
                : 'bg-gold-50/30 border-gold-200 text-brandDark hover:border-gold-400'
            }`}
          >
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5 min-w-0">
                {/* Checkbox Toggle Button */}
                <button
                  type="button"
                  onClick={(e) => handleClip(e, c)}
                  className={`w-5 h-5 rounded flex items-center justify-center border transition-all cursor-pointer ${
                    clipped
                      ? 'bg-gold-500 border-gold-500 text-white shadow-2xs'
                      : 'bg-white border-gray-300 hover:border-gold-500 text-transparent'
                  }`}
                  aria-label={clipped ? "Unclip Voucher" : "Clip Voucher"}
                  title={clipped ? "Click to deselect voucher" : "Click to apply voucher"}
                >
                  <Check size={14} className={clipped ? 'opacity-100' : 'opacity-0'} />
                </button>

                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="bg-gold-500 text-white text-[10px] font-extrabold px-1.5 py-0.5 rounded uppercase tracking-wider">
                      Voucher
                    </span>
                    <span className="text-xs font-extrabold text-gray-900">
                      {c.badgeText || (c.discountType === 'PERCENTAGE' ? `Save ${c.discountValue}%` : `Save ₹${c.discountValue}`)}
                    </span>
                    {clipped && (
                      <span className="text-[10px] font-bold text-gold-900 bg-gold-100 border border-gold-300/80 px-1.5 py-0.2 rounded">
                        ✓ Applied to Checkout
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-gray-600 mt-0.5 line-clamp-1">
                    {c.title} • Code: <span className="font-mono font-bold text-gray-900">{c.code}</span>
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1.5 shrink-0">
                <button
                  type="button"
                  onClick={() => setShowTerms(isDetailsOpen ? null : c.code)}
                  className="text-gray-400 hover:text-gray-700 p-1 text-[11px] font-semibold underline cursor-pointer"
                >
                  Terms
                </button>
                <button
                  type="button"
                  onClick={(e) => handleClip(e, c)}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    clipped
                      ? 'bg-gold-500 hover:bg-gold-600 text-white shadow-2xs'
                      : 'bg-gold-500 hover:bg-gold-600 text-white shadow-2xs active:scale-95'
                  }`}
                >
                  {clipped ? '✓ Clipped' : 'Clip Coupon'}
                </button>
              </div>
            </div>

            {/* Terms expandable dropdown */}
            {isDetailsOpen && (
              <div className="mt-2 pt-2 border-t border-gold-200/80 text-[11px] text-gray-600 space-y-1 bg-white/70 p-2.5 rounded-lg">
                <p className="font-semibold text-gray-800">{c.description || 'Promotional coupon terms apply.'}</p>
                {c.minOrderAmount ? (
                  <p>• Minimum cart subtotal: ₹{c.minOrderAmount.toLocaleString('en-IN')}</p>
                ) : null}
                {c.maxDiscountAmount ? (
                  <p>• Maximum savings cap: ₹{c.maxDiscountAmount.toLocaleString('en-IN')}</p>
                ) : null}
                <p>• Applicable automatically during checkout upon clipping. Click again to unclip.</p>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};
