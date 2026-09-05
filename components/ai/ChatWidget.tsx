"use client";

import React, { useState, useEffect, useRef } from 'react';
import { MessageCircle, X, Send, Bot, Loader2, Sparkles, Download, Menu } from 'lucide-react';
import { ChatLogin } from './ChatLogin';
import ChatAddress from './ChatAddress';
import { useRouter } from 'next/navigation';
import { QuickAddModal } from '../product/QuickAddModal';
import { Product } from '@/lib/api/product';
import { ChatCheckout } from './ChatCheckout';
import { ChatSidebar } from './ChatSidebar';
import { getMediaUrl } from '@/lib/media';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

type Message = {
  id: string;
  role: 'user' | 'assistant';
  content: string;
};

const InterruptCard = ({ interruptData, onAction }: { interruptData: any, onAction: (text: string) => void }) => {
  const maxQuantity = Math.max(0, Number(interruptData.available_stock) || 0);
  const [qty, setQty] = useState(Math.min(interruptData.requested_quantity || 1, maxQuantity));

  const handleAccept = () => {
    if (qty < 1 || qty > maxQuantity) return;
    if (qty !== interruptData.requested_quantity) {
      onAction(`Yes, but update the quantity to ${qty}.`);
    } else {
      onAction('Yes');
    }
  };

  return (
    <div className="mt-2 flex flex-col border border-neutral-700/50 rounded-xl overflow-hidden bg-[#1e1e1e] shadow-lg">
      <div className="px-4 py-2.5 bg-[#252525] border-b border-neutral-700/50 flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm text-neutral-300 font-medium">
          <Bot size={16} className="text-gold-500" />
          Agent wants to use <code className="text-gold-400 bg-black/40 px-1.5 py-0.5 rounded text-xs font-mono">add_to_cart</code>
        </div>
      </div>
      <div className="p-4 flex flex-col gap-4">
        <p className="text-sm text-neutral-300 leading-relaxed">
          The agent is requesting permission to add <strong className="text-white">{interruptData.title}</strong> to your cart.
        </p>
        <div className="bg-[#141414] border border-neutral-800 rounded-lg p-3 font-mono text-[13px] text-neutral-400">
          <div className="flex justify-between items-center mb-2">
            <span className="text-neutral-500">quantity:</span>
            <div className="flex items-center gap-3">
              <button 
                onClick={() => setQty(Math.max(1, qty - 1))}
                className="w-6 h-6 flex items-center justify-center bg-neutral-800 hover:bg-neutral-700 rounded text-white font-bold transition-colors"
              >-</button>
              <span className="text-gold-400 font-bold min-w-[20px] text-center">{qty}</span>
              <button 
                onClick={() => setQty(Math.min(maxQuantity, qty + 1))}
                className="w-6 h-6 flex items-center justify-center bg-neutral-800 hover:bg-neutral-700 rounded text-white font-bold transition-colors"
              >+</button>
            </div>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-neutral-500">available_stock:</span>
            <span className={interruptData.available_stock > 0 ? "text-green-400" : "text-red-400"}>
              {interruptData.available_stock}
            </span>
          </div>
        </div>
        <div className="flex gap-3 pt-1">
          <button disabled={qty < 1} onClick={handleAccept} className="flex-1 py-2.5 bg-gold-500 hover:bg-gold-400 text-black text-sm font-bold rounded-lg transition-all transform active:scale-95 border border-gold-400 shadow-md flex justify-center items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed">
            Accept
          </button>
          <button onClick={() => onAction('cancel')} className="flex-1 py-2.5 bg-neutral-700 hover:bg-neutral-600 text-white text-sm font-bold rounded-lg transition-all transform active:scale-95 border border-neutral-600 shadow-md">
            Reject
          </button>
        </div>
      </div>
    </div>
  );
};



