'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useStore } from '@/context/StoreContext';
import { addressAPI } from '@/lib/api/address';
import { checkoutAPI } from '@/lib/api/checkout';
import { authAPI } from '@/lib/api/auth';
import { couponAPI, CouponData, CouponValidationResult } from '@/lib/api/coupon';
import { X, Tag, Check, Sparkles, AlertCircle, Phone } from 'lucide-react';


const steps = [
  { id: 1, name: 'Delivery Address' },
  { id: 2, name: 'Payment' },
  { id: 3, name: 'Review Order' },
  { id: 4, name: 'Order Confirmation' },
];

export default function CheckoutPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { cart, cartSubtotal, cartTotalCount, fetchCart } = useStore();
  const [currentStep, setCurrentStep] = useState(1);
  const [addresses, setAddresses] = useState<any[]>([]);
  const [selectedAddress, setSelectedAddress] = useState<any | null>(null);
  const [userProfile, setUserProfile] = useState<any | null>(null);
  const [contactPhone, setContactPhone] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('phonepe');
  const [isLoading, setIsLoading] = useState(false);
  const [orderId, setOrderId] = useState<string | null>(null);
  const [paymentIframeUrl, setPaymentIframeUrl] = useState<string | null>(null);


  const [orderDetails, setOrderDetails] = useState<any | null>(null);
  const [shippingCharge, setShippingCharge] = useState(0);
  const [shippingLoading, setShippingLoading] = useState(false);

  // Coupon & Voucher State
  const [couponInput, setCouponInput] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<CouponValidationResult | null>(null);
  const [couponError, setCouponError] = useState<string | null>(null);
  const [isApplyingCoupon, setIsApplyingCoupon] = useState(false);
  const [availableCoupons, setAvailableCoupons] = useState<CouponData[]>([]);
  const [showOffers, setShowOffers] = useState(false);

  useEffect(() => {
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
    fetchOffers();

    // Check if user came with a clipped coupon
    const savedCode = localStorage.getItem('sculptnshine_active_coupon');
    if (savedCode && cart.length > 0) {
      handleApplyCoupon(savedCode);
    }
  }, [cartSubtotal]);

  const handleApplyCoupon = async (codeToApply?: string) => {
    const code = (codeToApply || couponInput).trim();
    if (!code) return;

    setIsApplyingCoupon(true);
    setCouponError(null);

    try {
      const res = await couponAPI.validateCoupon(code, cart, cartSubtotal);
      if (res.success && res.data) {
        setAppliedCoupon(res.data);
        setCouponInput('');
        try {
          localStorage.setItem('sculptnshine_active_coupon', res.data.coupon.code);
        } catch {}
      }
    } catch (err: any) {
      setCouponError(err.message || 'Failed to apply coupon');
      setAppliedCoupon(null);
    } finally {
      setIsApplyingCoupon(false);
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponError(null);
    try {
      localStorage.removeItem('sculptnshine_active_coupon');
    } catch {}
  };

  useEffect(() => {
    const fetchShipping = async () => {
      if (!selectedAddress) return;
      setShippingLoading(true);
      try {
        const { shippingAPI } = await import('@/lib/api/shipping');
        const subtotal = cart.reduce((acc, item) => {
          const price = item.variant?.unitPrice || item.product?.unitPrice || 0;
          const disc = item.variant?.discountPercentage || item.product?.discountPercentage || 0;
          const gst = item.variant?.gst || item.product?.gst || 18;
          const afterDisc = price * (1 - disc / 100);
          const finalItemPrice = afterDisc * (1 + gst / 100);
          return acc + finalItemPrice * (item.quantity || 1);
        }, 0);
        
        const res = await shippingAPI.calculateShipping(selectedAddress.state, subtotal);
        if (res.success) {
          setShippingCharge(res.data.shippingAmount);
        }
      } catch (err) {
        console.error("Failed to calculate shipping", err);
      } finally {
        setShippingLoading(false);
      }
    };
    
    fetchShipping();
  }, [selectedAddress, cart]);

  useEffect(() => {
    fetchAddresses();
    
    // Check if we came back from a payment redirect
    const status = searchParams.get('status');
    const order_id = searchParams.get('order_id') || searchParams.get('orderId') || searchParams.get('id');
    if (status === 'success' && order_id) {
      setCurrentStep(4);
      setOrderId(order_id);
      fetchOrder(order_id);
      fetchCart();
    } else if (status === 'failed') {
      alert('Payment failed. Please try again.');
      setCurrentStep(2);
    }
  }, [searchParams]);

  const fetchOrder = async (id: string) => {
    try {
      const res = await checkoutAPI.getOrder(id);
      if (res.success) {
        setOrderDetails(res.data);
      }
    } catch (err) {
      console.error('Failed to fetch order details', err);
    }
  };

  const fetchAddresses = async () => {
    try {
      const [addrRes, profileRes] = await Promise.all([
        addressAPI.getAddresses().catch(() => ({ success: false, data: [] })),
        authAPI.getProfile().catch(() => ({ success: false, data: null })),
      ]);

      if (profileRes.success && profileRes.data) {
        setUserProfile(profileRes.data);
        if (profileRes.data.phone) setContactPhone(profileRes.data.phone);
      }

      if (addrRes.success && addrRes.data.length > 0) {
        setAddresses(addrRes.data);
        const defaultAddr = addrRes.data.find((a: any) => a.isDefault);
        const initialAddr = defaultAddr || addrRes.data[0];
        setSelectedAddress(initialAddr);
        if (initialAddr.userPhone && !contactPhone) {
          setContactPhone(initialAddr.userPhone);
        }
      }
    } catch (err) {
      console.error('Failed to fetch addresses', err);
    }
  };

  const [checkoutError, setCheckoutError] = useState<string | null>(null);

  const handleCreateOrder = async () => {
    if (!selectedAddress) {
      setCheckoutError('Please select a delivery address');
      return;
    }
    
    setIsLoading(true);
    setCheckoutError(null);

    const finalPhone = (contactPhone || selectedAddress.userPhone || userProfile?.phone || '').trim();
    const finalName = (selectedAddress.userName || `${userProfile?.firstName || ''} ${userProfile?.lastName || ''}`).trim() || 'Customer';

    try {
      const res = await checkoutAPI.createOrder({
        shippingName: finalName,
        shippingPhone: finalPhone,
        shippingAddress: `${selectedAddress.flatHouse}, ${selectedAddress.areaStreet}${selectedAddress.landmark ? ', ' + selectedAddress.landmark : ''}`,
        shippingCity: selectedAddress.townCity,
        shippingState: selectedAddress.state,
        shippingPincode: selectedAddress.pincode,
        couponCode: appliedCoupon?.coupon.code || undefined,
      });
      
      if (res.success) {
        setOrderId(res.data.id);
        setOrderDetails(res.data);
        setShippingCharge(res.data.shippingAmount ?? shippingCharge);
        setCurrentStep(3); // Go to review
      }
    } catch (err: any) {
      const msg = err.message || 'Failed to create order';
      setCheckoutError(msg);
      if (msg.toLowerCase().includes('coupon')) {
        setCouponError(msg);
        setAppliedCoupon(null);
        try {
          localStorage.removeItem('sculptnshine_active_coupon');
        } catch {}
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleInitiatePayment = async () => {
    if (!orderId) return;
    
    setIsLoading(true);
    try {
      const res = await checkoutAPI.initiatePayment(orderId);
      if (res.success && res.data.paymentUrl) {
        if (res.data.isTestMode) {
          window.location.href = res.data.paymentUrl;
          return;
        }

        // Try PhonePe SDK in IFRAME mode
        try {
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
              tokenUrl: res.data.paymentUrl,
              type: 'IFRAME',
              callback: function (response: any) {
                if (response === 'USER_CANCEL') {
                  setIsLoading(false);
                } else {
                  window.location.href = `/checkout?status=success&order_id=${orderId}`;
                }
              },
            });
            setIsLoading(false);
            return;
          }
        } catch (sdkErr) {
          console.warn('PhonePe SDK transact failed, fallback to iframe modal:', sdkErr);
        }

        // In-app IFRAME modal fallback
        setPaymentIframeUrl(res.data.paymentUrl);
        setIsLoading(false);
      } else {
        alert('Payment initiation failed');
        setIsLoading(false);
      }
    } catch (err: any) {
      alert(err.message || 'Failed to initiate payment');
      setIsLoading(false);
    }
  };

  if (cart.length === 0 && currentStep !== 4) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center p-4">
        <h2 className="text-2xl font-bold mb-4">Your cart is empty</h2>
        <button onClick={() => router.push('/products')} className="bg-gold-500 text-white px-6 py-2 rounded-md font-bold hover:bg-gold-600">
          Continue Shopping
        </button>
      </div>
    );
  }

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
  const discount = discountTotal;
  const couponDiscountAmount = appliedCoupon ? appliedCoupon.discountAmount : (orderDetails?.couponDiscount ?? 0);
  const payableBeforeShipping = Math.max(0, finalTotal - couponDiscountAmount);
  const effectiveShippingCharge = orderDetails?.shippingAmount ?? shippingCharge;
  const total = orderDetails?.totalAmount ?? (payableBeforeShipping + effectiveShippingCharge);

  return (
    <div className="bg-gray-50 min-h-screen py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Stepper */}
        <div className="mb-8">
          <nav aria-label="Progress">
            <ol role="list" className="flex items-center">
              {steps.map((step, stepIdx) => (
                <li key={step.name} className={`relative pr-8 sm:pr-20 ${stepIdx !== steps.length - 1 ? 'w-full' : ''}`}>
                  <div className="absolute inset-0 flex items-center" aria-hidden="true">
                    <div className={`h-0.5 w-full ${currentStep > step.id ? 'bg-gold-500' : 'bg-gray-200'}`} />
                  </div>
                  <div className={`relative flex h-8 w-8 items-center justify-center rounded-full ${
                    currentStep > step.id ? 'bg-gold-500' : currentStep === step.id ? 'bg-gold-500 border-2 border-white ring-2 ring-gold-500' : 'bg-white border-2 border-gray-300'
                  }`}>
                    <span className={`text-xs font-semibold ${currentStep >= step.id ? 'text-white' : 'text-gray-500'}`}>
                      {step.id}
                    </span>
                  </div>
                  <span className={`absolute -bottom-6 left-1/2 -translate-x-1/2 text-xs font-medium whitespace-nowrap ${currentStep >= step.id ? 'text-gold-600' : 'text-gray-500'}`}>
                    {step.name}
                  </span>
                </li>
              ))}
            </ol>
          </nav>
        </div>

        <div className="flex flex-col lg:flex-row gap-8 mt-12">
          {/* Main Content */}
          <div className="flex-1 space-y-6">
            
            {currentStep === 1 && (
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                  <span className="bg-gold-500 text-white w-6 h-6 rounded-full flex items-center justify-center text-sm">1</span> 
                  Delivery Address
                </h2>
                
                {addresses.length === 0 ? (
                  <div className="p-4 bg-gray-50 rounded-md border border-dashed border-gray-300 text-center">
                    <p className="text-gray-600 mb-4">No saved addresses found.</p>
                    <button onClick={() => router.push('/profile')} className="text-gold-600 font-bold hover:underline">
                      + Add New Address in Profile
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {addresses.map((addr) => (
                      <label key={addr.id} className={`flex items-start p-4 border rounded-lg cursor-pointer transition-colors ${selectedAddress?.id === addr.id ? 'border-gold-500 bg-gold-50/30' : 'border-gray-200 hover:border-gray-300'}`}>
                        <div className="flex-shrink-0 mt-0.5">
                          <input 
                            type="radio" 
                            name="address" 
                            className="h-4 w-4 text-gold-600 border-gray-300 focus:ring-gold-500" 
                            checked={selectedAddress?.id === addr.id}
                            onChange={() => setSelectedAddress(addr)}
                          />
                        </div>
                        <div className="ml-3 flex-1">
                          <div className="flex justify-between">
                            <span className="font-bold text-gray-900">{addr.userName}</span>
                            {addr.isDefault && <span className="bg-gray-100 text-gray-600 text-xs px-2 py-0.5 rounded">Default</span>}
                          </div>
                          <p className="text-sm text-gray-500 mt-1">{addr.flatHouse}, {addr.areaStreet}</p>
                          {addr.landmark && <p className="text-sm text-gray-500">Near: {addr.landmark}</p>}
                          <p className="text-sm text-gray-500">{addr.townCity}, {addr.state} - {addr.pincode}</p>
                          <p className="text-sm text-gray-500 mt-1">Phone: {addr.userPhone}</p>
                        </div>
                      </label>
                    ))}
                  </div>
                )}

                {/* Contact Mobile Phone Number Input */}
                <div className="mt-5 p-4 bg-gray-50/80 rounded-xl border border-gray-200 space-y-2">
                  <label className="block text-xs font-bold text-gray-800 uppercase tracking-wide flex items-center gap-2">
                    <Phone size={14} className="text-gold-600" />
                    Contact Mobile Number (For Delivery & Order Updates)
                  </label>
                  <div className="flex items-center gap-2">
                    <span className="px-3 py-2 bg-white border border-gray-300 rounded-xl text-xs font-bold text-gray-700">
                      🇮🇳 +91
                    </span>
                    <input
                      type="tel"
                      value={contactPhone}
                      onChange={(e) => setContactPhone(e.target.value)}
                      placeholder="Enter 10-digit mobile number"
                      className="flex-1 px-3.5 py-2 bg-white border border-gray-300 rounded-xl text-xs font-bold text-gray-900 focus:ring-1 focus:ring-gold-500 focus:border-gold-500 outline-none"
                    />
                  </div>
                  <p className="text-[11px] text-gray-500">
                    We will send SMS updates and order tracking notifications to this number.
                  </p>
                </div>
                
                <div className="mt-8 flex justify-end">
                  <button 
                    onClick={() => setCurrentStep(2)} 
                    disabled={!selectedAddress}
                    className="bg-gold-500 text-white px-8 py-3 rounded-md font-bold hover:bg-gold-600 disabled:opacity-50 transition-colors"
                  >
                    Continue to Payment
                  </button>
                </div>
              </div>
            )}

            {currentStep === 2 && (
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                  <span className="bg-gold-500 text-white w-6 h-6 rounded-full flex items-center justify-center text-sm">2</span> 
                  Payment Method
                </h2>
                
                <div className="flex flex-col items-center justify-center p-10 bg-gray-50 rounded-xl border border-gray-200 text-center max-w-2xl mx-auto">
                  <div className="flex items-center gap-2 mb-4 bg-purple-50 border border-purple-100 px-4 py-2 rounded-xl">
                    <div className="w-8 h-8 rounded-full bg-[#5f259f] flex items-center justify-center text-white text-base font-bold shadow-sm">
                      पे
                    </div>
                    <span className="font-bold text-lg text-[#5f259f] tracking-tight">PhonePe</span>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">Secure Payment Gateway</h3>
                  <p className="text-gray-600 mb-6">You will be redirected to PhonePe's secure gateway to complete your payment using UPI, Credit/Debit Card, or Netbanking.</p>
                  
                  <div className="flex items-center gap-2 text-sm text-gray-500 font-medium">
                    <svg className="w-5 h-5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                    100% Secure & Encrypted
                  </div>
                </div>

                {checkoutError && (
                  <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-xs font-semibold flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <AlertCircle size={16} className="text-red-500 shrink-0" />
                      <span>{checkoutError}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setCheckoutError(null)}
                      className="text-red-400 hover:text-red-700 text-xs underline ml-3 shrink-0 cursor-pointer"
                    >
                      Dismiss
                    </button>
                  </div>
                )}
                
                <div className="mt-8 flex justify-between items-center">
                  <button onClick={() => setCurrentStep(1)} className="text-gray-500 hover:text-gray-900 font-medium text-sm flex items-center gap-1">
                    ← Back to Address
                  </button>
                  <button 
                    onClick={handleCreateOrder} 
                    disabled={isLoading}
                    className="bg-gold-500 text-white px-8 py-3 rounded-md font-bold hover:bg-gold-600 disabled:opacity-50 transition-colors"
                  >
                    {isLoading ? 'Processing...' : 'Continue to Review Order'}
                  </button>
                </div>
              </div>
            )}

            {currentStep === 3 && (
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                  <span className="bg-gold-500 text-white w-6 h-6 rounded-full flex items-center justify-center text-sm">3</span> 
                  Review Order
                </h2>
                
                <div className="space-y-6">
                  {/* Selected Address */}
                  <div className="flex justify-between items-start border-b border-gray-100 pb-4">
                    <div>
                      <h3 className="text-sm font-bold text-gray-900 mb-2">Delivery Address</h3>
                      <p className="text-sm font-bold">{selectedAddress?.userName}</p>
                      <p className="text-sm text-gray-600">{selectedAddress?.flatHouse}, {selectedAddress?.areaStreet}</p>
                      <p className="text-sm text-gray-600">{selectedAddress?.townCity}, {selectedAddress?.state} - {selectedAddress?.pincode}</p>
                      <p className="text-sm text-gray-600 mt-1">{selectedAddress?.userPhone}</p>
                    </div>
                    <button onClick={() => setCurrentStep(1)} className="text-gold-600 text-sm font-bold hover:underline">Change</button>
                  </div>
                  
                  {/* Selected Payment */}
                  <div className="flex justify-between items-start border-b border-gray-100 pb-4">
                    <div>
                      <h3 className="text-sm font-bold text-gray-900 mb-2">Payment Method</h3>
                      <p className="text-sm text-gray-800">PhonePe / UPI / Cards</p>
                    </div>
                    <button onClick={() => setCurrentStep(2)} className="text-gold-600 text-sm font-bold hover:underline">Change</button>
                  </div>
                  
                  {/* Items */}
                  <div>
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-sm font-bold text-gray-900">Order Items ({cartTotalCount})</h3>
                      <button onClick={() => router.push('/cart')} className="text-gold-600 text-sm font-bold hover:underline">Edit Cart</button>
                    </div>
                    <div className="space-y-3">
                      {cart.map((item) => {
                        let itemPrice = item.variant?.unitPrice || item.product?.unitPrice || 0;
                        if (item.variant && item.variant.discountPercentage > 0) {
                          itemPrice = item.variant.unitPrice * (1 - item.variant.discountPercentage / 100);
                        } else if (item.product && item.product.discountPercentage > 0) {
                          itemPrice = item.product.unitPrice * (1 - item.product.discountPercentage / 100);
                        }
                        return (
                          <div key={item.id} className="flex gap-4 items-center border border-gray-100 p-3 rounded-lg">
                            <img src={item.product.images?.[0] || '/product-placeholder.png'} alt={item.product.title} className="w-16 h-16 object-cover rounded bg-gray-50" />
                            <div className="flex-1">
                              <h4 className="text-sm font-bold text-gray-900 line-clamp-1">{item.product.title}</h4>
                              {item.variant && <p className="text-xs text-gray-500">{item.variant.flavor} | {item.variant.weight}</p>}
                              <p className="text-xs text-gray-500 mt-1">Qty: {item.quantity}</p>
                            </div>
                            <div className="text-right">
                              <p className="text-sm font-bold text-gray-900">₹{(itemPrice * item.quantity).toLocaleString('en-IN')}</p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
                
                <div className="mt-8 flex justify-between items-center">
                  <button onClick={() => setCurrentStep(2)} className="text-gray-500 hover:text-gray-900 font-medium text-sm flex items-center gap-1">
                    ← Back to Payment
                  </button>
                  <button 
                    onClick={handleInitiatePayment}
                    disabled={isLoading}
                    className="bg-gold-500 text-white px-10 py-3 rounded-md font-bold hover:bg-gold-600 text-lg shadow-lg hover:shadow-xl transition-all disabled:opacity-50"
                  >
                    {isLoading ? 'Processing...' : `Place Order (₹${total.toLocaleString('en-IN')})`}
                  </button>
                </div>
              </div>
            )}

            {currentStep === 4 && orderDetails && (
              <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100 text-center">
                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <svg className="w-10 h-10 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                
                <h2 className="text-3xl font-bold text-gray-900 mb-2">Thank You!</h2>
                <p className="text-gray-600 mb-6">Your order has been placed successfully.</p>
                
                <div className="inline-block bg-gray-50 px-6 py-3 rounded-lg border border-gray-200 mb-8">
                  <span className="text-sm text-gray-500 mr-2">Order ID:</span>
                  <span className="font-bold text-gray-900">{orderDetails.orderNumber}</span>
                </div>
                
                {orderDetails.invoiceUrl && (
                  <div className="mb-8">
                    <a 
                      href={`${process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'http://localhost:5000'}${orderDetails.invoiceUrl}`} 
                      target="_blank"
                      className="inline-flex items-center gap-2 bg-gray-900 text-white px-6 py-2 rounded-md font-bold hover:bg-gray-800 transition-colors"
                    >
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                      </svg>
                      Download Invoice
                    </a>
                  </div>
                )}
                
                <p className="text-sm text-gray-500 max-w-md mx-auto">
                  We've sent an order confirmation email to you. We will notify you once your order is shipped.
                </p>
                
                <div className="mt-10 border-t border-gray-100 pt-8 flex justify-center">
                  <button onClick={() => router.push('/')} className="text-gold-600 font-bold hover:underline">
                    Continue Shopping
                  </button>
                </div>
              </div>
            )}
          </div>
          
          {/* Order Summary Sidebar */}
          {currentStep < 4 && (
            <div className="lg:w-80 shrink-0">
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 sticky top-24">
                <h3 className="text-lg font-bold mb-4">Order Summary</h3>
                
                <div className="space-y-3 text-sm pb-4 border-b border-gray-100">
                  <div className="flex justify-between text-gray-600">
                    <span>Original Price ({cartTotalCount} items)</span>
                    <span>₹{originalTotal.toLocaleString('en-IN')}</span>
                  </div>
                  {discount > 0 && (
                    <div className="flex justify-between text-green-600">
                      <span>Product Discount</span>
                      <span>-₹{discount.toLocaleString('en-IN')}</span>
                    </div>
                  )}
                  {couponDiscountAmount > 0 && (
                    <div className="flex justify-between text-gold-900 font-bold bg-gold-50 p-2 rounded-lg border border-gold-300">
                      <span>Coupon Discount {appliedCoupon ? `(${appliedCoupon.coupon.code})` : ''}</span>
                      <span>-₹{couponDiscountAmount.toLocaleString('en-IN')}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-gray-600">
                    <span>Shipping</span>
                    {shippingLoading ? (
                      <span className="w-8 h-4 bg-gray-200 rounded animate-pulse"></span>
                    ) : (
                      <span className={`font-semibold ${effectiveShippingCharge === 0 ? 'text-green-600' : 'text-gray-900'}`}>
                        {effectiveShippingCharge === 0 ? 'FREE' : `₹${effectiveShippingCharge.toLocaleString('en-IN')}`}
                      </span>
                    )}
                  </div>
                </div>

                {/* Promo Code Box in Checkout */}
                {currentStep < 3 && (
                  <div className="py-4 border-b border-gray-100 space-y-2">
                    {appliedCoupon ? (
                      <div className="p-2.5 bg-gold-50 border border-gold-300 rounded-xl flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2">
                          <div className="w-5 h-5 rounded-full bg-gold-600 text-white flex items-center justify-center">
                            <Check size={12} />
                          </div>
                          <div>
                            <span className="font-mono font-bold text-gold-950">{appliedCoupon.coupon.code}</span>
                            <span className="text-[10px] text-gold-800 block font-semibold">Saved ₹{appliedCoupon.discountAmount}</span>
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
                            <Tag size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
                            <input
                              type="text"
                              value={couponInput}
                              onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') handleApplyCoupon();
                              }}
                              placeholder="PROMO CODE"
                              className="w-full pl-7 pr-2 py-1.5 border border-gray-300 rounded-lg text-xs font-mono font-bold uppercase focus:ring-1 focus:ring-gold-500 outline-none"
                            />
                          </div>
                          <button
                            type="button"
                            onClick={() => handleApplyCoupon()}
                            disabled={isApplyingCoupon || !couponInput.trim()}
                            className="px-3 py-1.5 bg-gray-900 hover:bg-gold-600 disabled:opacity-50 text-white text-xs font-bold rounded-lg transition-colors cursor-pointer"
                          >
                            {isApplyingCoupon ? '...' : 'APPLY'}
                          </button>
                        </div>
                        {couponError && (
                          <p className="text-[11px] text-red-600 font-semibold flex items-center gap-1">
                            <AlertCircle size={11} />
                            <span>{couponError}</span>
                          </p>
                        )}
                        {availableCoupons.length > 0 && (
                          <div>
                            <button
                              type="button"
                              onClick={() => setShowOffers(!showOffers)}
                              className="text-[11px] font-bold text-gold-700 hover:underline flex items-center gap-1 cursor-pointer mt-1"
                            >
                              <Sparkles size={11} />
                              <span>{showOffers ? 'Hide Offers' : `View ${availableCoupons.length} Available Offers`}</span>
                            </button>
                            {showOffers && (
                              <div className="mt-2 space-y-1 max-h-28 overflow-y-auto p-1 bg-gray-50 rounded-lg border border-gray-200">
                                {availableCoupons.map((c) => (
                                  <div
                                    key={c.id}
                                    onClick={() => handleApplyCoupon(c.code)}
                                    className="p-1.5 bg-white rounded border border-gray-200 hover:border-gold-400 cursor-pointer flex items-center justify-between text-[11px]"
                                  >
                                    <span className="font-mono font-bold text-gray-900">{c.code}</span>
                                    <span className="text-[10px] font-bold text-gold-700">Apply</span>
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
                
                <div className="pt-4 flex justify-between items-center mb-6">
                  <div>
                    <span className="text-lg font-bold text-gray-900 block">Total</span>
                    <span className="text-xs text-gray-500">Inclusive of all taxes</span>
                  </div>
                  <span className="text-2xl font-bold text-gray-900">₹{total.toLocaleString('en-IN')}</span>
                </div>
                
                <div className="flex items-center justify-center gap-6 text-xs font-medium text-gray-500 border-t border-gray-100 pt-4">
                  <div className="flex flex-col items-center gap-1">
                    <svg className="w-5 h-5 text-gold-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    100% Original
                  </div>
                  <div className="flex flex-col items-center gap-1">
                    <svg className="w-5 h-5 text-gold-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                    Secure
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* PhonePe IFRAME Payment Modal */}
      {paymentIframeUrl && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl overflow-hidden shadow-2xl w-full max-w-xl h-[700px] max-h-[92vh] flex flex-col relative animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="bg-gray-50 border-b border-gray-100 px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-full bg-purple-600 flex items-center justify-center text-white text-xs font-bold shadow-sm">
                  पे
                </div>
                <div>
                  <h4 className="font-bold text-gray-900 text-sm">PhonePe Payment</h4>
                  <p className="text-[11px] text-gray-400">100% Secure Transaction</p>
                </div>
              </div>
              <button
                onClick={() => setPaymentIframeUrl(null)}
                className="text-gray-400 hover:text-gray-600 p-1.5 rounded-xl hover:bg-gray-200/60 transition-colors"
                aria-label="Close"
              >
                <X size={20} />
              </button>
            </div>

            {/* Iframe */}
            <div className="flex-1 w-full h-full relative bg-gray-50">
              <iframe
                src={paymentIframeUrl}
                className="w-full h-full border-none"
                title="PhonePe Payment Gateway"
                allow="payment *"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
