import React from 'react';
import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center text-center p-6 bg-cream-100 space-y-4">
      <h1 className="font-serif text-6xl font-extrabold text-gold-700">404</h1>
      <h2 className="font-serif text-2xl font-bold text-gray-900">
        Page Not Found
      </h2>
      <p className="text-xs text-gray-600 max-w-sm">
        The page or product category you are looking for does not exist or has been moved.
      </p>
      <Link
        href="/"
        className="bg-gold-600 hover:bg-gold-700 text-white font-bold text-xs px-6 py-3 rounded-full shadow-md mt-2 inline-block"
      >
        Back to Home Page
      </Link>
    </div>
  );
}
