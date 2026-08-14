'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface ProductGalleryProps {
  images: string[];
  productName: string;
}

export const ProductGallery: React.FC<ProductGalleryProps> = ({ images, productName }) => {
  const [activeImage, setActiveImage] = useState(0);

  const nextImage = () => setActiveImage((prev) => (prev + 1) % images.length);
  const prevImage = () => setActiveImage((prev) => (prev - 1 + images.length) % images.length);

  const displayImages = images && images.length > 0 ? images : ['/assets/images/placeholder.jpg'];

  return (
    <div className="w-full lg:w-1/2 lg:sticky lg:top-24 h-max flex flex-col-reverse sm:flex-row gap-4">
      {/* Thumbnails */}
      <div className="flex sm:flex-col gap-3 overflow-x-auto hide-scrollbar sm:w-20 shrink-0">
        {displayImages.map((img, idx) => (
          <button 
            key={idx}
            onClick={() => setActiveImage(idx)}
            className={`w-16 h-16 sm:w-20 sm:h-24 rounded-xl border-2 overflow-hidden bg-white flex items-center justify-center p-1 shrink-0 transition-all ${idx === activeImage ? 'border-gold-500 shadow-md ring-1 ring-gold-500' : 'border-gray-100 hover:border-gold-300'}`}
          >
            <Image src={img} alt={`${productName} thumbnail ${idx + 1}`} width={60} height={80} className="object-contain w-full h-full" />
          </button>
        ))}
      </div>
      
      {/* Main Image */}
      <div className="flex-grow bg-white border border-gray-100 rounded-2xl flex items-center justify-center p-4 sm:p-8 relative aspect-square sm:aspect-auto sm:h-[500px]">
        {displayImages.length > 1 && (
          <>
            <button onClick={prevImage} className="absolute left-4 bg-white/80 p-2 rounded-full shadow-md hover:bg-white transition-colors z-10 text-gray-600">
              <ChevronLeft size={20} />
            </button>
            <button onClick={nextImage} className="absolute right-4 bg-white/80 p-2 rounded-full shadow-md hover:bg-white transition-colors z-10 text-gray-600">
              <ChevronRight size={20} />
            </button>
          </>
        )}
        <Image 
          src={displayImages[activeImage]} 
          alt={productName} 
          fill
          className="object-contain p-8 mix-blend-multiply transition-opacity duration-300" 
          priority
        />
      </div>
    </div>
  );
};