const ProductCarousel = ({ products, onProductClick, onAction, defaultPlaceholder, compact = false }: any) => {
  const scrollRef = React.useRef<HTMLDivElement>(null);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const { current } = scrollRef;
      const scrollAmount = direction === 'left' ? -300 : 300;
      current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  return (
    <div className="relative group mt-2">
      {products.length > 1 && (
        <>
          <button 
            onClick={() => scroll('left')}
            className="absolute -left-3 top-1/2 -translate-y-1/2 w-8 h-8 bg-neutral-800 hover:bg-gold-500 text-white hover:text-black rounded-full flex items-center justify-center shadow-lg z-10 opacity-0 group-hover:opacity-100 transition-all disabled:opacity-0"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
          </button>
          <button 
            onClick={() => scroll('right')}
            className="absolute -right-3 top-1/2 -translate-y-1/2 w-8 h-8 bg-neutral-800 hover:bg-gold-500 text-white hover:text-black rounded-full flex items-center justify-center shadow-lg z-10 opacity-0 group-hover:opacity-100 transition-all disabled:opacity-0"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6"/></svg>
          </button>
        </>
      )}
      
      <div 
        ref={scrollRef}
        className="flex overflow-x-auto gap-4 pb-4 snap-x snap-mandatory scrollbar-thin scrollbar-thumb-neutral-700 scrollbar-track-transparent"
        style={{ scrollbarWidth: 'thin' }}
      >
        {products.map((p: any, i: number) => (
          <div key={i} className={`${compact ? 'min-w-[150px] max-w-[150px]' : 'min-w-[240px] max-w-[240px]'} snap-center group/card relative bg-neutral-900/40 backdrop-blur-md border border-neutral-800 rounded-2xl overflow-hidden hover:border-gold-500/50 transition-all duration-300 hover:shadow-[0_0_20px_rgba(212,175,55,0.15)] flex flex-col cursor-pointer flex-shrink-0`} onClick={() => onProductClick && onProductClick(p.sku)}>
            <div className={`${compact ? 'aspect-square' : 'aspect-[4/3]'} bg-neutral-950 w-full relative overflow-hidden flex items-center justify-center`}>
              <img 
                src={getMediaUrl(p.image, defaultPlaceholder)} 
                alt={p.title} 
                className="w-full h-full object-cover group-hover/card:scale-105 transition-transform duration-500" 
                onError={(e) => { 
                  e.currentTarget.src = defaultPlaceholder; 
                }} 
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover/card:opacity-100 transition-opacity duration-300" />
            </div>
            <div className={`${compact ? 'p-3' : 'p-4'} flex flex-col gap-3 flex-1 justify-between`}>
              <div>
                <h4 className="text-sm font-semibold text-white line-clamp-2 leading-tight group-hover/card:text-gold-500 transition-colors">{p.title}</h4>
                <div className={`${compact ? 'text-sm' : 'text-lg'} font-bold text-gold-500 mt-2 tracking-tight`}>₹{p.price}</div>
              </div>
                {!compact && <button 
                  onClick={(e) => { e.stopPropagation(); onAction && onAction(`Add ${p.title} (ID: ${p.sku}) to my cart`) }}
                  className="w-full py-2.5 bg-neutral-800 hover:bg-gold-600 text-white hover:text-black text-sm font-bold rounded-xl transition-all transform active:scale-95 border border-neutral-700 hover:border-gold-500 shadow-lg"
                >Add to Cart</button>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const OrderStatusCard = ({ orderNumber, status, paymentStatus, trackingNumber, products = [] }: any) => {
  const stages = ['PENDING_PAYMENT', 'PAID', 'PROCESSING', 'SHIPPED', 'OUT_FOR_DELIVERY', 'DELIVERED'];
  const currentStage = stages.indexOf(status);
  const isCancelled = status === 'CANCELLED';

  return (
    <div className="w-full max-w-xl rounded-2xl border border-neutral-800 bg-[#151515] p-4 shadow-xl shadow-black/20">
      <div className="flex items-center justify-between gap-3 border-b border-neutral-800 pb-3">
        <div>
          <p className="text-xs uppercase tracking-wider text-neutral-500">Order</p>
          <p className="text-sm font-semibold text-white break-all">{orderNumber}</p>
        </div>
        <div className="text-right">
          <p className={`text-sm font-bold ${isCancelled ? 'text-red-400' : 'text-gold-400'}`}>{status.replaceAll('_', ' ')}</p>
          <p className="text-xs text-neutral-500">Payment: {paymentStatus.replaceAll('_', ' ')}</p>
        </div>
      </div>
      {isCancelled ? (
        <p className="mt-4 text-sm text-red-300">This order was cancelled.</p>
      ) : (
        <div className="mt-5 flex items-start">
          {stages.map((stage, index) => (
            <React.Fragment key={stage}>
              <div className="flex min-w-0 flex-1 flex-col items-center gap-2 text-center">
                <span className={`h-3 w-3 rounded-full ${index <= currentStage ? 'bg-gold-500 shadow-[0_0_10px_rgba(212,175,55,0.45)]' : 'bg-neutral-700'}`} />
                <span className={`text-[10px] leading-tight ${index <= currentStage ? 'text-neutral-200' : 'text-neutral-600'}`}>{stage.replaceAll('_', ' ')}</span>
              </div>
              {index < stages.length - 1 && <span className={`mt-1.5 h-px flex-1 ${index < currentStage ? 'bg-gold-500' : 'bg-neutral-700'}`} />}
            </React.Fragment>
          ))}
        </div>
      )}
      {trackingNumber && <p className="mt-4 text-xs text-neutral-400">Tracking: <span className="text-neutral-200">{trackingNumber}</span></p>}
      {products.length > 0 && (
        <div className="mt-4 border-t border-neutral-800 pt-4">
          {products.map((product: any) => (
            <div key={product.sku} className="flex items-center gap-3">
              <img
                src={getMediaUrl(product.image, '/assets/product-placeholder.png')}
                alt={product.title}
                className="h-14 w-14 rounded-lg object-cover"
                onError={(event) => { event.currentTarget.src = '/assets/product-placeholder.png'; }}
              />
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-white">{product.title}</p>
                <p className="text-sm font-bold text-gold-400">₹{product.price}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const renderMessageContent = (content: any, onAction?: (text: string) => void, onProductClick?: (sku: string) => void) => {
  if (typeof content !== 'string') {
    if (Array.isArray(content)) {
      content = content.map((c: any) => c.text || JSON.stringify(c)).join(' ');
    } else {
      content = typeof content === 'object' && content !== null ? JSON.stringify(content) : String(content || '');
    }
  }
  // Strip out the ACTION tags from visible text (with or without brackets)
  let displayContent = content
    .replace(/\[?ACTION:LOGIN\]?/g, '')
    .replace(/\[?ACTION:ADD_ADDRESS\]?/g, '')
    .replace(/\[?ACTION:CHECKOUT\]?/g, '')
    .replace(/\\n/g, '\n');
  
  let interruptData: any = null;
  const interruptMatch = displayContent.match(/\[INTERRUPT:(.+?)\]/);
  if (interruptMatch && interruptMatch[1]) {
    try {
      interruptData = JSON.parse(interruptMatch[1]);
    } catch (e) {}
    displayContent = displayContent.replace(interruptMatch[0], '');
  }
  
  displayContent = displayContent.trim();
  
  // If the message is completely empty after stripping actions and tools, we still want it to render so the form can appear inside it
  if (!displayContent.trim()) {
    if (content.includes('ACTION:LOGIN')) {
      displayContent = "In order to add items to your cart or checkout, you need to login or sign up first.";
    } else if (content.includes('ACTION:ADD_ADDRESS')) {
      displayContent = "Please add a shipping address to continue.";
    } else if (content.includes('ACTION:CHECKOUT')) {
      displayContent = "Please complete your checkout below:";
    }
  }

  if (!displayContent.includes('[ORDER_STATUS:') && !displayContent.includes('[PRODUCT:') && !displayContent.includes('[QUOTATION_FILE:') && !interruptData) {
    return (
      <div className="flex flex-col gap-2">
        {displayContent.trim() && (
          <div className="prose prose-sm md:prose-base prose-invert max-w-none prose-a:text-gold-500 prose-strong:text-white leading-relaxed">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {displayContent}
            </ReactMarkdown>
          </div>
        )}
        {displayContent.trim().endsWith('WhatsApp?') && (
          <div className="flex gap-3 mt-2">
            <button onClick={() => onAction && onAction('Yes')} className="px-6 py-2 bg-gold-500 hover:bg-gold-400 text-black font-bold rounded-xl shadow-lg transition-transform transform active:scale-95 border border-gold-400">Yes</button>
            <button onClick={() => onAction && onAction('No')} className="px-6 py-2 bg-neutral-800 hover:bg-neutral-700 text-white font-bold rounded-xl shadow-lg transition-transform transform active:scale-95 border border-neutral-700 hover:border-neutral-600">No</button>
          </div>
        )}
      </div>
    );
  }

  // Split content by the PRODUCT tag and QUOTATION_FILE tag regex
  const parts = displayContent.split(/(\[ORDER_STATUS:[^\]]+\]|\[PRODUCT:[^\]]+\]|\[QUOTATION_FILE:[^\]]+\])/g);
  
  const products: any[] = [];
  const productIds = new Set<string>();
  let orderStatus: any = null;
  const textParts: any[] = [];
  let quotationUrl: string | null = null;

  parts.forEach((part: string, index: number) => {
    if (part.startsWith('[ORDER_STATUS:') && part.endsWith(']')) {
      const data = part.slice(14, -1).split('|');
      if (data.length === 4) orderStatus = { orderNumber: data[0], status: data[1], paymentStatus: data[2], trackingNumber: data[3] };
      return;
    }
    if (part.startsWith('[PRODUCT:') && part.endsWith(']')) {
      const data = part.slice(9, -1).split('|');
      if (data.length === 4) {
        if (!productIds.has(data[0])) {
          productIds.add(data[0]);
          products.push({ sku: data[0], title: data[1], price: data[2], image: data[3] });
        }
      }
    } else if (part.startsWith('[QUOTATION_FILE:') && part.endsWith(']')) {
      quotationUrl = part.slice(16, -1);
    } else if (part.trim()) {
      textParts.push(
        <div key={`text-${index}`} className="prose prose-sm md:prose-base prose-invert max-w-none prose-a:text-gold-500 prose-strong:text-white mb-4 leading-relaxed">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>
            {part}
          </ReactMarkdown>
        </div>
      );
    }
  });

  const defaultPlaceholder = 'https://images.unsplash.com/photo-1584735935682-2f2b69dff9d2?auto=format&fit=crop&w=800&q=80';

  return (
    <div className="flex flex-col gap-4 w-full overflow-hidden">
      {textParts}
      {orderStatus && <OrderStatusCard {...orderStatus} products={products} />}
      {quotationUrl && (
        <a href={quotationUrl} download="quotation.xlsx" target="_blank" rel="noreferrer" className="flex items-center justify-center gap-2 w-full max-w-md mt-2 py-3 bg-gradient-to-r from-green-600 to-green-500 hover:from-green-500 hover:to-green-400 text-white font-bold rounded-xl shadow-lg transition-transform transform active:scale-95">
          <Download size={20} />
          Download Excel Quotation
        </a>
      )}
      {products.length > 0 && !orderStatus && (
        <ProductCarousel products={products} onProductClick={onProductClick} onAction={onAction} defaultPlaceholder={defaultPlaceholder} />
      )}
      {displayContent.trim().endsWith('WhatsApp?') && (
        <div className="flex gap-3 mt-2">
          <button onClick={() => onAction && onAction('Yes')} className="px-6 py-2 bg-gold-500 hover:bg-gold-400 text-black font-bold rounded-xl shadow-lg transition-transform transform active:scale-95 border border-gold-400">Yes</button>
          <button onClick={() => onAction && onAction('No')} className="px-6 py-2 bg-neutral-800 hover:bg-neutral-700 text-white font-bold rounded-xl shadow-lg transition-transform transform active:scale-95 border border-neutral-700 hover:border-neutral-600">No</button>
        </div>
      )}
      {interruptData && interruptData.action === 'confirm_add_to_cart' && onAction && (
        <InterruptCard interruptData={interruptData} onAction={onAction} />
      )}
    </div>
  );
};

export const ChatWidget = () => {
  const isChatEnabled =
    process.env.NEXT_PUBLIC_CHAT_STATUS === 'true' ||
    process.env.NEXT_PUBLIC_ENABLE_CHAT === 'true' ||
    process.env.NEXT_PUBLIC_CHAT_ENABLED === 'true';

  if (!isChatEnabled) {
    return null;
  }

  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'init',
      role: 'assistant',
      content: 'Welcome to SculptnShine AI! I am your personal fitness and commerce assistant. I can help you discover the perfect supplements, track your orders, or request bulk quotations. How can I fuel your journey today?',
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId, setSessionId] = useState<string>('');
  const [agentStatus, setAgentStatus] = useState<string>('');
  
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isQuickAddOpen, setIsQuickAddOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const initMessage = {
    id: 'init',
    role: 'assistant' as const,
    content: 'Welcome to SculptnShine AI! I am your personal fitness and commerce assistant. I can help you discover the perfect supplements, track your orders, or request bulk quotations. How can I fuel your journey today?',
  };

  const handleNewChat = () => {
    setSessionId(crypto.randomUUID());
    setMessages([initMessage]);
  };

  const handleSelectSession = async (sid: string) => {
    setSessionId(sid);
    const token = localStorage.getItem('accessToken');
    if (!token) return;
    
    setIsLoading(true);
    try {
      const baseUrl = process.env.NEXT_PUBLIC_AI_API_URL || 'http://localhost:8086/api/v1';
      const res = await fetch(`${baseUrl}/chat/session/${sid}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success && data.data && data.data.length > 0) {
        setMessages([initMessage, ...data.data]);
      } else {
        setMessages([initMessage]);
      }
    } catch (e) {
      console.error("Failed to fetch session messages", e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!sessionId) {
      setSessionId(crypto.randomUUID());
    }
  }, [sessionId]);

  const handleAddToCartClick = async (sku: string) => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/products/${sku}`);
      const data = await res.json();
      if (data.success) {
        setSelectedProduct(data.data);
        setIsQuickAddOpen(true);
      }
    } catch (e) {
      console.error('Failed to fetch product details for quick add:', e);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
    }
  }, [input]);

  const handleSendMessage = async (eOrText: React.FormEvent | string, isSystem: boolean = false, tokenOverride?: string) => {
    if (typeof eOrText !== 'string') {
      eOrText.preventDefault();
    }
    const text = typeof eOrText === 'string' ? eOrText : input;
    
    if (!text.trim() && !isSystem) return;

    if (!isSystem && text === input) {
      setInput('');
      if (textareaRef.current) textareaRef.current.style.height = 'auto';
    }

    if (!isSystem) {
      const userMessage: Message = { id: Date.now().toString(), role: 'user', content: text };
      setMessages(prev => [...prev, userMessage]);
    }
    
    setIsLoading(true);
    setAgentStatus('');

    try {
      // Get auth token from localStorage if exists
      const authToken = tokenOverride || localStorage.getItem('accessToken');
      
      const payload: any = {
        session_id: sessionId,
        message: text
      };
      
      if (authToken) {
        payload.auth_token = authToken;
      }

      const res = await fetch(`${process.env.NEXT_PUBLIC_AI_API_URL || 'http://localhost:8086/api/v1'}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'text/event-stream' },
        body: JSON.stringify(payload),
      });
      
      if (!res.body) throw new Error("ReadableStream not supported");
      
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let aiContent = "";
      
      const messageId = (Date.now() + 1).toString();
      setMessages(prev => [...prev, { id: messageId, role: 'assistant', content: '' }]);

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        
        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split('\n\n');
        
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const dataStr = line.substring(6);
            if (dataStr === '[DONE]') break;
            if (!dataStr) continue;
            
            try {
              const data = JSON.parse(dataStr);
              if (data.session_id && data.session_id !== sessionId) {
                setSessionId(data.session_id);
              }
              if (data.status !== undefined) {
                setAgentStatus(data.status);
              }
              if (data.content) {
                aiContent += data.content;
                
                setMessages(prev => prev.map(msg => 
                  msg.id === messageId ? { ...msg, content: aiContent } : msg
                ));
              }
            } catch (e) {
              console.error("Error parsing SSE JSON:", e, dataStr);
            }
          }
        }
      }
      
      // INTERCEPT AUTH_TOKEN (after streaming finishes)
      const tokenMatch = aiContent.match(/\[AUTH_TOKEN:([^\]]+)\]/);
      if (tokenMatch && tokenMatch[1]) {
        const token = tokenMatch[1];
        localStorage.setItem('accessToken', token);
        window.dispatchEvent(new Event('authChange'));
      }

    } catch (error) {
      console.error('Chat error:', error);
      setMessages(prev => [...prev, { id: (Date.now() + 1).toString(), role: 'assistant', content: 'Sorry, I am having trouble connecting to the server.' }]);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) {
    return (
      <button 
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 w-14 h-14 bg-gradient-to-br from-gold-500 to-gold-700 rounded-full shadow-[0_0_20px_rgba(212,175,55,0.4)] flex items-center justify-center text-black hover:scale-110 transition-transform z-50 border border-gold-400/30"
      >
        <Sparkles size={24} />
      </button>
    );
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 bg-black/60 backdrop-blur-sm">
      <div className="w-full max-w-5xl h-[90vh] bg-[#0f0f0f] rounded-3xl shadow-2xl flex flex-col overflow-hidden border border-neutral-800 ring-1 ring-gold-500/10 relative">
        
        {/* Header */}
        <div className="p-4 bg-[#0f0f0f]/80 backdrop-blur-md border-b border-neutral-800 flex justify-between items-center z-10 absolute top-0 w-full">
          <div className="flex items-center gap-3 pl-2">
            <button 
              onClick={() => setIsSidebarOpen(true)}
              className="w-10 h-10 flex items-center justify-center rounded-full text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors mr-1"
            >
              <Menu size={20} />
            </button>
            <div className="w-10 h-10 bg-gradient-to-br from-gold-500 to-gold-700 rounded-xl flex items-center justify-center text-black shadow-lg shadow-gold-500/20">
              <Bot size={20} />
            </div>
            <div>
              <h3 className="font-bold text-white text-lg leading-tight tracking-tight">SculptnShine AI</h3>
              <p className="text-xs text-gold-500 font-medium tracking-wider uppercase">Agentic Commerce Squad</p>
            </div>
          </div>
          <button onClick={() => setIsOpen(false)} className="w-10 h-10 flex items-center justify-center rounded-full text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors">
            <X size={20} />
          </button>
        </div>

        <ChatSidebar 
          isOpen={isSidebarOpen} 
          onClose={() => setIsSidebarOpen(false)} 
          onSelectSession={handleSelectSession}
          onNewChat={handleNewChat}
          currentSessionId={sessionId}
        />

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-4 md:px-12 pt-24 pb-32 bg-[#0a0a0a] scrollbar-thin scrollbar-thumb-neutral-800">
          <div className="flex flex-col gap-10 max-w-4xl mx-auto w-full">
            {messages.map((msg, index) => (
              <div key={msg.id} className={`flex w-full ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                {msg.role === 'assistant' && (
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-gold-500 to-gold-700 text-black flex items-center justify-center flex-shrink-0 mr-5 shadow-lg shadow-gold-500/20 mt-1">
                    <Bot size={24} />
                  </div>
                )}
                <div className={`max-w-full md:max-w-[85%] ${msg.role === 'user' ? 'bg-[#2a2a2a] text-white px-6 py-4 rounded-3xl rounded-tr-sm border border-white/5 shadow-md' : 'text-neutral-200'}`}>
                  {msg.role === 'user' ? <div className="text-[15px] leading-relaxed whitespace-pre-wrap">{msg.content.replace(/\s*\(ID:\s*[^)]+\)/g, '')}</div> : (
                    <div className="pt-1">
                      {(() => {
                        const needsAddressForm = /ACTION:ADD_ADDRESS|shipping address|delivery address|provide.*address|address to continue/i.test(msg.content);
                        return needsAddressForm && typeof window !== 'undefined' && !!localStorage.getItem('accessToken') ? (
                          <div className="mt-6">
                            <ChatAddress onSuccess={() => handleSendMessage("I have successfully added my shipping address. Please continue with checkout.", true)} />
                          </div>
                        ) : null;
                      })()}
                      {renderMessageContent(msg.content, (text) => handleSendMessage(text), (sku) => handleAddToCartClick(sku))}
                      {msg.content.includes('ACTION:LOGIN') && (
                        <div className="mt-6"><ChatLogin onAuthSuccess={(token) => handleSendMessage("I have successfully logged in. Please continue with my previous cart checkout and ask for my shipping address.", true, token)} /></div>
                      )}
                      {msg.content.includes('ACTION:ADD_ADDRESS') && (
                        <div className="mt-6">
                            {typeof window !== 'undefined' && !localStorage.getItem('accessToken') ? (
                                <ChatLogin onAuthSuccess={(token) => handleSendMessage("I have successfully logged in. Please continue with adding my address.", true, token)} />
                          ) : null}
                        </div>
                      )}
                      {msg.content.includes('ACTION:CHECKOUT') && (
                        <div className="mt-6">
                            {typeof window !== 'undefined' && !localStorage.getItem('accessToken') ? (
                                <ChatLogin onAuthSuccess={(token) => handleSendMessage("I have successfully logged in. Please continue with checkout.", true, token)} />
                            ) : (
                                <ChatCheckout 
                                    onSuccess={(orderId) => handleSendMessage(`I have successfully completed checkout and just paid for the order! My new Order ID is ${orderId}. Please congratulate me and tell me the current live status of this order.`, true)} 
                                    onCancel={() => handleSendMessage("I cancelled the checkout process.", true)} 
                                    isHistoricallyPaid={messages.slice(index + 1).some(m => m.content && m.content.includes("I have successfully completed checkout"))}
                                />
                            )}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))}
            
            {/* Loading Indicator with Logo */}
            {isLoading && (!messages[messages.length - 1] || messages[messages.length - 1].role !== 'assistant' || !messages[messages.length - 1].content) && (
              <div className="flex justify-start w-full items-start mb-2">
                <div className="w-10 h-10 rounded-xl border border-gold-500/20 bg-neutral-900 flex items-center justify-center flex-shrink-0 mr-5 mt-1 shadow-[0_0_15px_rgba(212,175,55,0.15)] overflow-hidden">
                   <img src="/apple-touch-icon.png" alt="SculptnShine Loading" className="w-6 h-6 object-contain animate-spin" onError={(e) => { e.currentTarget.style.display = 'none'; }} />
                </div>
                <div className="flex flex-col justify-center pt-3">
                  <span className="text-xs text-gold-500/80 font-semibold uppercase tracking-wider animate-pulse flex items-center gap-2">
                    {agentStatus || "Squad is thinking..."}
                  </span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} className="h-4" />
          </div>
        </div>

        {/* Input Area */}
        <div className="absolute bottom-0 w-full p-4 sm:p-6 bg-gradient-to-t from-black via-[#0a0a0a] to-transparent pointer-events-none">
          <div className="max-w-4xl mx-auto pointer-events-auto">
            <form 
              onSubmit={(e) => { e.preventDefault(); handleSendMessage(input); }}
              className="relative flex items-end bg-[#202020] rounded-[24px] border border-white/10 focus-within:border-gold-500/50 transition-all shadow-xl shadow-black/80 overflow-hidden ring-4 ring-transparent focus-within:ring-gold-500/10"
            >
              <textarea
                ref={textareaRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    if (input.trim() && !isLoading) handleSendMessage(input);
                  }
                }}
                placeholder="Message SculptnShine AI..."
                className="w-full max-h-32 min-h-[56px] py-4 pl-6 pr-14 bg-transparent text-white text-[15px] outline-none placeholder:text-neutral-500 resize-none scrollbar-none leading-tight"
                rows={1}
                disabled={isLoading}
              />
              <div className="absolute right-3 bottom-2.5">
                <button
                  type="submit"
                  disabled={!input.trim() || isLoading}
                  className="w-9 h-9 flex items-center justify-center rounded-full bg-white text-black hover:bg-gold-500 disabled:opacity-20 disabled:hover:bg-white transition-colors"
                >
                  <Send size={16} className="ml-0.5" />
                </button>
              </div>
            </form>
            <div className="text-center mt-3 text-[11px] text-neutral-500 font-medium">
              SculptnShine AI can make mistakes. Consider verifying important information.
            </div>
          </div>
        </div>

        {/* Quick Add Modal */}
        {isQuickAddOpen && (
          <QuickAddModal
            product={selectedProduct}
            isOpen={isQuickAddOpen}
            onClose={() => setIsQuickAddOpen(false)}
            onAddSuccess={() => {
              setIsQuickAddOpen(false);
              handleSendMessage(`I have successfully added ${selectedProduct?.title} to my cart. I am ready to checkout now.`, true);
            }}
          />
        )}
      </div>
    </div>
  );
};

