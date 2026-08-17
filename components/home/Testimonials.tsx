'use client';

import React, { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import { ChevronLeft, ChevronRight, Star, Quote, CheckCircle2, Sparkles, Image as ImageIcon } from 'lucide-react';
import { getMediaUrl } from '@/lib/media';

const FALLBACK_TESTIMONIALS = [
  {
    id: 'mock-1',
    userProfile: {
      user: { firstName: 'Rahul', lastName: 'Verma' },
      profileImage: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80'
    },
    rating: 5,
    title: 'Unbelievable Results & Taste',
    comment: 'Sculpt & Shine products are 100% genuine and super effective. My muscle recovery and workout intensity have leveled up noticeably!',
    isVerifiedPurchase: true,
    product: { title: 'Dymatize ISO 100 Hydrolyzed Whey' },
  },
  {
    id: 'mock-2',
    userProfile: {
      user: { firstName: 'Priya', lastName: 'Mehta' },
      profileImage: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=200&q=80'
    },
    rating: 5,
    title: 'Fast Delivery & Authentic Batch',
    comment: 'The authentic seal verification worked seamlessly. Tastes delicious, no digestive discomfort, and super smooth mixability.',
    isVerifiedPurchase: true,
    product: { title: 'Optimum Nutrition Gold Standard 100%' },
  },
  {
    id: 'mock-3',
    userProfile: {
      user: { firstName: 'Amit', lastName: 'Singh' },
      profileImage: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80'
    },
    rating: 5,
    title: 'Trusted Everyday Performance',
    comment: 'Best customer service and genuine laboratory-tested formulation. Ordered twice already and arrived in pristine condition.',
    isVerifiedPurchase: true,
    product: { title: 'MuscleTech NitroTech Ripped' },
  }
];

export default function Testimonials() {
  const [reviews, setReviews] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);

  const checkScrollPosition = () => {
    const el = scrollRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 10);
    setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 10);
  };

  const scroll = (direction: 'left' | 'right') => {
    const el = scrollRef.current;
    if (!el) return;
    const scrollAmount = el.clientWidth * 0.75;
    if (direction === 'left') {
      el.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
    } else {
      if (el.scrollLeft + el.clientWidth >= el.scrollWidth - 10) {
        el.scrollTo({ left: 0, behavior: 'smooth' });
      } else {
        el.scrollBy({ left: scrollAmount, behavior: 'smooth' });
      }
    }
  };

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    checkScrollPosition();
    el.addEventListener('scroll', checkScrollPosition, { passive: true });
    window.addEventListener('resize', checkScrollPosition);
    return () => {
      el.removeEventListener('scroll', checkScrollPosition);
      window.removeEventListener('resize', checkScrollPosition);
    };
  }, [reviews]);

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/reviews/featured?limit=12`);
        if (res.ok) {
          const data = await res.json();
          if (data.success && Array.isArray(data.data) && data.data.length > 0) {
            // Real reviews exist from live database
            setReviews(data.data);
          } else {
            // Only fallback to mock data if 0 reviews exist
            setReviews(FALLBACK_TESTIMONIALS);
          }
        } else {
          setReviews(FALLBACK_TESTIMONIALS);
        }
      } catch (err) {
        console.error('Failed to fetch testimonials', err);
        setReviews(FALLBACK_TESTIMONIALS);
      } finally {
        setIsLoading(false);
      }
    };
    fetchReviews();
  }, []);

  if (isLoading && reviews.length === 0) return null;

  return (
    <section className="py-14 sm:py-18 bg-white border-y border-cream-300 relative overflow-hidden">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">

        {/* Header row with Title and Pill Controls */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8 sm:mb-10">
          <div>
            <div className="flex items-center gap-1.5 text-xs font-black uppercase tracking-widest text-amber-700 mb-1.5">
              <Sparkles size={14} className="text-amber-500 fill-amber-500" />
              <span>Real Customer Stories</span>
            </div>
            <h2 className="font-serif text-2xl sm:text-3xl lg:text-4xl font-extrabold text-gray-950 tracking-tight uppercase">
              WHAT OUR CUSTOMERS SAY
            </h2>
            <p className="text-xs sm:text-sm text-gray-600 font-medium mt-1">
              Verified experiences and ratings from athletes and wellness seekers across India
            </p>
          </div>

          {/* Pill-Style Navigation Controls */}
          {reviews.length > 1 && (
            <div className="flex items-center gap-1.5 bg-cream-100 p-1 rounded-full border border-cream-300 shadow-2xs self-start sm:self-auto shrink-0">
              <button
                onClick={() => scroll('left')}
                disabled={!canScrollLeft}
                className={`p-2 rounded-full transition-all flex items-center justify-center ${canScrollLeft
                    ? 'bg-white hover:bg-gold-500 hover:text-white text-gray-800 shadow-sm cursor-pointer active:scale-95'
                    : 'opacity-35 text-gray-400 cursor-not-allowed'
                  }`}
                aria-label="Previous customer review"
              >
                <ChevronLeft size={16} />
              </button>
              <button
                onClick={() => scroll('right')}
                disabled={!canScrollRight}
                className={`p-2 rounded-full transition-all flex items-center justify-center ${canScrollRight
                    ? 'bg-white hover:bg-gold-500 hover:text-white text-gray-800 shadow-sm cursor-pointer active:scale-95'
                    : 'opacity-35 text-gray-400 cursor-not-allowed'
                  }`}
                aria-label="Next customer review"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          )}
        </div>

        {/* Carousel Container */}
        <div className="relative">
          {/* Scrollable Reviews List */}
          <div
            ref={scrollRef}
            className="flex overflow-x-auto hide-scrollbar gap-5 sm:gap-6 snap-x snap-mandatory pb-4 pt-1 touch-pan-x"
          >
            {reviews.map((review, idx) => {
              const fullName = review.userProfile?.user
                ? `${review.userProfile.user.firstName || ''} ${review.userProfile.user.lastName || ''}`.trim()
                : (review.userProfile?.name || 'Verified Customer');

              const rawImg = review.userProfile?.profileImage || review.userProfile?.avatarUrl;
              const profileImg = rawImg ? getMediaUrl(rawImg) : null;

              const initials = fullName
                .split(' ')
                .map((n: string) => n[0])
                .join('')
                .toUpperCase()
                .slice(0, 2) || 'SS';

              const reviewPhotos = Array.isArray(review.images) ? review.images.filter(Boolean) : [];

              return (
                <div
                  key={review.id || idx}
                  className="w-[300px] sm:w-[360px] lg:w-[calc(33.333%-1rem)] shrink-0 snap-start"
                >
                  <div className="h-full rounded-3xl border border-cream-200/90 bg-gradient-to-b from-white to-cream-50/40 p-6 sm:p-7 shadow-luxury transition-all duration-300 hover:shadow-xl hover:border-gold-300/80 hover:-translate-y-1 flex flex-col justify-between relative overflow-hidden group">

                    <div>
                      {/* Rating Stars & Verified Buyer Badge Header */}
                      <div className="flex items-center justify-between gap-2 mb-4">
                        <div className="flex gap-0.5 text-gold-400">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`h-4 w-4 ${i < (review.rating || 5) ? 'fill-gold-400 text-gold-400' : 'text-gray-200'}`}
                            />
                          ))}
                        </div>

                        {review.isVerifiedPurchase && (
                          <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-wider text-emerald-800 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full shrink-0 shadow-2xs">
                            <CheckCircle2 size={11} className="text-emerald-600 shrink-0" />
                            <span>Verified Buyer</span>
                          </span>
                        )}
                      </div>

                      {/* Headline / Title */}
                      {review.title && (
                        <h4 className="font-bold text-sm sm:text-base text-gray-900 mb-2 leading-snug line-clamp-1">
                          {review.title}
                        </h4>
                      )}

                      {/* Review Comment */}
                      <p className="text-gray-700 text-xs sm:text-sm leading-relaxed mb-4 line-clamp-5 font-normal">
                        &ldquo;{review.comment}&rdquo;
                      </p>
                    </div>

                    {/* Reviewer Details Footer */}
                    <div className="flex items-center gap-3 pt-4 border-t border-cream-200/80 mt-auto">
                      {/* Avatar with Gold Ring Accent */}
                      <div className="h-11 w-11 rounded-full overflow-hidden bg-amber-100 text-amber-900 border-2 border-amber-200/80 shadow-2xs flex items-center justify-center relative shrink-0">
                        {profileImg ? (
                          <img
                            src={profileImg}
                            alt={fullName}
                            onError={(e: any) => {
                              e.currentTarget.style.display = 'none';
                            }}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <span className="text-xs font-black tracking-wider text-amber-800">
                            {initials}
                          </span>
                        )}
                      </div>

                      <div className="min-w-0 flex-1">
                        <h4 className="text-xs sm:text-sm font-bold text-gray-900 truncate">
                          {fullName}
                        </h4>
                        {review.product?.title ? (
                          <p className="text-[11px] text-amber-700/90 font-medium truncate">
                            Verified on {review.product.title}
                          </p>
                        ) : (
                          <span className="text-[11px] text-gray-400 font-medium">
                            {new Date(review.createdAt || Date.now()).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                          </span>
                        )}
                      </div>
                    </div>

                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>
    </section>
  );
}


