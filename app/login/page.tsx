'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Mail, Eye, EyeOff, Loader, Lock } from 'lucide-react';
import { AuthCarousel } from '@/components/auth/AuthCarousel';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'react-toastify';

export default function LoginPage() {
  const router = useRouter();
  const { login, isLoading, isAuthenticated } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);

  // Load saved email on mount and redirect if already authenticated
  useEffect(() => {
    // Load saved email if it exists
    const savedEmail = localStorage.getItem('rememberMeEmail');
    if (savedEmail) {
      setEmail(savedEmail);
      setRememberMe(true);
    }
  }, []);

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      router.push('/');
    }
  }, [isAuthenticated, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !password) {
      toast.error('Please fill in all fields');
      return;
    }

    try {
      // Handle "Remember Me" functionality
      if (rememberMe) {
        localStorage.setItem('rememberMeEmail', email);
      } else {
        localStorage.removeItem('rememberMeEmail');
      }

      await login(email, password);
      toast.success('Successfully logged in!');
      router.push('/');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Login failed. Please try again.');
    }
  };

  return (
    <div className="min-h-[calc(100vh-80px)] flex">
      {/* Left Side: Auto-scrolling Carousel */}
      <AuthCarousel bannerType="LOGIN_BG" />

      {/* Right Side: Form */}
      <div className="w-full lg:w-1/2 flex flex-col items-center justify-center p-8 sm:p-12 md:p-24 bg-white">
        <div className="w-full max-w-md">
          {/* Mobile Logo */}
          <div className="lg:hidden flex flex-col items-center justify-center gap-4 mb-10">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-amber-100 via-gold-500/20 to-gold-600/30 border-2 border-gold-600/60 flex items-center justify-center shadow-sm">
              <span className="font-serif text-3xl font-extrabold text-gold-700 leading-none">S</span>
            </div>
            <div className="flex flex-col text-center">
              <span className="font-serif text-2xl font-bold tracking-tight text-gray-900 leading-none">
                SCULPT N SHINE
              </span>
            </div>
          </div>

          <div className="mb-10 text-center lg:text-left">
            <h1 className="text-3xl md:text-4xl font-serif font-bold text-brandDark mb-3">Sign In</h1>
            <p className="text-gray-500 text-sm md:text-base font-medium">Access your premium wellness account</p>
          </div>

          <form className="space-y-6" onSubmit={handleSubmit}>            {/* Email Field with Icon */}
            <div className="space-y-2">
              <label className="block text-sm font-bold text-gray-700">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-cream-50/50 border border-cream-200 text-gray-900 rounded-xl pl-12 pr-4 py-3.5 outline-none focus:border-gold-500 focus:ring-2 focus:ring-gold-500/30 transition-all shadow-sm"
                  placeholder="name@example.com"
                  required
                />
              </div>
            </div>

            {/* Password Field with Icon */}
            <div className="space-y-2">
              <label className="block text-sm font-bold text-gray-700">Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-cream-50/50 border border-cream-200 text-gray-900 rounded-xl pl-12 pr-12 py-3.5 outline-none focus:border-gold-500 focus:ring-2 focus:ring-gold-500/30 transition-all shadow-sm font-mono tracking-widest placeholder:tracking-normal placeholder:font-sans"
                  placeholder="••••••••"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none transition-colors"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>

            {/* Form Actions (Remember Me & Forgot Password) */}
            <div className="flex flex-col gap-2 pt-2">
              <div className="flex flex-wrap items-center justify-between gap-4">
                {/* Remember Me Checkbox */}
                <label className="flex items-center gap-2.5 cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={() => setRememberMe(!rememberMe)}
                    className="w-4 h-4 rounded border-cream-300 text-gold-600 focus:ring-gold-500 cursor-pointer accent-gold-600"
                  />
                  <span className="text-sm font-semibold text-gray-600 group-hover:text-brandDark transition-colors">
                    Remember Me
                  </span>
                </label>
                
                <Link
                  href="/forgot-password"
                  className="text-sm font-bold text-gold-600 hover:text-gold-700 transition-colors"
                >
                  Forgot Password?
                </Link>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-brandDark hover:bg-black disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-4 rounded-xl transition-all shadow-lg shadow-black/10 mt-6 text-lg flex items-center justify-center gap-2"
            >
              {isLoading && <Loader className="w-5 h-5 animate-spin" />}
              <span>{isLoading ? 'Signing In...' : 'Sign In'}</span>
            </button>
          </form>

          {/* Register Link */}
          <p className="mt-10 text-center text-sm font-medium text-gray-500">
            Don't have an account?{' '}
            <Link href="/signup" className="text-gold-600 font-bold hover:text-gold-700 transition-colors underline-offset-4 hover:underline">
              Register Now
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
