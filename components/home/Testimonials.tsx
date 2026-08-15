'use client';

import React, { useEffect, useState, useRef } from 'react';
import { ChevronLeft, ChevronRight, Star, Quote } from 'lucide-react';

const staticReviews = [
  {
    id: '1',
    userProfile: { 
      user: { firstName: 'Rahul', lastName: 'Verma' },
      avatarUrl: 'https://randomuser.me/api/portraits/men/32.jpg'
    },
    rating: 5,
    comment: 'Sculpt & Shine products are genuine and super effective. My energy and recovery have improved a lot!',
    isVerifiedPurchase: true,
  },
  {
    id: '2',
    userProfile: { 
      user: { firstName: 'Priya', lastName: 'Mehta' },
      avatarUrl: 'https://randomuser.me/api/portraits/women/44.jpg'
    },
    rating: 5,
    comment: 'The whey protein tastes great and mixes well. Definitely my go-to brand now.',
    isVerifiedPurchase: true,
  },
  {
    id: '3',
    userProfile: { 
      user: { firstName: 'Amit', lastName: 'Singh' },
      avatarUrl: 'https://randomuser.me/api/portraits/men/46.jpg'
    },
    rating: 5,
    comment: 'Excellent quality supplements and fast delivery. Highly recommended!',
    isVerifiedPurchase: true,
  }
];

