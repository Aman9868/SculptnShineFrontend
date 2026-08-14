'use client';

import React, { useState, useEffect, useRef } from 'react';
import { supportAPI, SupportTicket, TicketCategory } from '@/lib/api/support';
import { orderAPI } from '@/lib/api/order';
import { productAPI } from '@/lib/api/product';
import { 
  Headset, 
  MessageSquare, 
  Plus, 
  ArrowLeft, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  Send, 
  Upload, 
  ShoppingBag, 
  Package,
  ChevronDown,
  ChevronUp,
  Info
} from 'lucide-react';
import { toast } from 'react-toastify';
import { apiFetch } from '@/lib/api/apiFetch';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

const uploadFile = async (file: File) => {
  const formData = new FormData();
  formData.append('file', file);
  try {
    const res = await apiFetch(`${API_BASE_URL}/upload`, {
      method: 'POST',
      body: formData,
    });
    const data = await res.json();
    if (data.success) return data.data.url;
    return null;
  } catch (error) {
    return null;
  }
};

export default function SupportTab() {
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Views: 'list' | 'create' | 'details'
  const [view, setView] = useState<'list' | 'create' | 'details'>('list');
  const [selectedTicketId, setSelectedTicketId] = useState<string | null>(null);
  const [ticketDetails, setTicketDetails] = useState<SupportTicket | null>(null);
  const [isLoadingDetails, setIsLoadingDetails] = useState(false);
  const [isOriginalExpanded, setIsOriginalExpanded] = useState(false);
  
  // Create Form State
  const [subject, setSubject] = useState('');
  const [category, setCategory] = useState<TicketCategory>('GENERAL_INQUIRY');
  const [description, setDescription] = useState('');
  const [orderId, setOrderId] = useState('');
  const [productId, setProductId] = useState('');
  const [attachments, setAttachments] = useState<File[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // User context data for dropdowns
  const [userOrders, setUserOrders] = useState<any[]>([]);
  
  // Reply State
  const [replyMessage, setReplyMessage] = useState('');
  const [isReplying, setIsReplying] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = (behavior: ScrollBehavior = 'smooth') => {
    messagesEndRef.current?.scrollIntoView({ behavior });
  };

  useEffect(() => {
    if (view === 'details' && ticketDetails) {
      scrollToBottom('smooth');
    }
  }, [ticketDetails?.messages, view]);

  useEffect(() => {
    if (view === 'list') {
      fetchTickets();
    } else if (view === 'create') {
      fetchUserOrders();
    }
  }, [view]);

  const fetchTickets = async () => {
    try {
      setIsLoading(true);
      const res = await supportAPI.getMyTickets();
      if (res.success) {
        setTickets(res.data);
      }
    } catch (error) {
      toast.error('Failed to load your tickets');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchUserOrders = async () => {
    try {
      const res = await orderAPI.getMyOrders();
      if (res.success) {
        setUserOrders(res.data.orders || res.data);
      }
    } catch (error) {
      console.error('Failed to fetch orders for ticket context');
    }
  };

  const viewTicket = async (id: string) => {
    setSelectedTicketId(id);
    setView('details');
    setIsLoadingDetails(true);
    try {
      const res = await supportAPI.getTicketDetails(id);
      if (res.success) {
        setTicketDetails(res.data);
      }
    } catch (error) {
      toast.error('Failed to load ticket details');
      setView('list');
    } finally {
      setIsLoadingDetails(false);
    }
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject || !description) return toast.error('Subject and description are required');

    try {
      setIsSubmitting(true);
      
      const uploadedUrls: string[] = [];
      for (const file of attachments) {
        const url = await uploadFile(file);
        if (url) uploadedUrls.push(url);
      }

      const res = await supportAPI.createTicket({
        subject,
        description,
        category,
        orderId: orderId || undefined,
        productId: productId || undefined,
        attachments: uploadedUrls
      });

      if (res.success) {
        toast.success('Ticket created successfully');
        setView('list');
        setSubject('');
        setDescription('');
        setCategory('GENERAL_INQUIRY');
        setOrderId('');
        setProductId('');
        setAttachments([]);
      }
    } catch (error) {
      toast.error('Failed to create ticket');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReply = async () => {
    if (!ticketDetails || !replyMessage.trim()) return;
    const msgToSend = replyMessage.trim();
    try {
      setIsReplying(true);
      setReplyMessage('');

      const res = await supportAPI.addReply(ticketDetails.id, msgToSend);
      if (res.success) {
        const detailsRes = await supportAPI.getTicketDetails(ticketDetails.id);
        if (detailsRes.success) {
          setTicketDetails(detailsRes.data);
          setTimeout(() => scrollToBottom('smooth'), 100);
        }
      } else {
        toast.error(res.message || 'Failed to send reply');
        setReplyMessage(msgToSend);
      }
    } catch (error) {
      toast.error('Failed to send reply');
      setReplyMessage(msgToSend);
    } finally {
      setIsReplying(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleReply();
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      if (attachments.length + newFiles.length > 3) {
        return toast.error('Maximum 3 attachments allowed');
      }
      setAttachments([...attachments, ...newFiles]);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'OPEN': return <MessageSquare className="w-4 h-4 text-yellow-600" />;
      case 'IN_PROGRESS': return <Clock className="w-4 h-4 text-blue-600" />;
      case 'RESOLVED': return <CheckCircle2 className="w-4 h-4 text-green-600" />;
      case 'CLOSED': return <XCircle className="w-4 h-4 text-gray-600" />;
      default: return null;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'OPEN': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'IN_PROGRESS': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'RESOLVED': return 'bg-green-100 text-green-800 border-green-200';
      case 'CLOSED': return 'bg-gray-100 text-gray-800 border-gray-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  if (view === 'create') {
    return (
      <div className="space-y-6 animate-in fade-in">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={() => setView('list')} className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-500">
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h2 className="text-xl font-bold text-gray-900">Raise a Support Request</h2>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
          <form onSubmit={handleCreateSubmit} className="space-y-5 max-w-2xl">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Category *</label>
                <select 
                  value={category}
                  onChange={(e) => setCategory(e.target.value as TicketCategory)}
                  className="w-full px-4 py-2 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-gold-500 outline-none"
                  required
                >
                  <option value="GENERAL_INQUIRY">General Inquiry</option>
                  <option value="DAMAGED_PRODUCT">Damaged Product</option>
                  <option value="WRONG_ITEM">Wrong Item Received</option>
                  <option value="DELIVERY_ISSUE">Delivery Issue</option>
                  <option value="PAYMENT_REFUND">Payment / Refund</option>
                  <option value="QUALITY_ISSUE">Quality Issue</option>
                  <option value="OTHER">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Related Order (Optional)</label>
                <select 
                  value={orderId}
                  onChange={(e) => setOrderId(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-gold-500 outline-none"
                >
                  <option value="">-- None --</option>
                  {userOrders.map(order => (
                    <option key={order.id} value={order.id}>{order.orderNumber} - ₹{order.totalAmount}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Subject *</label>
              <input 
                type="text" 
                required
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="Brief summary of your issue"
                className="w-full px-4 py-2 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-gold-500 outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Description *</label>
              <textarea 
                required
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Please describe your issue in detail..."
                className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-gold-500 outline-none resize-none h-32"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Attachments (Optional)</label>
              <div className="flex items-center gap-4">
                <label className="flex items-center justify-center gap-2 px-4 py-2 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer hover:border-gold-500 hover:text-gold-600 transition-colors text-sm text-gray-500 bg-gray-50">
                  <Upload className="w-4 h-4" />
                  <span>Choose Files</span>
                  <input type="file" multiple accept="image/*" className="hidden" onChange={handleFileChange} />
                </label>
                <span className="text-xs text-gray-400">Max 3 images. JPG, PNG.</span>
              </div>
              {attachments.length > 0 && (
                <div className="flex gap-2 mt-3">
                  {attachments.map((file, idx) => (
                    <div key={idx} className="relative group w-16 h-16 rounded-lg border border-gray-200 overflow-hidden">
                      <img src={URL.createObjectURL(file)} alt="" className="w-full h-full object-cover" />
                      <button 
                        type="button" 
                        onClick={() => setAttachments(attachments.filter((_, i) => i !== idx))}
                        className="absolute top-1 right-1 bg-black/50 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <XCircle className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="pt-4 flex justify-end">
              <button 
                type="submit"
                disabled={isSubmitting}
                className="px-6 py-2.5 bg-gold-600 hover:bg-gold-700 text-white rounded-xl font-bold text-sm shadow-lg shadow-gold-600/20 transition-all disabled:opacity-50"
              >
                {isSubmitting ? 'Submitting...' : 'Submit Request'}
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  if (view === 'details') {
    return (
      <div className="space-y-4 animate-in fade-in max-w-4xl mx-auto">
        {/* Top Header Bar */}
        <div className="flex items-center justify-between bg-white p-4 sm:p-5 rounded-2xl border border-gray-100 shadow-sm">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setView('list')} 
              className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-500"
              title="Back to Tickets"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg sm:text-xl font-bold text-gray-900">
                  {ticketDetails?.ticketNumber || 'Ticket Details'}
                </h2>
                {ticketDetails && (
                  <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold border ${getStatusColor(ticketDetails.status)}`}>
                    {getStatusIcon(ticketDetails.status)}
                    {ticketDetails.status.replace('_', ' ')}
                  </span>
                )}
              </div>
              {ticketDetails && (
                <p className="text-xs text-gray-400 mt-0.5">
                  Created {new Date(ticketDetails.createdAt).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}
                </p>
              )}
            </div>
          </div>

          {/* Toggle Inquiry Details */}
          {ticketDetails && (
            <button
              onClick={() => setIsOriginalExpanded(!isOriginalExpanded)}
              className="flex items-center gap-1 text-xs font-semibold text-gold-600 hover:text-gold-700 px-3 py-1.5 rounded-lg hover:bg-gold-50 transition-colors"
            >
              <Info className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{isOriginalExpanded ? 'Hide Ticket Info' : 'View Ticket Info'}</span>
              {isOriginalExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
          )}
        </div>

        {/* Collapsible Ticket Summary */}
        {ticketDetails && isOriginalExpanded && (
          <div className="bg-gradient-to-r from-gray-50 to-white rounded-2xl border border-gray-200 p-5 shadow-sm space-y-3 animate-in fade-in slide-in-from-top-2 duration-200">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <h3 className="font-bold text-gray-900 text-base">{ticketDetails.subject}</h3>
              <span className="text-xs font-semibold text-gray-600 bg-gray-100 px-2.5 py-1 rounded-md">
                Category: {ticketDetails.category.replace(/_/g, ' ')}
              </span>
            </div>
            <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed bg-white p-3.5 rounded-xl border border-gray-100">
              {ticketDetails.description}
            </p>
            {ticketDetails.attachments && ticketDetails.attachments.length > 0 && (
              <div className="pt-2">
                <p className="text-xs font-bold text-gray-500 mb-2">Attachments:</p>
                <div className="flex flex-wrap gap-2">
                  {ticketDetails.attachments.map((url, i) => (
                    <a key={i} href={url} target="_blank" rel="noreferrer" className="w-16 h-16 rounded-lg border border-gray-200 overflow-hidden relative group block shadow-sm">
                      <img src={url} alt={`Attachment ${i}`} className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <span className="text-white text-[10px] font-bold">View</span>
                      </div>
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Chatbot Window Container */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm flex flex-col h-[550px] overflow-hidden">
          {/* Messages Scroll Area */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 bg-gray-50/50">
            {isLoadingDetails ? (
              <div className="flex flex-col items-center justify-center h-full gap-3 text-gray-400">
                <div className="w-8 h-8 border-3 border-gold-200 border-t-gold-600 rounded-full animate-spin"></div>
                <p className="text-xs">Loading conversation...</p>
              </div>
            ) : ticketDetails ? (
              <>
                {/* Initial Query as First Chat Message */}
                <div className="flex gap-3 items-start">
                  <div className="w-8 h-8 rounded-full bg-gold-100 text-gold-800 flex items-center justify-center text-xs font-bold shrink-0 shadow-sm">
                    You
                  </div>
                  <div className="max-w-[85%] sm:max-w-[75%] space-y-1">
                    <div className="bg-white border border-gray-200/80 p-4 rounded-2xl rounded-tl-none shadow-sm">
                      <p className="text-xs font-bold text-gray-900 mb-1">{ticketDetails.subject}</p>
                      <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">{ticketDetails.description}</p>
                    </div>
                    <span className="text-[10px] text-gray-400 px-1 block">
                      {new Date(ticketDetails.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>

                {/* Message Timeline */}
                {ticketDetails.messages && ticketDetails.messages.map((msg) => {
                  const isUser = msg.senderType === 'USER';
                  return (
                    <div 
                      key={msg.id} 
                      className={`flex gap-3 items-start ${isUser ? 'flex-row-reverse' : ''}`}
                    >
                      {/* Avatar */}
                      <div 
                        className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 shadow-sm ${
                          isUser ? 'bg-gold-600 text-white' : 'bg-gray-900 text-white'
                        }`}
                      >
                        {isUser ? 'You' : <Headset className="w-4 h-4" />}
                      </div>

                      {/* Bubble */}
                      <div className={`max-w-[85%] sm:max-w-[75%] space-y-1 ${isUser ? 'items-end' : 'items-start'}`}>
                        <div 
                          className={`p-4 rounded-2xl text-sm leading-relaxed shadow-sm ${
                            isUser 
                              ? 'bg-gradient-to-r from-gold-500 to-gold-600 text-white rounded-tr-none' 
                              : 'bg-white border border-gray-200/80 text-gray-800 rounded-tl-none'
                          }`}
                        >
                          <p className="whitespace-pre-wrap break-words">{msg.message}</p>
                        </div>
                        <span className={`text-[10px] text-gray-400 px-1 block ${isUser ? 'text-right' : 'text-left'}`}>
                          {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    </div>
                  );
                })}

                {/* Auto-scroll anchor */}
                <div ref={messagesEndRef} />
              </>
            ) : null}
          </div>

          {/* Bottom Chat Input Bar */}
          {ticketDetails && ticketDetails.status !== 'CLOSED' ? (
            <div className="p-3 sm:p-4 bg-white border-t border-gray-100 shrink-0">
              <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-2xl p-2 focus-within:border-gold-500 focus-within:bg-white focus-within:ring-2 focus-within:ring-gold-500/20 transition-all">
                <textarea 
                  value={replyMessage}
                  onChange={(e) => setReplyMessage(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Type your message... (Press Enter ↵ to send)"
                  rows={1}
                  className="flex-1 px-3 py-2 bg-transparent border-none text-sm outline-none resize-none max-h-24 text-gray-800 placeholder:text-gray-400"
                />
                <button 
                  onClick={handleReply}
                  disabled={isReplying || !replyMessage.trim()}
                  className="h-10 px-4 bg-gradient-to-r from-gold-500 to-gold-600 hover:from-gold-600 hover:to-gold-700 disabled:opacity-40 text-white rounded-xl font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all shadow-md shadow-gold-500/10 shrink-0"
                >
                  {isReplying ? (
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      <Send className="w-3.5 h-3.5" />
                      <span>Send</span>
                    </>
                  )}
                </button>
              </div>
              <p className="text-[10px] text-gray-400 text-right mt-1.5 px-2">
                Press <kbd className="font-mono bg-gray-100 px-1 py-0.5 rounded text-[9px] text-gray-600">Enter ↵</kbd> to send, <kbd className="font-mono bg-gray-100 px-1 py-0.5 rounded text-[9px] text-gray-600">Shift + Enter</kbd> for new line
              </p>
            </div>
          ) : (
            <div className="p-4 bg-gray-50 text-center text-xs text-gray-500 border-t border-gray-100 font-medium">
              This ticket has been closed. If you have new questions, please raise a new ticket.
            </div>
          )}
        </div>
      </div>
    );
  }

  // Default List View
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Headset className="w-6 h-6 text-gold-600" />
            Support & Complaints
          </h2>
          <p className="text-gray-500 text-sm mt-1">Need help? Raise a ticket and our team will assist you.</p>
        </div>
        <button
          onClick={() => setView('create')}
          className="flex items-center gap-2 px-5 py-2.5 bg-gold-600 hover:bg-gold-700 text-white rounded-xl font-bold text-sm shadow-lg shadow-gold-600/20 hover:shadow-xl transition-all"
        >
          <Plus className="w-4 h-4" />
          Raise a Ticket
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="p-8 flex justify-center">
            <div className="w-8 h-8 border-4 border-gold-200 border-t-gold-600 rounded-full animate-spin"></div>
          </div>
        ) : tickets.length === 0 ? (
          <div className="p-12 text-center text-gray-500">
            <Headset className="w-16 h-16 text-gray-200 mx-auto mb-4" />
            <h3 className="text-lg font-bold text-gray-900">No Support Tickets</h3>
            <p className="text-sm mt-1 mb-6">You haven't raised any complaints or support requests yet.</p>
            <button
              onClick={() => setView('create')}
              className="px-6 py-2.5 bg-gray-900 hover:bg-black text-white rounded-xl font-medium transition-colors"
            >
              Raise a Ticket Now
            </button>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {tickets.map((ticket) => (
              <div 
                key={ticket.id} 
                onClick={() => viewTicket(ticket.id)}
                className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-gray-50 transition-colors cursor-pointer group"
              >
                <div className="flex items-start gap-4">
                  <div className={`p-3 rounded-xl flex-shrink-0 ${
                    ticket.status === 'RESOLVED' || ticket.status === 'CLOSED' ? 'bg-gray-100 text-gray-500' : 'bg-gold-50 text-gold-600'
                  }`}>
                    {getStatusIcon(ticket.status) || <MessageSquare className="w-6 h-6" />}
                  </div>
                  <div>
                    <div className="flex items-center gap-3 mb-1">
                      <span className="font-bold text-gray-900">{ticket.ticketNumber}</span>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${getStatusColor(ticket.status)}`}>
                        {ticket.status.replace('_', ' ')}
                      </span>
                    </div>
                    <h4 className="text-sm font-medium text-gray-800 line-clamp-1 group-hover:text-gold-600 transition-colors">{ticket.subject}</h4>
                    <div className="flex items-center gap-3 mt-1.5 text-xs text-gray-500 font-medium">
                      <span>{new Date(ticket.createdAt).toLocaleDateString()}</span>
                      <span className="w-1 h-1 rounded-full bg-gray-300"></span>
                      <span>{ticket.category.replace('_', ' ')}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center justify-end">
                  <span className="text-gold-600 text-sm font-bold group-hover:underline">View Details</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
