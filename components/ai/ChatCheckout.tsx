import React, { useState, useEffect } from 'react';
import { useStore } from '@/context/StoreContext';
import { addressAPI } from '@/lib/api/address';
import { checkoutAPI } from '@/lib/api/checkout';
import { authAPI } from '@/lib/api/auth';
import { getMediaUrl } from '@/lib/media';
import { AlertCircle, MapPin, Loader2, Check } from 'lucide-react';
import ChatAddress from './ChatAddress';

interface ChatCheckoutProps {
  onSuccess: (orderId: string) => void;
  onCancel: () => void;
  isHistoricallyPaid?: boolean;
}

export const ChatCheckout: React.FC<ChatCheckoutProps> = ({ onSuccess, onCancel, isHistoricallyPaid }) => {
  const { cart, cartTotalCount, fetchCart } = useStore();
  const [addresses, setAddresses] = useState<any[]>([]);
  const [selectedAddress, setSelectedAddress] = useState<any | null>(null);
  const [userProfile, setUserProfile] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showAddAddress, setShowAddAddress] = useState(false);
  const [isPaid, setIsPaid] = useState(false);

  useEffect(() => {
    fetchAddresses();
    fetchCart();
  }, []);

  const fetchAddresses = async () => {
    try {
      const [addrRes, profileRes] = await Promise.all([
        addressAPI.getAddresses().catch(() => ({ success: false, data: [] })),
        authAPI.getProfile().catch(() => ({ success: false, data: null })),
      ]);

      if (profileRes.success && profileRes.data) {
        setUserProfile(profileRes.data);
      }

      if (addrRes.success && addrRes.data.length > 0) {
        setAddresses(addrRes.data);
        const defaultAddr = addrRes.data.find((a: any) => a.isDefault);
        setSelectedAddress(defaultAddr || addrRes.data[0]);
      }
    } catch (err) {
      console.error('Failed to fetch addresses', err);
    }
  };

  const handlePay = async () => {
    if (!selectedAddress) {
      setError('Please select a delivery address');
      return;
    }

    setIsLoading(true);
    setError(null);

    const finalName = (selectedAddress.userName || `${userProfile?.firstName || ''} ${userProfile?.lastName || ''}`).trim() || 'Customer';
    const finalPhone = selectedAddress.userPhone || userProfile?.phone || '';

    try {
      // 1. Create Order
      const orderRes = await checkoutAPI.createOrder({
        shippingName: finalName,
        shippingPhone: finalPhone,
        shippingAddress: `${selectedAddress.flatHouse}, ${selectedAddress.areaStreet}${selectedAddress.landmark ? ', ' + selectedAddress.landmark : ''}`,
        shippingCity: selectedAddress.townCity,
        shippingState: selectedAddress.state,
        shippingPincode: selectedAddress.pincode,
      });

      if (!orderRes.success) {
        throw new Error(orderRes.message || 'Failed to create order');
      }

      const orderId = orderRes.data.id;

      // 2. Initiate Payment
      const paymentRes = await checkoutAPI.initiatePayment(orderId);
      if (paymentRes.success && paymentRes.data.paymentUrl) {
        if (paymentRes.data.isTestMode) {
           // Backend handles the simulated webhook internally, so we just wait and succeed
           setTimeout(() => {
              fetchCart();
              setIsPaid(true);
              setIsLoading(false);
              onSuccess(orderId);
           }, 2000);
           return;
        }

        // PhonePe SDK
        if (!(window as any).PhonePeCheckout) {
          await new Promise((resolve, reject) => {
            const script = document.createElement('script');
            script.src = 'https://mercury.phonepe.com/web/bundle/checkout.js';
            script.onload = resolve;
            script.onerror = () => reject(new Error('Failed to load PhonePe SDK'));
            document.body.appendChild(script);
          });
        }

        if ((window as any).PhonePeCheckout) {
          (window as any).PhonePeCheckout.transact({
            tokenUrl: paymentRes.data.paymentUrl,
            type: 'IFRAME',
            callback: function (response: any) {
              if (response === 'USER_CANCEL') {
                setIsLoading(false);
              } else {
                setIsPaid(true);
                setIsLoading(false);
                onSuccess(orderId);
              }
            },
          });
          return;
        } else {
            window.location.href = paymentRes.data.paymentUrl;
        }
      } else {
        throw new Error('Payment initiation failed');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to process checkout');
      setIsLoading(false);
    }
  };

  const originalTotal = cart.reduce((acc, item) => {
    const price = item.variant?.unitPrice || item.product?.unitPrice || 0;
    return acc + price * (item.quantity || 1);
  }, 0);

  const discountTotal = cart.reduce((acc, item) => {
    let disc = 0;
    if (item.variant && item.variant.discountPercentage > 0) {
        disc = item.variant.unitPrice * (item.variant.discountPercentage / 100);
    } else if (item.product && item.product.discountPercentage > 0) {
        disc = item.product.unitPrice * (item.product.discountPercentage / 100);
    }
    return acc + disc * (item.quantity || 1);
  }, 0);

  const gstTotal = cart.reduce((acc, item) => {
    let priceAfterDisc = item.variant?.unitPrice || item.product?.unitPrice || 0;
    let gstRate = item.variant?.gst || item.product?.gst || 18;
    if (item.variant && item.variant.discountPercentage > 0) {
        priceAfterDisc = item.variant.unitPrice * (1 - item.variant.discountPercentage / 100);
    } else if (item.product && item.product.discountPercentage > 0) {
        priceAfterDisc = item.product.unitPrice * (1 - item.product.discountPercentage / 100);
    }
    return acc + (priceAfterDisc * (gstRate / 100)) * (item.quantity || 1);
  }, 0);

  const finalTotal = (originalTotal - discountTotal) + gstTotal;

  if (isPaid || isHistoricallyPaid) {
    return (
        <div className="bg-neutral-900 border border-gold-600 rounded-xl p-4 w-full flex flex-col items-center justify-center space-y-3 mt-2">
           <div className="w-12 h-12 bg-green-500/20 text-green-400 rounded-full flex items-center justify-center">
             <Check size={24} />
           </div>
           <h3 className="text-white font-bold text-lg">Payment Successful!</h3>
           <p className="text-neutral-400 text-xs text-center">Your order is confirmed.</p>
        </div>
    );
  }

  if (cart.length === 0) {
    return (
        <div className="bg-[#151515] border border-white/10 rounded-xl p-4 w-full flex flex-col items-center justify-center space-y-2 mt-2">
           <h3 className="text-white font-medium text-sm">Checkout Session Ended</h3>
           <p className="text-neutral-500 text-xs text-center">Your cart is empty.</p>
        </div>
    );
  }

  return (
    <div className="bg-neutral-900 border border-neutral-700 rounded-xl p-4 w-full flex flex-col gap-4 mt-2">
      <div className="flex justify-between items-center border-b border-neutral-800 pb-2">
        <h3 className="text-white font-bold text-sm">Checkout Summary ({cartTotalCount} Items)</h3>
        <button onClick={onCancel} className="text-neutral-400 hover:text-white text-xs">Cancel</button>
      </div>

      {/* Cart Items (Mini) */}
      <div className="flex flex-col gap-2 max-h-32 overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-neutral-700">
        {cart.map((item) => (
          <div key={item.id} className="flex gap-2 items-center">
            <img 
              src={getMediaUrl(item.product.images?.[0], '/assets/product-placeholder.png')} 
              alt={item.product.title} 
              className="w-10 h-10 object-cover rounded bg-neutral-800"
              onError={(e) => { e.currentTarget.src = 'https://via.placeholder.com/40' }}
            />
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-white truncate">{item.product.title}</p>
              <p className="text-[10px] text-neutral-400">Qty: {item.quantity}</p>
            </div>
            <div className="text-xs font-bold text-gold-500 shrink-0">
              ₹{((item.variant?.unitPrice || item.product?.unitPrice || 0) * (1 - (item.variant?.discountPercentage || item.product?.discountPercentage || 0) / 100) * item.quantity).toLocaleString('en-IN', { maximumFractionDigits: 0 })}
            </div>
          </div>
        ))}
      </div>

      {/* Address Selection */}
      <div className="pt-2 border-t border-neutral-800">
        <h4 className="text-xs font-bold text-neutral-300 mb-2">Delivery Address</h4>
        {showAddAddress ? (
            <div className="-mx-4 -mb-4">
                <ChatAddress onSuccess={() => {
                    setShowAddAddress(false);
                    fetchAddresses();
                }} />
                <button onClick={() => setShowAddAddress(false)} className="w-full py-2 text-xs text-neutral-400 hover:text-white">Cancel Address Add</button>
            </div>
        ) : addresses.length > 0 ? (
          <div className="space-y-2">
            <select 
              className="w-full bg-neutral-800 border border-neutral-700 rounded-lg p-2 text-xs text-white outline-none focus:border-gold-500"
              value={selectedAddress?.id || ''}
              onChange={(e) => setSelectedAddress(addresses.find(a => a.id === e.target.value))}
            >
              {addresses.map(a => (
                <option key={a.id} value={a.id}>
                  {a.userName} - {a.flatHouse}, {a.townCity}, {a.state}
                </option>
              ))}
            </select>
            <button onClick={() => setShowAddAddress(true)} className="text-[10px] text-gold-500 hover:underline flex items-center gap-1">
              + Add New Address
            </button>
          </div>
        ) : (
          <button onClick={() => setShowAddAddress(true)} className="w-full py-2 border border-dashed border-neutral-700 rounded-lg text-xs text-neutral-400 hover:text-gold-500 hover:border-gold-500 flex items-center justify-center gap-2">
            <MapPin size={12} /> Add Delivery Address
          </button>
        )}
      </div>

      {/* Total & Pay Button */}
      {!showAddAddress && (
        <div className="pt-2 border-t border-neutral-800 flex items-center justify-between">
            <div className="flex flex-col">
                <span className="text-[10px] text-neutral-400">Total to Pay</span>
                <span className="text-sm font-bold text-white">₹{finalTotal.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</span>
            </div>
            <button 
                onClick={handlePay}
                disabled={isLoading || cart.length === 0 || !selectedAddress}
                className="bg-gold-500 text-black px-6 py-2 rounded-lg font-bold text-xs hover:bg-gold-600 disabled:opacity-50 flex items-center gap-2 transition-colors"
            >
                {isLoading ? <Loader2 size={14} className="animate-spin" /> : 'Pay Now'}
            </button>
        </div>
      )}

      {error && (
        <div className="flex items-center gap-1.5 text-[10px] text-red-400 bg-red-400/10 p-2 rounded mt-2">
          <AlertCircle size={12} />
          {error}
        </div>
      )}
    </div>
  );
};
