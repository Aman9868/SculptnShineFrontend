'use client';

import React, { useState, useEffect } from 'react';
import { X, Minus, Plus, ShoppingCart, Loader2, Check } from 'lucide-react';
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
      const defaultVariant = variants.find((v) => v.isDefault) || variants[0];
      setSelectedFlavor(defaultVariant?.flavor || flavors[0] || '');
      setSelectedSize(defaultVariant?.weight || sizes[0] || '');
      setQuantity(1);
      setAdded(false);
      setLoading(false);
    }
  }, [product]);

  if (!isOpen || !product) return null;

  // Find currently matched variant
  const currentVariant: ProductVariant | undefined = variants.find((v) => {
    const matchFlavor = flavors.length === 0 || v.flavor === selectedFlavor;
    const matchSize = sizes.length === 0 || v.weight === selectedSize;
    return matchFlavor && matchSize;
  }) || variants[0];

  const unitPrice = currentVariant ? currentVariant.unitPrice : product.unitPrice;
  const discountPercent = currentVariant ? currentVariant.discountPercentage : product.discountPercentage;
  const stock = currentVariant ? currentVariant.stock : product.stock;
  const finalUnitPrice = discountPercent > 0 ? unitPrice * (1 - discountPercent / 100) : unitPrice;

  const imageUrl = (currentVariant?.images && currentVariant.images.length > 0 ? currentVariant.images[0] : null) ||
    (product.images && product.images.length > 0 ? product.images[0] : '/assets/images/category-placeholder.jpg');

  const handleAddToCart = async () => {
    if (stock === 0) return;
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
      <div className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full p-5 sm:p-6 z-10 border border-cream-300 animate-in zoom-in-95 duration-200 overflow-hidden">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-full text-gray-400 hover:text-gray-700 hover:bg-cream-100 transition-colors"
          aria-label="Close modal"
        >
          <X size={20} />
        </button>

        {/* Product Info Header */}
        <div className="flex gap-4 items-start mb-5 pb-4 border-b border-cream-200 pr-6">
          <div className="w-20 h-20 bg-cream-50 rounded-xl overflow-hidden shrink-0 border border-cream-200 p-1 flex items-center justify-center">
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
                  return (
                    <button
                      key={flavor}
                      type="button"
                      onClick={() => setSelectedFlavor(flavor)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                        isSelected
                          ? 'bg-gold-600 text-white border-gold-600 shadow-xs'
                          : 'bg-white text-gray-700 border-cream-300 hover:border-gold-400 hover:bg-cream-50'
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
                  return (
                    <button
                      key={size}
                      type="button"
                      onClick={() => setSelectedSize(size)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                        isSelected
                          ? 'bg-gold-600 text-white border-gold-600 shadow-xs'
                          : 'bg-white text-gray-700 border-cream-300 hover:border-gold-400 hover:bg-cream-50'
                      }`}
                    >
                      {size}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Stock Status Indicator */}
          <div className="text-xs font-medium">
            {stock > 0 ? (
              <span className="text-emerald-600 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                In Stock ({stock} available)
              </span>
            ) : (
              <span className="text-red-600 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-red-500"></span>
                Out of Stock
              </span>
            )}
          </div>
        </div>

        {/* Quantity and Add to Cart Action */}
        <div className="mt-6 pt-4 border-t border-cream-200 flex items-center gap-3">
          {/* Quantity Counter */}
          <div className="flex items-center border border-cream-300 rounded-xl bg-cream-50 p-1">
            <button
              type="button"
              onClick={() => setQuantity((q) => Math.max(1, q - 1))}
              disabled={quantity <= 1 || stock === 0}
              className="p-1.5 rounded-lg text-gray-600 hover:bg-white disabled:opacity-30 disabled:hover:bg-transparent"
              aria-label="Decrease quantity"
            >
              <Minus size={14} />
            </button>
            <span className="w-8 text-center text-xs font-bold text-gray-900">
              {quantity}
            </span>
            <button
              type="button"
              onClick={() => setQuantity((q) => Math.min(stock || 10, q + 1))}
              disabled={quantity >= stock || stock === 0}
              className="p-1.5 rounded-lg text-gray-600 hover:bg-white disabled:opacity-30 disabled:hover:bg-transparent"
              aria-label="Increase quantity"
            >
              <Plus size={14} />
            </button>
          </div>

          {/* Add to Cart Button */}
          <button
            type="button"
            onClick={handleAddToCart}
            disabled={loading || stock === 0}
            className={`flex-1 py-3 px-4 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 shadow-md transition-all ${
              added 
                ? 'bg-emerald-600 text-white' 
                : 'bg-gold-600 hover:bg-gold-700 text-white active:scale-98 disabled:opacity-50 disabled:cursor-not-allowed'
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
