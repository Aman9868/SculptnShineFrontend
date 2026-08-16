import React from 'react';
import { Truck, ShieldCheck, Tag, Sparkles } from 'lucide-react';

async function getShippingSettings() {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/shipping`, {
      next: { revalidate: 30 },
    });
    if (!res.ok) return {};
    const data = await res.json();
    return data.success ? data.data : {};
  } catch (error) {
    return {};
  }
}

async function getAnnouncementCoupon() {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/coupons/announcement`, {
      next: { revalidate: 30 },
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

  // Set of live ticker promo items
  const tickerItems = (
    <>
      {/* 1. Free Shipping */}
      <div className="inline-flex items-center gap-2 px-6">
        <Truck className="w-3.5 h-3.5 text-gold-400 shrink-0" />
        <span className="font-semibold text-gray-200 tracking-wide text-xs uppercase">
          FREE EXPRESS SHIPPING ON ORDERS ABOVE <strong className="text-gold-400 font-extrabold">₹{threshold}</strong>
        </span>
      </div>

      <span className="text-gold-500/40 text-xs select-none">•</span>

      {/* 2. Live Coupon / Discount Code (if active) */}
      {isFirstOrderCoupon && couponText && coupon ? (
        <>
          <div className="inline-flex items-center gap-2 px-6">
            <span className="inline-flex items-center gap-1 bg-gold-500/20 text-gold-300 px-2 py-0.5 rounded-full text-[10px] font-extrabold border border-gold-500/30">
              <Tag className="w-3 h-3 text-gold-400 shrink-0" />
              SPECIAL OFFER
            </span>
            <span className="font-semibold text-white tracking-wide text-xs">
              {couponText} &nbsp;|&nbsp; USE CODE:{' '}
              <span className="text-amber-300 font-mono font-extrabold underline underline-offset-2">
                {coupon.code}
              </span>
            </span>
          </div>
          <span className="text-gold-500/40 text-xs select-none">•</span>
        </>
      ) : (
        <>
          <div className="inline-flex items-center gap-2 px-6">
            <Sparkles className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            <span className="font-semibold text-gray-200 tracking-wide text-xs uppercase">
              PREMIUM LUXURY WELLNESS & ATHLETIC NUTRITION &nbsp;|&nbsp; <strong className="text-amber-300">UP TO 30% OFF</strong>
            </span>
          </div>
          <span className="text-gold-500/40 text-xs select-none">•</span>
        </>
      )}

      {/* 3. Authentic Guarantee */}
      <div className="inline-flex items-center gap-2 px-6">
        <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
        <span className="font-semibold text-gray-200 tracking-wide text-xs uppercase">
          100% AUTHENTIC PRODUCTS &nbsp;|&nbsp; SOURCED DIRECTLY FROM CERTIFIED BRANDS
        </span>
      </div>

      <span className="text-gold-500/40 text-xs select-none">•</span>
    </>
  );

  return (
    <aside aria-label="Announcement Bar" className="relative bg-[#111624] text-white text-xs py-2 border-b border-white/[0.08] overflow-hidden select-none">
      {/* Left gradient fade */}
      <div className="absolute left-0 top-0 bottom-0 w-12 sm:w-20 bg-gradient-to-r from-[#111624] via-[#111624]/80 to-transparent z-10 pointer-events-none" />

      {/* Right gradient fade */}
      <div className="absolute right-0 top-0 bottom-0 w-12 sm:w-20 bg-gradient-to-l from-[#111624] via-[#111624]/80 to-transparent z-10 pointer-events-none" />

      {/* Marquee Track (Duplicated for seamless continuous loop) */}
      <div className="flex w-max overflow-hidden">
        <div className="animate-ticker-marquee flex items-center whitespace-nowrap">
          {tickerItems}
          {tickerItems}
        </div>
      </div>
    </aside>
  );
};

