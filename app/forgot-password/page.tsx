'use client';

import React from 'react';
import Link from 'next/link';
import { AuthCarousel } from '@/components/auth/AuthCarousel';

export default function ForgotPasswordPage() {
  return (
    <div className="min-h-[calc(100vh-80px)] flex">
      {/* Left Side: Auto-scrolling Carousel */}
      <AuthCarousel bannerType="LOGIN_BG" />

      {/* Right Side: Form */}
      <div className="w-full lg:w-1/2 flex flex-col items-center justify-center p-8 sm:p-12 md:p-16 lg:p-24 bg-white">
        <div className="w-full max-w-md">
          {/* Mobile Logo */}
          <div className="flex flex-col items-center justify-center gap-4 mb-12">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-amber-100 via-gold-500/20 to-gold-600/30 border-2 border-gold-600/60 flex items-center justify-center shadow-sm">
              <span className="font-serif text-3xl font-extrabold text-gold-700 leading-none">S</span>
            </div>
            <div className="flex flex-col text-center">
              <span className="font-serif text-2xl font-bold tracking-tight text-gray-900 leading-none">
                SCULPT N SHINE
              </span>
            </div>
          </div>

          <div className="mb-10 text-center">
            <h1 className="text-3xl md:text-4xl font-serif font-bold text-brandDark mb-4">Forget Your Password?</h1>
            <p className="text-gray-500 text-sm md:text-base font-medium">Enter your registered email to receive a verification code.</p>
          </div>

          <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
            {/* Email Field */}
            <div className="space-y-2">
              <label className="block text-sm font-bold text-gray-700">Email Address</label>
              <input
                type="email"
                className="w-full bg-cream-50/50 border border-cream-200 text-gray-900 rounded-xl px-4 py-3.5 outline-none focus:border-gold-500 focus:ring-1 focus:ring-gold-500 transition-all shadow-sm"
                placeholder="name@example.com"
                required
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="w-full bg-brandDark hover:bg-black text-white font-bold py-4 rounded-xl transition-all shadow-lg shadow-black/10 mt-6 text-lg"
            >
              Send Code
            </button>
          </form>

          {/* Login Link */}
          <p className="mt-10 text-center text-sm font-medium text-gray-500">
            Remember Password?{' '}
            <Link href="/login" className="text-gold-600 font-bold hover:text-gold-700 transition-colors underline-offset-4 hover:underline">
              Sign In
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
