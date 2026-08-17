'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { orderAPI } from '@/lib/api/order';
import { reviewAPI } from '@/lib/api/review';
import { apiFetch } from '@/lib/api/apiFetch';
import { Search, Filter, Package, Truck, CheckCircle, Clock, XCircle, FileText, ChevronDown, MapPin, RefreshCw, X, Star, ChevronLeft, ChevronRight, Sparkles, Check } from 'lucide-react';
import io from 'socket.io-client';
import { getMediaUrl } from '@/lib/media';

const ORDER_STATUS_STEPS = ['PENDING', 'PROCESSING', 'SHIPPED', 'OUT_FOR_DELIVERY', 'DELIVERED'];
const ORDERS_PER_PAGE = 4;

export default function MyOrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('All Orders');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedOrderTracking, setSelectedOrderTracking] = useState<any | null>(null);

  // Review Modal State
  const [selectedProductForReview, setSelectedProductForReview] = useState<{
    productId: string;
    productTitle: string;
    productImage: string;
    orderNumber: string;
    orderId: string;
  } | null>(null);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewHoverRating, setReviewHoverRating] = useState(0);
  const [reviewTitle, setReviewTitle] = useState('');
  const [reviewComment, setReviewComment] = useState('');
  const [reviewImages, setReviewImages] = useState<string[]>([]);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [isEditingReview, setIsEditingReview] = useState(false);
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  const [reviewSuccess, setReviewSuccess] = useState(false);
  const [reviewedProductIds, setReviewedProductIds] = useState<string[]>([]);
  const reviewFileInputRef = React.useRef<HTMLInputElement>(null);

  const socketRef = React.useRef<any>(null);

  useEffect(() => {
    fetchOrders();

    // Socket.io for real-time order updates
    const socket = io(process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'http://localhost:5000', {
      transports: ['websocket'],
    });

    // The backend emits 'order_status_updated' to the room 'order_${orderId}'
    socket.on('order_status_updated', (data) => {
      console.log('Real-time order update:', data);
      setOrders(prevOrders => prevOrders.map(order => 
        order.id === data.orderId 
          ? { 
              ...order, 
              status: data.status, 
              statusHistory: data.history 
            } 
          : order
      ));
    });

    socketRef.current = socket;

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, []);

  // When orders change/load, join their respective socket rooms
  useEffect(() => {
    if (orders.length > 0 && socketRef.current) {
      orders.forEach(order => {
        socketRef.current.emit('join_order_room', order.id);
      });
    }
  }, [orders.length]);

  const fetchOrders = async () => {
    try {
      setIsLoading(true);
      const [res, reviewsRes] = await Promise.all([
        orderAPI.getMyOrders(),
        reviewAPI.getMyReviewedProductIds().catch(() => ({ success: false, data: [] }))
      ]);
      if (res.success) {
        setOrders(res.data.orders);
      }
      if (reviewsRes?.success && Array.isArray(reviewsRes.data)) {
        setReviewedProductIds(reviewsRes.data);
      }
    } catch (error) {
      console.error('Failed to fetch orders:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Reset page to 1 when filters or tabs change
  useEffect(() => {
    setCurrentPage(1);
  }, [activeTab, searchQuery]);

  const tabs = ['All Orders', 'Processing', 'Shipped', 'Delivered', 'Cancelled'];

  const filteredOrders = orders.filter(order => {
    // Status tab filter
    let matchesTab = true;
    if (activeTab === 'Processing') matchesTab = ['PENDING_PAYMENT', 'PAID', 'PROCESSING'].includes(order.status);
    else if (activeTab === 'Shipped') matchesTab = ['SHIPPED', 'OUT_FOR_DELIVERY'].includes(order.status);
    else if (activeTab === 'Delivered') matchesTab = order.status === 'DELIVERED';
    else if (activeTab === 'Cancelled') matchesTab = order.status === 'CANCELLED';

    if (!matchesTab) return false;

    // Search query filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      const matchOrderNum = order.orderNumber?.toLowerCase().includes(q);
      const matchItem = order.items?.some((it: any) => 
        it.product?.title?.toLowerCase().includes(q) || 
        it.productName?.toLowerCase().includes(q)
      );
      const matchShipping = order.shippingName?.toLowerCase().includes(q);
      return matchOrderNum || matchItem || matchShipping;
    }

    return true;
  });

  // Paginated Slicing
  const totalPages = Math.ceil(filteredOrders.length / ORDERS_PER_PAGE) || 1;
  const paginatedOrders = filteredOrders.slice(
    (currentPage - 1) * ORDERS_PER_PAGE,
    currentPage * ORDERS_PER_PAGE
  );

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
    window.scrollTo({ top: 120, behavior: 'smooth' });
  };

  // Open Review Modal with Pre-filled existing review check
  const handleOpenReviewModal = async (
    productId: string,
    productTitle: string,
    productImage: string,
    orderNumber: string,
    orderId: string
  ) => {
    setSelectedProductForReview({
      productId,
      productTitle,
      productImage,
      orderNumber,
      orderId,
    });
    setReviewSuccess(false);

    try {
      const res = await reviewAPI.getMyReview(productId);
      if (res.success && res.data) {
        setReviewRating(res.data.rating || 5);
        setReviewTitle(res.data.title || '');
        setReviewComment(res.data.comment || '');
        setReviewImages(Array.isArray(res.data.images) ? res.data.images : []);
        setIsEditingReview(true);
        return;
      }
    } catch (err) {
      // Ignore
    }

    // Default fresh review
    setReviewRating(5);
    setReviewTitle('');
    setReviewComment('');
    setReviewImages([]);
    setIsEditingReview(false);
  };

  // Media / Photo upload for reviews (like Amazon) using apiFetch with auth
  const handleUploadReviewImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    if (reviewImages.length + files.length > 5) {
      alert('You can upload up to 5 photos for your review.');
      return;
    }

    setIsUploadingImage(true);
    try {
      const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const formData = new FormData();
        formData.append('file', file);
        const res = await apiFetch(`${API_BASE_URL}/upload`, {
          method: 'POST',
          body: formData,
        });
        const data = await res.json();
        if (data.success && (data.data?.url || data.url)) {
          setReviewImages((prev) => [...prev, data.data?.url || data.url]);
        }
      }
    } catch (err) {
      console.error('Failed to upload review image:', err);
      alert('Failed to upload image. Please try again.');
    } finally {
      setIsUploadingImage(false);
      if (reviewFileInputRef.current) reviewFileInputRef.current.value = '';
    }
  };

  const handleRemoveReviewImage = (indexToRemove: number) => {
    setReviewImages((prev) => prev.filter((_, idx) => idx !== indexToRemove));
  };

  // Submit Review Handler
  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProductForReview) return;

    try {
      setIsSubmittingReview(true);
      await reviewAPI.addReview({
        productId: selectedProductForReview.productId,
        rating: reviewRating,
        title: reviewTitle.trim() || undefined,
        comment: reviewComment.trim() || undefined,
        images: reviewImages,
      });

      setReviewedProductIds(prev => [...prev, selectedProductForReview.productId]);
      setReviewSuccess(true);

      setTimeout(() => {
        setReviewSuccess(false);
        setSelectedProductForReview(null);
        setReviewTitle('');
        setReviewComment('');
        setReviewImages([]);
        setReviewRating(5);
        setIsEditingReview(false);
      }, 1500);
    } catch (err: any) {
      console.error('Failed to submit review:', err);
      alert(err.message || 'Failed to submit review. Please try again.');
    } finally {
      setIsSubmittingReview(false);
    }
  };

  const getStatusStepIndex = (status?: string) => {
    if (!status) return 0;
    // Map initial statuses to PENDING in the timeline
    if (status === 'PENDING_PAYMENT' || status === 'PAID') return 0;
    return ORDER_STATUS_STEPS.indexOf(status);
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return '';
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return '';
      return date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
    } catch {
      return '';
    }
  };
  
  const formatTime = (dateString?: string) => {
    if (!dateString) return '';
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return '';
      return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
    } catch {
      return '';
    }
  };

  // Stats for the sidebar
  const totalOrders = orders.length;
  const inProgress = orders.filter(o => ['PENDING_PAYMENT', 'PAID', 'PROCESSING', 'SHIPPED', 'OUT_FOR_DELIVERY'].includes(o?.status)).length;
  const delivered = orders.filter(o => o?.status === 'DELIVERED').length;
  const cancelled = orders.filter(o => o?.status === 'CANCELLED').length;
  const totalSpent = orders.reduce((acc, o) => o?.status !== 'CANCELLED' ? acc + (Number(o?.totalAmount) || 0) : acc, 0);

  // Function to handle invoice download
  const handleDownloadInvoice = async (orderId: string, orderNumber: string) => {
    try {
      const token = localStorage.getItem('accessToken');
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
      
      const response = await fetch(`${apiUrl}/orders/${orderId}/invoice`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to generate invoice');
      }
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = `invoice-${orderNumber}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Error downloading invoice:', error);
      alert('Failed to download invoice. Please try again later.');
    }
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-serif font-extrabold text-gray-900 tracking-tight">Your Orders</h1>
          <p className="text-xs sm:text-sm text-gray-500 font-medium mt-0.5">Track packages, download invoices, write reviews, and reorder</p>
        </div>
        <div className="relative w-full sm:w-80">
          <input 
            type="text" 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by order #, product, or name..." 
            className="w-full pl-9 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-xs sm:text-sm font-medium focus:outline-none focus:ring-2 focus:ring-gold-500/30 focus:border-gold-500 shadow-2xs transition-all"
          />
          <Search className="absolute left-3 top-3 text-gray-400 w-4 h-4" />
          {searchQuery && (
            <button 
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-3 text-gray-400 hover:text-gray-600 text-xs font-bold"
            >
              <X size={14} />
            </button>
          )}
        </div>
      </div>

      {/* Main Full-Width Orders Container */}
      <div className="w-full space-y-6">
        {/* Status Tabs */}
        <div className="bg-white p-1.5 rounded-2xl border border-gray-100 shadow-2xs flex overflow-x-auto gap-1 scrollbar-none">
          {tabs.map((tab) => {
            let count = orders.length;
            if (tab === 'Processing') count = inProgress;
            else if (tab === 'Shipped') count = orders.filter(o => ['SHIPPED', 'OUT_FOR_DELIVERY'].includes(o?.status)).length;
            else if (tab === 'Delivered') count = delivered;
            else if (tab === 'Cancelled') count = cancelled;

            const isActive = activeTab === tab;

            return (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`py-2 px-4 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all flex items-center gap-2 cursor-pointer ${
                  isActive
                    ? 'bg-gold-600 text-white shadow-xs'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                <span>{tab}</span>
                <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-extrabold ${
                  isActive ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-600'
                }`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Orders List */}
        {isLoading ? (
          <div className="flex flex-col justify-center items-center py-24 bg-white rounded-2xl border border-gray-100 shadow-2xs">
            <div className="w-10 h-10 border-3 border-gold-200 border-t-gold-600 rounded-full animate-spin mb-3"></div>
            <p className="text-xs font-bold text-gray-400">Loading your orders...</p>
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-2xs border border-gray-100 p-12 sm:p-16 text-center">
            <div className="w-16 h-16 bg-cream-50 text-gold-600 rounded-full flex items-center justify-center mx-auto mb-4 border border-cream-200 shadow-2xs">
              <Package size={28} />
            </div>
            <h2 className="text-base sm:text-lg font-bold text-gray-900 mb-1">No orders found</h2>
            <p className="text-xs sm:text-sm text-gray-500 max-w-sm mx-auto">
              {searchQuery ? 'No orders matched your search query.' : 'You do not have any orders under this filter.'}
            </p>
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="mt-4 px-4 py-2 bg-cream-100 hover:bg-cream-200 text-gray-800 text-xs font-bold rounded-xl transition-colors cursor-pointer"
              >
                Clear Search Filter
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-5">
            {paginatedOrders.map((order) => {
              const currentStepIndex = getStatusStepIndex(order?.status);
              const isCancelled = order?.status === 'CANCELLED';
              const isDelivered = order?.status === 'DELIVERED';

              return (
                <div key={order?.id} className="bg-white rounded-2xl shadow-2xs border border-gray-200/80 overflow-hidden hover:border-gold-500/40 hover:shadow-luxury transition-all duration-300">
                  {/* Order Top Bar */}
                  <div className="bg-cream-50/70 p-4 sm:px-6 border-b border-cream-200/80 flex flex-wrap justify-between items-center gap-4 text-xs">
                    <div className="flex flex-wrap gap-6 sm:gap-10">
                      <div>
                        <span className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">ORDER PLACED</span>
                        <span className="font-extrabold text-gray-900">{formatDate(order?.createdAt)}</span>
                      </div>
                      <div>
                        <span className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">TOTAL AMOUNT</span>
                        <span className="font-black text-gray-900">₹{(order?.totalAmount || 0).toLocaleString('en-IN', { maximumFractionDigits: 2 })}</span>
                      </div>
                      <div>
                        <span className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">SHIP TO</span>
                        <span className="font-bold text-gray-800">{order?.shippingName || 'Customer'}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <span className="block text-[11px] font-extrabold text-gray-900 font-mono">#{order?.orderNumber}</span>
                      </div>
                      <button 
                        onClick={() => handleDownloadInvoice(order.id, order.orderNumber)}
                        className="inline-flex items-center gap-1 px-3 py-1.5 bg-white hover:bg-gold-50 text-gold-800 border border-gray-200 hover:border-gold-300 rounded-lg text-xs font-bold transition-all shadow-2xs cursor-pointer"
                        title="Download official GST tax invoice"
                      >
                        <FileText size={13} className="text-gold-600" />
                        <span>Invoice</span>
                      </button>
                    </div>
                  </div>

                  {/* Order Content */}
                  <div className="p-5 sm:p-6">
                    {/* Status Header Badge */}
                    <div className="flex items-center justify-between gap-3 mb-6 pb-4 border-b border-gray-100">
                      <div className="flex items-center gap-2">
                        {isCancelled ? (
                          <div className="p-1.5 bg-red-100 text-red-600 rounded-lg">
                            <XCircle size={18} />
                          </div>
                        ) : isDelivered ? (
                          <div className="p-1.5 bg-emerald-100 text-emerald-600 rounded-lg">
                            <CheckCircle size={18} />
                          </div>
                        ) : (
                          <div className="p-1.5 bg-amber-100 text-amber-600 rounded-lg">
                            <Truck size={18} />
                          </div>
                        )}
                        <div>
                          <h3 className={`text-sm sm:text-base font-extrabold ${
                            isCancelled ? 'text-red-700' : isDelivered ? 'text-emerald-700' : 'text-amber-800'
                          }`}>
                            {isCancelled 
                              ? `Cancelled on ${formatDate(order?.updatedAt)}` 
                              : isDelivered 
                              ? `Delivered on ${formatDate(order?.updatedAt || order?.createdAt)}` 
                              : `Arriving Soon (${(order?.status || 'PROCESSING').replace(/_/g, ' ')})`}
                          </h3>
                          <p className="text-[11px] text-gray-500 font-medium mt-0.5">
                            {isDelivered 
                              ? 'Package was handed directly to the recipient.' 
                              : isCancelled 
                              ? 'This order was cancelled.' 
                              : 'Your items are being processed and prepared for shipping.'}
                          </p>
                        </div>
                      </div>

                      <button 
                        onClick={() => setSelectedOrderTracking(order)}
                        className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-gray-50 hover:bg-gray-100 text-gray-700 rounded-xl text-xs font-bold border border-gray-200 transition-colors cursor-pointer shrink-0"
                      >
                        <MapPin size={14} className="text-gray-400" />
                        <span>Track Order</span>
                      </button>
                    </div>
                    
                    {/* Sleek Milestone Timeline (For non-cancelled orders) */}
                    {!isCancelled && (
                      <div className="mb-6 px-2 sm:px-6">
                        <div className="relative">
                          {/* Background Track */}
                          <div className="absolute top-3 left-0 w-full h-1 bg-gray-100 rounded-full -z-10"></div>
                          {/* Active Filled Track */}
                          <div 
                            className="absolute top-3 left-0 h-1 bg-emerald-500 rounded-full transition-all duration-500 ease-in-out -z-10"
                            style={{ width: `${(Math.max(0, currentStepIndex) / (ORDER_STATUS_STEPS.length - 1)) * 100}%` }}
                          ></div>
                          
                          <div className="flex justify-between">
                            {ORDER_STATUS_STEPS.map((step, idx) => {
                              const isCompleted = idx <= currentStepIndex;
                              const isActive = idx === currentStepIndex;
                              const historyEntry = order?.statusHistory?.find((h: any) => h?.status === step || (step === 'PENDING' && (h?.status === 'PENDING_PAYMENT' || h?.status === 'PAID')));
                              
                              return (
                                <div key={step} className="flex flex-col items-center">
                                  <div className={`w-6 h-6 rounded-full flex items-center justify-center ring-4 ring-white transition-all ${
                                    isActive 
                                      ? 'bg-emerald-600 text-white scale-110 shadow-xs' 
                                      : isCompleted 
                                      ? 'bg-emerald-500 text-white' 
                                      : 'bg-gray-200 text-gray-400'
                                  }`}>
                                    {isActive ? (
                                      <div className="w-2 h-2 bg-white rounded-full"></div>
                                    ) : isCompleted ? (
                                      <Check size={12} className="stroke-[3]" />
                                    ) : null}
                                  </div>
                                  <div className="mt-2 text-center">
                                    <span className={`block text-[11px] font-bold ${
                                      isActive ? 'text-emerald-700 font-extrabold' : isCompleted ? 'text-gray-800' : 'text-gray-400'
                                    }`}>
                                      {step === 'OUT_FOR_DELIVERY' ? 'Out for Delivery' : step.charAt(0) + step.slice(1).toLowerCase()}
                                    </span>
                                    {isCompleted && historyEntry ? (
                                      <span className="block text-[10px] text-gray-400 mt-0.5">{formatDate(historyEntry.createdAt)}</span>
                                    ) : idx === 0 ? (
                                      <span className="block text-[10px] text-gray-400 mt-0.5">{formatDate(order?.createdAt)}</span>
                                    ) : null}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Products List in this Order */}
                    <div className="space-y-4 pt-2">
                      {(order?.items || []).map((item: any) => {
                        const productTitle = item.product?.title || item.productName || 'Product';
                        const rawImage = (item.product?.images && Array.isArray(item.product.images) && item.product.images.length > 0 && item.product.images[0])
                          ? item.product.images[0]
                          : null;
                        const productImage = getMediaUrl(rawImage, '/assets/product-placeholder.png');
                        const productId = item.product?.id || item.productId;
                        const productSlug = item.product?.slug || productId;
                        const productUrl = productSlug ? `/product/${productSlug}` : null;
                        const quantity = item.quantity || 1;
                        const unitPrice = Number(item.unitPrice) || 0;
                        const discountPct = Number(item.discountPercentage) || 0;
                        const itemTotal = unitPrice * (1 - discountPct / 100) * quantity;
                        const isReviewed = productId && reviewedProductIds.includes(productId);

                        return (
                          <div key={item.id || Math.random()} className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-3.5 bg-cream-50/40 rounded-xl border border-cream-200/60 hover:border-cream-300 transition-colors">
                            {/* Product Info Left */}
                            <div className="flex items-center gap-4 flex-1 min-w-0">
                              <div className="w-16 h-16 sm:w-20 sm:h-20 shrink-0 bg-white border border-gray-200/80 rounded-xl overflow-hidden p-1.5 flex items-center justify-center shadow-2xs">
                                <img 
                                  src={productImage} 
                                  alt={productTitle} 
                                  onError={(e: any) => {
                                    e.currentTarget.onerror = null;
                                    e.currentTarget.src = '/assets/product-placeholder.png';
                                  }}
                                  className="w-full h-full object-contain mix-blend-multiply" 
                                />
                              </div>
                              
                              <div className="flex-1 min-w-0">
                                {productUrl ? (
                                  <Link href={productUrl} className="font-bold text-xs sm:text-sm text-gray-900 hover:text-gold-700 line-clamp-1 transition-colors block">
                                    {productTitle}
                                  </Link>
                                ) : (
                                  <span className="font-bold text-xs sm:text-sm text-gray-900 line-clamp-1 block">
                                    {productTitle}
                                  </span>
                                )}
                                
                                <div className="flex flex-wrap items-center gap-2 mt-1">
                                  {item.variantId && (
                                    <span className="text-[10px] font-bold text-gold-800 bg-gold-50 px-2 py-0.5 rounded-md border border-gold-200">
                                      Variant Selected
                                    </span>
                                  )}
                                  <span className="text-xs text-gray-500 font-medium">
                                    Qty: <strong className="text-gray-900 font-bold">{quantity}</strong>
                                  </span>
                                  <span className="text-xs text-gray-400">•</span>
                                  <span className="text-xs font-black text-gray-900">
                                    ₹{itemTotal.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                                  </span>
                                </div>
                              </div>
                            </div>
                            
                            {/* Action Buttons Right */}
                            <div className="flex flex-wrap items-center gap-2 self-start md:self-auto shrink-0">
                              {/* Delivered-Only Review Button (Supports Write & Edit) */}
                              {isDelivered && productId && (
                                <button
                                  onClick={() => handleOpenReviewModal(
                                    productId,
                                    productTitle,
                                    productImage,
                                    order.orderNumber,
                                    order.id
                                  )}
                                  className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-extrabold transition-all shadow-xs active:scale-95 cursor-pointer ${
                                    isReviewed
                                      ? 'bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300'
                                      : 'bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white'
                                  }`}
                                >
                                  <Star size={14} className={isReviewed ? "fill-amber-500 text-amber-500" : "fill-white text-white"} />
                                  <span>{isReviewed ? 'Update Review' : 'Write Review'}</span>
                                </button>
                              )}

                              {productUrl ? (
                                <Link 
                                  href={productUrl}
                                  className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-white hover:bg-gray-50 text-gray-800 border border-gray-200 hover:border-gray-300 rounded-xl text-xs font-bold transition-colors shadow-2xs"
                                >
                                  <RefreshCw size={13} />
                                  <span>Buy Again</span>
                                </Link>
                              ) : (
                                <button 
                                  disabled
                                  className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-gray-50 text-gray-400 border border-gray-200 rounded-xl text-xs font-bold cursor-not-allowed"
                                >
                                  <RefreshCw size={13} />
                                  <span>Buy Again</span>
                                </button>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Pagination Toolbar */}
        {!isLoading && filteredOrders.length > ORDERS_PER_PAGE && (
          <div className="mt-8 pt-4 border-t border-gray-200/80 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-xs text-gray-500 font-medium">
              Showing <span className="font-bold text-gray-900">{(currentPage - 1) * ORDERS_PER_PAGE + 1}</span> to{' '}
              <span className="font-bold text-gray-900">
                {Math.min(currentPage * ORDERS_PER_PAGE, filteredOrders.length)}
              </span>{' '}
              of <span className="font-bold text-gray-900">{filteredOrders.length}</span> orders
            </div>

            <div className="flex items-center gap-1.5">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className={`flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold border transition-all ${
                  currentPage === 1
                    ? 'border-gray-200 text-gray-400 cursor-not-allowed bg-gray-50'
                    : 'border-gray-300 text-gray-700 bg-white hover:bg-gold-50 hover:border-gold-400 cursor-pointer shadow-2xs'
                }`}
              >
                <ChevronLeft size={14} />
                Previous
              </button>

              {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
                <button
                  key={pageNum}
                  onClick={() => handlePageChange(pageNum)}
                  className={`w-8 h-8 rounded-xl text-xs font-extrabold transition-all flex items-center justify-center ${
                    currentPage === pageNum
                      ? 'bg-gold-600 text-white shadow-xs'
                      : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 cursor-pointer'
                  }`}
                >
                  {pageNum}
                </button>
              ))}

              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className={`flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold border transition-all ${
                  currentPage === totalPages
                    ? 'border-gray-200 text-gray-400 cursor-not-allowed bg-gray-50'
                    : 'border-gray-300 text-gray-700 bg-white hover:bg-gold-50 hover:border-gold-400 cursor-pointer shadow-2xs'
                }`}
              >
                Next
                <ChevronRight size={14} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Track Package Modal */}
      {selectedOrderTracking && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-lg w-full max-h-[90vh] flex flex-col overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
              <div>
                <h3 className="font-bold text-gray-900">Track Package</h3>
                <p className="text-xs text-gray-500">Order #{selectedOrderTracking.orderNumber}</p>
              </div>
              <button 
                onClick={() => setSelectedOrderTracking(null)}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-200 rounded-full transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto flex-1">
              {selectedOrderTracking.trackingNumber && (
                <div className="mb-6 bg-blue-50 text-blue-800 p-4 rounded-lg flex items-start gap-3">
                  <Truck className="mt-0.5 text-blue-500" size={18} />
                  <div>
                    <span className="block text-sm font-medium">Tracking ID: {selectedOrderTracking.trackingNumber}</span>
                    <span className="block text-xs mt-1 opacity-80">Track this ID on the courier partner's website for live updates.</span>
                  </div>
                </div>
              )}

              <div className="space-y-6">
                <h4 className="font-semibold text-gray-900 text-sm uppercase tracking-wider">Tracking History</h4>
                
                <div className="relative pl-6">
                  {/* Vertical Line */}
                  <div className="absolute top-2 left-[11px] bottom-2 w-0.5 bg-gray-200"></div>
                  
                  {/* History Items */}
                  {(selectedOrderTracking.statusHistory || []).map((history: any, idx: number) => (
                    <div key={history.id} className="relative mb-6 last:mb-0">
                      {/* Node */}
                      <div className={`absolute -left-[30px] w-4 h-4 rounded-full border-4 border-white ${
                        idx === 0 ? 'bg-orange-500' : 'bg-gray-300'
                      }`}></div>
                      
                      <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
                        <div className="flex justify-between items-start mb-1">
                          <span className="font-bold text-gray-900 text-sm">{history.status.replace(/_/g, ' ')}</span>
                          <span className="text-xs text-gray-500 text-right">
                            {formatDate(history.createdAt)}<br/>
                            {formatTime(history.createdAt)}
                          </span>
                        </div>
                        {history.comment && (
                          <div className="mt-3 text-sm text-gray-600 bg-white p-3 rounded border border-gray-100 italic">
                            <span className="block font-medium not-italic text-xs text-gray-400 mb-1">Admin Note:</span>
                            "{history.comment}"
                          </div>
                        )}
                      </div>
                    </div>
                  ))}

                  {/* Original Order Placed entry */}
                  <div className="relative">
                    <div className="absolute -left-[30px] w-4 h-4 rounded-full border-4 border-white bg-gray-300"></div>
                    <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
                      <div className="flex justify-between items-start">
                        <span className="font-bold text-gray-900 text-sm">ORDER PLACED</span>
                        <span className="text-xs text-gray-500 text-right">
                          {formatDate(selectedOrderTracking.createdAt)}<br/>
                          {formatTime(selectedOrderTracking.createdAt)}
                        </span>
                      </div>
                      <p className="mt-2 text-xs text-gray-500">Your order has been received and is waiting for payment confirmation.</p>
                    </div>
                  </div>

                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Write / Update Product Review Modal (Delivered Only) */}
      {selectedProductForReview && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="px-6 py-4 bg-gradient-to-r from-amber-50 to-cream-50 border-b border-amber-200/80 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-amber-500/10 text-amber-700 rounded-lg">
                  <Sparkles size={18} />
                </div>
                <div>
                  <h3 className="font-serif font-bold text-gray-900 text-base">
                    {isEditingReview ? 'Update Product Review' : 'Write Product Review'}
                  </h3>
                  <p className="text-[11px] text-gray-500 font-medium">Order #{selectedProductForReview.orderNumber}</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedProductForReview(null)}
                className="p-1.5 text-gray-400 hover:text-gray-700 rounded-full hover:bg-white/80 transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            {/* Product Preview */}
            <div className="p-6 overflow-y-auto flex-1">
              <div className="flex items-center gap-3.5 pb-4 mb-5 border-b border-gray-100 bg-cream-50/50 p-3 rounded-xl">
                <div className="w-14 h-14 rounded-lg bg-white border border-gray-200 p-1 flex-shrink-0 flex items-center justify-center overflow-hidden">
                  <img
                    src={selectedProductForReview.productImage}
                    alt={selectedProductForReview.productTitle}
                    className="w-full h-full object-contain"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-gray-900 truncate">
                    {selectedProductForReview.productTitle}
                  </p>
                  <span className="inline-flex items-center gap-1 mt-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                    <Check size={10} /> Verified Delivered Purchase
                  </span>
                </div>
              </div>

              {reviewSuccess ? (
                <div className="py-8 text-center space-y-2">
                  <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-3 animate-in zoom-in">
                    <Check size={24} />
                  </div>
                  <h4 className="font-bold text-gray-900 text-base">
                    {isEditingReview ? 'Review Updated Successfully!' : 'Thank you for your review!'}
                  </h4>
                  <p className="text-xs text-gray-500">Your feedback helps fellow athletes make the right choice.</p>
                </div>
              ) : (
                <form onSubmit={handleSubmitReview} className="space-y-4">
                  {/* Star Rating */}
                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                      Overall Rating *
                    </label>
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            key={star}
                            type="button"
                            onMouseEnter={() => setReviewHoverRating(star)}
                            onMouseLeave={() => setReviewHoverRating(0)}
                            onClick={() => setReviewRating(star)}
                            className="p-1 text-gray-300 hover:text-amber-400 transition-transform active:scale-110 cursor-pointer"
                          >
                            <Star
                              size={26}
                              className={
                                star <= (reviewHoverRating || reviewRating)
                                  ? 'text-amber-500 fill-amber-400'
                                  : 'text-gray-300'
                              }
                            />
                          </button>
                        ))}
                      </div>
                      <span className="text-xs font-extrabold text-amber-800 ml-2">
                        {reviewRating === 5 && '5 - Excellent ⭐'}
                        {reviewRating === 4 && '4 - Very Good'}
                        {reviewRating === 3 && '3 - Good'}
                        {reviewRating === 2 && '2 - Fair'}
                        {reviewRating === 1 && '1 - Poor'}
                      </span>
                    </div>
                  </div>

                  {/* Review Title */}
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">
                      Headline / Title (Optional)
                    </label>
                    <input
                      type="text"
                      value={reviewTitle}
                      onChange={(e) => setReviewTitle(e.target.value)}
                      placeholder="e.g. Delicious flavor & smooth mixability!"
                      className="w-full px-3.5 py-2 rounded-xl border border-gray-200 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-gold-500/30"
                    />
                  </div>

                  {/* Detailed Comment */}
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">
                      Your Detailed Review *
                    </label>
                    <textarea
                      rows={4}
                      required
                      value={reviewComment}
                      onChange={(e) => setReviewComment(e.target.value)}
                      placeholder="What did you like or dislike? How was the effectiveness, quality, and results?"
                      className="w-full px-3.5 py-2 rounded-xl border border-gray-200 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-gold-500/30 resize-none"
                    />
                  </div>

                  {/* Amazon-Style Media / Photo Upload */}
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1.5 flex items-center justify-between">
                      <span>Add Photos / Media (Optional)</span>
                      <span className="text-[11px] text-gray-400 font-normal">{reviewImages.length}/5 photos</span>
                    </label>
                    
                    <input 
                      type="file"
                      ref={reviewFileInputRef}
                      onChange={handleUploadReviewImage}
                      multiple
                      accept="image/*"
                      className="hidden"
                    />

                    {/* Image Thumbnails & Add Button */}
                    <div className="flex flex-wrap items-center gap-2.5">
                      {reviewImages.map((imgUrl, idx) => (
                        <div key={idx} className="relative w-16 h-16 rounded-xl border border-gray-200 overflow-hidden bg-gray-50 group">
                          <img src={getMediaUrl(imgUrl, '/assets/product-placeholder.png')} alt={`Review photo ${idx + 1}`} className="w-full h-full object-cover" />
                          <button
                            type="button"
                            onClick={() => handleRemoveReviewImage(idx)}
                            className="absolute top-1 right-1 w-5 h-5 bg-black/70 hover:bg-black text-white rounded-full flex items-center justify-center text-[10px] transition-colors cursor-pointer"
                            title="Remove photo"
                          >
                            <X size={12} />
                          </button>
                        </div>
                      ))}

                      {reviewImages.length < 5 && (
                        <button
                          type="button"
                          onClick={() => reviewFileInputRef.current?.click()}
                          disabled={isUploadingImage}
                          className="w-16 h-16 rounded-xl border-2 border-dashed border-gray-300 hover:border-gold-500 bg-gray-50 hover:bg-gold-50/50 flex flex-col items-center justify-center text-gray-500 hover:text-gold-700 transition-all cursor-pointer"
                          title="Upload product photo"
                        >
                          {isUploadingImage ? (
                            <div className="w-4 h-4 border-2 border-gold-300 border-t-gold-600 rounded-full animate-spin"></div>
                          ) : (
                            <>
                              <span className="text-lg leading-none">+</span>
                              <span className="text-[9px] font-bold mt-0.5">Photo</span>
                            </>
                          )}
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center justify-end gap-2.5 pt-2">
                    <button
                      type="button"
                      onClick={() => setSelectedProductForReview(null)}
                      className="px-4 py-2 text-xs font-bold text-gray-600 hover:text-gray-900 rounded-xl hover:bg-gray-100 transition-colors cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmittingReview || !reviewComment.trim()}
                      className="px-5 py-2 bg-gold-600 hover:bg-gold-700 disabled:opacity-50 text-white text-xs font-bold rounded-xl shadow-sm transition-all cursor-pointer flex items-center gap-1.5"
                    >
                      {isSubmittingReview ? 'Saving...' : isEditingReview ? 'Update Review' : 'Submit Verified Review'}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
