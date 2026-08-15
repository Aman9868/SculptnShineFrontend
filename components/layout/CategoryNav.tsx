'use client';

import React, { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import { Scissors, Package, Droplets, Sparkles, Leaf, LayoutGrid, ChevronLeft, ChevronRight } from 'lucide-react';
import { categoryAPI, Category } from '@/lib/api/category';

const getCategoryIcon = (slug: string = '') => {
  const s = slug.toLowerCase();
  if (s.includes('protein') || s.includes('supplement') || s.includes('fitness')) return <Package size={18} />;
  if (s.includes('skin')) return <Droplets size={18} />;
  if (s.includes('hair') || s.includes('salon')) return <Scissors size={18} />;
  if (s.includes('beauty') || s.includes('cosmetic')) return <Sparkles size={18} />;
  if (s.includes('wellness') || s.includes('health')) return <Leaf size={18} />;
  return <LayoutGrid size={18} />;
};

export const CategoryNav: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const scrollContainerRef = useRef<HTMLUListElement>(null);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const scrollAmount = 250;
      scrollContainerRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await categoryAPI.getCategories();
        if (res.success && res.data.categories) {
          setCategories(res.data.categories);
        }
      } catch (error) {
        console.error('Failed to fetch categories:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchCategories();
  }, []);

  return (
    <nav className="bg-cream-100 border-b border-cream-300/60 shadow-xs h-[45px] sm:h-[53px]">
      <div className="max-w-7xl mx-auto px-2 sm:px-4 h-full relative group">
        
        {/* Left Scroll Button (Hidden on Mobile, Visible on Desktop Hover) */}
        <button 
          onClick={() => scroll('left')}
          className="absolute left-1 top-1/2 -translate-y-1/2 z-10 bg-white/90 backdrop-blur-sm shadow-[0_2px_8px_rgba(0,0,0,0.1)] border border-cream-300 rounded-full w-8 h-8 hidden md:group-hover:flex items-center justify-center text-gray-500 hover:text-gold-600 hover:bg-cream-100 transition-all"
          aria-label="Scroll left"
        >
          <ChevronLeft size={18} className="mr-0.5" />
        </button>

        <ul 
          ref={scrollContainerRef}
          className="grid grid-flow-col auto-cols-[max-content] md:auto-cols-[25%] h-full overflow-x-auto hide-scrollbar items-center gap-4 md:gap-0"
        >
          {loading ? (
            // Skeleton loader
            Array.from({ length: 5 }).map((_, i) => (
              <li key={i} className="shrink-0 flex items-center gap-2 py-1 px-3">
                <div className="w-4 h-4 rounded-full bg-cream-200 animate-pulse" />
                <div className="w-20 h-4 rounded bg-cream-200 animate-pulse" />
              </li>
            ))
          ) : (
            categories.map((cat) => {
              const icon = getCategoryIcon(cat.slug);
              const displayName = cat.name;

              return (
                <li key={cat.id || cat.slug} className="flex items-center justify-center h-full w-full min-w-0 px-2">
                  <Link
                    href={`/category/${cat.slug}`}
                    className="flex items-center gap-2 text-sm font-semibold text-gray-800 hover:text-gold-700 transition-colors py-1.5 px-2 rounded-lg hover:bg-cream-200/80 group max-w-full"
                  >
                    <span className="text-gold-600 group-hover:scale-110 transition-transform shrink-0">
                      {icon}
                    </span>
                    <span className="truncate">{displayName}</span>
                  </Link>
                </li>
              );
            })
          )}
        </ul>

        {/* Right Scroll Button */}
        <button 
          onClick={() => scroll('right')}
          className="absolute right-1 top-1/2 -translate-y-1/2 z-10 bg-white/90 backdrop-blur-sm shadow-[0_2px_8px_rgba(0,0,0,0.1)] border border-cream-300 rounded-full w-8 h-8 hidden md:group-hover:flex items-center justify-center text-gray-500 hover:text-gold-600 hover:bg-cream-100 transition-all"
          aria-label="Scroll right"
        >
          <ChevronRight size={18} className="ml-0.5" />
        </button>
      </div>
    </nav>
  );
};
