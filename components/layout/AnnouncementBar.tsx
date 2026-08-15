import React from 'react';
import { Truck, ShieldCheck, Tag } from 'lucide-react';

async function getShippingSettings() {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/shipping`, {
      next: { revalidate: 3600 } // Cache for 1 hour
    });
    if (!res.ok) return {};
    const data = await res.json();
    return data.success ? data.data : {};
  } catch (error) {
    console.error("Error fetching shipping settings:", error);
    return {};
  }
}

export const AnnouncementBar = async () => {
  const shippingSettings = await getShippingSettings();
  const threshold = shippingSettings.threshold || 1000;

  return (
    <div className="bg-brandDark text-white text-xs py-2 px-4 border-b border-brandDark-soft">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-2 items-center text-center">
        
        {/* Left message */}
        <div className="flex items-center justify-center md:justify-start gap-2 font-medium text-gray-300 overflow-hidden">
          <Truck size={14} className="text-gold-500 shrink-0" />
          <span className="truncate">
            FREE SHIPPING ON ORDERS ABOVE <strong className="text-white">₹{threshold}</strong>
          </span>
        </div>

        {/* Middle Offer Code */}
        <div className="flex items-center justify-center gap-1.5 font-semibold text-gold-400 bg-brandDark-soft/70 px-3 py-1 rounded-full border border-gold-500/20 w-auto max-w-full mx-auto overflow-hidden">
          <Tag size={12} className="text-gold-400 shrink-0" />
          <span className="truncate text-[10px] sm:text-[11px] lg:text-xs">
            <span className="text-white">10% OFF</span> ON 1ST ORDER <span className="hidden sm:inline">&nbsp;|&nbsp;</span><span className="sm:hidden"> </span>CODE:{' '}
            <span className="text-amber-300 underline underline-offset-2 font-bold">SHINE10</span>
          </span>
        </div>

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
