import React from 'react';
import { Truck, ShieldCheck, Tag } from 'lucide-react';

async function getShippingSettings() {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/shipping`, {
      cache: 'no-store'
    });
    if (!res.ok) return {};
    const data = await res.json();
    return data.success ? data.data : {};
  } catch (error) {
    console.error("Error fetching shipping settings:", error);
    return {};
  }
}

async function getAnnouncementCoupon() {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/coupons/announcement`, {
      cache: 'no-store'
    });
    if (!res.ok) return null;
    const data = await res.json();
    return data.success ? data.data : null;
  } catch (error) {
    return null;
  }
}

export const AnnouncementBar = async () => {
  const [shippingSettings, coupon] = await Promise.all([
    getShippingSettings(),
    getAnnouncementCoupon(),
  ]);

  const threshold = shippingSettings.threshold || 1000;

  const isFirstOrderCoupon = coupon && coupon.scopeType === 'FIRST_ORDER';

  const discountStr = isFirstOrderCoupon
    ? coupon.discountType === 'PERCENTAGE'
      ? `${coupon.discountValue}% OFF`
      : `FLAT ₹${coupon.discountValue} OFF`
    : '';

  const couponText = isFirstOrderCoupon
    ? coupon.bannerText || `${discountStr} ON 1ST ORDER`
    : null;

  return (
    <div className="bg-brandDark text-white text-xs py-2 px-4 border-b border-brandDark-soft">
      <div className={`max-w-7xl mx-auto items-center text-center ${
        isFirstOrderCoupon ? 'grid grid-cols-1 md:grid-cols-3 gap-2' : 'flex justify-between gap-4'
      }`}>
        
        {/* Left message */}
        <div className="flex items-center justify-center md:justify-start gap-2 font-medium text-gray-300 overflow-hidden">
          <Truck size={14} className="text-gold-500 shrink-0" />
          <span className="truncate">
            FREE SHIPPING ON ORDERS ABOVE <strong className="text-white">₹{threshold}</strong>
          </span>
        </div>

        {/* Middle Offer Code - ONLY RENDERED IF ACTIVE FIRST ORDER COUPON FROM API EXISTS */}
        {isFirstOrderCoupon && couponText && coupon && (
          <div className="flex items-center justify-center gap-1.5 font-semibold text-gold-400 bg-brandDark-soft/70 px-3 py-1 rounded-full border border-gold-500/20 w-auto max-w-full mx-auto overflow-hidden">
            <Tag size={12} className="text-gold-400 shrink-0" />
            <span className="truncate text-[10px] sm:text-[11px] lg:text-xs">
              <span className="text-white">{couponText}</span>{' '}
              <span className="hidden sm:inline">&nbsp;|&nbsp;</span>
              <span className="sm:hidden"> </span>CODE:{' '}
              <span className="text-amber-300 underline underline-offset-2 font-bold font-mono">
                {coupon.code}
              </span>
            </span>
          </div>
        )}

        {/* Right Assurance */}
        <div className="hidden md:flex items-center justify-end gap-2 font-medium text-gray-300 overflow-hidden">
          <ShieldCheck size={14} className="text-gold-500 shrink-0" />
          <span className="truncate">
            100% ORIGINAL PRODUCTS &nbsp;|&nbsp; PREMIUM QUALITY
          </span>
        </div>

      </div>
    </div>
  );
};
