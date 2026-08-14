'use client';

import React, { useState, useEffect } from 'react';
import { Star, CheckCircle2, UserCircle, Edit3, X } from 'lucide-react';
import { reviewAPI, ProductReview } from '@/lib/api/review';
import { toast } from 'react-toastify';
import { useAuth } from '@/context/AuthContext';

interface ProductReviewsProps {
  productId: string;
  averageRating: number;
  reviewCount: number;
}

export default function ProductReviews({ productId, averageRating, reviewCount }: ProductReviewsProps) {
  const [reviews, setReviews] = useState<ProductReview[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();
  const [isEligible, setIsEligible] = useState(false);
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newReview, setNewReview] = useState({
    rating: 5,
    title: '',
    comment: ''
  });

  useEffect(() => {
    fetchReviews();
    if (user) {
      checkUserEligibility();
    } else {
      setIsEligible(false);
    }
  }, [productId, user]);

  const checkUserEligibility = async () => {
    try {
      const res = await reviewAPI.checkEligibility(productId);
      if (res.success) {
        setIsEligible(res.isEligible);
      }
    } catch (e) {
      console.error('Failed to check eligibility');
    }
  };

  const fetchReviews = async () => {
    try {
      setIsLoading(true);
      const res = await reviewAPI.getProductReviews(productId);
      if (res.success) {
        setReviews(res.data);
      }
    } catch (error) {
      console.error('Failed to load reviews');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast.info('Please login to write a review');
      return;
    }

    try {
      setIsSubmitting(true);
      const res = await reviewAPI.addReview({
        productId,
        rating: newReview.rating,
        title: newReview.title,
        comment: newReview.comment,
      });

      if (res.success) {
        toast.success('Review submitted successfully!');
        setIsModalOpen(false);
        setNewReview({ rating: 5, title: '', comment: '' });
        fetchReviews(); // refresh reviews list
      } else {
        toast.error(res.message || 'Failed to submit review');
      }
    } catch (error) {
      toast.error('An error occurred while submitting');
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStars = (rating: number) => {
    return Array(5).fill(0).map((_, i) => (
      <Star 
        key={i} 
        className={`w-4 h-4 md:w-5 md:h-5 ${i < rating ? 'fill-gold-400 text-gold-400' : 'text-gray-300'}`} 
      />
    ));
  };

  return (
    <div className="mt-16 md:mt-24 border-t border-gray-100 pt-16">
      <div className="flex flex-col md:flex-row md:items-start gap-12">
        
        {/* Reviews Summary Section */}
        <div className="md:w-1/3">
          <h2 className="text-2xl font-serif font-bold text-gray-900 mb-6">Customer Reviews</h2>
          
          <div className="flex items-center gap-4 mb-6">
            <div className="flex gap-1">
              {renderStars(Math.round(averageRating || 0))}
            </div>
            <span className="text-xl font-bold text-gray-900">{averageRating ? averageRating.toFixed(1) : '0.0'} out of 5</span>
          </div>
          <p className="text-gray-500 mb-8">Based on {reviewCount} {reviewCount === 1 ? 'review' : 'reviews'}</p>
          
          {isEligible && (
            <button
              onClick={() => setIsModalOpen(true)}
              className="w-full flex items-center justify-center gap-2 py-4 border-2 border-gray-900 rounded-xl font-bold text-gray-900 hover:bg-gray-900 hover:text-white transition-colors"
            >
              <Edit3 className="w-5 h-5" />
              Write a Review
            </button>
          )}
        </div>

        {/* Reviews List Section */}
        <div className="md:w-2/3 space-y-8">
          {isLoading ? (
            <div className="flex justify-center py-12">
              <div className="w-8 h-8 border-4 border-gold-200 border-t-gold-600 rounded-full animate-spin"></div>
            </div>
          ) : reviews.length === 0 ? (
            <div className="text-center py-12 bg-gray-50 rounded-2xl border border-gray-100">
              <Star className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <h3 className="text-lg font-bold text-gray-900">No reviews yet</h3>
              <p className="text-gray-500 mt-1">Be the first to review this product!</p>
            </div>
          ) : (
            <div className="space-y-8 divide-y divide-gray-100">
              {reviews.map((review) => (
                <div key={review.id} className="pt-8 first:pt-0">
                  <div className="flex items-start justify-between gap-4 mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-400 shrink-0">
                        <UserCircle className="w-6 h-6" />
                      </div>
                      <div>
                        <div className="font-semibold text-gray-900 flex items-center gap-2">
                          {review.userProfile ? `${review.userProfile.user.firstName} ${review.userProfile.user.lastName}` : 'Anonymous User'}
                          {review.isVerifiedPurchase && (
                            <span className="flex items-center gap-1 text-[10px] uppercase font-bold text-green-600 bg-green-50 px-2 py-0.5 rounded">
                              <CheckCircle2 className="w-3 h-3" /> Verified
                            </span>
                          )}
                        </div>
                        <span className="text-xs text-gray-500">{new Date(review.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                      </div>
                    </div>
                    <div className="flex gap-0.5 shrink-0">
                      {renderStars(review.rating)}
                    </div>
                  </div>
                  {review.title && <h4 className="font-bold text-gray-900 mb-2">{review.title}</h4>}
                  {review.comment && <p className="text-gray-600 leading-relaxed text-sm md:text-base">{review.comment}</p>}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Write Review Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setIsModalOpen(false)} />
          
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl relative animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <h2 className="text-xl font-serif font-bold text-gray-900">Write a Review</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:bg-gray-100 p-2 rounded-full transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleSubmitReview} className="p-6 space-y-6">
              <div className="flex flex-col items-center justify-center py-4 bg-gray-50 rounded-xl border border-gray-100">
                <label className="block text-sm font-medium text-gray-700 mb-3">Overall Rating *</label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      type="button"
                      key={star}
                      onClick={() => setNewReview({ ...newReview, rating: star })}
                      className="p-2 transition-transform hover:scale-110 focus:outline-none"
                    >
                      <Star className={`w-8 h-8 ${star <= newReview.rating ? 'fill-gold-400 text-gold-400' : 'text-gray-300'}`} />
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Review Title (Optional)</label>
                <input 
                  type="text"
                  placeholder="Summarize your experience"
                  value={newReview.title}
                  onChange={(e) => setNewReview({ ...newReview, title: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-gold-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Your Review (Optional)</label>
                <textarea 
                  placeholder="What did you like or dislike? What should others know before buying?"
                  value={newReview.comment}
                  onChange={(e) => setNewReview({ ...newReview, comment: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-gold-500 outline-none resize-none h-32"
                />
              </div>

              <div className="pt-4 flex justify-end gap-3 border-t border-gray-100">
                <button 
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-6 py-3 text-gray-600 hover:bg-gray-50 font-bold rounded-xl transition-colors text-sm"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  disabled={isSubmitting}
                  className="px-8 py-3 bg-[#111] hover:bg-black text-white rounded-xl font-bold text-sm shadow-lg transition-all disabled:opacity-50"
                >
                  {isSubmitting ? 'Submitting...' : 'Submit Review'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
