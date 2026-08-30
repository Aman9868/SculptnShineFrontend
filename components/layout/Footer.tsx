'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { LockKeyhole, Mail, MapPin, Phone } from 'lucide-react';
import { businessConfigApi, BusinessConfig } from '@/lib/api/businessConfig';
import { categoryAPI, Category } from '@/lib/api/category';

const FALLBACK_ADDRESS = 'Ground floor, Unipole complex, 8 Marla, Model Town, Sonipat, Haryana 131001';
const FALLBACK_SUPPORT_EMAIL = 'support@sculptshine.shop';

const PaymentTile = ({ children, label }: { children: React.ReactNode; label: string }) => (
  <span
    className="inline-flex h-10 w-[94px] items-center justify-center rounded-md border border-white/25 bg-white shadow-[0_1px_0_rgba(255,255,255,0.35),0_10px_22px_rgba(0,0,0,0.18)]"
    aria-label={label}
  >
    {children}
  </span>
);

export const Footer: React.FC = () => {
  const [config, setConfig] = useState<BusinessConfig | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    const fetchFooterData = async () => {
      const [configRes, categoriesRes] = await Promise.allSettled([
        businessConfigApi.getConfig(),
        categoryAPI.getCategories(),
      ]);

      if (configRes.status === 'fulfilled' && configRes.value.success && configRes.value.data) {
        const configData = configRes.value.data;
        setConfig(configData);
      }

      if (categoriesRes.status === 'fulfilled' && categoriesRes.value.success) {
        setCategories((categoriesRes.value.data.categories || []).slice(0, 6));
      }
    };

    fetchFooterData();
  }, []);

  const footerAddress = config?.address?.trim() || FALLBACK_ADDRESS;
  const supportEmail = config?.supportEmail?.trim() || FALLBACK_SUPPORT_EMAIL;

  return (
    <footer className="bg-brandDark text-gray-300 border-t border-brandDark-soft text-xs pt-12 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">

        {/* Main Footer Columns */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">

          {/* Brand Info */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gold-600/20 border border-gold-500 flex items-center justify-center">
                <span className="font-serif font-bold text-xl text-gold-400">S</span>
              </div>
              <div>
                <span className="font-serif text-xl font-bold text-white tracking-wide block">
                  SCULPT N SHINE
                </span>
                <span className="text-[10px] text-gold-400 uppercase tracking-widest font-semibold">
                  SUPPLEMENTS &middot; FITNESS &middot; WELLNESS
                </span>
              </div>
            </div>

            <p className="text-gray-400 leading-relaxed max-w-sm">
              Sculpt N Shine is India&apos;s premier destination for authentic sports nutrition, clean wellness formulas, and high-performance beauty care.
            </p>

            <div className="flex items-start gap-2 text-gray-400 leading-relaxed max-w-sm">
              <MapPin className="w-4 h-4 mt-0.5 text-gold-500 shrink-0" />
              <span>{footerAddress}</span>
            </div>

            <a
              href={`mailto:${supportEmail}`}
              className="flex items-center gap-2 text-gray-400 hover:text-gold-400 transition-colors max-w-sm"
            >
              <Mail className="w-4 h-4 text-gold-500 shrink-0" />
              <span>{supportEmail}</span>
            </a>

            <a
              href="tel:9008990052"
              className="flex items-center gap-2 text-gray-400 hover:text-gold-400 transition-colors max-w-sm"
            >
              <Phone className="w-4 h-4 text-gold-500 shrink-0" />
              <span>+91 90089 90052</span>
            </a>

            <div className="flex items-center gap-3 pt-2">
              <a href={config?.instagramUrl || 'https://instagram.com'} target="_blank" rel="noopener noreferrer" aria-label="Instagram" className="w-8 h-8 rounded-full bg-brandDark-soft hover:bg-gold-600 hover:text-white flex items-center justify-center transition-colors">
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" /></svg>
              </a>
              <a href={config?.facebookUrl || 'https://facebook.com'} target="_blank" rel="noopener noreferrer" aria-label="Facebook" className="w-8 h-8 rounded-full bg-brandDark-soft hover:bg-gold-600 hover:text-white flex items-center justify-center transition-colors">
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M9 8H6v4h3v12h5V12h3.642L18 8h-4V6.333C14 5.374 14.5 5 15.5 5H18V0h-3.808C10.592 0 9 1.583 9 4.615V8z" /></svg>
              </a>
              <a href={config?.youtubeUrl || 'https://youtube.com'} target="_blank" rel="noopener noreferrer" aria-label="YouTube" className="w-8 h-8 rounded-full bg-brandDark-soft hover:bg-gold-600 hover:text-white flex items-center justify-center transition-colors">
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 3.993-8 4.007z" /></svg>
              </a>
            </div>
          </div>

          {/* Quick Shop Links */}
          <div className="space-y-3">
            <h4 className="font-serif text-sm font-bold text-white uppercase tracking-wider">
              Categories
            </h4>
            <ul className="space-y-2 text-gray-400 font-medium">
              {categories.map((category) => (
                <li key={category.id}>
                  <Link href={`/category/${category.slug}`} className="hover:text-gold-400 transition-colors">
                    {category.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Customer Support */}
          <div className="space-y-3">
            <h4 className="font-serif text-sm font-bold text-white uppercase tracking-wider">
              Support
            </h4>
            <ul className="space-y-2 text-gray-400 font-medium">
              <li><Link href="/track-order" className="hover:text-gold-400 transition-colors">Track Order</Link></li>
              <li><Link href="/policies/SHIPPING_POLICY" className="hover:text-gold-400 transition-colors">Shipping & Returns</Link></li>
              <li><Link href="#" className="hover:text-gold-400 transition-colors">Authenticity Guarantee</Link></li>
              <li><Link href="/policies/PRIVACY_POLICY" className="hover:text-gold-400 transition-colors">Privacy Policy</Link></li>
              <li><Link href="/policies/TERMS_AND_CONDITIONS" className="hover:text-gold-400 transition-colors">Terms of Service</Link></li>
            </ul>
          </div>

          {/* Newsletter Form */}
          <div className="space-y-3">
            <h4 className="font-serif text-sm font-bold text-white uppercase tracking-wider">
              Join The Club
            </h4>
            <p className="text-gray-400">
              Subscribe for exclusive member discounts and wellness tips.
            </p>

            <form onSubmit={(e) => e.preventDefault()} className="space-y-2">
              <div className="relative">
                <input
                  type="email"
                  placeholder="Enter your email"
                  className="w-full bg-brandDark-soft text-white text-xs px-3 py-2.5 rounded-lg border border-gray-700 focus:border-gold-500 outline-none"
                />
                <button
                  type="submit"
                  className="absolute right-1 top-1/2 -translate-y-1/2 bg-gold-600 hover:bg-gold-700 text-white text-xs font-bold px-3 py-1.5 rounded-md"
                >
                  Join
                </button>
              </div>
            </form>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-brandDark-soft flex flex-col md:flex-row items-center justify-between gap-4 text-center text-gray-500">
          <p>&copy; {new Date().getFullYear()} Sculpt N Shine. All Rights Reserved.</p>

          <div className="flex flex-wrap items-center justify-center gap-4 text-gray-400 font-semibold text-[11px]">
            <span className="inline-flex items-center gap-1.5 text-gray-300">
              <LockKeyhole className="w-3.5 h-3.5 text-gold-500/90" />
              256-BIT SSL SECURE CHECKOUT
            </span>
            <span className="hidden sm:inline-block h-4 w-px bg-white/15" />
            <div className="flex flex-wrap items-center justify-center gap-2.5" aria-label="Accepted payment methods">
              <PaymentTile label="Visa">
                <span className="font-sans text-[26px] font-black italic tracking-[-0.08em] text-[#1434cb]">
                  VISA
                </span>
              </PaymentTile>

              <PaymentTile label="Mastercard">
                <span className="flex flex-col items-center gap-0.5">
                  <span className="relative inline-flex h-5 w-9 items-center">
                    <span className="absolute left-1 h-5 w-5 rounded-full bg-[#eb001b]" />
                    <span className="absolute right-1 h-5 w-5 rounded-full bg-[#f79e1b] mix-blend-multiply" />
                  </span>
                  <span className="font-sans text-[10px] font-bold leading-none text-gray-900">mastercard</span>
                </span>
              </PaymentTile>


              <PaymentTile label="UPI">
                <span className="flex flex-col items-center leading-none">
                  <span className="flex items-center font-sans text-[25px] font-black italic tracking-[-0.08em] text-[#6b7280]">
                    UPI
                    <span className="ml-1 inline-flex items-center gap-px">
                      <span className="h-0 w-0 border-y-[7px] border-l-[10px] border-y-transparent border-l-[#1f9d55]" />
                      <span className="h-0 w-0 border-y-[7px] border-l-[10px] border-y-transparent border-l-[#f97316]" />
                    </span>
                  </span>
                  <span className="mt-0.5 font-sans text-[6px] font-bold uppercase tracking-[0.04em] text-gray-600">
                    Unified Payments
                  </span>
                </span>
              </PaymentTile>
            </div>
          </div>
        </div>

      </div>
    </footer>
  );
};
