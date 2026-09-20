"use client";

import React, { useState, useEffect, useRef } from 'react';
import { 
  MessageCircle, X, Send, Bot, Loader2, Sparkles, Download, Menu,
  Paperclip, Image as ImageIcon, Utensils, ShieldAlert, Clock, Package, FileSpreadsheet 
} from 'lucide-react';
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
  image?: string;
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
          <div className="w-5 h-5 rounded-md overflow-hidden flex items-center justify-center bg-black/40 border border-gold-500/30 p-0.5 flex-shrink-0">
            <img src="/apple-touch-icon.png" alt="SculptnShine" className="w-full h-full object-contain" />
          </div>
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
          <div key={i} className={`${compact ? 'min-w-[160px] max-w-[160px]' : 'min-w-[250px] max-w-[250px]'} snap-center group/card relative bg-gradient-to-b from-[#18181d] via-[#141418] to-[#101014] backdrop-blur-md border border-gold-500/25 rounded-2xl overflow-hidden hover:border-gold-400/80 transition-all duration-300 hover:shadow-[0_0_25px_rgba(245,158,11,0.25)] hover:-translate-y-1 flex flex-col cursor-pointer flex-shrink-0`} onClick={() => onProductClick && onProductClick(p.sku)}>
            <div className={`${compact ? 'aspect-square' : 'aspect-[4/3]'} bg-black w-full relative overflow-hidden flex items-center justify-center border-b border-gold-500/15`}>
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
                <h4 className="text-sm font-bold text-white line-clamp-2 leading-snug group-hover/card:text-gold-400 transition-colors">{p.title}</h4>
                <div className={`${compact ? 'text-base' : 'text-xl'} font-extrabold text-gold-400 mt-2 tracking-tight`}>₹{p.price}</div>
              </div>
                {!compact && <button 
                  onClick={(e) => { e.stopPropagation(); onAction && onAction(`Add ${p.title} (ID: ${p.sku}) to my cart`) }}
                  className="w-full py-2.5 bg-gradient-to-r from-gold-500 via-gold-400 to-amber-600 hover:from-gold-400 hover:to-amber-500 text-black text-sm font-extrabold rounded-xl transition-all transform active:scale-95 shadow-[0_4px_15px_rgba(245,158,11,0.3)]"
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
  const defaultPlaceholder = 'https://images.unsplash.com/photo-1584735935682-2f2b69dff9d2?auto=format&fit=crop&w=800&q=80';

  parts.forEach((part: string, index: number) => {
    if (part.startsWith('[ORDER_STATUS:') && part.endsWith(']')) {
      const data = part.slice(14, -1).split('|');
      if (data.length === 4) orderStatus = { orderNumber: data[0], status: data[1], paymentStatus: data[2], trackingNumber: data[3] };
      return;
    }
    if (part.startsWith('[PRODUCT:') && part.endsWith(']')) {
      const data = part.slice(9, -1).split('|');
      if (data.length >= 2) {
        if (!productIds.has(data[0])) {
          productIds.add(data[0]);
          products.push({ 
            sku: data[0], 
            title: data[1], 
            price: data[2] || '', 
            image: data[3] || defaultPlaceholder 
          });
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
  const [selectedImage, setSelectedImage] = useState<{ file: File; previewUrl: string; base64: string } | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const processImageFile = (file: File) => {
    if (!file.type.startsWith('image/')) return;
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      const base64 = dataUrl.split(',')[1] || '';
      setSelectedImage({
        file,
        previewUrl: dataUrl,
        base64,
      });
    };
    reader.readAsDataURL(file);
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processImageFile(file);
    }
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLTextAreaElement>) => {
    const items = e.clipboardData?.items;
    if (!items) return;
    for (let i = 0; i < items.length; i++) {
      if (items[i].type.indexOf('image') !== -1) {
        const file = items[i].getAsFile();
        if (file) {
          processImageFile(file);
          break;
        }
      }
    }
  };

  const initMessage = {
    id: 'init',
    role: 'assistant' as const,
    content: 'Welcome to SculptnShine AI! I am your personal fitness and commerce assistant. I can help you discover the perfect supplements, track your orders, or request bulk quotations. How can I fuel your journey today?',
  };

  const handleNewChat = () => {
    setSessionId(crypto.randomUUID());
    setSelectedImage(null);
    setMessages([initMessage]);
  };

  const handleSelectSession = async (sid: string) => {
    setSessionId(sid);
    setSelectedImage(null);
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
  }, [messages, isOpen, selectedImage]);

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
    let text = typeof eOrText === 'string' ? eOrText : input;
    
    const currentSelectedImage = selectedImage;

    // If user attached an image without text, supply a natural prompt
    if (!text.trim() && currentSelectedImage) {
      text = "Please analyze this uploaded photo for me.";
    }

    if (!text.trim() && !isSystem && !currentSelectedImage) return;

    if (!isSystem) {
      if (text === input || currentSelectedImage) {
        setInput('');
        setSelectedImage(null);
        if (textareaRef.current) textareaRef.current.style.height = 'auto';
      }
      const userMessage: Message = { 
        id: Date.now().toString(), 
        role: 'user', 
        content: text,
        image: currentSelectedImage?.previewUrl
      };
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

      if (currentSelectedImage) {
        payload.image_base64 = currentSelectedImage.base64;
      }
      
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
        title="Open SculptnShine AI"
      >
        <Sparkles size={24} />
      </button>
    );
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-5xl h-[92vh] max-h-[880px] bg-[#0c0c0e] rounded-3xl shadow-[0_25px_80px_rgba(0,0,0,0.9),0_0_50px_rgba(245,158,11,0.12)] flex flex-col overflow-hidden border border-gold-500/25 ring-1 ring-gold-400/20 relative">
        
        {/* Ambient Top Luxury Aura */}
        <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-[600px] h-48 bg-gradient-to-b from-gold-500/20 via-gold-500/5 to-transparent blur-3xl pointer-events-none rounded-full" />

        {/* Clean Fixed Header */}
        <header className="h-16 px-4 sm:px-6 bg-[#131317]/90 backdrop-blur-xl border-b border-gold-500/20 flex justify-between items-center z-20 flex-shrink-0">
          <div className="flex items-center gap-3.5">
            <button 
              onClick={() => setIsSidebarOpen(true)}
              className="w-9 h-9 flex items-center justify-center rounded-xl text-neutral-400 hover:text-white hover:bg-white/5 border border-transparent hover:border-gold-500/20 transition-all"
              title="Chat History"
            >
              <Menu size={19} />
            </button>
            <div className="w-9 h-9 bg-[#17171d] rounded-xl flex items-center justify-center p-1.5 shadow-[0_0_15px_rgba(245,158,11,0.25)] border border-gold-500/30 overflow-hidden ring-1 ring-gold-400/20">
              <img src="/apple-touch-icon.png" alt="SculptnShine" className="w-full h-full object-contain rounded-lg" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-white text-[16px] sm:text-base tracking-tight font-sans">
                  SculptnShine <span className="bg-gradient-to-r from-gold-400 to-amber-500 bg-clip-text text-transparent">AI</span>
                </h3>
                <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 text-[10px] font-bold uppercase tracking-wider">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  Live Intelligence
                </span>
              </div>
              <p className="text-[10px] text-gold-400/90 font-semibold tracking-wider uppercase">Agentic Commerce Squad</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleNewChat}
              className="hidden sm:flex items-center gap-1.5 text-xs font-semibold text-neutral-300 hover:text-gold-300 px-3 py-1.5 rounded-xl bg-white/5 hover:bg-gold-500/10 border border-white/10 hover:border-gold-500/30 transition-all"
            >
              <Sparkles size={13} className="text-gold-400" />
              <span>New Chat</span>
            </button>
            <button 
              onClick={() => setIsOpen(false)} 
              className="w-9 h-9 flex items-center justify-center rounded-xl text-neutral-400 hover:text-white hover:bg-white/5 border border-transparent hover:border-gold-500/20 transition-all"
            >
              <X size={19} />
            </button>
          </div>
        </header>

        <ChatSidebar 
          isOpen={isSidebarOpen} 
          onClose={() => setIsSidebarOpen(false)} 
          onSelectSession={handleSelectSession}
          onNewChat={handleNewChat}
          currentSessionId={sessionId}
        />

        {/* Scrollable Chat / Welcome Area */}
        <div className="flex-1 overflow-y-auto px-4 md:px-10 py-5 bg-[#0c0c0e] scrollbar-thin scrollbar-thumb-neutral-800">
          <div className="max-w-4xl mx-auto w-full h-full flex flex-col justify-center">
            
            {/* If Only Initial Greeting: Render World-Class Welcome Hero Screen */}
            {messages.length === 1 && messages[0].id === 'init' ? (
              <div className="flex flex-col justify-center items-center text-center py-2 animate-in fade-in duration-500">
                {/* Brand Hero Icon */}
                <div className="relative mb-3.5">
                  <div className="absolute inset-0 bg-gold-500/25 blur-2xl rounded-full" />
                  <div className="relative w-16 h-16 rounded-2xl bg-[#17171d] border border-gold-500/40 p-2.5 flex items-center justify-center shadow-[0_0_35px_rgba(245,158,11,0.35)] ring-1 ring-gold-400/30 overflow-hidden">
                    <img src="/apple-touch-icon.png" alt="SculptnShine" className="w-full h-full object-contain rounded-xl" />
                  </div>
                </div>

                <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight font-sans">
                  Sculpt Your <span className="bg-gradient-to-r from-gold-300 via-gold-400 to-amber-500 bg-clip-text text-transparent">Peak Performance</span>
                </h2>
                <p className="text-neutral-400 text-xs sm:text-sm mt-1.5 max-w-lg leading-relaxed">
                  Your autonomous clinical nutrition squad. Audit meal plate photos, check supplement toxicity, or forecast tub replenishment.
                </p>

                {/* 4 Direct Interactive Prompt Cards */}
                <div className="w-full grid grid-cols-1 sm:grid-cols-2 gap-3 mt-6 text-left">
                  {/* Card 1: Snap & Balance */}
                  <div 
                    onClick={() => handleSendMessage("Audit my meal: I had 2 rotis with paneer (100g) and yellow dal for lunch, and 2 eggs for breakfast. Training for hypertrophy. What is my protein deficit and hourly balancing plan?")}
                    className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#18181f]/95 to-[#111116]/95 border border-gold-500/20 hover:border-gold-400 hover:bg-[#1f1f28] hover:shadow-[0_8px_30px_rgba(245,158,11,0.18)] transition-all duration-300 p-4 flex flex-col justify-between cursor-pointer hover:-translate-y-0.5"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <div className="w-8 h-8 rounded-lg bg-gold-500/10 border border-gold-500/25 flex items-center justify-center text-gold-400 group-hover:bg-gold-500 group-hover:text-black transition-all">
                          <Utensils size={16} />
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              fileInputRef.current?.click();
                            }}
                            className="flex items-center gap-1.5 px-2 py-0.5 rounded-lg bg-gold-500/15 border border-gold-500/30 hover:bg-gold-500 hover:text-black text-gold-300 text-[11px] font-semibold transition-all shadow-sm"
                            title="Upload meal plate image"
                          >
                            <Paperclip size={11} />
                            <span>Upload Photo</span>
                          </button>
                          <span className="text-[10px] font-mono font-bold text-gold-300/80 bg-white/5 px-2 py-0.5 rounded-full border border-white/10 tracking-wider">MULTIMODAL</span>
                        </div>
                      </div>
                      <h4 className="font-bold text-white text-[14px] group-hover:text-gold-300 transition-colors">Snap & Balance (Meal Audit)</h4>
                      <p className="text-xs text-neutral-400 leading-relaxed mt-1">Audit meal photos or daily food intake to calculate exact protein deficit & leucine threshold.</p>
                    </div>
                  </div>

                  {/* Card 2: Scan My Stack */}
                  <div 
                    onClick={() => handleSendMessage("Audit my supplement stack for ingredient collisions, toxicity and PubMed citations: High Caffeine Pre-workout, Thermogenic Fat Burner, Iron supplement, and Calcium Citrate.")}
                    className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#18181f]/95 to-[#111116]/95 border border-emerald-500/20 hover:border-emerald-400 hover:bg-[#1f1f28] hover:shadow-[0_8px_30px_rgba(16,185,129,0.18)] transition-all duration-300 p-4 flex flex-col justify-between cursor-pointer hover:-translate-y-0.5"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/25 flex items-center justify-center text-emerald-400 group-hover:bg-emerald-500 group-hover:text-black transition-all">
                          <ShieldAlert size={16} />
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              fileInputRef.current?.click();
                            }}
                            className="flex items-center gap-1.5 px-2 py-0.5 rounded-lg bg-emerald-500/15 border border-emerald-500/30 hover:bg-emerald-500 hover:text-black text-emerald-300 text-[11px] font-semibold transition-all shadow-sm"
                            title="Upload supplement label image"
                          >
                            <Paperclip size={11} />
                            <span>Upload Label</span>
                          </button>
                          <span className="text-[10px] font-mono font-bold text-emerald-300/80 bg-white/5 px-2 py-0.5 rounded-full border border-white/10 tracking-wider">CLINICAL</span>
                        </div>
                      </div>
                      <h4 className="font-bold text-white text-[14px] group-hover:text-emerald-300 transition-colors">Scan Stack & Lab Panel</h4>
                      <p className="text-xs text-neutral-400 leading-relaxed mt-1">Audit supplement labels or blood tests for ingredient collisions, clinical toxicity & PubMed citations.</p>
                    </div>
                  </div>

                  {/* Card 3: Living Replenishment */}
                  <div 
                    onClick={() => handleSendMessage("When will my Whey Protein and Creatine run out? I train 5 days a week with 1 scoop per day. Forecast my burn rate.")}
                    className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#18181f]/95 to-[#111116]/95 border border-amber-500/20 hover:border-amber-400 hover:bg-[#1f1f28] hover:shadow-[0_8px_30px_rgba(245,158,11,0.18)] transition-all duration-300 p-4 flex flex-col justify-between cursor-pointer hover:-translate-y-0.5"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/25 flex items-center justify-center text-amber-400 group-hover:bg-amber-500 group-hover:text-black transition-all">
                          <Clock size={16} />
                        </div>
                        <span className="text-[10px] font-mono font-bold text-amber-300 bg-amber-500/15 px-2 py-0.5 rounded-full border border-amber-500/25 tracking-wider">FORECAST</span>
                      </div>
                      <h4 className="font-bold text-white text-[14px] group-hover:text-amber-300 transition-colors">Living Replenishment</h4>
                      <p className="text-xs text-neutral-400 leading-relaxed mt-1">Forecast tub burn-rate & predict exact empty date based on your workout volume.</p>
                    </div>
                  </div>

                  {/* Card 4: B2B Wholesale */}
                  <div 
                    onClick={() => handleSendMessage("I manage a gym and need a wholesale bulk quotation for 50 units of Whey Protein and 30 units of Pre-workout. Generate bulk spreadsheet quotation.")}
                    className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#18181f]/95 to-[#111116]/95 border border-gold-500/20 hover:border-gold-400 hover:bg-[#1f1f28] hover:shadow-[0_8px_30px_rgba(245,158,11,0.18)] transition-all duration-300 p-4 flex flex-col justify-between cursor-pointer hover:-translate-y-0.5"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <div className="w-8 h-8 rounded-lg bg-gold-500/10 border border-gold-500/25 flex items-center justify-center text-gold-400 group-hover:bg-gold-500 group-hover:text-black transition-all">
                          <FileSpreadsheet size={16} />
                        </div>
                        <span className="text-[10px] font-mono font-bold text-gold-300 bg-gold-500/15 px-2 py-0.5 rounded-full border border-gold-500/25 tracking-wider">B2B SALES</span>
                      </div>
                      <h4 className="font-bold text-white text-[14px] group-hover:text-gold-300 transition-colors">B2B Bulk Quotation</h4>
                      <p className="text-xs text-neutral-400 leading-relaxed mt-1">Commercial gym bulk pricing and automated quotation spreadsheet downloads.</p>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              /* Conversation Messages History */
              <div className="flex flex-col gap-8">
                {messages.map((msg, index) => (
                  <div key={msg.id} className={`flex w-full ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    {msg.role === 'assistant' && (
                      <div className="w-9 h-9 rounded-xl bg-[#17171d] border border-gold-500/30 p-1.5 flex items-center justify-center flex-shrink-0 mr-4 shadow-[0_0_12px_rgba(245,158,11,0.2)] mt-1 overflow-hidden ring-1 ring-gold-400/20">
                        <img src="/apple-touch-icon.png" alt="SculptnShine" className="w-full h-full object-contain rounded-lg" />
                      </div>
                    )}
                    <div className={`max-w-full md:max-w-[85%] ${msg.role === 'user' ? 'bg-gradient-to-r from-[#262630] to-[#1e1e24] text-white px-5 py-3.5 rounded-2xl rounded-tr-sm border border-gold-500/20 shadow-lg' : 'text-neutral-200'}`}>
                      {msg.role === 'user' ? (
                        <div className="flex flex-col gap-2.5">
                          {msg.image && (
                            <div className="max-w-xs rounded-xl overflow-hidden border border-gold-500/50 shadow-[0_0_15px_rgba(245,158,11,0.2)] bg-black/90">
                              <img src={msg.image} alt="Uploaded attachment" className="w-full max-h-56 object-cover rounded-xl" />
                            </div>
                          )}
                          <div className="text-[15px] leading-relaxed whitespace-pre-wrap">{msg.content.replace(/\s*\(ID:\s*[^)]+\)/g, '')}</div>
                        </div>
                      ) : (
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
                
                {/* Loading Indicator */}
                {isLoading && (!messages[messages.length - 1] || messages[messages.length - 1].role !== 'assistant' || !messages[messages.length - 1].content) && (
                  <div className="flex justify-start w-full items-start mb-2">
                    <div className="w-9 h-9 rounded-xl border border-gold-500/30 bg-gradient-to-br from-gold-500/10 to-[#141418] flex items-center justify-center flex-shrink-0 mr-4 mt-1 shadow-[0_0_15px_rgba(245,158,11,0.2)] overflow-hidden">
                       <img src="/apple-touch-icon.png" alt="SculptnShine Loading" className="w-5 h-5 object-contain animate-spin" onError={(e) => { e.currentTarget.style.display = 'none'; }} />
                    </div>
                    <div className="flex flex-col justify-center pt-2">
                      <span className="text-xs text-gold-400 font-semibold uppercase tracking-wider animate-pulse flex items-center gap-2">
                        {agentStatus || "Squad is thinking..."}
                      </span>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} className="h-2" />
              </div>
            )}
          </div>
        </div>

        {/* Clean Fixed Footer Input */}
        <footer className="p-3 sm:px-6 bg-[#0f0f13]/95 backdrop-blur-xl border-t border-gold-500/15 z-20 flex-shrink-0">
          <div className="max-w-4xl mx-auto w-full">
            <form 
              onSubmit={(e) => { e.preventDefault(); handleSendMessage(input); }}
              className="relative flex flex-col bg-[#16161c] rounded-2xl border border-gold-500/25 focus-within:border-gold-400 transition-all shadow-xl shadow-black/80 ring-2 ring-gold-500/10 focus-within:ring-gold-400/25 overflow-hidden"
            >
              {/* Selected Image Preview */}
              {selectedImage && (
                <div className="flex items-center gap-3 px-4 py-2 bg-[#121216] border-b border-gold-500/20">
                  <div className="relative w-10 h-10 rounded-lg overflow-hidden border border-gold-400/60 bg-black flex-shrink-0 shadow">
                    <img src={selectedImage.previewUrl} alt="Preview" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => setSelectedImage(null)}
                      className="absolute top-0.5 right-0.5 w-4 h-4 rounded-full bg-black/80 hover:bg-red-600 text-white flex items-center justify-center transition-colors text-[10px]"
                    >
                      <X size={10} />
                    </button>
                  </div>
                  <div className="flex flex-col min-w-0 flex-1">
                    <span className="text-xs font-semibold text-white truncate">{selectedImage.file.name}</span>
                    <span className="text-[10px] text-gold-400 font-medium">{(selectedImage.file.size / 1024).toFixed(1)} KB • Image ready for Multimodal audit</span>
                  </div>
                </div>
              )}

              <div className="flex items-end w-full">
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleImageSelect}
                  accept="image/*"
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isLoading}
                  className="w-9 h-9 flex items-center justify-center text-gold-400/80 hover:text-gold-300 hover:bg-gold-500/15 rounded-xl transition-colors ml-2 mb-1.5 flex-shrink-0"
                  title="Upload meal plate photo, supplement label, or lab test"
                >
                  <Paperclip size={18} />
                </button>

                <textarea
                  ref={textareaRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onPaste={handlePaste}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      if ((input.trim() || selectedImage) && !isLoading) handleSendMessage(input);
                    }
                  }}
                  placeholder={selectedImage ? "Add notes about this photo (or hit Send)..." : "Ask anything, audit a meal photo, or scan lab panel..."}
                  className="w-full max-h-32 min-h-[50px] py-3.5 pl-2 pr-12 bg-transparent text-white text-[14.5px] outline-none placeholder:text-neutral-500 resize-none scrollbar-none leading-normal font-sans"
                  rows={1}
                  disabled={isLoading}
                />

                <div className="absolute right-2.5 bottom-2">
                  <button
                    type="submit"
                    disabled={(!input.trim() && !selectedImage) || isLoading}
                    className="w-8 h-8 flex items-center justify-center rounded-xl bg-gradient-to-r from-gold-400 via-gold-500 to-amber-600 text-black font-bold hover:brightness-110 disabled:opacity-20 disabled:grayscale transition-all shadow-[0_0_12px_rgba(245,158,11,0.3)]"
                  >
                    <Send size={15} className="ml-0.5 text-black" />
                  </button>
                </div>
              </div>
            </form>
            <div className="text-center mt-2 text-[11px] text-neutral-500 font-medium tracking-wide">
              SculptnShine Live Intelligence • Powered by Multi-Agent Clinical AI
            </div>
          </div>
        </footer>

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

