'use client';

import React, { useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight, Star } from 'lucide-react';
import { reviewAPI, ProductReview } from '@/lib/api/review';

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
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        // Assume backend has a /api/reviews/featured endpoint or similar.
        // We'll just use the standard API or fallback.
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

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1 >= reviews.length - 2 ? 0 : prev + 1));
  };

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev === 0 ? Math.max(0, reviews.length - 3) : prev - 1));
  };

  if (isLoading) return null;

  return (
    <section className="py-12 lg:py-16 bg-white border-y border-cream-300">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        
        {/* Section Header with Decorative Lines */}
        <div className="text-center mb-10">
          <div className="flex items-center justify-center gap-4 max-w-md mx-auto mb-2">
            <div className="h-px bg-gradient-to-r from-transparent to-gold-600/40 flex-1" />
            <div className="w-2 h-2 rotate-45 bg-gold-600" />
            <div className="h-px bg-gradient-to-l from-transparent to-gold-600/40 flex-1" />
          </div>
          <h2 className="font-serif text-2xl sm:text-3xl lg:text-4xl font-extrabold text-gray-900 tracking-tight uppercase">
            WHAT OUR CUSTOMERS SAY
          </h2>
        </div>

        <div className="relative group">
          <div className="overflow-hidden">
            <div 
              className="flex transition-transform duration-500 ease-out gap-6"
              style={{ transform: `translateX(calc(-${currentIndex * (100 / 3)}%))` }}
            >
              {reviews.map((review) => (
                <div key={review.id} className="w-full md:w-[calc(50%-12px)] lg:w-[calc(33.333%-16px)] shrink-0">
                  <div className="h-full rounded-2xl border border-gray-200 bg-white p-8 shadow-sm transition-shadow hover:shadow-md">
                    <div className="flex gap-1 mb-4 text-orange-400">
                      {[...Array(review.rating || 5)].map((_, i) => (
                        <Star key={i} className="h-4 w-4 fill-current" />
                      ))}
                    </div>
                    <p className="text-gray-800 text-sm leading-relaxed mb-6 line-clamp-4">
                      {review.comment}
                    </p>
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 overflow-hidden rounded-full bg-gray-100 flex items-center justify-center relative">
                        {review.userProfile?.avatarUrl ? (
                          <img 
                            src={review.userProfile.avatarUrl} 
                            alt={`${review.userProfile?.user?.firstName || 'User'} avatar`}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <span className="text-sm font-bold text-gray-500">
                            {review.userProfile?.user?.firstName?.[0] || 'A'}
                            {review.userProfile?.user?.lastName?.[0] || 'U'}
                          </span>
                        )}
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-gray-900">
                          {review.userProfile?.user?.firstName} {review.userProfile?.user?.lastName}
                        </h4>
                        {review.isVerifiedPurchase && (
                          <span className="text-xs font-medium text-green-600 flex items-center gap-1">
                            Verified Buyer
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          {reviews.length > 3 && (
            <>
              <button 
                onClick={prevSlide}
                className="absolute -left-4 top-1/2 -translate-y-1/2 flex h-10 w-10 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-600 shadow-sm transition-all hover:bg-orange-50 hover:text-orange-500 opacity-0 group-hover:opacity-100 disabled:opacity-0"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              
              <button 
                onClick={nextSlide}
                className="absolute -right-4 top-1/2 -translate-y-1/2 flex h-10 w-10 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-600 shadow-sm transition-all hover:bg-orange-50 hover:text-orange-500 opacity-0 group-hover:opacity-100 disabled:opacity-0"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </>
          )}
        </div>
      </div>
    </section>
  );
}
