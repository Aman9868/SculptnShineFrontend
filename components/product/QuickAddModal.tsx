'use client';

import React, { useState, useEffect } from 'react';
import { X, Minus, Plus, ShoppingCart, Loader2, Check, Calendar, AlertCircle } from 'lucide-react';
import { Product, ProductVariant } from '@/lib/api/product';
import { useStore } from '@/context/StoreContext';

interface QuickAddModalProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
}

export const QuickAddModal: React.FC<QuickAddModalProps> = ({ product, isOpen, onClose }) => {
  const { addToCart } = useStore();
  const [selectedFlavor, setSelectedFlavor] = useState<string>('');
  const [selectedSize, setSelectedSize] = useState<string>('');
  const [quantity, setQuantity] = useState<number>(1);
  const [loading, setLoading] = useState<boolean>(false);
  const [added, setAdded] = useState<boolean>(false);

  // Extract unique flavors and weights from product variants
  const variants = product?.variants || [];
  const flavors = Array.from(new Set(variants.map((v) => v.flavor).filter(Boolean))) as string[];
  const sizes = Array.from(new Set(variants.map((v) => v.weight).filter(Boolean))) as string[];

  useEffect(() => {
    if (product) {
      // Prioritize in-stock variant on open
      const inStockDefault = variants.find((v) => v.isDefault && (v.stock || 0) > 0) ||
                             variants.find((v) => (v.stock || 0) > 0) ||
                             variants[0];
      setSelectedFlavor(inStockDefault?.flavor || flavors[0] || '');
      setSelectedSize(inStockDefault?.weight || sizes[0] || '');
      setQuantity(1);
      setAdded(false);
      setLoading(false);
    }
  }, [product, isOpen]);

  if (!isOpen || !product) return null;

  const hasVariants = variants.length > 0;

  // Find all matching batches for the chosen flavor and size
  const matchingBatches = hasVariants
    ? variants.filter((v) => {
        const matchFlavor = flavors.length === 0 || v.flavor === selectedFlavor;
        const matchSize = sizes.length === 0 || v.weight === selectedSize;
        return matchFlavor && matchSize;
      })
    : [];

  const isInvalidCombination = hasVariants && matchingBatches.length === 0;

  // Pick active batch with earliest expiry date (FEFO)
  const activeBatchesSorted = matchingBatches
    .filter((v) => (v.stock || 0) > 0)
    .sort((a, b) => {
      const timeA = a.expiryDate ? new Date(a.expiryDate).getTime() : Infinity;
      const timeB = b.expiryDate ? new Date(b.expiryDate).getTime() : Infinity;
      return timeA - timeB;
    });

  const currentVariant = activeBatchesSorted[0] || matchingBatches[0] || undefined;

  // Calculate aggregated stock for this combination
  const stock = matchingBatches.length > 0
    ? matchingBatches.reduce((sum, v) => sum + (v.stock || 0), 0)
    : (hasVariants ? 0 : (product.stock || 0));

  const isOutOfStock = !isInvalidCombination && stock === 0;
  const isProductInactive = product.status !== 'ACTIVE';
  const isActionDisabled = isInvalidCombination || isOutOfStock || isProductInactive || loading;

  const unitPrice = currentVariant ? currentVariant.unitPrice : product.unitPrice;
  const discountPercent = currentVariant ? (currentVariant.discountPercentage || 0) : (product.discountPercentage || 0);
  const finalUnitPrice = discountPercent > 0 ? unitPrice * (1 - discountPercent / 100) : unitPrice;

  const activeExpiryDate = currentVariant?.expiryDate || product.expiryDate;

  const imageUrl = (currentVariant?.images && currentVariant.images.length > 0 ? currentVariant.images[0] : null) ||
    (product.images && product.images.length > 0 ? product.images[0] : '/assets/images/category-placeholder.jpg');

  const handleAddToCart = async () => {
    if (isActionDisabled || !currentVariant && hasVariants) return;
    setLoading(true);
    try {
      const res = await addToCart(product.id, currentVariant?.id, quantity);
      if (res.success) {
        setAdded(true);
        setTimeout(() => {
          onClose();
        }, 800);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity animate-in fade-in duration-200"
        onClick={onClose}
      />

      {/* Modal Dialog */}
      <div className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full p-5 sm:p-6 z-10 border border-gray-100 animate-in zoom-in-95 duration-200 overflow-hidden">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-full text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors cursor-pointer"
          aria-label="Close modal"
        >
          <X size={20} />
        </button>

        {/* Product Info Header */}
        <div className="flex gap-4 items-start mb-5 pb-4 border-b border-gray-100 pr-6">
          <div className="w-20 h-20 bg-gray-50 rounded-xl overflow-hidden shrink-0 border border-gray-100 p-1 flex items-center justify-center">
            <img 
              src={imageUrl} 
              alt={product.title}
              className="max-h-full max-w-full object-contain mix-blend-multiply"
            />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-[11px] font-bold text-gold-700 uppercase tracking-wider mb-0.5">
              {product.brand?.name || 'Sculpt & Shine'}
            </p>
            <h3 className="text-sm sm:text-base font-bold text-gray-900 line-clamp-2 leading-snug">
              {product.title}
            </h3>
            
            <div className="flex items-baseline gap-2 mt-1.5">
              <span className="text-lg font-extrabold text-brandDark">
                ₹{finalUnitPrice.toLocaleString()}
              </span>
              {discountPercent > 0 && (
                <>
                  <span className="text-xs text-gray-400 line-through">
                    ₹{unitPrice.toLocaleString()}
                  </span>
                  <span className="text-[10px] font-bold bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded">
                    {discountPercent}% OFF
                  </span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Variant Selectors */}
        <div className="space-y-4 max-h-[45vh] overflow-y-auto pr-1">
          {/* Flavor options */}
          {flavors.length > 0 && (
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                Flavor: <span className="text-gold-700 font-semibold normal-case">{selectedFlavor}</span>
              </label>
              <div className="flex flex-wrap gap-2">
                {flavors.map((flavor) => {
                  const isSelected = flavor === selectedFlavor;
                  // Check if this flavor has any valid variant matching current size
                  const hasStockInFlavor = variants.some((v) => v.flavor === flavor && (v.stock || 0) > 0);
                  
                  return (
                    <button
                      key={flavor}
                      type="button"
                      onClick={() => setSelectedFlavor(flavor)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-gold-600 text-white border-gold-600 shadow-xs'
                          : hasStockInFlavor
                          ? 'bg-white text-gray-700 border-gray-200 hover:border-gold-400 hover:bg-gold-50/50'
                          : 'bg-gray-50 text-gray-400 border-gray-200'
                      }`}
                    >
                      {flavor}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Size / Weight options */}
          {sizes.length > 0 && (
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                Weight / Size: <span className="text-gold-700 font-semibold normal-case">{selectedSize}</span>
              </label>
              <div className="flex flex-wrap gap-2">
                {sizes.map((size) => {
                  const isSelected = size === selectedSize;
                  // Check if this size exists in selected flavor
                  const existsForFlavor = variants.some((v) => (flavors.length === 0 || v.flavor === selectedFlavor) && v.weight === size);
                  const hasStockInSize = variants.some((v) => (flavors.length === 0 || v.flavor === selectedFlavor) && v.weight === size && (v.stock || 0) > 0);

                  return (
                    <button
                      key={size}
                      type="button"
                      onClick={() => setSelectedSize(size)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-gold-600 text-white border-gold-600 shadow-xs'
                          : !existsForFlavor
                          ? 'bg-gray-100 text-gray-400 border-dashed border-gray-300 opacity-60'
                          : hasStockInSize
                          ? 'bg-white text-gray-700 border-gray-200 hover:border-gold-400 hover:bg-gold-50/50'
                          : 'bg-gray-50 text-gray-400 border-gray-200'
                      }`}
                    >
                      {size}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Stock & Expiry Status Bar */}
          <div className="flex items-center justify-between gap-2 pt-1 text-xs font-medium">
            {isInvalidCombination ? (
              <span className="text-gray-500 flex items-center gap-1.5 bg-gray-100 px-2.5 py-1 rounded-md font-bold text-[11px]">
                <AlertCircle size={13} className="text-gray-400" />
                Unavailable Combination
              </span>
            ) : isOutOfStock ? (
              <span className="text-red-600 flex items-center gap-1.5 bg-red-50 px-2.5 py-1 rounded-md font-bold text-[11px]">
                <span className="w-2 h-2 rounded-full bg-red-500"></span>
                Out of Stock
              </span>
            ) : (
              <span className="text-emerald-700 flex items-center gap-1.5 bg-emerald-50 px-2.5 py-1 rounded-md font-bold text-[11px]">
                <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                In Stock ({stock} available)
              </span>
            )}

            {activeExpiryDate && !isInvalidCombination && !isOutOfStock && (
              <span className="text-amber-800 bg-amber-50 px-2.5 py-1 rounded-md text-[11px] font-bold flex items-center gap-1">
                <Calendar size={11} className="text-amber-600" />
                Exp: {new Date(activeExpiryDate).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })}
              </span>
            )}
          </div>
        </div>

        {/* Quantity and Add to Cart Action */}
        <div className="mt-6 pt-4 border-t border-gray-100 flex items-center gap-3">
          {/* Quantity Counter */}
          <div className="flex items-center border border-gray-200 rounded-xl bg-gray-50 p-1">
            <button
              type="button"
              onClick={() => setQuantity((q) => Math.max(1, q - 1))}
              disabled={quantity <= 1 || isActionDisabled}
              className="p-1.5 rounded-lg text-gray-600 hover:bg-white disabled:opacity-30 disabled:hover:bg-transparent cursor-pointer"
              aria-label="Decrease quantity"
            >
              <Minus size={14} />
            </button>
            <span className={`w-8 text-center text-xs font-bold ${isActionDisabled ? 'text-gray-400' : 'text-gray-900'}`}>
              {isActionDisabled ? 0 : quantity}
            </span>
            <button
              type="button"
              onClick={() => setQuantity((q) => Math.min(stock || 10, q + 1))}
              disabled={quantity >= stock || isActionDisabled}
              className="p-1.5 rounded-lg text-gray-600 hover:bg-white disabled:opacity-30 disabled:hover:bg-transparent cursor-pointer"
              aria-label="Increase quantity"
            >
              <Plus size={14} />
            </button>
          </div>

          {/* Add to Cart Button */}
          <button
            type="button"
            onClick={handleAddToCart}
            disabled={isActionDisabled}
            className={`flex-1 py-3 px-4 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer ${
              added 
                ? 'bg-emerald-600 text-white' 
                : isInvalidCombination || isOutOfStock || isProductInactive
                ? 'bg-gray-200 text-gray-400 shadow-none cursor-not-allowed'
                : 'bg-gold-600 hover:bg-gold-700 text-white active:scale-98'
            }`}
          >
            {loading ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                <span>Adding to Cart...</span>
              </>
            ) : added ? (
              <>
                <Check size={16} />
                <span>Added to Cart!</span>
              </>
            ) : isInvalidCombination ? (
              <span>Unavailable</span>
            ) : isOutOfStock ? (
              <span>Out of Stock</span>
            ) : isProductInactive ? (
              <span>Currently Unavailable</span>
            ) : (
              <>
                <ShoppingCart size={16} />
                <span>Add to Cart • ₹{(finalUnitPrice * quantity).toLocaleString()}</span>
              </>
            )}
          </button>
        </div>

      </div>
    </div>
  );
};
