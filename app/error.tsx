'use client';

import React from 'react';
import Link from 'next/link';

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center text-center p-6 bg-cream-100 space-y-4">
      <div className="w-16 h-16 rounded-full bg-red-100 text-red-600 flex items-center justify-center text-2xl font-bold">
        !
      </div>
      <h2 className="font-serif text-2xl font-bold text-gray-900">
        Something went wrong!
      </h2>
      <p className="text-xs text-gray-600 max-w-md">
        An unexpected error occurred while loading this page. Our engineers have been notified.
      </p>
      <div className="flex gap-3 pt-2">
        <button
          onClick={() => reset()}
          className="bg-gold-600 hover:bg-gold-700 text-white font-bold text-xs px-5 py-2.5 rounded-full"
        >
          Try Again
        </button>
        <Link
          href="/"
          className="bg-cream-200 hover:bg-cream-300 text-gray-800 font-bold text-xs px-5 py-2.5 rounded-full border border-cream-300"
        >
          Return to Home
        </Link>
      </div>
    </div>
  );
}
