'use client';

import React, { useEffect, useState, useRef } from 'react';
import { useStore } from '@/context/StoreContext';
import { productAPI, Product } from '@/lib/api/product';
import Link from 'next/link';
import Image from 'next/image';
import { Loader2, ArrowRight } from 'lucide-react';
import { useRouter } from 'next/navigation';

export const SearchOverlay: React.FC = () => {
  const { isSearchOpen, closeSearch, searchQuery, setSearchQuery } = useStore();
  const [suggestions, setSuggestions] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const router = useRouter();
  const overlayRef = useRef<HTMLDivElement>(null);

  // Close when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent | TouchEvent) => {
      const target = e.target as Element | null;
      if (
        target?.closest('[data-search-overlay]') ||
        target?.closest('form')
      ) {
        return;
      }
      closeSearch();
    };
    if (isSearchOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('touchstart', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, [isSearchOpen, closeSearch]);

  // Debounce search query and reset page
  useEffect(() => {
    setPage(1);
    const timer = setTimeout(() => {
      setDebouncedQuery(searchQuery);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Fetch paginated results
  useEffect(() => {
    if (!debouncedQuery.trim()) {
      setSuggestions([]);
      setHasMore(false);
      return;
    }

    const fetchProducts = async () => {
      if (page === 1) setLoading(true);
      else setLoadingMore(true);

      try {
        const res = await productAPI.getProducts({ search: debouncedQuery, limit: 10, page });
        if (res.success) {
          if (page === 1) {
            setSuggestions(res.data.products);
          } else {
            setSuggestions(prev => [...prev, ...res.data.products]);
          }
          setHasMore(res.data.pagination.page < res.data.pagination.totalPages);
        }
      } catch (error) {
        console.error('Failed to fetch search suggestions', error);
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    };

    fetchProducts();
  }, [debouncedQuery, page]);

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
    if (scrollHeight - scrollTop <= clientHeight * 1.5 && hasMore && !loading && !loadingMore) {
      setPage(p => p + 1);
    }
  };

  if (!isSearchOpen) return null;

  return (
    <div 
      ref={overlayRef}
      data-search-overlay="true"
      onScroll={handleScroll}
      className="absolute top-full mt-1.5 left-4 right-4 md:left-0 md:right-auto md:w-full bg-white border border-cream-300 shadow-[0_8px_30px_rgba(0,0,0,0.15)] rounded-2xl z-50 max-h-[70vh] overflow-y-auto overflow-x-hidden"
    >
      <div className="p-4 sm:p-5">
        
        {/* Header */}
        <div className="flex justify-between items-center mb-2 pb-2">
          <h3 className="text-xs font-extrabold text-gray-500 tracking-wider uppercase">Products</h3>
          {searchQuery.trim() && (
            <button 
              onClick={() => {
                closeSearch();
                router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
              }}
              className="text-[11px] sm:text-xs text-gray-500 hover:text-gold-700 font-medium flex items-center gap-1 group"
            >
              View all results for "{searchQuery}"
              <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
            </button>
          )}
        </div>

        {/* Product List */}
        {loading ? (
          <div className="flex items-center justify-center py-10 text-gold-600">
            <Loader2 className="animate-spin" size={24} />
          </div>
        ) : suggestions.length > 0 ? (
          <div className="flex flex-col">
            {suggestions.map((product, idx) => (
              <Link 
                key={product.id} 
                href={`/product/${product.slug}`}
                onClick={closeSearch}
                className={`flex items-center gap-4 py-3 group hover:bg-cream-50 transition-colors -mx-4 px-4 sm:-mx-5 sm:px-5 ${idx !== suggestions.length - 1 ? 'border-b border-cream-100' : ''}`}
              >
                <div className="relative w-14 h-14 bg-cream-100 rounded-lg overflow-hidden shrink-0 flex items-center justify-center">
                  <img
                    src={product.images && product.images.length > 0 && product.images[0] ? product.images[0] : '/assets/product-placeholder.png'}
                    alt={product.title}
                    onError={(e: any) => {
                      e.currentTarget.onerror = null;
                      e.currentTarget.src = '/assets/product-placeholder.png';
                    }}
                    className="w-full h-full object-contain p-1"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-bold text-gray-900 truncate group-hover:text-gold-700 transition-colors">
                    {product.title}
                  </h4>
                  <div className="flex items-center text-[11px] sm:text-xs text-gray-500 mt-0.5 gap-1.5">
                    <span>{product.category?.name || 'Supplement'}</span>
                    {product.brand && (
                      <>
                        <span className="w-1 h-1 rounded-full bg-cream-300"></span>
                        <span>{product.brand.name}</span>
                      </>
                    )}
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-sm font-extrabold text-gray-900">
                    ₹{product.unitPrice.toLocaleString('en-IN')}
                  </p>
                </div>
              </Link>
            ))}
            {loadingMore && (
              <div className="flex items-center justify-center py-4 text-gold-600">
                <Loader2 className="animate-spin" size={20} />
              </div>
            )}
          </div>
        ) : searchQuery.trim() ? (
          <div className="py-8 text-center text-gray-500 text-sm font-medium">
            No products found for "{searchQuery}"
          </div>
        ) : (
          <div className="py-8 text-center text-gray-500 text-sm font-medium">
            Start typing to see product suggestions...
          </div>
        )}

        {/* Categories Section */}
        <div className="mt-4 pt-4 border-t border-cream-200">
          <h3 className="text-xs font-extrabold text-gray-500 tracking-wider uppercase mb-3">
            Search Categories
          </h3>
          <div className="flex flex-wrap gap-2">
            {['Whey Protein', 'Protein', 'Isolate', 'Supplements'].map(tag => (
              <button
                key={tag}
                onClick={() => {
                  setSearchQuery(tag);
                  router.push(`/search?q=${encodeURIComponent(tag)}`);
                  closeSearch();
                }}
                className="px-4 py-1.5 rounded-full bg-cream-100 text-gray-700 text-[11px] sm:text-xs font-bold hover:bg-gold-600 hover:text-white transition-colors border border-transparent hover:border-gold-600"
              >
                {tag}
              </button>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
};
