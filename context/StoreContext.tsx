'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { Product, CartItem } from '@/types';
import { cartAPI } from '@/lib/api/cart';

interface ToastMessage {
  id: string;
  text: string;
  type?: 'success' | 'info';
}

interface StoreContextType {
  cart: any[]; // Using any[] for now as backend cart items might differ from frontend type
  wishlist: string[];
  isCartOpen: boolean;
  isMobileMenuOpen: boolean;
  isSearchOpen: boolean;
  searchQuery: string;
  searchResults: Product[];
  toast: ToastMessage | null;
  fetchCart: () => Promise<void>;
  fetchWishlist: () => Promise<void>;
  addToCart: (productId: string, variantId?: string, quantity?: number) => Promise<{ success: boolean; requireLogin?: boolean; message?: string }>;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  toggleWishlist: (productId: string) => void;
  isInWishlist: (productId: string) => boolean;
  openCart: () => void;
  closeCart: () => void;
  toggleMobileMenu: () => void;
  closeMobileMenu: () => void;
  openSearch: () => void;
  closeSearch: () => void;
  setSearchQuery: (query: string) => void;
  cartTotalCount: number;
  cartSubtotal: number;
  showToast: (text: string, type?: 'success' | 'info') => void;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

export const StoreProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [cart, setCart] = useState<any[]>([]);
  const [wishlist, setWishlist] = useState<string[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [toast, setToast] = useState<ToastMessage | null>(null);
  
  const fetchCart = async () => {
    try {
      if (typeof window !== 'undefined' && localStorage.getItem('accessToken')) {
        const res = await cartAPI.getCart();
        if (res.success && res.data && res.data.items) {
          setCart(res.data.items);
        }
      }
    } catch (error) {
      console.error("Failed to fetch cart:", error);
    }
  };

  const fetchWishlist = async () => {
    try {
      if (typeof window !== 'undefined' && localStorage.getItem('accessToken')) {
        const { wishlistAPI } = await import('@/lib/api/wishlist');
        const res = await wishlistAPI.getWishlist();
        if (res.success && res.data && res.data.data) {
          const productIds = res.data.data.map((item: any) => item.productId || item.product?.id || item.id);
          setWishlist(productIds);
          return;
        }
      }
      if (typeof window !== 'undefined') {
        const saved = localStorage.getItem('sculpt_wishlist');
        if (saved) {
          setWishlist(JSON.parse(saved));
        } else {
          setWishlist([]);
        }
      }
    } catch {
      if (typeof window !== 'undefined') {
        const saved = localStorage.getItem('sculpt_wishlist');
        if (saved) {
          try {
            setWishlist(JSON.parse(saved));
          } catch {
            setWishlist([]);
          }
        }
      }
    }
  };

  useEffect(() => {
    fetchCart();
    fetchWishlist();
  }, []);

  const searchResults: Product[] = []; // Search removed for brevity as it was using static data

  const cartTotalCount = cart.length;
  const cartSubtotal = cart.reduce((acc, item) => {
    let price = 0;
    if (item.variant) {
      price = item.variant.discountPercentage > 0 
        ? item.variant.unitPrice * (1 - item.variant.discountPercentage / 100) 
        : item.variant.unitPrice;
    } else if (item.product) {
      price = item.product.discountPercentage > 0 
        ? item.product.unitPrice * (1 - item.product.discountPercentage / 100) 
        : (item.product.unitPrice || 0);
    }
    return acc + (price * (item.quantity || 1));
  }, 0);

  const showToast = (text: string, type: 'success' | 'info' = 'success') => {
    const id = Date.now().toString();
    setToast({ id, text, type });
    setTimeout(() => {
      setToast(null);
    }, 3000);
  };

  const removeFromCart = async (cartItemId: string) => {
    try {
      const item = cart.find((i) => i.id === cartItemId);
      if (item) {
        await cartAPI.removeFromCart(item.id);
        await fetchCart();
        showToast('Item removed from cart', 'info');
      }
    } catch (err) {
      console.error('Failed to remove from cart', err);
    }
  };

  const updateQuantity = async (cartItemId: string, quantity: number) => {
    if (quantity <= 0) {
      await removeFromCart(cartItemId);
      return;
    }
    
    try {
      const item = cart.find((i) => i.id === cartItemId);
      if (item) {
        // Optimistic UI update
        setCart((prevCart) =>
          prevCart.map((cItem) =>
            cItem.id === item.id ? { ...cItem, quantity } : cItem
          )
        );
        
        await cartAPI.updateCartItem(item.id, quantity);
        await fetchCart();
      }
    } catch (err) {
      console.error('Failed to update quantity', err);
      await fetchCart(); // revert on failure
    }
  };

  const addToCart = async (productId: string, variantId?: string, quantity: number = 1) => {
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;
      if (!token) {
        showToast('Please sign in to add items to your cart', 'info');
        return { success: false, requireLogin: true };
      }
      
      const res = await cartAPI.addToCart(productId, variantId, quantity);
      if (res.success) {
        await fetchCart();
        showToast('Item added to cart successfully!', 'success');
        openCart();
        return { success: true };
      }
      showToast(res.message || 'Failed to add item to cart', 'info');
      return { success: false, message: res.message };
    } catch (err: any) {
      console.error('Add to cart error:', err);
      showToast(err.message || 'Failed to add item to cart', 'info');
      return { success: false, message: err.message };
    }
  };

  const toggleWishlist = async (productId: string) => {
    const isAdding = !wishlist.includes(productId);
    const updated = isAdding 
      ? [...wishlist, productId] 
      : wishlist.filter((id) => id !== productId);
    
    setWishlist(updated);
    if (typeof window !== 'undefined') {
      localStorage.setItem('sculpt_wishlist', JSON.stringify(updated));
    }

    try {
      if (typeof window !== 'undefined' && localStorage.getItem('accessToken')) {
        const { wishlistAPI } = await import('@/lib/api/wishlist');
        await wishlistAPI.toggleWishlist(productId);
      }
    } catch (err) {
      console.error('Failed to sync wishlist with API:', err);
    }
  };

  const isInWishlist = (productId: string) => wishlist.includes(productId);

  const openCart = () => setIsCartOpen(true);
  const closeCart = () => setIsCartOpen(false);

  const toggleMobileMenu = () => setIsMobileMenuOpen((prev) => !prev);
  const closeMobileMenu = () => setIsMobileMenuOpen(false);

  const openSearch = () => setIsSearchOpen(true);
  const closeSearch = () => {
    setIsSearchOpen(false);
    setSearchQuery('');
  };

  return (
    <StoreContext.Provider
      value={{
        cart,
        wishlist,
        isCartOpen,
        isMobileMenuOpen,
        isSearchOpen,
        searchQuery,
        searchResults,
        toast,
        fetchCart,
        fetchWishlist,
        addToCart,
        removeFromCart,
        updateQuantity,
        toggleWishlist,
        isInWishlist,
        openCart,
        closeCart,
        toggleMobileMenu,
        closeMobileMenu,
        openSearch,
        closeSearch,
        setSearchQuery,
        cartTotalCount,
        cartSubtotal,
        showToast,
      }}
    >
      {children}
    </StoreContext.Provider>
  );
};

export const useStore = () => {
  const context = useContext(StoreContext);
  if (context === undefined) {
    throw new Error('useStore must be used within a StoreProvider');
  }
  return context;
};
