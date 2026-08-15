'use client';

import React from 'react';
import { useHealth } from '@/context/HealthContext';
import { 
  Wrench, 
  WifiOff, 
  RefreshCw, 
  ShieldCheck, 
  Clock, 
  Mail, 
  Phone, 
  MessageSquare,
  Sparkles
} from 'lucide-react';

export default function MaintenanceScreen() {
  const { 
    isMaintenance, 
    isOffline, 
    healthData, 
    checkHealth, 
    isChecking, 
    nextRetrySeconds 
  } = useHealth();

  const envMaintenance =
    process.env.NEXT_PUBLIC_WEBSITE_MAINTENANCE_MODE === 'true' ||
    process.env.NEXT_PUBLIC_MAINTENANCE_MODE === 'true';

  if (!isMaintenance && !isOffline && !envMaintenance) {
    return null;
  }

  const isScheduled = isMaintenance || envMaintenance;
  const title = isScheduled 
    ? "Scheduled Maintenance in Progress" 
    : "System Upgrade & Connectivity";
  
  const message = healthData?.maintenanceMessage || (
    isScheduled
      ? "We are currently optimizing our catalog and upgrading our infrastructure to bring you a faster, smoother luxury shopping experience."
      : "We're currently performing a routine server sync and system upgrade. All services will be restored momentarily."
  );

  return (
    <div className="fixed inset-0 z-[999999] bg-[#09090b] text-white flex flex-col items-center justify-center p-4 sm:p-6 overflow-y-auto selection:bg-gold-500/30 selection:text-gold-200">
      {/* Background ambient lighting effects */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-gradient-to-tr from-gold-500/10 via-amber-500/5 to-transparent rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-96 h-96 bg-gold-600/5 rounded-full blur-3xl pointer-events-none" />

      {/* Main card */}
      <div className="relative z-10 max-w-xl w-full bg-gradient-to-b from-[#141417] to-[#0c0c0e] border border-white/10 rounded-3xl p-6 sm:p-10 shadow-2xl shadow-black/80 backdrop-blur-xl text-center space-y-6 animate-in fade-in zoom-in-95 duration-300">
        
        {/* Brand Header */}
        <div className="flex items-center justify-center gap-2 mb-2">
          <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-gold-400 to-gold-600 flex items-center justify-center shadow-lg shadow-gold-500/20">
            <Sparkles className="h-5 w-5 text-black" />
          </div>
          <span className="text-xl font-extrabold tracking-wider bg-gradient-to-r from-white via-gold-200 to-gold-400 bg-clip-text text-transparent">
            SCULPT & SHINE
          </span>
        </div>

        {/* Status Badge */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-gold-500/10 border border-gold-500/20 text-gold-300 text-xs font-bold uppercase tracking-widest">
          {isScheduled ? (
            <>
              <Wrench className="h-3.5 w-3.5 text-gold-400 animate-pulse" />
              <span>Maintenance Mode</span>
            </>
          ) : (
            <>
              <WifiOff className="h-3.5 w-3.5 text-amber-400 animate-pulse" />
              <span>Reconnecting Server</span>
            </>
          )}
        </div>

        {/* Hero Title & Description */}
        <div className="space-y-3">
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
            {title}
          </h1>
          <p className="text-sm sm:text-base text-gray-400 leading-relaxed max-w-md mx-auto">
            {message}
          </p>
        </div>

        {/* Auto-reconnect live timer & pulse */}
        <div className="p-4 bg-white/[0.03] border border-white/[0.06] rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2.5 text-gray-300">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-gold-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-gold-500"></span>
            </span>
            <span className="font-medium">
              Auto-reconnecting in <strong className="text-gold-400 font-bold">{nextRetrySeconds}s</strong>
            </span>
          </div>

          <button
            onClick={() => checkHealth()}
            disabled={isChecking}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-4 py-2 bg-gradient-to-r from-gold-500 to-gold-600 hover:from-gold-600 hover:to-gold-700 text-black font-extrabold rounded-xl transition-all shadow-md shadow-gold-500/20 hover:scale-[1.02] active:scale-[0.98] cursor-pointer disabled:opacity-50"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isChecking ? 'animate-spin' : ''}`} />
            {isChecking ? 'Checking...' : 'Check Connection'}
          </button>
        </div>

        {/* Features banner during maintenance */}
        <div className="grid grid-cols-2 gap-3 pt-2 text-left">
          <div className="p-3 bg-white/[0.02] border border-white/[0.04] rounded-xl flex items-start gap-2.5">
            <ShieldCheck className="h-4 w-4 text-gold-400 mt-0.5 shrink-0" />
            <div>
              <p className="text-xs font-bold text-gray-200">Data Safe & Encrypted</p>
              <p className="text-[11px] text-gray-500">Your cart & orders are fully preserved.</p>
            </div>
          </div>
          <div className="p-3 bg-white/[0.02] border border-white/[0.04] rounded-xl flex items-start gap-2.5">
            <Clock className="h-4 w-4 text-gold-400 mt-0.5 shrink-0" />
            <div>
              <p className="text-xs font-bold text-gray-200">Rapid Restoration</p>
              <p className="text-[11px] text-gray-500">Auto-resumes immediately upon completion.</p>
            </div>
          </div>
        </div>

        {/* Contact info footer */}
        <div className="pt-4 border-t border-white/[0.08] flex flex-wrap items-center justify-center gap-4 text-xs text-gray-400">
          <span className="text-gray-500">Need urgent support?</span>
          <a
            href="mailto:support@sculptnshine.com"
            className="inline-flex items-center gap-1 hover:text-gold-400 transition-colors"
          >
            <Mail className="h-3.5 w-3.5 text-gold-500" />
            support@sculptnshine.com
          </a>
          <a
            href="tel:+91800728578"
            className="inline-flex items-center gap-1 hover:text-gold-400 transition-colors"
          >
            <Phone className="h-3.5 w-3.5 text-gold-500" />
            +91-800-SCULPT
          </a>
        </div>
      </div>
    </div>
  );
}
