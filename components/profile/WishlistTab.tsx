'use client';

import { useState, useEffect } from 'react';
import { Heart, Trash2, ShoppingCart, ChevronLeft, ChevronRight, Loader2, AlertCircle } from 'lucide-react';
import { wishlistAPI, WishlistItem } from '@/lib/api/wishlist';
import { toast } from 'react-toastify';
import Link from 'next/link';
import { useStore } from '@/context/StoreContext';
import { getMediaUrl } from '@/lib/media';

export default function WishlistTab() {
  const { addToCart } = useStore();
  const [items, setItems] = useState<WishlistItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Pagination state
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const limit = 6;

  const fetchWishlist = async (pageNumber: number) => {
    try {
      setLoading(true);
      setError(null);
      const res = await wishlistAPI.getWishlist(pageNumber, limit);
      if (res.success) {
        setItems(res.data.data);
        setTotalPages(res.data.totalPages);
        setTotalItems(res.data.total);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load wishlist');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWishlist(page);
  }, [page]);

  const handleRemove = async (productId: string) => {
    try {
      await wishlistAPI.toggleWishlist(productId);
      toast.success('Removed from wishlist');
      // Refetch current page
      fetchWishlist(page);
    } catch (err: any) {
      toast.error(err.message || 'Failed to remove item');
    }
  };

  if (loading && items.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-8 min-h-[400px] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-gold-500 animate-spin" />
      </div>
    );
  }

  if (error && items.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-8 min-h-[400px] flex flex-col items-center justify-center text-center">
        <AlertCircle className="w-12 h-12 text-red-400 mb-4" />
        <h3 className="text-lg font-bold text-gray-900 mb-2">Oops!</h3>
        <p className="text-gray-500 mb-6">{error}</p>
        <button
          onClick={() => fetchWishlist(page)}
          className="px-6 py-2 bg-gold-600 text-white rounded-lg hover:bg-gold-700 transition-colors"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm p-4 sm:p-8">
      <div className="flex items-center justify-between mb-8 pb-4 border-b border-cream-200">
        <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
          <Heart className="w-6 h-6 text-gold-500 fill-current" />
          My Wishlist
        </h2>
        <span className="bg-cream-100 text-gold-800 text-sm font-semibold px-3 py-1 rounded-full">
          {totalItems} {totalItems === 1 ? 'Item' : 'Items'}
        </span>
      </div>

      {items.length === 0 ? (
        <div className="text-center py-16">
          <div className="w-24 h-24 bg-cream-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Heart className="w-10 h-10 text-gold-400" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">Your wishlist is empty</h3>
          <p className="text-gray-500 mb-8 max-w-sm mx-auto">
            Save items you love and keep track of them here for later.
          </p>
          <Link
            href="/"
            className="inline-flex items-center gap-2 bg-gold-600 hover:bg-gold-700 text-white font-semibold px-8 py-3 rounded-xl transition-all shadow-md hover:shadow-lg"
          >
            Start Browsing
          </Link>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {items.map((item) => {
              const product = (item.product || {}) as any;
              const unitPrice = product.unitPrice ?? product.price ?? 0;
              const discountPercentage = product.discountPercentage ?? 0;
              const finalPrice = discountPercentage > 0 
                ? unitPrice * (1 - discountPercentage / 100) 
                : unitPrice;
              const thumbnail = getMediaUrl(
                product.thumbnail || (product.images && product.images.length > 0 ? product.images[0] : null),
                '/assets/product-placeholder.png'
              );
              const title = product.title || product.name || 'Product';
              const slug = product.slug || product.id || item.productId;
              const stock = product.stock ?? 1;

              return (
                <div
                  key={item.id || item.productId}
                  className="group relative bg-white border border-cream-200 rounded-2xl overflow-hidden hover:shadow-xl hover:border-gold-300 transition-all duration-300 flex flex-col"
                >
                  {/* Remove button */}
                  <button
                    onClick={() => handleRemove(item.productId)}
                    className="absolute top-3 right-3 z-10 w-8 h-8 bg-white/90 backdrop-blur text-red-500 hover:bg-red-50 rounded-full flex items-center justify-center shadow-sm opacity-0 group-hover:opacity-100 transition-all duration-200 focus:outline-none focus:opacity-100"
                    aria-label="Remove from Wishlist"
                    title="Remove from Wishlist"
                  >
                    <Trash2 size={16} />
                  </button>

                  {/* Product Image */}
                  <Link
                    href={`/product/${slug}`}
                    className="block aspect-square bg-cream-50 p-6 relative overflow-hidden flex items-center justify-center border-b border-cream-100"
                  >
                    <img
                      src={thumbnail}
                      alt={title}
                      onError={(e: any) => {
                        e.currentTarget.onerror = null;
                        e.currentTarget.src = '/assets/product-placeholder.png';
                      }}
                      className="w-full h-full object-contain mix-blend-multiply group-hover:scale-110 transition-transform duration-500"
                    />
                    
                    {discountPercentage > 0 && (
                      <div className="absolute top-3 left-3 bg-red-500 text-white text-[10px] font-bold px-2 py-1 rounded uppercase tracking-wide z-10 shadow-sm">
                        Sale
                      </div>
                    )}
                    
                    {stock === 0 && (
                      <div className="absolute inset-0 bg-white/60 backdrop-blur-[2px] flex items-center justify-center z-10">
                        <span className="bg-gray-900 text-white text-xs font-bold px-3 py-1.5 rounded uppercase tracking-wide">
                          Out of Stock
                        </span>
                      </div>
                    )}
                  </Link>

                  {/* Product Info */}
                  <div className="p-4 flex flex-col flex-1">
                    <Link href={`/product/${slug}`} className="flex-1">
                      <h3 className="font-semibold text-gray-900 text-sm mb-1 line-clamp-2 group-hover:text-gold-700 transition-colors">
                        {title}
                      </h3>
                    </Link>

                    <div className="mt-4 flex items-center justify-between">
                      <div className="flex flex-col">
                        {discountPercentage > 0 ? (
                          <>
                            <span className="text-lg font-bold text-gray-900">
                              ₹{finalPrice.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                            </span>
                            <span className="text-xs text-gray-400 line-through">
                              ₹{unitPrice.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                            </span>
                          </>
                        ) : (
                          <span className="text-lg font-bold text-gray-900">
                            ₹{unitPrice.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                          </span>
                        )}
                      </div>

                      <button
                        onClick={async (e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          await addToCart(item.productId, undefined, 1);
                        }}
                        disabled={stock === 0}
                        className="w-10 h-10 rounded-full bg-cream-100 text-gold-700 flex items-center justify-center hover:bg-gold-600 hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-cream-100 disabled:hover:text-gold-700 active:scale-95 shadow-xs"
                        aria-label="Add to cart"
                        title="Add to cart"
                      >
                        <ShoppingCart size={18} />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="mt-12 flex items-center justify-center gap-2">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1 || loading}
                className="w-10 h-10 rounded-full border border-cream-200 flex items-center justify-center text-gray-600 hover:bg-cream-50 hover:text-gold-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft size={20} />
              </button>
              
              <div className="flex items-center gap-2 px-4">
                <span className="text-sm font-medium text-gray-900">Page {page}</span>
                <span className="text-sm text-gray-500">of {totalPages}</span>
              </div>

              <button
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages || loading}
                className="w-10 h-10 rounded-full border border-cream-200 flex items-center justify-center text-gray-600 hover:bg-cream-50 hover:text-gold-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronRight size={20} />
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
