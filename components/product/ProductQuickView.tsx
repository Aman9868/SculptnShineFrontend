import React, { useState } from 'react';
import Image from 'next/image';
import { X, Star, Minus, Plus, ShieldCheck, Truck, RotateCcw } from 'lucide-react';
import { Product } from '@/data/products';
import { Accordion } from '@/components/ui/Accordion';

interface ProductQuickViewProps {
  product: Product;
  onClose: () => void;
}

export const ProductQuickView: React.FC<ProductQuickViewProps> = ({ product, onClose }) => {
  const [quantity, setQuantity] = useState(1);
  const [activeImage, setActiveImage] = useState(0);

  // Mock multiple images based on the single product image
  const images = [product.image, product.image, product.image];

  return (
    <div className="bg-white rounded-2xl shadow-2xl border border-gray-100 flex flex-col h-[calc(100vh-120px)] sticky top-24 overflow-hidden animate-in slide-in-from-right-8 duration-300">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-100">
        <h2 className="text-sm font-bold text-gray-500 uppercase tracking-wider">Product Details</h2>
        <button 
          onClick={onClose}
          className="p-2 bg-gray-50 rounded-full text-gray-500 hover:bg-gray-100 hover:text-gray-900 transition-colors"
        >
          <X size={18} />
        </button>
      </div>

      {/* Scrollable Content */}
      <div className="overflow-y-auto flex-grow p-6 hide-scrollbar">
        
        {/* Brand & Title (Mobile - Usually at top) */}
        <div className="mb-4">
          <p className="text-sm text-gray-500 font-medium mb-1">{product.brand}</p>
          <h1 className="text-2xl font-serif-luxury text-brandDark leading-tight mb-2">
            {product.name}
          </h1>
          <div className="flex items-center gap-2">
            <div className="flex items-center">
              <Star className="w-4 h-4 text-gold-400 fill-gold-400" />
              <span className="text-sm font-bold ml-1">{product.rating}</span>
            </div>
            <div className="flex text-gold-400">
              {[...Array(4)].map((_, i) => <Star key={i} className="w-3 h-3 fill-gold-400" />)}
            </div>
            <span className="text-sm text-gray-400 underline cursor-pointer">({product.reviews} Reviews)</span>
          </div>
        </div>

        {/* Gallery Area */}
        <div className="flex gap-4 mb-8">
          {/* Thumbnails */}
          <div className="flex flex-col gap-2 w-16">
            {images.map((img, idx) => (
              <button 
                key={idx}
                onClick={() => setActiveImage(idx)}
                className={`w-16 h-20 rounded-lg border-2 overflow-hidden bg-gray-50 flex items-center justify-center p-1 ${activeImage === idx ? 'border-gold-500' : 'border-transparent hover:border-gray-200'}`}
              >
                <Image src={img} alt="" width={60} height={80} className="object-contain w-full h-full" />
              </button>
            ))}
          </div>
          
          {/* Main Image */}
          <div className="flex-grow bg-gray-50/50 rounded-xl flex items-center justify-center p-8 relative">
            {(product.discount ?? 0) > 0 && (
              <span className="absolute top-4 right-4 bg-orange-100 text-orange-600 text-xs font-bold px-3 py-1 rounded-full">
                {product.discount}% OFF
              </span>
            )}
            <Image 
              src={images[activeImage]} 
              alt={product.name} 
              width={300} 
              height={400} 
              className="object-contain w-full h-64 mix-blend-multiply" 
            />
          </div>
        </div>

        {/* Pricing */}
        <div className="mb-6">
          <div className="flex items-end gap-3 mb-1">
            <span className="text-3xl font-bold text-brandDark">₹{product.price.toLocaleString()}</span>
            {product.originalPrice && (
              <span className="text-lg text-gray-400 line-through mb-1">₹{product.originalPrice.toLocaleString()}</span>
            )}
          </div>
          <p className="text-xs text-gray-500">Inclusive of all taxes</p>
        </div>

        {/* Benefits */}
        <ul className="space-y-2 mb-8">
          {[
            'Protects color radiance',
            'Gently cleanses',
            'Adds shine and softness',
            'For colored hair'
          ].map((benefit, idx) => (
            <li key={idx} className="flex items-start gap-2 text-sm text-gray-600">
              <span className="text-gold-500 font-bold mt-0.5">•</span>
              {benefit}
            </li>
          ))}
        </ul>

        {/* Add to Cart Actions */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          {/* Quantity */}
          <div className="flex items-center justify-between border border-gray-300 rounded-lg px-3 py-2 w-full sm:w-32 bg-white">
            <button 
              onClick={() => setQuantity(Math.max(1, quantity - 1))}
              className="text-gray-500 hover:text-gold-600"
            >
              <Minus size={18} />
            </button>
            <span className="font-semibold text-brandDark">{quantity}</span>
            <button 
              onClick={() => setQuantity(quantity + 1)}
              className="text-gray-500 hover:text-gold-600"
            >
              <Plus size={18} />
            </button>
          </div>
          
          <button className="flex-grow bg-gold-500 hover:bg-gold-600 text-white font-bold rounded-lg py-3 transition-colors shadow-lg shadow-gold-500/30">
            Add to Cart
          </button>
        </div>
        
        <button className="w-full bg-white border-2 border-brandDark text-brandDark hover:bg-brandDark hover:text-white font-bold rounded-lg py-3 transition-colors mb-8">
          Buy Now
        </button>

        {/* Trust Badges */}
        <div className="flex justify-between items-center py-4 border-t border-b border-gray-100 mb-8">
          <div className="flex items-center gap-1.5 text-xs text-gray-600 font-medium">
            <ShieldCheck size={16} className="text-gray-400" /> 100% Original
          </div>
          <div className="flex items-center gap-1.5 text-xs text-gray-600 font-medium">
            <RotateCcw size={16} className="text-gray-400" /> Easy Returns
          </div>
          <div className="flex items-center gap-1.5 text-xs text-gray-600 font-medium">
            <ShieldCheck size={16} className="text-gray-400" /> Secure Payment
          </div>
        </div>

        <div className="flex items-center gap-3 text-sm text-gray-700 bg-gray-50 p-4 rounded-lg mb-8">
          <Truck size={20} className="text-gold-600" />
          <span className="font-semibold">Estimated Delivery:</span> 3 - 5 business days
        </div>

        {/* Accordions */}
        <div className="space-y-1">
          <Accordion title="Description" defaultOpen={true}>
            <p>
              {product.name} is a professional gentle shampoo that helps protect and extend hair color vibrancy. Enriched with Resveratrol, it cleanses while preserving color radiance and shine.
            </p>
          </Accordion>
          <Accordion title="How to Use">
            <ol className="list-decimal pl-4 space-y-1">
              <li>Apply evenly on wet hair.</li>
              <li>Lather.</li>
              <li>Rinse thoroughly.</li>
              <li>Follow with a conditioner for best results.</li>
            </ol>
          </Accordion>
          <Accordion title="Ingredients">
            <p className="text-xs text-gray-500 leading-relaxed">
              AQUA / WATER / EAU • SODIUM LAURETH SULFATE • COCAMIDOPROPYL BETAINE • DIMETHICONE • SODIUM CHLORIDE • CITRIC ACID • HEXYLENE GLYCOL • SODIUM BENZOATE • SODIUM HYDROXIDE • AMODIMETHICONE • CARBOMER • GUAR HYDROXYPROPYLTRIMONIUM CHLORIDE • TRIDECETH-10 • GLYCERIN • SALICYLIC ACID • GLYCOL DISTEARATE • MICA • PEG-100 STEARATE • LINALOOL • STEARETH-6 • PHENOXYETHANOL • COCO-BETAINE • TRIDECETH-3 • CI 77891 / TITANIUM DIOXIDE • RESVERATROL • BENZYL ALCOHOL • ACETIC ACID • PARFUM / FRAGRANCE.
            </p>
          </Accordion>
          <Accordion title={`Reviews (${product.reviews})`}>
            <div className="flex items-center justify-between mb-4">
              <div>
                <span className="text-2xl font-bold text-brandDark">{product.rating}</span>
                <span className="text-gray-500">/5</span>
              </div>
              <div className="flex text-gold-400">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className={`w-4 h-4 ${i < Math.floor(product.rating) ? 'fill-gold-400' : 'fill-gray-200 text-gray-200'}`} />
                ))}
              </div>
            </div>
            <p className="text-xs text-gray-500 text-center italic">Reviews are currently unavailable.</p>
          </Accordion>
        </div>

      </div>
    </div>
  );
};
