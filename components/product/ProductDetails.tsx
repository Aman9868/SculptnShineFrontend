'use client';

import React, { useState, useEffect } from 'react';
import { Star, Minus, Plus, Heart, Share2, ShieldCheck, Truck, RotateCcw, Lock, Trash2, Calendar, Sparkles } from 'lucide-react';
import { Product, ProductVariant } from '@/lib/api/product';
import { wishlistAPI } from '@/lib/api/wishlist';
import { cartAPI } from '@/lib/api/cart';
import { shippingAPI } from '@/lib/api/shipping';
import { useStore } from '@/context/StoreContext';
import { useRouter } from 'next/navigation';

interface ProductDetailsProps {
  product: Product;
}

export const ProductDetails: React.FC<ProductDetailsProps> = ({ product }) => {
  const router = useRouter();
  const { cart, fetchCart, updateQuantity, removeFromCart } = useStore();

  // Extract unique flavors and sizes/weights from variants
  const flavors = Array.from(new Set(product.variants?.map(v => v.flavor).filter(Boolean))) as string[];
  const sizes = Array.from(new Set(product.variants?.map(v => v.weight).filter(Boolean))) as string[];

  // Default selections
  const [selectedFlavor, setSelectedFlavor] = useState<string>(flavors[0] || '');
  const [selectedSize, setSelectedSize] = useState<string>(sizes[0] || '');
  const [quantity, setQuantity] = useState(1);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [isWishlistLoading, setIsWishlistLoading] = useState(true);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [freeShippingThreshold, setFreeShippingThreshold] = useState(1000);

  useEffect(() => {
    // Check if product is in wishlist on load
    const checkWishlistStatus = async () => {
      try {
        const token = localStorage.getItem('accessToken');
        if (!token) {
          setIsWishlistLoading(false);
          return;
        }
        
        // Quick fetch of wishlist to check if this product is in it
        const res = await wishlistAPI.getWishlist(1, 50);
        if (res.success && res.data && res.data.data) {
          const inWishlist = res.data.data.some(item => item.productId === product.id);
          setIsWishlisted(inWishlist);
        }
      } catch (err) {
        console.error('Failed to check wishlist status', err);
      } finally {
        setIsWishlistLoading(false);
      }
    };
    checkWishlistStatus();
  }, [product.id]);

  useEffect(() => {
    const fetchShippingSettings = async () => {
      try {
        const res = await shippingAPI.getSettings();
        if (res.success) {
          setFreeShippingThreshold(res.data.threshold);
        }
      } catch (err) {
        console.error('Failed to load shipping settings', err);
      }
    };

    fetchShippingSettings();
  }, []);

  // Find the currently selected variant
  const currentVariant = product.variants?.find(
    v => (flavors.length === 0 || v.flavor === selectedFlavor) && 
         (sizes.length === 0 || v.weight === selectedSize)
  );

  // Derive active price and stock
  const originalUnitPrice = currentVariant ? currentVariant.unitPrice : product.unitPrice;
  const discountPercent = currentVariant ? currentVariant.discountPercentage : product.discountPercentage;
  const gstRate = currentVariant ? currentVariant.gst : product.gst;
  const stock = currentVariant ? currentVariant.stock : product.stock;
  
  const currentUnitPrice = discountPercent > 0 
    ? originalUnitPrice * (1 - discountPercent / 100) 
    : originalUnitPrice;
    
  const price = currentUnitPrice * quantity;
  const originalPrice = originalUnitPrice * quantity;
    
  // Check if product (and variant) is already in cart
  const hasVariants = product.variants && product.variants.length > 0;
  
  const cartItem = cart.find(item => {
    if (item.productId !== product.id) return false;
    if (hasVariants) {
      return currentVariant ? item.variantId === currentVariant.id : false;
    }
    return true;
  });
  const isAlreadyInCart = !!cartItem;

  const isInvalidVariantCombination = hasVariants && !currentVariant;

  const handleQuantityChange = (delta: number) => {
    setQuantity(prev => {
      const newQty = prev + delta;
      if (newQty < 1) return 1;
      if (stock !== undefined && newQty > stock) return stock;
      return newQty;
    });
  };

  // Reset quantity if variant changes and it's higher than new stock
  useEffect(() => {
    if (stock !== undefined && quantity > stock) {
      setQuantity(Math.max(1, stock));
    }
  }, [stock, quantity]);

  const handleAddToCart = async () => {
    const token = localStorage.getItem('accessToken');
    if (!token) {
      setShowLoginModal(true);
      return;
    }

    setIsAddingToCart(true);
    try {
      await cartAPI.addToCart(product.id, currentVariant?.id, quantity);
      await fetchCart(); // Refresh global cart state
    } catch (err: any) {
      console.error('Failed to add to cart', err);
      alert(err.message || 'Failed to add to cart');
    } finally {
      setIsAddingToCart(false);
    }
  };

  const handleToggleWishlist = async () => {
    const token = localStorage.getItem('accessToken');
    if (!token) {
      setShowLoginModal(true);
      return;
    }

    // Optimistic UI update
    setIsWishlisted(!isWishlisted);
    
    try {
      await wishlistAPI.toggleWishlist(product.id);
    } catch (err) {
      // Revert on error
      setIsWishlisted(!isWishlisted);
      console.error('Failed to toggle wishlist', err);
    }
  };

  const handleBuyNow = async () => {
    const token = localStorage.getItem('accessToken');
    if (!token) {
      setShowLoginModal(true);
      return;
    }
    
    // Add to cart first, then redirect to cart/checkout
    setIsAddingToCart(true);
    try {
      if (!isAlreadyInCart) {
        await cartAPI.addToCart(product.id, currentVariant?.id, quantity);
        await fetchCart();
      }
      router.push('/cart');
    } catch (err: any) {
      console.error('Failed to buy now', err);
      alert(err.message || 'Failed to process Buy Now');
    } finally {
      setIsAddingToCart(false);
    }
  };

  const handleShare = async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: product.title,
          text: `Check out ${product.title} at SculptnShine`,
          url: window.location.href,
        });
      } else {
        await navigator.clipboard.writeText(window.location.href);
        alert('Link copied to clipboard!');
      }
    } catch (err) {
      console.error('Error sharing', err);
    }
  };

  const isOutOfStock = product.status !== 'ACTIVE' || (stock !== undefined && stock <= 0);

  return (
    <div className="w-full lg:w-1/2 flex flex-col">
      <div className="flex justify-between items-start mb-2">
        <p className="text-sm text-gray-500 font-bold tracking-widest uppercase">{product.brand?.name || product.brandId || 'BRAND'}</p>
        <div className="flex items-center gap-2">
          <button 
            onClick={handleToggleWishlist}
            disabled={isWishlistLoading}
            className={`p-2 rounded-full border transition-colors ${isWishlisted ? 'border-red-100 bg-red-50 text-red-500' : 'border-gray-200 hover:border-gray-300 text-gray-500 hover:text-gray-700'}`}
          >
            <Heart size={20} className={isWishlisted ? 'fill-current' : ''} />
          </button>
          <button onClick={handleShare} className="p-2 rounded-full border border-gray-200 hover:border-gray-300 text-gray-500 hover:text-gray-700 transition-colors">
            <Share2 size={20} />
          </button>
        </div>
      </div>
      
      <h1 className="text-3xl sm:text-4xl font-serif-luxury text-brandDark leading-tight mb-4">
        {product.title}
      </h1>
      
      {/* Reviews & Ratings Summary */}
      {(() => {
        const rating = Number((product as any).averageRating || 0);
        const count = Number((product as any).reviewCount || 0);
        return (
          <div className="flex items-center gap-3 mb-6 pb-6 border-b border-gray-100">
            {count > 0 ? (
              <div className="flex items-center bg-gold-50 px-3 py-1 rounded-full border border-gold-200">
                <Star className="w-4 h-4 text-gold-500 fill-gold-500" />
                <span className="text-sm font-bold ml-1.5 text-gold-800">{rating.toFixed(1)}</span>
              </div>
            ) : (
              <div className="flex items-center bg-gray-50 px-2.5 py-0.5 rounded-full border border-gray-200">
                <Star className="w-3.5 h-3.5 text-gray-400" />
                <span className="text-xs font-semibold ml-1 text-gray-500">New Product</span>
              </div>
            )}
            <button 
              onClick={() => {
                const el = document.getElementById('product-tabs-section');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
              }}
              className="text-sm text-gray-500 underline hover:text-gold-600 transition-colors"
            >
              {count > 0 ? `(${count.toLocaleString()} ${count === 1 ? 'review' : 'reviews'})` : 'Be the first to review'}
            </button>
            <span className="text-gray-300">|</span>
            <span className="text-sm text-gray-500 flex items-center gap-1 cursor-pointer hover:text-brandDark transition-colors">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
              Verified Authentic
            </span>
          </div>
        );
      })()}

      {/* Short Summary Snippet */}
      {(() => {
        const raw = product.description || '';
        // Extract the description block text before ingredients/nutrition
        const descMatch = raw.match(/(?:<h[1-6][^>]*>(?:DESCRIPTION|OVERVIEW|ABOUT)[\s\S]*?<\/h[1-6]>)?([\s\S]*?)(?=<h[1-6]|$)/i);
        const targetBlock = descMatch && descMatch[1] ? descMatch[1] : raw;
        
        const cleanText = targetBlock
          .replace(/<h[1-6][^>]*>[\s\S]*?<\/h[1-6]>/gi, '')
          .replace(/<[^>]+>/g, ' ')
          .replace(/&nbsp;/gi, ' ')
          .replace(/&amp;/gi, '&')
          .replace(/\s+/g, ' ')
          .trim();

        const summary = cleanText.length > 200 
          ? cleanText.slice(0, cleanText.lastIndexOf(' ', 200)) + '...'
          : cleanText;

        return (
          <p className="text-gray-600 text-sm leading-relaxed mb-6">
            {summary || 'High quality formulation crafted with tested ingredients to deliver optimal results.'}
          </p>
        );
      })()}

      {/* Pricing */}
      <div className="mb-6">
        <div className="flex items-end gap-3 mb-1">
          <span className="text-4xl font-bold text-brandDark">₹{price.toLocaleString()}</span>
          {originalPrice && originalPrice > price && (
            <span className="text-xl text-gray-400 line-through mb-1">₹{originalPrice.toLocaleString()}</span>
          )}
          {discountPercent > 0 && (
            <span className="text-sm font-bold text-orange-600 mb-2">{discountPercent}% OFF</span>
          )}
        </div>
        <p className="text-xs text-gray-400">(Inclusive of all taxes)</p>
      </div>

      {/* Flavors */}
      {flavors.length > 0 && (
        <div className="mb-6">
          <h3 className="text-sm font-bold text-gray-900 mb-3 uppercase tracking-wide">Flavor: <span className="text-gray-500 font-medium capitalize">{selectedFlavor}</span></h3>
          <div className="flex flex-wrap gap-3">
            {flavors.map(flavor => (
              <button
                key={flavor}
                onClick={() => setSelectedFlavor(flavor)}
                className={`px-4 py-2 text-sm rounded-md border font-medium transition-colors ${
                  selectedFlavor === flavor
                    ? 'border-gold-500 text-brandDark ring-1 ring-gold-500'
                    : 'border-gray-200 text-gray-600 hover:border-gray-300'
                }`}
              >
                {flavor}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Sizes */}
      {sizes.length > 0 && (
        <div className="mb-8">
          <h3 className="text-sm font-bold text-gray-900 mb-3 uppercase tracking-wide">Size:</h3>
          <div className="flex flex-wrap gap-3 relative">
            {sizes.map(size => (
              <button
                key={size}
                onClick={() => setSelectedSize(size)}
                className={`px-6 py-2 text-sm rounded-md border font-medium transition-colors ${
                  selectedSize === size
                    ? 'border-gold-500 text-brandDark ring-1 ring-gold-500'
                    : 'border-gray-200 text-gray-600 hover:border-gray-300'
                }`}
              >
                {size}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Add to Cart Actions */}
      <div className="flex flex-col sm:flex-row gap-4 mb-4">
        {isAlreadyInCart && cartItem ? (
          <>
            <div className="flex items-center justify-between border-2 border-gold-500 bg-gold-50 rounded-md px-4 py-3 w-full sm:w-40 shrink-0 shadow-sm">
              <button 
                onClick={() => updateQuantity(cartItem.id, cartItem.quantity - 1)} 
                className="text-gold-700 hover:text-gold-800 transition-colors"
              >
                <Minus size={18} />
              </button>
              <span className="font-bold text-lg text-brandDark">{cartItem.quantity}</span>
              <button 
                onClick={() => updateQuantity(cartItem.id, cartItem.quantity + 1)} 
                className="text-gold-700 hover:text-gold-800 transition-colors"
              >
                <Plus size={18} />
              </button>
              <div className="w-px h-6 bg-gold-200 mx-1"></div>
              <button 
                onClick={() => removeFromCart(cartItem.id)} 
                className="text-red-400 hover:text-red-500 transition-colors"
              >
                <Trash2 size={18} />
              </button>
            </div>
            <button 
              onClick={() => router.push('/cart')}
              className="flex-grow font-bold text-sm tracking-wider uppercase rounded-md py-4 transition-colors shadow bg-green-600 hover:bg-green-700 text-white"
            >
              Go to Cart
            </button>
          </>
        ) : (
          <>
            {/* Quantity */}
            <div className="flex items-center justify-between border-2 border-gray-200 rounded-md px-4 py-3 w-full sm:w-32 bg-white shrink-0">
              <button onClick={() => handleQuantityChange(-1)} className="text-gray-400 hover:text-gold-600 transition-colors disabled:opacity-50" disabled={quantity <= 1 || isOutOfStock}>
                <Minus size={18} />
              </button>
              <span className={`font-bold text-lg ${isOutOfStock ? 'text-gray-400' : 'text-brandDark'}`}>{isOutOfStock ? 0 : quantity}</span>
              <button onClick={() => handleQuantityChange(1)} className="text-gray-400 hover:text-gold-600 transition-colors disabled:opacity-50" disabled={stock !== undefined && quantity >= stock || isOutOfStock}>
                <Plus size={18} />
              </button>
            </div>
            
            <button 
              onClick={handleAddToCart} 
              disabled={isOutOfStock || isAddingToCart || isInvalidVariantCombination}
              className={`flex-grow font-bold text-sm tracking-wider uppercase rounded-md py-4 transition-colors shadow ${
                isInvalidVariantCombination || isOutOfStock 
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
                  : 'bg-[#D99A2B] hover:bg-gold-600 text-white'
              }`}
            >
              {isAddingToCart ? 'Adding...' : (isInvalidVariantCombination ? 'Unavailable' : (isOutOfStock ? 'Out of Stock' : 'Add to Cart'))}
            </button>
          </>
        )}
        <button 
          onClick={handleBuyNow}
          disabled={isOutOfStock || isInvalidVariantCombination || isAddingToCart}
          className={`flex-grow font-bold text-sm tracking-wider uppercase rounded-md py-4 transition-colors border-2 ${isOutOfStock || isInvalidVariantCombination ? 'bg-gray-100 border-gray-300 text-gray-400 cursor-not-allowed' : 'bg-white hover:bg-gray-50 border-brandDark text-brandDark'}`}
        >
          {isAddingToCart ? 'Processing...' : 'Buy Now'}
        </button>
      </div>
      
      {/* Expiry Date, Stock & Shipping Line */}
      {(() => {
        const expiryDate = (currentVariant as any)?.expiryDate || (product as any).expiryDate;
        return (
          <div className="flex flex-wrap items-center gap-3 sm:gap-5 mb-8 text-sm font-medium">
            {expiryDate && (
              <span className="text-amber-800 bg-amber-50/90 border border-amber-200/80 px-2.5 py-1 rounded-md text-xs font-bold flex items-center gap-1.5 shadow-xs">
                <Calendar className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                <span>Expiry: {new Date(expiryDate).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })}</span>
              </span>
            )}
            {product.status !== 'ACTIVE' ? (
              <span className="text-red-600 flex items-center gap-1.5">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg> 
                Unavailable
              </span>
            ) : isOutOfStock ? (
              <span className="text-red-600 flex items-center gap-1.5">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg> 
                Out of Stock
              </span>
            ) : (stock !== undefined && stock <= 5) ? (
              <span className="text-orange-600 flex items-center gap-1.5">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg> 
                Only {stock} left in stock - order soon.
              </span>
            ) : (
              <span className="text-green-600 flex items-center gap-1.5">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg> 
                In Stock
              </span>
            )}
            <span className="text-gray-500 flex items-center gap-1.5"><svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg> Ships in 24 hours</span>
          </div>
        );
      })()}

      {/* Trust Badges */}
      <div className="grid grid-cols-4 gap-2 py-6 border-t border-gray-100">
        <div className="flex flex-col items-center text-center gap-2">
          <ShieldCheck className="w-6 h-6 text-gold-500" />
          <span className="text-xs text-gray-500 font-medium">100% Original<br/>Products</span>
        </div>
        <div className="flex flex-col items-center text-center gap-2">
          <Truck className="w-6 h-6 text-gold-500" />
          <span className="text-xs text-gray-500 font-medium">Free Shipping on<br/>orders above ₹{freeShippingThreshold.toLocaleString('en-IN')}</span>
        </div>
        <div className="flex flex-col items-center text-center gap-2">
          <RotateCcw className="w-6 h-6 text-gold-500" />
          <span className="text-xs text-gray-500 font-medium">Easy Returns<br/>within 7 days</span>
        </div>
        <div className="flex flex-col items-center text-center gap-2">
          <Lock className="w-6 h-6 text-gold-500" />
          <span className="text-xs text-gray-500 font-medium">Secure<br/>Payments</span>
        </div>
      </div>

      {/* Login Modal */}
      {showLoginModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm transition-opacity">
          <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-8 text-center relative animate-in fade-in zoom-in duration-300">
            <div className="w-16 h-16 bg-gold-50 text-gold-600 rounded-full flex items-center justify-center mx-auto mb-4 border border-gold-100">
              <Lock size={28} />
            </div>
            <h3 className="text-2xl font-serif-luxury font-extrabold text-gray-900 mb-2">Login Required</h3>
            <p className="text-gray-500 mb-8 text-sm">Please log in or sign up to add items to your cart and wishlist.</p>
            <div className="flex flex-col gap-3">
              <button
                onClick={() => router.push('/login')}
                className="w-full bg-brandDark hover:bg-black text-white font-bold py-3.5 rounded-xl transition-colors uppercase tracking-wider text-sm shadow-md"
              >
                Go to Login
              </button>
              <button
                onClick={() => setShowLoginModal(false)}
                className="w-full bg-gray-50 hover:bg-gray-100 border border-gray-200 text-gray-600 font-bold py-3.5 rounded-xl transition-colors uppercase tracking-wider text-sm"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
