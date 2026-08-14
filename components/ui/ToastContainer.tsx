'use client';

import React from 'react';
import { useStore } from '@/context/StoreContext';
import { CheckCircle2, Info } from 'lucide-react';

export const ToastContainer: React.FC = () => {
  const { toast } = useStore();

  if (!toast) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 animate-in fade-in slide-in-from-bottom-4 duration-300">
      <div className="bg-brandDark text-white px-4 py-3 rounded-2xl shadow-2xl border border-brandDark-lighter flex items-center gap-3 max-w-sm">
        {toast.type === 'info' ? (
          <Info size={18} className="text-amber-400 shrink-0" />
        ) : (
          <CheckCircle2 size={18} className="text-emerald-400 shrink-0" />
        )}
        <p className="text-xs font-semibold">{toast.text}</p>
      </div>
    </div>
  );
};
