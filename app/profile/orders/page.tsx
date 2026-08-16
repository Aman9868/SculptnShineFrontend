'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { orderAPI } from '@/lib/api/order';
import { Search, Filter, Package, Truck, CheckCircle, Clock, XCircle, FileText, ChevronDown, MapPin, RefreshCw, X } from 'lucide-react';
import io from 'socket.io-client';
import { getMediaUrl } from '@/lib/media';

const ORDER_STATUS_STEPS = ['PENDING', 'PROCESSING', 'SHIPPED', 'OUT_FOR_DELIVERY', 'DELIVERED'];

export default function MyOrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('All Orders');
  const [selectedOrderTracking, setSelectedOrderTracking] = useState<any | null>(null);
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

    // We need a way to join rooms after orders are loaded, so we store the socket for this effect
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
      const res = await orderAPI.getMyOrders();
      if (res.success) {
        setOrders(res.data.orders);
      }
    } catch (error) {
      console.error('Failed to fetch orders:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const tabs = ['All Orders', 'Processing', 'Shipped', 'Delivered', 'Cancelled', 'Returned'];

  const filteredOrders = orders.filter(order => {
    if (activeTab === 'All Orders') return true;
    if (activeTab === 'Processing' && (order.status === 'PENDING_PAYMENT' || order.status === 'PAID' || order.status === 'PROCESSING')) return true;
    if (activeTab === 'Shipped' && (order.status === 'SHIPPED' || order.status === 'OUT_FOR_DELIVERY')) return true;
    if (activeTab === 'Delivered' && order.status === 'DELIVERED') return true;
    if (activeTab === 'Cancelled' && order.status === 'CANCELLED') return true;
    return false;
  });

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
      <div className="flex justify-between items-end mb-6">
        <div>
          <h1 className="text-2xl font-serif font-bold text-gray-900">Your Orders</h1>
          <p className="text-sm text-gray-500 mt-1">Track, return, cancel or buy again</p>
        </div>
        <div className="flex gap-3">
          <div className="relative">
            <input 
              type="text" 
              placeholder="Search by order ID, product or brand" 
              className="pl-4 pr-10 py-2 border border-gray-200 rounded-md text-sm w-72 focus:outline-none focus:ring-1 focus:ring-orange-500 focus:border-orange-500"
            />
            <Search className="absolute right-3 top-2.5 text-gray-400 w-4 h-4" />
          </div>
          <button className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-md text-sm font-medium hover:bg-gray-50 text-gray-700 bg-white">
            <Filter className="w-4 h-4" />
            Filters
          </button>
        </div>
      </div>

      <div className="flex flex-col xl:flex-row gap-6">
        
        {/* Main Orders Area */}
        <div className="flex-1 overflow-hidden">
          {/* Tabs */}
          <div className="mb-6 border-b border-gray-200">
            <div className="flex overflow-x-auto hide-scrollbar">
              {tabs.map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`py-3 px-5 text-sm font-medium whitespace-nowrap transition-all border-b-2 ${
                    activeTab === tab
                      ? 'border-[#d8ab60] text-[#d8ab60]'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>

          {/* Orders List */}
          {isLoading ? (
            <div className="flex justify-center items-center py-20">
              <div className="w-8 h-8 border-4 border-orange-200 border-t-orange-600 rounded-full animate-spin"></div>
            </div>
          ) : filteredOrders.length === 0 ? (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
              <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <Package size={32} className="text-gray-300" />
              </div>
              <h2 className="text-lg font-bold text-gray-900 mb-2">No orders found</h2>
              <p className="text-gray-500 text-sm">You have no orders in this category.</p>
            </div>
          ) : (
            <div className="space-y-6">
              {filteredOrders.map((order) => {
                const currentStepIndex = getStatusStepIndex(order?.status);
                const isCancelled = order?.status === 'CANCELLED';
                const isDelivered = order?.status === 'DELIVERED';
                const orderTotal = Number(order?.totalAmount) || 0;

                return (
                  <div key={order.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    
                    {/* Order Header */}
                    <div className="bg-gray-50 px-6 py-4 border-b border-gray-200 flex flex-wrap justify-between items-center text-xs text-gray-600">
                      <div className="flex gap-8">
                        <div>
                          <span className="block mb-1 font-semibold uppercase">Order Placed</span>
                          <span className="text-gray-900">{formatDate(order?.createdAt)}</span>
                        </div>
                        <div>
                          <span className="block mb-1 font-semibold uppercase">Total</span>
                          <span className="text-gray-900">₹{orderTotal.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</span>
                        </div>
                        <div>
                          <span className="block mb-1 font-semibold uppercase">Ship To</span>
                          <span className="text-gray-900">{order?.shippingName || 'Customer'}</span>
                        </div>
                      </div>
                      <div className="text-right flex flex-col items-end">
                        <span className="block mb-1 font-semibold uppercase text-gray-900">Order # {order?.orderNumber}</span>
                        <button 
                          onClick={() => handleDownloadInvoice(order.id, order.orderNumber)}
                          className="text-[#d87c1c] hover:text-[#b36310] hover:underline font-medium inline-flex items-center gap-1 mt-1 text-sm bg-transparent border-none cursor-pointer"
                        >
                          View Invoice
                        </button>
                      </div>
                    </div>

                    <div className="p-6">
                      {/* Status Banner */}
                      <h3 className={`text-lg font-bold mb-6 flex items-center gap-2 ${
                        isCancelled ? 'text-red-600' : isDelivered ? 'text-green-600' : 'text-orange-500'
                      }`}>
                        {isCancelled ? <XCircle size={20} /> : isDelivered ? <CheckCircle size={20} /> : <Clock size={20} />}
                        {isCancelled ? `Cancelled on ${formatDate(order?.updatedAt)}` 
                          : isDelivered ? `Delivered on ${formatDate(order?.updatedAt)}` 
                          : `Arriving soon (${(order?.status || 'PROCESSING').replace(/_/g, ' ')})`}
                      </h3>
                      
                      {/* Timeline (Only show if not cancelled) */}
                      {!isCancelled && (
                        <div className="mb-8 px-4 sm:px-8">
                          <div className="relative">
                            <div className="absolute top-2.5 left-0 w-full h-1 bg-gray-200 rounded-full -z-10"></div>
                            
                            <div 
                              className="absolute top-2.5 left-0 h-1 bg-green-500 rounded-full transition-all duration-500 ease-in-out -z-10"
                              style={{ width: `${(Math.max(0, currentStepIndex) / (ORDER_STATUS_STEPS.length - 1)) * 100}%` }}
                            ></div>
                            
                            <div className="flex justify-between">
                              {ORDER_STATUS_STEPS.map((step, idx) => {
                                const isCompleted = idx <= currentStepIndex;
                                const isActive = idx === currentStepIndex;
                                // Find history for this step if it exists to show exact date
                                const historyEntry = order?.statusHistory?.find((h: any) => h?.status === step || (step === 'PENDING' && (h?.status === 'PENDING_PAYMENT' || h?.status === 'PAID')));
                                
                                return (
                                  <div key={step} className="flex flex-col items-center">
                                    <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                                      isCompleted ? 'bg-green-500' : 'bg-gray-200'
                                    }`}>
                                      {isActive && <div className="w-2 h-2 bg-white rounded-full"></div>}
                                      {isCompleted && !isActive && <CheckCircle size={14} className="text-white" />}
                                    </div>
                                    <div className="mt-2 text-center">
                                      <span className={`block text-xs font-medium ${
                                        isActive ? 'text-green-700 font-bold' : isCompleted ? 'text-gray-900' : 'text-gray-400'
                                      }`}>
                                        {step === 'OUT_FOR_DELIVERY' ? 'Out for Delivery' : step.charAt(0) + step.slice(1).toLowerCase()}
                                      </span>
                                      {isCompleted && historyEntry ? (
                                        <span className="block text-[10px] text-gray-500 mt-0.5">{formatDate(historyEntry.createdAt)}</span>
                                      ) : idx === 0 ? (
                                        <span className="block text-[10px] text-gray-500 mt-0.5">{formatDate(order?.createdAt)}</span>
                                      ) : null}
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Cancelled Timeline (if cancelled) */}
                      {isCancelled && (
                         <div className="mb-8 px-4 sm:px-8">
                          <div className="relative">
                            <div className="absolute top-2.5 left-0 w-full h-1 bg-gray-200 rounded-full -z-10"></div>
                            
                            <div 
                              className="absolute top-2.5 left-0 h-1 bg-red-500 rounded-full -z-10"
                              style={{ width: '33%' }} // Example hardcoded width to show partial progress then red
                            ></div>
                            
                            <div className="flex justify-between">
                              <div className="flex flex-col items-center">
                                <div className="w-6 h-6 rounded-full flex items-center justify-center bg-gray-400">
                                  <CheckCircle size={14} className="text-white" />
                                </div>
                                <div className="mt-2 text-center">
                                  <span className="block text-xs font-medium text-gray-900">Order Placed</span>
                                  <span className="block text-[10px] text-gray-500 mt-0.5">{formatDate(order?.createdAt)}</span>
                                </div>
                              </div>
                              <div className="flex flex-col items-center">
                                <div className="w-6 h-6 rounded-full flex items-center justify-center bg-red-500 text-white">
                                  <XCircle size={14} />
                                </div>
                                <div className="mt-2 text-center">
                                  <span className="block text-xs font-medium text-red-600 font-bold">Cancelled</span>
                                  <span className="block text-[10px] text-gray-500 mt-0.5">{formatDate(order?.updatedAt)}</span>
                                </div>
                              </div>
                              <div className="flex flex-col items-center">
                                <div className="w-6 h-6 rounded-full flex items-center justify-center bg-gray-200"></div>
                                <div className="mt-2 text-center">
                                  <span className="block text-xs font-medium text-gray-400">Shipped</span>
                                </div>
                              </div>
                              <div className="flex flex-col items-center">
                                <div className="w-6 h-6 rounded-full flex items-center justify-center bg-gray-200"></div>
                                <div className="mt-2 text-center">
                                  <span className="block text-xs font-medium text-gray-400">Delivered</span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Items */}
                      <div className="space-y-4">
                        {(order?.items || []).map((item: any) => {
                          const productTitle = item.product?.title || item.productName || 'Product';
                          const rawImage = (item.product?.images && Array.isArray(item.product.images) && item.product.images.length > 0 && item.product.images[0])
                            ? item.product.images[0]
                            : null;
                          const productImage = getMediaUrl(rawImage, '/assets/product-placeholder.png');
                          const productId = item.product?.id || item.productId;
                          const productUrl = productId ? `/product/${productId}` : null;
                          const quantity = item.quantity || 1;
                          const unitPrice = Number(item.unitPrice) || 0;
                          const discountPct = Number(item.discountPercentage) || 0;
                          const itemTotal = unitPrice * (1 - discountPct / 100) * quantity;

                          return (
                            <div key={item.id || Math.random()} className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6 pb-4 border-b border-gray-100 last:border-0 last:pb-0">
                              <div className="flex items-center gap-4 flex-1">
                                <div className="w-16 h-16 sm:w-20 sm:h-20 flex-shrink-0 bg-gray-50 border border-gray-100 rounded-md overflow-hidden p-2">
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
                                
                                <div className="flex-1">
                                  {productUrl ? (
                                    <Link href={productUrl} className="font-semibold text-gray-900 hover:text-orange-600 line-clamp-1 mb-1">
                                      {productTitle}
                                    </Link>
                                  ) : (
                                    <span className="font-semibold text-gray-900 line-clamp-1 mb-1">
                                      {productTitle}
                                    </span>
                                  )}
                                  
                                  {item.variantId && (
                                    <p className="text-xs text-gray-500 mb-1">Variant selected</p>
                                  )}
                                  
                                  <div className="flex items-center gap-4 mt-2">
                                    <span className="text-xs font-medium text-gray-600">
                                      Qty: {quantity}
                                    </span>
                                    <span className="text-sm font-bold text-gray-900">
                                      ₹{itemTotal.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                                    </span>
                                  </div>
                                </div>
                              </div>
                              
                              <div className="flex sm:flex-row items-center gap-3 mt-2 sm:mt-0">
                                <button 
                                  onClick={() => setSelectedOrderTracking(order)}
                                  className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                                >
                                  <MapPin size={16} className="text-gray-400" />
                                  Track Package
                                </button>
                                {productUrl ? (
                                  <Link 
                                    href={productUrl}
                                    className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                                  >
                                    <RefreshCw size={16} />
                                    Buy it again
                                  </Link>
                                ) : (
                                  <button 
                                    disabled
                                    className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 border border-gray-200 rounded-md text-sm font-medium text-gray-400 bg-gray-50 cursor-not-allowed"
                                  >
                                    <RefreshCw size={16} />
                                    Buy it again
                                  </button>
                                )}
                                <button className="hidden sm:block p-2 border border-gray-300 rounded-md text-gray-500 hover:bg-gray-50">
                                  <ChevronDown size={16} />
                                </button>
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
        </div>

        {/* Right Sidebar */}
        <div className="xl:w-72 flex-shrink-0 space-y-6">
          
          {/* Order Summary */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
            <h3 className="font-bold text-gray-900 mb-4 pb-3 border-b border-gray-100">Order Summary</h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Total Orders</span>
                <span className="font-medium text-gray-900">{totalOrders}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">In Progress</span>
                <span className="font-medium text-gray-900">{inProgress}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Delivered</span>
                <span className="font-medium text-gray-900">{delivered}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Cancelled</span>
                <span className="font-medium text-gray-900">{cancelled}</span>
              </div>
              <div className="flex justify-between pt-3 mt-3 border-t border-gray-100">
                <span className="font-bold text-gray-900">Total Spent</span>
                <span className="font-bold text-gray-900">₹{totalSpent.toLocaleString('en-IN')}</span>
              </div>
            </div>
            <button className="w-full mt-5 py-2 border border-orange-200 text-orange-600 rounded-md text-sm font-medium hover:bg-orange-50 transition-colors">
              View All Orders
            </button>
          </div>

          {/* Subscribe & Save Promo */}
          <div className="bg-orange-50 rounded-xl shadow-sm border border-orange-100 p-5 relative overflow-hidden">
            <div className="relative z-10">
              <div className="flex items-center gap-2 text-orange-500 mb-2">
                <span className="text-xl">☀️</span>
              </div>
              <h3 className="font-bold text-gray-900 mb-2 text-lg">Subscribe & <br/>Save More</h3>
              <p className="text-xs text-gray-600 mb-4 pr-12">Subscribe to your favorite supplements and get up to 20% OFF</p>
              <button className="bg-yellow-400 text-gray-900 font-bold text-xs px-4 py-2 rounded-md hover:bg-yellow-500 transition-colors shadow-sm">
                Explore Subscription
              </button>
            </div>
            {/* Promo Image Placeholder */}
            <div className="absolute -right-4 -bottom-4 w-28 h-28 opacity-50 pointer-events-none mix-blend-multiply">
              <div className="w-full h-full bg-orange-200 rounded-full filter blur-xl"></div>
            </div>
          </div>

          {/* Common Actions */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
            <h3 className="font-bold text-gray-900 mb-4">Common Actions</h3>
            <ul className="space-y-3 text-sm">
              <li>
                <button className="flex items-center gap-3 text-gray-600 hover:text-orange-600 transition-colors w-full text-left">
                  <RefreshCw size={16} /> Return / Replace Items
                </button>
              </li>
              <li>
                <button className="flex items-center gap-3 text-gray-600 hover:text-orange-600 transition-colors w-full text-left">
                  <FileText size={16} /> Download Invoices
                </button>
              </li>
              <li>
                <button className="flex items-center gap-3 text-gray-600 hover:text-orange-600 transition-colors w-full text-left">
                  <Package size={16} /> Manage Subscriptions
                </button>
              </li>
              <li>
                <button className="flex items-center gap-3 text-gray-600 hover:text-orange-600 transition-colors w-full text-left">
                  <XCircle size={16} /> Need Help with Order?
                </button>
              </li>
            </ul>
          </div>
        </div>
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
    </div>
  );
}
