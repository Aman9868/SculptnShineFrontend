'use client';

import React, { useState, useRef } from 'react';
import Image from 'next/image';
import { ChevronLeft, ChevronRight, ZoomIn } from 'lucide-react';

interface ProductGalleryProps {
  images: string[];
  productName: string;
}

export const ProductGallery: React.FC<ProductGalleryProps> = ({ images, productName }) => {
  const [activeImage, setActiveImage] = useState(0);
  const [isHovering, setIsHovering] = useState(false);
  const [lensStyle, setLensStyle] = useState({ left: 0, top: 0, width: 0, height: 0 });
  const [zoomBackgroundPosition, setZoomBackgroundPosition] = useState('0% 0%');

  const mainImageRef = useRef<HTMLDivElement>(null);

  const displayImages = images && images.length > 0 && images[0] ? images : ['/assets/product-placeholder.png'];
  const activeImgSrc = displayImages[activeImage] || '/assets/product-placeholder.png';

  const nextImage = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    setActiveImage((prev) => (prev + 1) % displayImages.length);
  };

  const prevImage = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    setActiveImage((prev) => (prev - 1 + displayImages.length) % displayImages.length);
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!mainImageRef.current) return;

    const rect = mainImageRef.current.getBoundingClientRect();
    const cursorX = e.clientX - rect.left;
    const cursorY = e.clientY - rect.top;

    // Lens is 40% of container dimension
    const lensWidth = rect.width * 0.4;
    const lensHeight = rect.height * 0.4;

    // Calculate clamped lens coordinates
    let lensX = cursorX - lensWidth / 2;
    let lensY = cursorY - lensHeight / 2;

    const maxLensX = rect.width - lensWidth;
    const maxLensY = rect.height - lensHeight;

    lensX = Math.max(0, Math.min(lensX, maxLensX));
    lensY = Math.max(0, Math.min(lensY, maxLensY));

    setLensStyle({
      left: lensX,
      top: lensY,
      width: lensWidth,
      height: lensHeight,
    });

    // Calculate zoom background percentage (0% to 100%)
    const percentX = maxLensX > 0 ? (lensX / maxLensX) * 100 : 0;
    const percentY = maxLensY > 0 ? (lensY / maxLensY) * 100 : 0;

    setZoomBackgroundPosition(`${percentX}% ${percentY}%`);
  };

  const handleMouseEnter = () => {
    setIsHovering(true);
  };

  const handleMouseLeave = () => {
    setIsHovering(false);
  };

  return (
    <div className="w-full lg:w-1/2 lg:sticky lg:top-24 h-max flex flex-col-reverse sm:flex-row gap-4 relative">
      
      {/* Thumbnails list */}
      <div className="flex sm:flex-col gap-3 overflow-x-auto hide-scrollbar sm:w-20 shrink-0">
        {displayImages.map((img, idx) => (
          <button 
            key={idx}
            onClick={() => setActiveImage(idx)}
            onMouseEnter={() => setActiveImage(idx)}
            className={`w-16 h-16 sm:w-20 sm:h-24 rounded-xl border-2 overflow-hidden bg-white flex items-center justify-center p-1 shrink-0 transition-all cursor-pointer ${
              idx === activeImage 
                ? 'border-gold-500 shadow-md ring-1 ring-gold-500 scale-[1.02]' 
                : 'border-gray-100 hover:border-gold-300 opacity-75 hover:opacity-100'
            }`}
          >
            <img 
              src={img} 
              alt={`${productName} thumbnail ${idx + 1}`} 
              onError={(e: any) => {
                e.currentTarget.onerror = null;
                e.currentTarget.src = '/assets/product-placeholder.png';
              }}
              className="object-contain w-full h-full" 
            />
          </button>
        ))}
      </div>
      
      {/* Main Image Container with Lens */}
      <div 
        ref={mainImageRef}
        onMouseEnter={handleMouseEnter}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        className="flex-grow bg-white border border-gray-100 rounded-2xl flex items-center justify-center p-4 sm:p-8 relative aspect-square sm:aspect-auto sm:h-[500px] select-none cursor-crosshair overflow-hidden group shadow-2xs"
      >
        {/* Previous / Next buttons */}
        {displayImages.length > 1 && (
          <>
            <button 
              onClick={prevImage} 
              className="absolute left-4 bg-white/90 p-2.5 rounded-full shadow-md hover:bg-white transition-all z-20 text-gray-700 hover:scale-105 cursor-pointer"
              aria-label="Previous Image"
            >
              <ChevronLeft size={20} />
            </button>
            <button 
              onClick={nextImage} 
              className="absolute right-4 bg-white/90 p-2.5 rounded-full shadow-md hover:bg-white transition-all z-20 text-gray-700 hover:scale-105 cursor-pointer"
              aria-label="Next Image"
            >
              <ChevronRight size={20} />
            </button>
          </>
        )}

        {/* Base Image */}
        <img 
          src={activeImgSrc} 
          alt={productName} 
          onError={(e: any) => {
            e.currentTarget.onerror = null;
            e.currentTarget.src = '/assets/product-placeholder.png';
          }}
          className="object-contain max-h-full max-w-full mix-blend-multiply transition-opacity duration-200 pointer-events-none" 
        />

        {/* Amazon-style Shaded Blue Zoom Lens */}
        {isHovering && (
          <div 
            style={{
              left: `${lensStyle.left}px`,
              top: `${lensStyle.top}px`,
              width: `${lensStyle.width}px`,
              height: `${lensStyle.height}px`,
            }}
            className="absolute z-10 border border-blue-500/60 bg-blue-500/20 backdrop-blur-[0.5px] rounded-lg pointer-events-none shadow-inner"
          >
            {/* Subtle grid texture overlay like Amazon */}
            <div className="w-full h-full opacity-30 bg-[radial-gradient(#3b82f6_1px,transparent_1px)] [background-size:8px_8px]" />
          </div>
        )}

        {/* Hover Hint Badge (fades out on hover) */}
        {!isHovering && (
          <div className="absolute bottom-3 right-3 bg-black/60 text-white text-[11px] font-bold px-2.5 py-1 rounded-full flex items-center gap-1.5 backdrop-blur-xs opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
            <ZoomIn size={13} />
            <span>Roll over image to zoom in</span>
          </div>
        )}
      </div>

      {/* Floating High-Resolution Zoom Preview Window (Amazon / Flipkart Side Preview) */}
      {isHovering && (
        <div 
          className="hidden lg:block absolute left-[calc(100%+24px)] top-0 w-[540px] h-[500px] z-50 bg-white border border-gray-200 rounded-2xl shadow-2xl overflow-hidden pointer-events-none animate-in fade-in zoom-in-95 duration-100"
          style={{
            backgroundImage: `url(${activeImgSrc})`,
            backgroundPosition: zoomBackgroundPosition,
            backgroundSize: '260% 260%',
            backgroundRepeat: 'no-repeat',
          }}
        >
          {/* Subtle watermark / indicator */}
          <div className="absolute bottom-3 right-4 px-2.5 py-1 bg-black/70 text-white rounded-md text-[10px] font-bold tracking-wider uppercase backdrop-blur-xs">
            HD Zoom Preview
          </div>
        </div>
      )}

    </div>
  );
};
