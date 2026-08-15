'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Mail, Eye, EyeOff, User, Phone, Loader, Lock } from 'lucide-react';
import { AuthCarousel } from '@/components/auth/AuthCarousel';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'react-toastify';

export default function SignupPage() {
  const router = useRouter();
  const { register, isLoading, isAuthenticated } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      router.push('/');
    }
  }, [isAuthenticated, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!fullName || !email || !password) {
      toast.error('Please fill in all required fields');
      return;
    }

    // Split fullName into firstName and lastName
    const [firstName, ...lastNameParts] = fullName.trim().split(' ');
    const lastName = lastNameParts.join(' ') || 'User';

    if (!firstName) {
      toast.error('Please enter a valid name');
      return;
    }

    try {
      await register(firstName, lastName, email, password);
      toast.success('Successfully registered!');
      router.push('/');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Registration failed. Please try again.');
    }
  };

  return (
    <div className="min-h-[calc(100vh-80px)] flex">
      {/* Left Side: Auto-scrolling Carousel */}
      <AuthCarousel bannerType="SIGNUP_BG" />

      {/* Right Side: Form */}
      <div className="w-full lg:w-1/2 flex flex-col items-center justify-center p-8 sm:p-12 md:p-16 lg:p-24 bg-white">
        <div className="w-full max-w-md">
          {/* Mobile Logo */}
          <div className="lg:hidden flex flex-col items-center justify-center gap-4 mb-8">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-amber-100 via-gold-500/20 to-gold-600/30 border-2 border-gold-600/60 flex items-center justify-center shadow-sm">
              <span className="font-serif text-3xl font-extrabold text-gold-700 leading-none">S</span>
            </div>
            <div className="flex flex-col text-center">
              <span className="font-serif text-2xl font-bold tracking-tight text-gray-900 leading-none">
                SCULPT N SHINE
              </span>
            </div>
          </div>

          <div className="mb-8 text-center lg:text-left">
            <h1 className="text-3xl md:text-4xl font-serif font-bold text-brandDark mb-3">Create Account</h1>
            <p className="text-gray-500 text-sm md:text-base font-medium">Join Sculpt N Shine for high-quality wellness solutions</p>
          </div>

          <form className="space-y-5" onSubmit={handleSubmit}>            {/* Full Name with Icon */}
            <div className="space-y-2">
              <label className="block text-sm font-bold text-gray-700">Full Name</label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full bg-cream-50/50 border border-cream-200 text-gray-900 rounded-xl pl-12 pr-4 py-3 outline-none focus:border-gold-500 focus:ring-2 focus:ring-gold-500/30 transition-all shadow-sm"
                  placeholder="Enter your name"
                  required
                />
              </div>
            </div>

            {/* Email Field with Icon */}
            <div className="space-y-2">
              <label className="block text-sm font-bold text-gray-700">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-cream-50/50 border border-cream-200 text-gray-900 rounded-xl pl-12 pr-4 py-3 outline-none focus:border-gold-500 focus:ring-2 focus:ring-gold-500/30 transition-all shadow-sm"
                  placeholder="name@example.com"
                  required
                />
              </div>
            </div>
            
            {/* Phone Number with Icon */}
            <div className="space-y-2">
              <label className="block text-sm font-bold text-gray-700">Phone Number</label>
              <div className="relative">
                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full bg-cream-50/50 border border-cream-200 text-gray-900 rounded-xl pl-12 pr-4 py-3 outline-none focus:border-gold-500 focus:ring-2 focus:ring-gold-500/30 transition-all shadow-sm"
                  placeholder="+91 XXXXX XXXXX"
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
                  className="w-full bg-cream-50/50 border border-cream-200 text-gray-900 rounded-xl pl-12 pr-12 py-3 outline-none focus:border-gold-500 focus:ring-2 focus:ring-gold-500/30 transition-all shadow-sm font-mono tracking-widest placeholder:tracking-normal placeholder:font-sans"
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

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-brandDark hover:bg-black disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-4 rounded-xl transition-all shadow-lg shadow-black/10 mt-6 text-lg flex items-center justify-center gap-2"
            >
              {isLoading && <Loader className="w-5 h-5 animate-spin" />}
              <span>{isLoading ? 'Creating Account...' : 'Register Now'}</span>
            </button>
          </form>

          {/* Login Link */}
          <p className="mt-8 text-center text-sm font-medium text-gray-500">
            Already have an account?{' '}
            <Link href="/login" className="text-gold-600 font-bold hover:text-gold-700 transition-colors underline-offset-4 hover:underline">
              Sign In
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