export default function Testimonials() {
  const [reviews, setReviews] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeIndex, setActiveIndex] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/reviews/featured?limit=10`);
        if (res.ok) {
          const data = await res.json();
          if (data.success && data.data && data.data.length > 0) {
            setReviews(data.data);
          } else {
            setReviews(staticReviews);
          }
        } else {
          setReviews(staticReviews);
        }
      } catch (err) {
        setReviews(staticReviews);
      } finally {
        setIsLoading(false);
      }
    };
    fetchReviews();
  }, []);

  const handleScroll = () => {
    if (!scrollRef.current) return;
    const container = scrollRef.current;
    const scrollLeft = container.scrollLeft;
    const itemWidth = container.firstElementChild ? (container.firstElementChild as HTMLElement).offsetWidth : container.clientWidth;
    const newIndex = Math.round(scrollLeft / (itemWidth || 1));
    setActiveIndex(Math.min(Math.max(0, newIndex), reviews.length - 1));
  };

  const scroll = (direction: 'left' | 'right') => {
    if (!scrollRef.current) return;
    const container = scrollRef.current;
    const scrollAmount = container.clientWidth;
    const targetScroll = direction === 'left' ? container.scrollLeft - scrollAmount : container.scrollLeft + scrollAmount;
    container.scrollTo({ left: targetScroll, behavior: 'smooth' });
  };

  const scrollToIndex = (index: number) => {
    if (!scrollRef.current) return;
    const container = scrollRef.current;
    const items = container.children;
    if (items[index]) {
      (items[index] as HTMLElement).scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
        inline: 'start'
      });
      setActiveIndex(index);
    }
  };

  if (isLoading) return null;

  return (
    <section className="py-12 lg:py-16 bg-white border-y border-cream-300">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        
        {/* Section Header with Decorative Lines */}
        <div className="text-center mb-8 sm:mb-10">
          <div className="flex items-center justify-center gap-4 max-w-md mx-auto mb-2">
            <div className="h-px bg-gradient-to-r from-transparent to-gold-600/40 flex-1" />
            <div className="w-2 h-2 rotate-45 bg-gold-600" />
            <div className="h-px bg-gradient-to-l from-transparent to-gold-600/40 flex-1" />
          </div>
          <h2 className="font-serif text-2xl sm:text-3xl lg:text-4xl font-extrabold text-gray-900 tracking-tight uppercase">
            WHAT OUR CUSTOMERS SAY
          </h2>
          <p className="text-sm text-gray-500 mt-2 max-w-lg mx-auto">
            Real stories from fitness enthusiasts and wellness seekers
          </p>
        </div>

        {/* Carousel Container */}
        <div className="relative group">
          {/* Left Scroll Button */}
          {reviews.length > 1 && (
            <button 
              onClick={() => scroll('left')}
              className="absolute -left-3 sm:-left-5 top-1/2 -translate-y-1/2 z-10 hidden sm:flex h-11 w-11 items-center justify-center rounded-full border border-cream-300 bg-white/90 backdrop-blur-sm text-gray-700 shadow-luxury transition-all hover:bg-gold-50 hover:text-gold-600 hover:scale-105 active:scale-95"
              aria-label="Previous customer review"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
          )}

          {/* Right Scroll Button */}
          {reviews.length > 1 && (
            <button 
              onClick={() => scroll('right')}
              className="absolute -right-3 sm:-right-5 top-1/2 -translate-y-1/2 z-10 hidden sm:flex h-11 w-11 items-center justify-center rounded-full border border-cream-300 bg-white/90 backdrop-blur-sm text-gray-700 shadow-luxury transition-all hover:bg-gold-50 hover:text-gold-600 hover:scale-105 active:scale-95"
              aria-label="Next customer review"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          )}

          {/* Scrollable Reviews List */}
          <div 
            ref={scrollRef}
            onScroll={handleScroll}
            className="flex overflow-x-auto hide-scrollbar gap-4 sm:gap-6 snap-x snap-mandatory py-2 touch-pan-x"
          >
            {reviews.map((review, idx) => (
              <div 
                key={review.id || idx} 
                className="w-full sm:w-[calc(50%-12px)] lg:w-[calc(33.333%-16px)] shrink-0 snap-start"
              >
                <div className="h-full rounded-2xl border border-cream-300/80 bg-white p-6 sm:p-8 shadow-luxury transition-all duration-300 hover:shadow-xl hover:border-gold-300 flex flex-col justify-between relative overflow-hidden">
                  
                  {/* Subtle Background Quote Decoration */}
                  <Quote className="absolute top-4 right-4 w-12 h-12 text-cream-200 pointer-events-none opacity-40" />

                  <div>
                    {/* Rating Stars */}
                    <div className="flex gap-1 mb-4 text-gold-500">
                      {[...Array(review.rating || 5)].map((_, i) => (
                        <Star key={i} className="h-4 w-4 fill-current text-gold-500" />
                      ))}
                    </div>

                    {/* Review Comment */}
                    <p className="text-gray-800 text-sm sm:text-base leading-relaxed mb-6 line-clamp-4">
                      &ldquo;{review.comment}&rdquo;
                    </p>
                  </div>

                  {/* Reviewer Details */}
                  <div className="flex items-center gap-3 pt-4 border-t border-cream-200">
                    <div className="h-11 w-11 overflow-hidden rounded-full bg-cream-100 border border-cream-300 flex items-center justify-center relative shrink-0">
                      {review.userProfile?.avatarUrl ? (
                        <img 
                          src={review.userProfile.avatarUrl} 
                          alt={`${review.userProfile?.user?.firstName || 'User'} avatar`}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <span className="text-sm font-bold text-gold-700">
                          {review.userProfile?.user?.firstName?.[0] || 'U'}
                          {review.userProfile?.user?.lastName?.[0] || ''}
                        </span>
                      )}
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-gray-900 line-clamp-1">
                        {review.userProfile?.user?.firstName} {review.userProfile?.user?.lastName}
                      </h4>
                      {review.isVerifiedPurchase && (
                        <span className="text-xs font-medium text-emerald-600 flex items-center gap-1">
                          ✓ Verified Buyer
                        </span>
                      )}
                    </div>
                  </div>

                </div>
              </div>
            ))}
          </div>

          {/* Mobile Pagination Dots */}
          {reviews.length > 1 && (
            <div className="flex items-center justify-center gap-2 mt-6">
              {reviews.map((_, index) => (
                <button
                  key={index}
                  onClick={() => scrollToIndex(index)}
                  className={`h-2 rounded-full transition-all duration-300 ${
                    activeIndex === index 
                      ? 'w-6 bg-gold-600' 
                      : 'w-2 bg-cream-300 hover:bg-cream-400'
                  }`}
                  aria-label={`Go to slide ${index + 1}`}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

