'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Star, CheckCircle2, UserCircle, ShieldCheck, ChevronLeft, ChevronRight, X, ZoomIn, Image as ImageIcon } from 'lucide-react';
import { reviewAPI, ProductReview } from '@/lib/api/review';
import { getMediaUrl } from '@/lib/media';

interface ProductReviewsProps {
  productId: string;
  averageRating: number;
  reviewCount: number;
}

const REVIEWS_PER_PAGE = 3;

export default function ProductReviews({ productId, averageRating, reviewCount }: ProductReviewsProps) {
  const [reviews, setReviews] = useState<ProductReview[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [lightboxImage, setLightboxImage] = useState<string | null>(null);
  const [selectedFilter, setSelectedFilter] = useState<'ALL' | '5' | '4' | '3' | '2' | '1' | 'PHOTOS'>('ALL');
  const [currentPage, setCurrentPage] = useState(1);
  const reviewsContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchReviews();
  }, [productId]);

  const fetchReviews = async () => {
    try {
      setIsLoading(true);
      const res = await reviewAPI.getProductReviews(productId);
      if (res.success && Array.isArray(res.data)) {
        setReviews(res.data);
      }
    } catch (error) {
      console.error('Failed to load reviews');
    } finally {
      setIsLoading(false);
    }
  };

  // Reset to page 1 on filter change
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedFilter]);

  // Star breakdown calculation
  const totalReviews = reviews.length;
  const ratingCounts = {
    5: reviews.filter(r => r.rating === 5).length,
    4: reviews.filter(r => r.rating === 4).length,
    3: reviews.filter(r => r.rating === 3).length,
    2: reviews.filter(r => r.rating === 2).length,
    1: reviews.filter(r => r.rating === 1).length,
    photos: reviews.filter(r => Array.isArray(r.images) && r.images.length > 0).length,
  };

  // Filtered reviews
  const filteredReviews = reviews.filter(r => {
    if (selectedFilter === 'ALL') return true;
    if (selectedFilter === 'PHOTOS') return Array.isArray(r.images) && r.images.length > 0;
    return r.rating === Number(selectedFilter);
  });

  // Paginated reviews
  const totalPages = Math.ceil(filteredReviews.length / REVIEWS_PER_PAGE) || 1;
  const paginatedReviews = filteredReviews.slice(
    (currentPage - 1) * REVIEWS_PER_PAGE,
    currentPage * REVIEWS_PER_PAGE
  );

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
    if (reviewsContainerRef.current) {
      const topPos = reviewsContainerRef.current.getBoundingClientRect().top + window.scrollY - 100;
      window.scrollTo({ top: topPos, behavior: 'smooth' });
    }
  };

  const renderStars = (rating: number) => {
    return Array(5).fill(0).map((_, i) => (
      <Star 
        key={i} 
        className={`w-4 h-4 md:w-4.5 md:h-4.5 ${i < rating ? 'fill-gold-400 text-gold-400' : 'text-gray-200'}`} 
      />
    ));
  };

  return (
    <div ref={reviewsContainerRef} className="pt-2">
      <div className="flex flex-col md:flex-row md:items-start gap-12">
        
        {/* Reviews Summary & Rating Distribution */}
        <div className="md:w-1/3 space-y-6">
          <div>
            <h2 className="text-2xl font-serif font-bold text-gray-900 mb-4">Customer Reviews</h2>
            
            <div className="flex items-center gap-3 mb-2">
              <div className="flex gap-0.5">
                {renderStars(Math.round(averageRating || 0))}
              </div>
              <span className="text-xl font-extrabold text-gray-900">
                {averageRating ? averageRating.toFixed(1) : '0.0'} <span className="text-sm font-normal text-gray-500">out of 5</span>
              </span>
            </div>
            <p className="text-xs text-gray-500">Based on {totalReviews || reviewCount} verified {totalReviews === 1 ? 'review' : 'reviews'}</p>
          </div>

          {/* Rating Breakdown Bars */}
          {totalReviews > 0 && (
            <div className="space-y-2 pt-2 border-t border-gray-100">
              {[5, 4, 3, 2, 1].map((star) => {
                const count = ratingCounts[star as keyof typeof ratingCounts] || 0;
                const percentage = totalReviews > 0 ? (count / totalReviews) * 100 : 0;
                const isActive = selectedFilter === String(star);

                return (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setSelectedFilter(isActive ? 'ALL' : String(star) as any)}
                    className={`w-full flex items-center gap-2.5 py-1 px-1.5 rounded-lg text-xs transition-colors group cursor-pointer ${
                      isActive ? 'bg-amber-50 font-bold' : 'hover:bg-gray-50'
                    }`}
                  >
                    <span className="w-10 text-right text-gray-600 font-medium group-hover:text-gray-900 shrink-0">
                      {star} star
                    </span>
                    <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-amber-400 rounded-full transition-all duration-300"
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                    <span className="w-8 text-left text-[11px] text-gray-400 font-medium shrink-0">
                      {Math.round(percentage)}%
                    </span>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Reviews List & Pagination Section */}
        <div className="md:w-2/3 space-y-6">
          {/* Filter Pills */}
          {totalReviews > 0 && (
            <div className="flex flex-wrap items-center gap-2 pb-2 border-b border-gray-100">
              <button
                onClick={() => setSelectedFilter('ALL')}
                className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                  selectedFilter === 'ALL'
                    ? 'bg-gray-900 text-white shadow-2xs'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                All ({totalReviews})
              </button>

              {ratingCounts.photos > 0 && (
                <button
                  onClick={() => setSelectedFilter(selectedFilter === 'PHOTOS' ? 'ALL' : 'PHOTOS')}
                  className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                    selectedFilter === 'PHOTOS'
                      ? 'bg-amber-600 text-white shadow-2xs'
                      : 'bg-amber-50 text-amber-900 border border-amber-200 hover:bg-amber-100'
                  }`}
                >
                  <ImageIcon size={13} />
                  <span>With Photos ({ratingCounts.photos})</span>
                </button>
              )}

              {[5, 4, 3, 2, 1].map((s) => {
                const count = ratingCounts[s as keyof typeof ratingCounts] || 0;
                if (count === 0) return null;
                const isSelected = selectedFilter === String(s);
                return (
                  <button
                    key={s}
                    onClick={() => setSelectedFilter(isSelected ? 'ALL' : String(s) as any)}
                    className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-gold-600 text-white shadow-2xs'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {s} ★ ({count})
                  </button>
                );
              })}
            </div>
          )}

          {isLoading ? (
            <div className="flex justify-center py-16">
              <div className="w-8 h-8 border-3 border-gold-200 border-t-gold-600 rounded-full animate-spin"></div>
            </div>
          ) : filteredReviews.length === 0 ? (
            <div className="text-center py-16 bg-cream-50/50 rounded-2xl border border-cream-100">
              <Star className="w-10 h-10 text-gold-300 mx-auto mb-2.5" />
              <h3 className="text-base font-bold text-gray-900">
                {selectedFilter === 'ALL' ? 'No reviews yet' : 'No reviews match this filter'}
              </h3>
              <p className="text-xs text-gray-500 mt-0.5 max-w-xs mx-auto">
                {selectedFilter === 'ALL' 
                  ? 'Be the first verified customer to share your thoughts after your order is delivered!'
                  : 'Try selecting a different rating filter or view all reviews.'}
              </p>
            </div>
          ) : (
            <div className="space-y-6 divide-y divide-gray-100">
              {paginatedReviews.map((review) => {
                const userFullName = review.userProfile?.user 
                  ? `${review.userProfile.user.firstName || ''} ${review.userProfile.user.lastName || ''}`.trim() 
                  : 'Verified Athlete';
                
                const profileImg = review.userProfile?.profileImage
                  ? getMediaUrl(review.userProfile.profileImage)
                  : null;

                const userInitials = userFullName
                  .split(' ')
                  .map((n) => n[0])
                  .join('')
                  .toUpperCase()
                  .slice(0, 2) || 'SS';

                const images = Array.isArray(review.images) ? review.images.filter(Boolean) : [];

                return (
                  <div key={review.id} className="pt-6 first:pt-0">
                    <div className="flex items-start justify-between gap-4 mb-3">
                      <div className="flex items-center gap-3">
                        {/* User Avatar */}
                        <div className="w-10 h-10 rounded-full overflow-hidden border border-gray-200 bg-amber-100/60 text-amber-900 flex items-center justify-center font-bold text-xs shrink-0 shadow-2xs">
                          {profileImg ? (
                            <img 
                              src={profileImg} 
                              alt={userFullName} 
                              onError={(e: any) => {
                                e.currentTarget.style.display = 'none';
                              }}
                              className="w-full h-full object-cover" 
                            />
                          ) : (
                            <span>{userInitials}</span>
                          )}
                        </div>

                        <div>
                          <div className="font-bold text-xs sm:text-sm text-gray-900 flex items-center gap-2">
                            <span>{userFullName}</span>
                            {review.isVerifiedPurchase && (
                              <span className="inline-flex items-center gap-1 text-[10px] font-extrabold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                                <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Verified Purchase
                              </span>
                            )}
                          </div>
                          <span className="text-[11px] text-gray-400 font-medium">
                            {new Date(review.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                          </span>
                        </div>
                      </div>

                      {/* Stars */}
                      <div className="flex gap-0.5 shrink-0">
                        {renderStars(review.rating)}
                      </div>
                    </div>

                    {/* Headline */}
                    {review.title && (
                      <h4 className="font-bold text-sm text-gray-900 mb-1.5">{review.title}</h4>
                    )}

                    {/* Comment */}
                    {review.comment && (
                      <p className="text-gray-600 leading-relaxed text-xs sm:text-sm mb-3">
                        {review.comment}
                      </p>
                    )}

                    {/* Review Uploaded Photos (with Carousel & Chevrons) */}
                    {images.length > 0 && (
                      <ReviewImageGallery 
                        images={images} 
                        onSelectImage={(url) => setLightboxImage(url)} 
                      />
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* Pagination Toolbar */}
          {!isLoading && filteredReviews.length > REVIEWS_PER_PAGE && (
            <div className="mt-8 pt-4 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="text-xs text-gray-500 font-medium">
                Showing <span className="font-bold text-gray-900">{(currentPage - 1) * REVIEWS_PER_PAGE + 1}</span> to{' '}
                <span className="font-bold text-gray-900">
                  {Math.min(currentPage * REVIEWS_PER_PAGE, filteredReviews.length)}
                </span>{' '}
                of <span className="font-bold text-gray-900">{filteredReviews.length}</span> reviews
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className={`flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold border transition-all ${
                    currentPage === 1
                      ? 'border-gray-200 text-gray-400 cursor-not-allowed bg-gray-50'
                      : 'border-gray-300 text-gray-700 bg-white hover:bg-gold-50 hover:border-gold-400 cursor-pointer shadow-2xs'
                  }`}
                >
                  <ChevronLeft size={14} />
                  Previous
                </button>

                {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
                  <button
                    key={pageNum}
                    onClick={() => handlePageChange(pageNum)}
                    className={`w-7 h-7 rounded-xl text-xs font-extrabold transition-all flex items-center justify-center ${
                      currentPage === pageNum
                        ? 'bg-gold-600 text-white shadow-xs'
                        : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 cursor-pointer'
                    }`}
                  >
                    {pageNum}
                  </button>
                ))}

                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className={`flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold border transition-all ${
                    currentPage === totalPages
                      ? 'border-gray-200 text-gray-400 cursor-not-allowed bg-gray-50'
                      : 'border-gray-300 text-gray-700 bg-white hover:bg-gold-50 hover:border-gold-400 cursor-pointer shadow-2xs'
                  }`}
                >
                  Next
                  <ChevronRight size={14} />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Fullscreen Photo Lightbox Modal */}
      {lightboxImage && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="relative max-w-3xl max-h-[85vh] w-full flex items-center justify-center">
            <button
              onClick={() => setLightboxImage(null)}
              className="absolute -top-12 right-0 text-white hover:text-gray-300 p-2 rounded-full transition-colors cursor-pointer"
            >
              <X size={24} />
            </button>
            <img
              src={getMediaUrl(lightboxImage)}
              alt="Customer Review Photo"
              className="max-w-full max-h-[80vh] object-contain rounded-xl shadow-2xl bg-black"
            />
          </div>
        </div>
      )}
    </div>
  );
}

// Sub-component for Review Photos Carousel
function ReviewImageGallery({ images, onSelectImage }: { images: string[]; onSelectImage: (url: string) => void }) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const checkScroll = () => {
    const el = scrollContainerRef.current;
    if (el) {
      setCanScrollLeft(el.scrollLeft > 5);
      setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 5);
    }
  };

  useEffect(() => {
    checkScroll();
    window.addEventListener('resize', checkScroll);
    return () => window.removeEventListener('resize', checkScroll);
  }, [images]);

  const handleScroll = (direction: 'left' | 'right') => {
    const el = scrollContainerRef.current;
    if (el) {
      const scrollAmount = direction === 'left' ? -180 : 180;
      el.scrollBy({ left: scrollAmount, behavior: 'smooth' });
      setTimeout(checkScroll, 300);
    }
  };

  return (
    <div className="relative group/gallery mt-2">
      {/* Left Chevron */}
      {images.length > 3 && canScrollLeft && (
        <button
          onClick={() => handleScroll('left')}
          className="absolute -left-3 top-1/2 -translate-y-1/2 z-10 w-7 h-7 bg-white/95 hover:bg-white text-gray-800 rounded-full shadow-md flex items-center justify-center transition-all cursor-pointer border border-gray-200"
          aria-label="Previous photos"
        >
          <ChevronLeft size={16} />
        </button>
      )}

      {/* Images List */}
      <div 
        ref={scrollContainerRef}
        onScroll={checkScroll}
        className="flex items-center gap-2.5 overflow-x-auto scrollbar-none py-1 px-0.5"
      >
        {images.map((imgUrl, idx) => (
          <button
            key={idx}
            onClick={() => onSelectImage(imgUrl)}
            className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-xl overflow-hidden border border-gray-200/90 hover:border-gold-500 bg-gray-50 flex-shrink-0 group/img transition-all cursor-pointer shadow-2xs hover:shadow-md"
            title="Click to view full photo"
          >
            <img
              src={getMediaUrl(imgUrl, '/assets/product-placeholder.png')}
              alt={`Review attachment ${idx + 1}`}
              className="w-full h-full object-cover group-hover/img:scale-105 transition-transform duration-300"
            />
            <div className="absolute inset-0 bg-black/30 opacity-0 group-hover/img:opacity-100 flex items-center justify-center transition-opacity text-white">
              <ZoomIn size={16} />
            </div>
          </button>
        ))}
      </div>

      {/* Right Chevron */}
      {images.length > 3 && canScrollRight && (
        <button
          onClick={() => handleScroll('right')}
          className="absolute -right-3 top-1/2 -translate-y-1/2 z-10 w-7 h-7 bg-white/95 hover:bg-white text-gray-800 rounded-full shadow-md flex items-center justify-center transition-all cursor-pointer border border-gray-200"
          aria-label="Next photos"
        >
          <ChevronRight size={16} />
        </button>
      )}
    </div>
  );
}
