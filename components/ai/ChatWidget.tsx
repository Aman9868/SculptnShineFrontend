"use client";

import React, { useState, useEffect, useRef } from 'react';
import { MessageCircle, X, Send, Bot, User, Loader2 } from 'lucide-react';
import { ChatLogin } from './ChatLogin';
import ChatAddress from './ChatAddress';
import { useRouter } from 'next/navigation';
import { QuickAddModal } from '../product/QuickAddModal';
import { Product } from '@/lib/api/product';
import { ChatCheckout } from './ChatCheckout';

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
    .replace(/^- (.*)$/gm, '<ul><li class="ml-4 list-disc">$1</li></ul>')
    .replace(/<\/ul><br\/><ul>/g, ''); // Fix adjacent list spacing

  return { __html: formatted };
};

const renderMessageContent = (content: string, onAction?: (text: string) => void, onProductClick?: (sku: string) => void) => {
  // Strip out the ACTION tags from visible text
  let displayContent = content.replace(/\[ACTION:LOGIN\]/g, '').replace(/\[ACTION:ADD_ADDRESS\]/g, '').replace(/\[ACTION:CHECKOUT\]/g, '');

  if (!displayContent.includes('[PRODUCT:')) {
    return <div dangerouslySetInnerHTML={formatMarkdown(displayContent)} className="prose prose-sm prose-invert max-w-none prose-a:text-gold-500 prose-strong:text-white" />;
  }

  // Split content by the PRODUCT tag regex
  const parts = displayContent.split(/(\[PRODUCT:[^\]]+\])/g);
  
  const products: any[] = [];
  const textParts: any[] = [];

  parts.forEach((part, index) => {
    if (part.startsWith('[PRODUCT:') && part.endsWith(']')) {
      const data = part.slice(9, -1).split('|');
      if (data.length === 4) {
        products.push({ sku: data[0], title: data[1], price: data[2], image: data[3] });
      }
    } else if (part.trim()) {
      textParts.push(<div key={`text-${index}`} dangerouslySetInnerHTML={formatMarkdown(part)} className="prose prose-sm prose-invert max-w-none prose-a:text-gold-500 prose-strong:text-white mb-2" />);
    }
  });

  return (
    <div className="flex flex-col gap-2 w-full max-w-[480px]">
      {textParts}
      {products.length > 0 && (
        <div className="flex gap-3 overflow-x-auto pb-2 pt-1 scrollbar-thin scrollbar-thumb-neutral-700 scrollbar-track-transparent snap-x">
          {products.map((p, i) => (
            <div key={i} className="flex-shrink-0 w-40 bg-neutral-900 border border-neutral-700 rounded-xl overflow-hidden snap-start flex flex-col">
              <div className="h-36 bg-neutral-800 w-full relative">
                <img src={p.image.startsWith('http') || p.image.startsWith('/') ? p.image : `https://via.placeholder.com/150?text=Product`} alt={p.title} className="w-full h-full object-cover" onError={(e) => { e.currentTarget.src = 'https://via.placeholder.com/150?text=No+Image' }} />
              </div>
              <div className="p-3 flex flex-col gap-2 flex-1 justify-between">
                <div>
                  <span className="text-xs font-medium text-white line-clamp-2 leading-tight">{p.title}</span>
                  <span className="text-sm font-bold text-gold-500 block mt-1">₹{p.price}</span>
                </div>
                <button 
                  onClick={() => onProductClick ? onProductClick(p.sku) : onAction && onAction(`Add ${p.title} (ID: ${p.sku}) to my cart`)}
                  className="w-full mt-1 py-1.5 bg-neutral-800 hover:bg-gold-600 hover:text-black text-gold-500 text-xs font-semibold rounded transition-colors border border-neutral-700 hover:border-gold-600"
                >
                  Add to Cart
                </button>
              </div>
            </div>
          ))}
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

  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'init',
      role: 'assistant',
      content: 'Hi! I am the SculptnShine AI Assistant. How can I help you today? I can help you find products, track orders, or provide bulk quotations!',
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId, setSessionId] = useState<string>('');
  
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isQuickAddOpen, setIsQuickAddOpen] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

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

  const handleSendMessage = async (eOrText: React.FormEvent | string, isSystem: boolean = false) => {
    if (typeof eOrText !== 'string') {
      eOrText.preventDefault();
    }
    const text = typeof eOrText === 'string' ? eOrText : input;
    
    if (!text.trim() && !isSystem) return;

    if (typeof eOrText !== 'string') {
      setInput('');
    }

    const userMessage: Message = { id: Date.now().toString(), role: 'user', content: text };
    
    // Only display user message if it's not a system/background task
    if (!isSystem) {
      setMessages(prev => [...prev, userMessage]);
    }
    
    setIsLoading(true);

    try {
      // Get auth token from localStorage if exists
      const authToken = localStorage.getItem('accessToken');
      
      const payload: any = {
        session_id: sessionId,
        messages: [{ role: 'user', content: text }]
      };
      
      if (authToken) {
        payload.auth_token = authToken;
      }

      const res = await fetch(`${process.env.NEXT_PUBLIC_AI_API_URL || 'http://localhost:8086/api/v1'}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      
      const data = await res.json();
      
      // Update logic based on server response structure
      let aiContent = data.reply || data.data || 'Sorry, I could not process your request.';
      
      // INTERCEPT AUTH_TOKEN
      const tokenMatch = aiContent.match(/\[AUTH_TOKEN:([^\]]+)\]/);
      if (tokenMatch && tokenMatch[1]) {
        const token = tokenMatch[1];
        localStorage.setItem('accessToken', token);
        window.dispatchEvent(new Event('authChange'));
        // Strip the token from visible text
        aiContent = aiContent.replace(/\[AUTH_TOKEN:[^\]]+\]/g, '').trim();
      }

      setMessages(prev => [...prev, { id: (Date.now() + 1).toString(), role: 'assistant', content: aiContent }]);
      if (data.session_id && data.session_id !== sessionId) setSessionId(data.session_id);

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
        className="fixed bottom-6 right-6 w-14 h-14 bg-black rounded-full shadow-2xl shadow-gold-500/20 flex items-center justify-center text-gold-500 hover:scale-110 transition-transform z-50 border border-neutral-800"
      >
        <MessageCircle size={24} />
      </button>
    );
  }

  return (
    <div className="fixed bottom-6 right-6 w-[400px] sm:w-[480px] h-[600px] bg-black rounded-2xl shadow-2xl flex flex-col overflow-hidden z-50 border border-neutral-800">
      {/* Header */}
      <div className="p-4 bg-neutral-900 border-b border-neutral-800 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gold-600/10 rounded-full flex items-center justify-center text-gold-500 border border-gold-500/20">
            <Bot size={20} />
          </div>
          <div>
            <h3 className="font-bold text-white leading-tight">SculptnShine AI</h3>
            <p className="text-xs text-neutral-400">Agentic Commerce Squad</p>
          </div>
        </div>
        <button onClick={() => setIsOpen(false)} className="text-neutral-400 hover:text-white transition-colors">
          <X size={20} />
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-black scrollbar-thin scrollbar-thumb-neutral-800">
        <div className="flex flex-col gap-6">
          {messages.map((msg) => (
            <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              {msg.role === 'assistant' && (
                <div className="w-8 h-8 rounded-full bg-gold-600/10 text-gold-500 flex items-center justify-center flex-shrink-0 mr-3 border border-gold-500/20">
                  <Bot size={16} />
                </div>
              )}
              <div className={`px-4 py-3 rounded-2xl text-sm ${msg.role === 'user' ? 'bg-gold-600 text-black' : 'bg-neutral-800 text-neutral-200 border border-neutral-700'}`}>
                {msg.role === 'user' ? msg.content : (
                  <>
                    {renderMessageContent(msg.content, (text) => handleSendMessage(text), (sku) => handleAddToCartClick(sku))}
                    {msg.content.includes('[ACTION:LOGIN]') && (
                      <div className="mt-2"><ChatLogin onAuthSuccess={() => handleSendMessage("I have successfully logged in. Please continue.", true)} /></div>
                    )}
                    {msg.content.includes('[ACTION:ADD_ADDRESS]') && (
                      <div className="mt-2"><ChatAddress onSuccess={() => handleSendMessage("I have successfully added my address. Please continue with checkout.", true)} /></div>
                    )}
                    {msg.content.includes('[ACTION:CHECKOUT]') && (
                      <div className="mt-2"><ChatCheckout onSuccess={(orderId) => handleSendMessage(`I have successfully paid for the order! The Order ID is ${orderId}.`, true)} onCancel={() => handleSendMessage("I cancelled the checkout process.", true)} /></div>
                    )}
                  </>
                )}
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex justify-start">
              <div className="w-8 h-8 rounded-full bg-gold-600/10 text-gold-500 flex items-center justify-center flex-shrink-0 mr-3 border border-gold-500/20">
                <Bot size={16} />
              </div>
              <div className="px-4 py-3 rounded-2xl bg-neutral-800 text-neutral-200 text-sm border border-neutral-700 flex items-center">
                <Loader2 size={16} className="animate-spin text-gold-500" />
                <span className="ml-2 text-neutral-400">Thinking...</span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Quick Add Modal */}
        {isQuickAddOpen && (
          <QuickAddModal
            product={selectedProduct}
            isOpen={isQuickAddOpen}
            onClose={() => setIsQuickAddOpen(false)}
            onAddSuccess={() => {
              setIsQuickAddOpen(false);
              // Instead of routing to /checkout, we stay in chat!
              handleSendMessage(`I have successfully added ${selectedProduct?.title} to my cart. I am ready to checkout now.`, true);
            }}
          />
        )}
      </div>

      {/* Input Area */}
      <div className="p-4 bg-neutral-900 border-t border-neutral-800">
        <form 
          onSubmit={(e) => { e.preventDefault(); handleSendMessage(input); }}
          className="flex items-center gap-2 bg-neutral-800 border border-neutral-700 rounded-full px-4 py-2 focus-within:border-gold-500/50 transition-colors"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type your message..."
            className="flex-1 bg-transparent text-white text-sm outline-none placeholder:text-neutral-500 h-10"
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={!input.trim() || isLoading}
            className="w-10 h-10 flex items-center justify-center rounded-full bg-gold-600 text-black hover:bg-gold-500 disabled:opacity-50 disabled:hover:bg-gold-600 transition-colors flex-shrink-0"
          >
            <Send size={18} className="ml-1" />
          </button>
        </form>
        <div className="text-center mt-3 text-[10px] text-neutral-500">
          Powered by SculptnShine Multi-Agent System
        </div>
      </div>
    </div>
  );
};
