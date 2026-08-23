'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { getMediaUrl } from '@/lib/media';

interface BrandItem {
  id?: string;
  name: string;
  logo?: string | null;
}

// High-fidelity vector logos for authorized brands coming from API
const BRAND_VECTOR_LOGOS: Record<string, React.ReactNode> = {
  'optimum nutrition': (
    <svg viewBox="0 0 200 60" className="h-8 sm:h-9 md:h-10 w-auto" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="30" cy="30" r="18" fill="#18181B" />
      <circle cx="30" cy="30" r="15" fill="none" stroke="#D4AF37" strokeWidth="2" />
      <text x="30" y="36" fontFamily="Arial Black, sans-serif" fontWeight="900" fontSize="14" fill="#D4AF37" textAnchor="middle">ON</text>
      <text x="58" y="27" fontFamily="Arial Black, sans-serif" fontWeight="900" fontSize="12" fill="#18181B" letterSpacing="1">OPTIMUM</text>
      <text x="58" y="42" fontFamily="Arial, sans-serif" fontWeight="900" fontSize="10" fill="#B45309" letterSpacing="2">NUTRITION</text>
    </svg>
  ),
  'muscletech': (
    <svg viewBox="0 0 190 60" className="h-8 sm:h-9 md:h-10 w-auto" fill="none" xmlns="http://www.w3.org/2000/svg">
      <polygon points="16,16 30,16 38,44 24,44" fill="#DC2626" />
      <polygon points="28,16 36,16 44,44 36,44" fill="#18181B" />
      <text x="50" y="38" fontFamily="Arial Black, Impact, sans-serif" fontWeight="900" fontSize="18" fill="#18181B" letterSpacing="1">MUSCLETECH</text>
    </svg>
  ),
  'dymatize': (
    <svg viewBox="0 0 190 60" className="h-8 sm:h-9 md:h-10 w-auto" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M18 16 L34 30 L18 44 Z" fill="#002F6C" />
      <path d="M26 16 L42 30 L26 44 Z" fill="#DC2626" />
      <text x="50" y="39" fontFamily="Impact, Arial Black, sans-serif" fontStyle="italic" fontWeight="900" fontSize="26" fill="#002F6C" letterSpacing="0.5">Dymatize</text>
    </svg>
  ),
  'one science nutrition': (
    <svg viewBox="0 0 200 60" className="h-8 sm:h-9 md:h-10 w-auto" fill="none" xmlns="http://www.w3.org/2000/svg">
      <polygon points="30,10 46,19 46,39 30,48 14,39 14,19" fill="#D97706" />
      <text x="30" y="35" fontFamily="Arial Black, Impact, sans-serif" fontWeight="900" fontSize="20" fill="#FFFFFF" textAnchor="middle">1</text>
      <text x="58" y="28" fontFamily="Arial, Helvetica, sans-serif" fontWeight="900" fontSize="12" fill="#111111" letterSpacing="1">ONE SCIENCE</text>
      <text x="58" y="42" fontFamily="Arial, Helvetica, sans-serif" fontWeight="800" fontSize="9.5" fill="#B45309" letterSpacing="2.5">NUTRITION</text>
    </svg>
  ),
  'labrada nutrition': (
    <svg viewBox="0 0 190 60" className="h-8 sm:h-9 md:h-10 w-auto" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="28" cy="30" r="16" fill="#E11D48" />
      <path d="M22 20 L22 40 L35 40" stroke="#FFFFFF" strokeWidth="4.5" strokeLinecap="round" strokeLinejoin="round" />
      <text x="52" y="34" fontFamily="Impact, Arial Black, sans-serif" fontSize="22" fill="#E11D48" letterSpacing="1">LABRADA</text>
      <text x="52" y="45" fontFamily="Arial, sans-serif" fontWeight="900" fontSize="7" fill="#18181B" letterSpacing="2">THE NUTRITION COMPANY</text>
    </svg>
  ),
  'bsn nutrition': (
    <svg viewBox="0 0 160 60" className="h-8 sm:h-9 md:h-10 w-auto" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M26 14 L38 21 L38 35 C38 42 26 46 26 46 C26 46 14 42 14 35 L14 21 Z" fill="#DC2626" />
      <circle cx="26" cy="25" r="4.5" stroke="#FFFFFF" strokeWidth="2" />
      <path d="M20 37 C20 31 32 31 32 37" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" />
      <text x="48" y="39" fontFamily="Arial Black, Impact, sans-serif" fontWeight="900" fontSize="24" fill="#DC2626" fontStyle="italic" letterSpacing="1">BSN</text>
    </svg>
  ),
  'bsn': (
    <svg viewBox="0 0 160 60" className="h-8 sm:h-9 md:h-10 w-auto" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M26 14 L38 21 L38 35 C38 42 26 46 26 46 C26 46 14 42 14 35 L14 21 Z" fill="#DC2626" />
      <circle cx="26" cy="25" r="4.5" stroke="#FFFFFF" strokeWidth="2" />
      <path d="M20 37 C20 31 32 31 32 37" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" />
      <text x="48" y="39" fontFamily="Arial Black, Impact, sans-serif" fontWeight="900" fontSize="24" fill="#DC2626" fontStyle="italic" letterSpacing="1">BSN</text>
    </svg>
  ),
  'scitec nutrition': (
    <svg viewBox="0 0 190 60" className="h-8 sm:h-9 md:h-10 w-auto" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M26 14 C17 14 11 21 11 30 C11 39 18 46 27 46 C34 46 39 41 41 34 L34 34 C32 37 30 39 26 39 C21 39 17 35 17 30 C17 25 21 21 26 21 C30 21 33 23 35 27 L42 27 C39 19 33 14 26 14 Z" fill="#0284C7" />
      <text x="50" y="33" fontFamily="Arial Black, sans-serif" fontWeight="900" fontSize="16" fill="#0369A1" letterSpacing="1">SCITEC</text>
      <text x="50" y="45" fontFamily="Arial, sans-serif" fontWeight="800" fontSize="8.5" fill="#0369A1" letterSpacing="2.5">NUTRITION</text>
    </svg>
  ),
  'scietic nutrition': (
    <svg viewBox="0 0 190 60" className="h-8 sm:h-9 md:h-10 w-auto" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M26 14 C17 14 11 21 11 30 C11 39 18 46 27 46 C34 46 39 41 41 34 L34 34 C32 37 30 39 26 39 C21 39 17 35 17 30 C17 25 21 21 26 21 C30 21 33 23 35 27 L42 27 C39 19 33 14 26 14 Z" fill="#0284C7" />
      <text x="50" y="33" fontFamily="Arial Black, sans-serif" fontWeight="900" fontSize="16" fill="#0369A1" letterSpacing="1">SCITEC</text>
      <text x="50" y="45" fontFamily="Arial, sans-serif" fontWeight="800" fontSize="8.5" fill="#0369A1" letterSpacing="2.5">NUTRITION</text>
    </svg>
  ),
  'pro jym': (
    <svg viewBox="0 0 160 60" className="h-8 sm:h-9 md:h-10 w-auto" fill="none" xmlns="http://www.w3.org/2000/svg">
      <text x="80" y="38" fontFamily="Arial Black, Impact, sans-serif" fontWeight="900" fontSize="24" fill="#18181B" textAnchor="middle" fontStyle="italic" letterSpacing="2">PRO JYM</text>
      <text x="80" y="49" fontFamily="Arial, sans-serif" fontWeight="800" fontSize="7.5" fill="#D97706" textAnchor="middle" letterSpacing="2.5">SUPPLEMENT SCIENCE</text>
    </svg>
  ),
  'alpino': (
    <svg viewBox="0 0 160 60" className="h-8 sm:h-9 md:h-10 w-auto" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="26" cy="30" r="15" fill="#14532D" />
      <path d="M26 19 C20 24 20 36 26 41 C32 36 32 24 26 19 Z" fill="#BBF7D0" />
      <text x="48" y="37" fontFamily="Arial Black, sans-serif" fontWeight="900" fontSize="19" fill="#14532D" letterSpacing="0.5">alpino</text>
    </svg>
  ),
  'muscleblaze': (
    <svg viewBox="0 0 180 60" className="h-8 sm:h-9 md:h-10 w-auto" fill="none" xmlns="http://www.w3.org/2000/svg">
      <polygon points="16,42 24,18 34,32 44,18 52,42 42,42 34,30 26,42" fill="#F59E0B" />
      <text x="60" y="31" fontFamily="Arial Black, sans-serif" fontWeight="900" fontSize="14" fill="#111111" letterSpacing="1">MUSCLE</text>
      <text x="60" y="46" fontFamily="Arial Black, sans-serif" fontWeight="900" fontSize="14" fill="#F59E0B" letterSpacing="1">BLAZE</text>
    </svg>
  ),
  'gnc': (
    <svg viewBox="0 0 160 60" className="h-8 sm:h-9 md:h-10 w-auto" fill="none" xmlns="http://www.w3.org/2000/svg">
      <text x="20" y="38" fontFamily="Arial Black, Impact, sans-serif" fontWeight="900" fontSize="28" fill="#DC2626" letterSpacing="2">GNC</text>
      <text x="22" y="49" fontFamily="Arial, sans-serif" fontWeight="800" fontSize="7.5" fill="#DC2626" letterSpacing="3">LIVE WELL</text>
    </svg>
  ),
  'cerave': (
    <svg viewBox="0 0 150 60" className="h-8 sm:h-9 md:h-10 w-auto" fill="none" xmlns="http://www.w3.org/2000/svg">
      <text x="75" y="39" fontFamily="Arial Black, Helvetica, sans-serif" fontWeight="900" fontSize="26" fill="#0369A1" textAnchor="middle" letterSpacing="0.5">CeraVe</text>
    </svg>
  ),
  'the ordinary': (
    <svg viewBox="0 0 180 60" className="h-8 sm:h-9 md:h-10 w-auto" fill="none" xmlns="http://www.w3.org/2000/svg">
      <text x="90" y="32" fontFamily="Georgia, serif" fontSize="16" fontWeight="bold" fill="#18181B" textAnchor="middle">The Ordinary.</text>
      <text x="90" y="44" fontFamily="Arial, sans-serif" fontWeight="bold" fontSize="6.5" fill="#71717A" textAnchor="middle" letterSpacing="1.5">CLINICAL FORMULATIONS WITH INTEGRITY</text>
    </svg>
  ),
  'olaplex': (
    <svg viewBox="0 0 160 60" className="h-8 sm:h-9 md:h-10 w-auto" fill="none" xmlns="http://www.w3.org/2000/svg">
      <text x="80" y="39" fontFamily="Futura, Arial Black, sans-serif" fontWeight="900" fontSize="22" fill="#18181B" textAnchor="middle" letterSpacing="3">OLAPLEX</text>
    </svg>
  ),
  'schwarzkopf': (
    <svg viewBox="0 0 190 60" className="h-8 sm:h-9 md:h-10 w-auto" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M22 40 C20 36 20 26 26 23 C32 20 36 26 34 33 C32 39 28 40 22 40 Z" fill="#18181B" />
      <text x="46" y="32" fontFamily="Times New Roman, serif" fontWeight="bold" fontSize="14" fill="#18181B" letterSpacing="0.5">Schwarzkopf</text>
      <text x="46" y="44" fontFamily="Arial, sans-serif" fontWeight="bold" fontSize="7.5" fill="#DC2626" letterSpacing="2.5">PROFESSIONAL</text>
    </svg>
  )
};

