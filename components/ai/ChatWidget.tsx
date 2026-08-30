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

type Message = {
  id: string;
  role: 'user' | 'assistant';
  content: string;
};

// Simple Markdown to HTML parser for basic formatting (bold, italics, lists, newlines)
const formatMarkdown = (text: string) => {
  if (!text) return { __html: '' };
  
  let formatted = text
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    .replace(/\n\n/g, '<br/><br/>')
    .replace(/\n/g, '<br/>')
    .replace(/^- (.*)$/gm, '<ul><li class="ml-4 list-disc my-1">$1</li></ul>')
    .replace(/<\/ul><br\/><ul>/g, ''); // Fix adjacent list spacing

  return { __html: formatted };
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
  let displayContent = content.replace(/\[?ACTION:LOGIN\]?/g, '').replace(/\[?ACTION:ADD_ADDRESS\]?/g, '').replace(/\[?ACTION:CHECKOUT\]?/g, '');
  
  // If the message is completely empty after stripping actions, we still want it to render so the form can appear inside it
  if (!displayContent.trim()) {
    if (content.includes('ACTION:LOGIN')) {
      displayContent = "In order to add items to your cart or checkout, you need to login or sign up first.";
    } else if (content.includes('ACTION:ADD_ADDRESS')) {
      displayContent = "Please add a shipping address to continue.";
    } else if (content.includes('ACTION:CHECKOUT')) {
      displayContent = "Please complete your checkout below:";
    }
  }

  if (!displayContent.includes('[PRODUCT:') && !displayContent.includes('[QUOTATION_FILE:')) {
    return (
      <div className="flex flex-col gap-2">
        <div dangerouslySetInnerHTML={formatMarkdown(displayContent)} className="prose prose-sm md:prose-base prose-invert max-w-none prose-a:text-gold-500 prose-strong:text-white leading-relaxed" />
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
  const parts = displayContent.split(/(\[PRODUCT:[^\]]+\]|\[QUOTATION_FILE:[^\]]+\])/g);
  
  const products: any[] = [];
  const textParts: any[] = [];
  let quotationUrl: string | null = null;

  parts.forEach((part: string, index: number) => {
    if (part.startsWith('[PRODUCT:') && part.endsWith(']')) {
      const data = part.slice(9, -1).split('|');
      if (data.length === 4) {
        products.push({ sku: data[0], title: data[1], price: data[2], image: data[3] });
      }
    } else if (part.startsWith('[QUOTATION_FILE:') && part.endsWith(']')) {
      quotationUrl = part.slice(16, -1);
    } else if (part.trim()) {
      textParts.push(<div key={`text-${index}`} dangerouslySetInnerHTML={formatMarkdown(part)} className="prose prose-sm md:prose-base prose-invert max-w-none prose-a:text-gold-500 prose-strong:text-white mb-4 leading-relaxed" />);
    }
  });

  const defaultPlaceholder = 'https://images.unsplash.com/photo-1584735935682-2f2b69dff9d2?auto=format&fit=crop&w=800&q=80';

  return (
    <div className="flex flex-col gap-4 w-full">
      {textParts}
      {quotationUrl && (
        <a href={quotationUrl} download="quotation.xlsx" target="_blank" rel="noreferrer" className="flex items-center justify-center gap-2 w-full max-w-md mt-2 py-3 bg-gradient-to-r from-green-600 to-green-500 hover:from-green-500 hover:to-green-400 text-white font-bold rounded-xl shadow-lg transition-transform transform active:scale-95">
          <Download size={20} />
          Download Excel Quotation
        </a>
      )}
      {products.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mt-2">
          {products.map((p, i) => (
            <div key={i} className="group relative bg-neutral-900/40 backdrop-blur-md border border-neutral-800 rounded-2xl overflow-hidden hover:border-gold-500/50 transition-all duration-300 hover:shadow-[0_0_20px_rgba(212,175,55,0.15)] flex flex-col cursor-pointer" onClick={() => onProductClick && onProductClick(p.sku)}>
              <div className="aspect-[4/3] bg-neutral-950 w-full relative overflow-hidden flex items-center justify-center">
                <img 
                  src={getMediaUrl(p.image, defaultPlaceholder)} 
                  alt={p.title} 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                  onError={(e) => { 
                    e.currentTarget.src = defaultPlaceholder; 
                  }} 
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </div>
              <div className="p-4 flex flex-col gap-3 flex-1 justify-between">
                <div>
                  <h4 className="text-sm font-semibold text-white line-clamp-2 leading-tight group-hover:text-gold-500 transition-colors">{p.title}</h4>
                  <div className="text-lg font-bold text-gold-500 mt-2 tracking-tight">₹{p.price}</div>
                </div>
                <button 
                  onClick={(e) => { e.stopPropagation(); onAction && onAction(`Add ${p.title} (ID: ${p.sku}) to my cart`) }}
                  className="w-full py-2.5 bg-neutral-800 hover:bg-gold-600 text-white hover:text-black text-sm font-bold rounded-xl transition-all transform active:scale-95 border border-neutral-700 hover:border-gold-500 shadow-lg"
                >
                  Add to Cart
                </button>
              </div>
            </div>
          ))}
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

  const handleSendMessage = async (eOrText: React.FormEvent | string, isSystem: boolean = false) => {
    if (typeof eOrText !== 'string') {
      eOrText.preventDefault();
    }
    const text = typeof eOrText === 'string' ? eOrText : input;
    
    if (!text.trim() && !isSystem) return;

    if (!isSystem && text === input) {
      setInput('');
      if (textareaRef.current) textareaRef.current.style.height = 'auto';
    }

    const userMessage: Message = { id: Date.now().toString(), role: 'user', content: text };
    
    // Display all messages (even system-triggered ones like login success) so the user knows they were sent
    setMessages(prev => [...prev, userMessage]);
    
    setIsLoading(true);

    try {
      // Get auth token from localStorage if exists
      const authToken = localStorage.getItem('accessToken');
      
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
              if (data.content) {
                aiContent += data.content;
                
                // Intercept token for display purposes
                let displayContent = aiContent.replace(/\[AUTH_TOKEN:[^\]]+\]/g, '').trim();
                
                setMessages(prev => prev.map(msg => 
                  msg.id === messageId ? { ...msg, content: displayContent } : msg
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
                      {renderMessageContent(msg.content, (text) => handleSendMessage(text), (sku) => handleAddToCartClick(sku))}
                      {msg.content.includes('ACTION:LOGIN') && (
                        <div className="mt-6"><ChatLogin onAuthSuccess={() => handleSendMessage("I have successfully logged in. Please continue.", true)} /></div>
                      )}
                      {msg.content.includes('ACTION:ADD_ADDRESS') && (
                        <div className="mt-6"><ChatAddress onSuccess={() => handleSendMessage("I have successfully added my address. Please continue with checkout.", true)} /></div>
                      )}
                      {msg.content.includes('ACTION:CHECKOUT') && (
                        <div className="mt-6">
                            <ChatCheckout 
                                onSuccess={(orderId) => handleSendMessage(`I have successfully completed checkout and just paid for the order! My new Order ID is ${orderId}.`, true)} 
                                onCancel={() => handleSendMessage("I cancelled the checkout process.", true)} 
                                isHistoricallyPaid={messages.slice(index + 1).some(m => m.content && m.content.includes("I have successfully completed checkout"))}
                            />
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
                    Squad is thinking...
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

