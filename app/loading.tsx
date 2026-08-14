import React from 'react';

export default function Loading() {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-4 bg-cream-100">
      <div className="relative w-14 h-14">
        <div className="absolute inset-0 rounded-full border-4 border-gold-600/20 border-t-gold-600 animate-spin" />
        <div className="absolute inset-2 rounded-full bg-cream-200 flex items-center justify-center font-serif font-bold text-gold-700">
          S
        </div>
      </div>
      <p className="text-xs font-bold text-gold-700 tracking-widest uppercase animate-pulse">
        Loading Sculpt & Shine...
      </p>
    </div>
  );
}