export const BrandPartners: React.FC = () => {
  const [brands, setBrands] = useState<BrandItem[]>([]);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    let isMounted = true;
    const fetchApiBrands = async () => {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://api.sculptshine.shop/api';
        
        // 1. Try public brands endpoint
        let list: BrandItem[] = [];
        try {
          const res = await fetch(`${apiUrl}/brands?status=ACTIVE&limit=50`);
          if (res.ok) {
            const json = await res.json();
            const rawBrands = json?.data?.brands || json?.data || [];
            if (Array.isArray(rawBrands) && rawBrands.length > 0) {
              list = rawBrands.map((b: any) => ({
                id: b.id,
                name: b.name,
                logo: b.logo || null,
              }));
            }
          }
        } catch (e) {
          // ignore
        }

        // 2. If empty, fetch from public products filters endpoint
        if (list.length === 0) {
          try {
            const filterRes = await fetch(`${apiUrl}/products/filters`);
            if (filterRes.ok) {
              const filterJson = await filterRes.json();
              const filterBrands = filterJson?.data?.brands || [];
              if (Array.isArray(filterBrands) && filterBrands.length > 0) {
                list = filterBrands.map((b: any) => ({
                  name: b.name,
                  logo: null,
                }));
              }
            }
          } catch (e) {
            // ignore
          }
        }

        if (isMounted && list.length > 0) {
          setBrands(list);
        }
      } catch (err) {
        console.error('Error loading brand partners from API:', err);
      }
    };

    fetchApiBrands();
    return () => {
      isMounted = false;
    };
  }, []);

  if (brands.length === 0) return null;

  // Duplicate for seamless infinite marquee loop
  const marqueeList = [...brands, ...brands, ...brands];

  return (
    <section className="py-6 sm:py-7 bg-white border-y border-cream-200 overflow-hidden relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-4">
        <div className="flex items-center justify-center gap-3">
          <div className="h-px bg-gradient-to-r from-transparent via-gold-500/40 to-transparent flex-1 max-w-xs" />
          <h2 className="text-xs sm:text-sm font-extrabold uppercase tracking-[0.2em] text-brandDark">
            Trusted Brands We Deal With
          </h2>
          <div className="h-px bg-gradient-to-l from-transparent via-gold-500/40 to-transparent flex-1 max-w-xs" />
        </div>
      </div>

      {/* Infinite Logo Marquee Strip */}
      <div 
        className="w-full relative overflow-hidden"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
      >
        {/* Left & Right gradient edge fades */}
        <div className="absolute top-0 bottom-0 left-0 w-12 sm:w-24 bg-gradient-to-r from-white via-white/90 to-transparent z-10 pointer-events-none" />
        <div className="absolute top-0 bottom-0 right-0 w-12 sm:w-24 bg-gradient-to-l from-white via-white/90 to-transparent z-10 pointer-events-none" />

        <div className="flex overflow-hidden select-none">
          <div className={`flex items-center gap-3 sm:gap-4 shrink-0 py-1 ${isPaused ? '' : 'animate-marquee'}`}>
            {marqueeList.map((brand, idx) => {
              const brandName = brand.name;
              const searchHref = `/search?brand=${encodeURIComponent(brandName)}`;
              const normalizedName = brandName.toLowerCase().trim();
              const customSvg = BRAND_VECTOR_LOGOS[normalizedName];
              const resolvedImgUrl = brand.logo && !brand.logo.includes('clearbit.com') 
                ? getMediaUrl(brand.logo, '') 
                : null;

              return (
                <Link
                  key={`${brandName}-${idx}`}
                  href={searchHref}
                  className="group flex items-center justify-center h-13 sm:h-15 px-4 sm:px-6 bg-cream-50/70 hover:bg-white rounded-xl border border-cream-200/90 shadow-2xs hover:shadow-luxury hover:border-gold-400 hover:scale-105 transition-all duration-300 shrink-0 cursor-pointer"
                  title={`Shop ${brandName}`}
                >
                  <div className="transition-transform duration-300 group-hover:scale-105">
                    {resolvedImgUrl ? (
                      <img
                        src={resolvedImgUrl}
                        alt={brandName}
                        className="h-8 sm:h-9 md:h-10 w-auto object-contain max-w-[120px]"
                        onError={(e) => {
                          (e.target as HTMLElement).style.display = 'none';
                        }}
                      />
                    ) : customSvg ? (
                      customSvg
                    ) : (
                      <span className="text-xs sm:text-sm font-serif font-black uppercase tracking-wider text-brandDark">
                        {brandName}
                      </span>
                    )}
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes marquee {
          0% {
            transform: translateX(0%);
          }
          100% {
            transform: translateX(-33.333%);
          }
        }
        .animate-marquee {
          animation: marquee 26s linear infinite;
        }
        .animate-marquee:hover {
          animation-play-state: paused;
        }
      `}</style>
    </section>
  );
};

export default BrandPartners;
