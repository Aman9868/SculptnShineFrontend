'use client';

import React, { useState } from 'react';
import { orderAPI } from '@/lib/api/order';
import { Package, Search, MapPin, Truck, CheckCircle, Clock, AlertCircle } from 'lucide-react';

const statusSteps = [
  { status: 'PAID', label: 'Order Confirmed', icon: CheckCircle },
  { status: 'PROCESSING', label: 'Processing', icon: Package },
  { status: 'SHIPPED', label: 'Shipped', icon: Truck },
  { status: 'OUT_FOR_DELIVERY', label: 'Out for Delivery', icon: MapPin },
  { status: 'DELIVERED', label: 'Delivered', icon: CheckCircle },
];

export default function TrackOrderPage() {
  const [orderNumber, setOrderNumber] = useState('');
  const [emailOrPhone, setEmailOrPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [orderData, setOrderData] = useState<any>(null);

  const handleTrack = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!orderNumber.trim() || !emailOrPhone.trim()) {
      setError('Please provide both Order ID and Email/Phone.');
      return;
    }

    setLoading(true);
    setError('');
    setOrderData(null);

    try {
      const response = await orderAPI.trackOrder(orderNumber, emailOrPhone);
      if (response.success) {
        setOrderData(response.data);
      } else {
        setError(response.message || 'Order not found.');
      }
    } catch (err: any) {
      setError(err?.message || 'Failed to track order. Please verify your details.');
    } finally {
      setLoading(false);
    }
  };

  const getStepStatus = (stepStatus: string) => {
    if (!orderData) return 'pending';
    if (orderData.status === 'CANCELLED') return 'cancelled';
    
    const currentIndex = statusSteps.findIndex(s => s.status === orderData.status);
    const stepIndex = statusSteps.findIndex(s => s.status === stepStatus);

    if (stepIndex < currentIndex) return 'completed';
    if (stepIndex === currentIndex) return 'current';
    return 'pending';
  };

  return (
    <div 
      className="min-h-screen pt-32 pb-24 text-gray-900 bg-cover bg-center bg-no-repeat bg-fixed"
      style={{ backgroundImage: `url('/images/track-order-bg.png')` }}
    >
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header Section */}
        <div className="text-center mb-10">
          <h1 className="text-3xl md:text-5xl font-serif font-bold text-gold-600 mb-4 drop-shadow-sm">Track Your Order</h1>
          <p className="text-gray-700 font-medium">Enter your Order ID and contact details to check the status of your shipment.</p>
        </div>

        {/* Input Form */}
        <div className="bg-white/80 backdrop-blur-md border border-white/60 rounded-3xl p-6 md:p-8 shadow-2xl mb-12">
          <form onSubmit={handleTrack} className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-2">Order ID</label>
                <input 
                  type="text" 
                  placeholder="e.g. ORD-123456"
                  className="w-full bg-white/70 text-gray-900 placeholder-gray-400 px-4 py-3 rounded-xl border border-gray-300 focus:border-gold-500 focus:ring-2 focus:ring-gold-500/20 outline-none transition-all shadow-sm"
                  value={orderNumber}
                  onChange={e => setOrderNumber(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-2">Email or Phone Number</label>
                <input 
                  type="text" 
                  placeholder="Associated with your order"
                  className="w-full bg-white/70 text-gray-900 placeholder-gray-400 px-4 py-3 rounded-xl border border-gray-300 focus:border-gold-500 focus:ring-2 focus:ring-gold-500/20 outline-none transition-all shadow-sm"
                  value={emailOrPhone}
                  onChange={e => setEmailOrPhone(e.target.value)}
                />
              </div>
            </div>
            {error && (
              <div className="flex items-center gap-2 text-red-600 text-sm p-4 bg-red-50 rounded-xl border border-red-100">
                <AlertCircle size={16} />
                <p>{error}</p>
              </div>
            )}
            <button 
              type="submit" 
              disabled={loading}
              className="w-full bg-gold-600 hover:bg-gold-700 text-white font-bold py-3.5 rounded-xl transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? <span className="animate-pulse">Locating...</span> : <><Search size={18} /> Track Order</>}
            </button>
          </form>
        </div>

        {/* Results Section */}
        {orderData && (
          <div className="bg-white/90 backdrop-blur-lg border border-white/60 rounded-3xl p-6 md:p-8 shadow-2xl animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex justify-between items-start mb-10 pb-6 border-b border-gray-200">
              <div>
                <h2 className="text-2xl font-serif font-bold text-gray-900 mb-1">{orderData.orderNumber}</h2>
                <p className="text-sm font-medium text-gray-500">Placed on {new Date(orderData.createdAt).toLocaleDateString()}</p>
              </div>
              <div className="text-right">
                <span className="inline-block px-4 py-1.5 rounded-full text-xs font-extrabold bg-gold-100 text-gold-700 border border-gold-200 shadow-sm uppercase tracking-wide">
                  {orderData.status.replace(/_/g, ' ')}
                </span>
                {orderData.trackingNumber && (
                  <p className="text-sm font-medium text-gray-600 mt-3">
                    Tracking: <span className="font-mono font-bold text-gold-600">{orderData.trackingNumber}</span>
                  </p>
                )}
              </div>
            </div>

            {orderData.status === 'CANCELLED' ? (
              <div className="text-center py-10 bg-red-50/50 rounded-2xl border border-red-100">
                <AlertCircle size={48} className="text-red-500 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-gray-900 mb-2">Order Cancelled</h3>
                <p className="text-gray-600">This order has been cancelled and will not be shipped.</p>
              </div>
            ) : (
              <div className="relative py-10 px-4">
                {/* Timeline Line */}
                <div className="absolute top-1/2 left-4 right-4 h-1.5 bg-gray-200 -translate-y-1/2 hidden md:block z-0 rounded-full" />
                
                <div className="relative z-10 flex flex-col md:flex-row justify-between gap-8 md:gap-0">
                  {statusSteps.map((step, idx) => {
                    const status = getStepStatus(step.status);
                    const Icon = step.icon;
                    return (
                      <div key={idx} className="flex md:flex-col items-center gap-4 md:gap-3 text-center">
                        <div className={`w-14 h-14 rounded-full flex items-center justify-center border-4 transition-all duration-300 shadow-sm ${
                          status === 'completed' ? 'bg-gold-600 border-white text-white shadow-[0_4px_15px_rgba(212,175,55,0.4)]' :
                          status === 'current' ? 'bg-white border-gold-500 text-gold-600 shadow-[0_0_0_4px_rgba(212,175,55,0.2)]' :
                          'bg-white border-gray-200 text-gray-400'
                        }`}>
                          <Icon size={22} />
                        </div>
                        <div className="md:w-24">
                          <p className={`text-sm font-extrabold ${
                            status === 'completed' || status === 'current' ? 'text-gray-900' : 'text-gray-400'
                          }`}>
                            {step.label}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Items Summary */}
            <div className="mt-12 pt-8 border-t border-gray-200">
              <h3 className="text-lg font-serif font-bold text-gray-900 mb-6">Items in Order</h3>
              <div className="space-y-4">
                {orderData.items.map((item: any, idx: number) => (
                  <div key={idx} className="flex items-center gap-5 bg-white p-4 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                    <div className="w-20 h-20 bg-gray-50 rounded-xl overflow-hidden flex-shrink-0 border border-gray-100">
                      {item.image ? (
                        <img src={item.image} alt={item.productName} className="w-full h-full object-cover" />
                      ) : (
                        <Package className="w-10 h-10 text-gray-300 m-auto mt-5" />
                      )}
                    </div>
                    <div>
                      <p className="font-bold text-gray-900 line-clamp-1">{item.productName}</p>
                      <p className="text-sm font-semibold text-gold-600 mt-1">Qty: {item.quantity} &times; ₹{item.unitPrice}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        )}

      </div>
    </div>
  );
}
