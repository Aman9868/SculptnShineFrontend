'use client';

import React, { useEffect, useState } from 'react';
import { ArrowRight } from 'lucide-react';
import Link from 'next/link';

interface Guide {
  id: string;
  title: string;
  slug: string;
  category: string;
  image: string;
  readTime: string;
  createdAt: string;
}

const staticGuides = [
  {
    id: 'g1',
    title: 'How Much Protein Do You Really Need Every Day?',
    slug: 'how-much-protein-do-you-really-need',
    category: 'NUTRITION',
    image: 'https://images.unsplash.com/photo-1579722820308-d74e571900a9?q=80&w=600',
    readTime: '4 min read',
    createdAt: new Date().toISOString()
  },
  {
    id: 'g2',
    title: 'Pre Workout: When to Take & How It Works',
    slug: 'pre-workout-when-to-take-how-it-works',
    category: 'WORKOUT',
    image: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=600',
    readTime: '5 min read',
    createdAt: new Date().toISOString()
  },
  {
    id: 'g3',
    title: '5 Daily Habits for a Healthier Stronger You',
    slug: '5-daily-habits-for-healthier-stronger-you',
    category: 'WELLNESS',
    image: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?q=80&w=600',
    readTime: '6 min read',
    createdAt: new Date().toISOString()
  }
];

export default function GuidesSection() {
  const [guides, setGuides] = useState<Guide[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchGuides = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/guides?status=true&limit=3`);
        if (res.ok) {
          const data = await res.json();
          if (data.success && data.guides && data.guides.length > 0) {
            setGuides(data.guides.slice(0, 3));
          } else {
            setGuides(staticGuides);
          }
        } else {
          setGuides(staticGuides);
        }
      } catch (err) {
        setGuides(staticGuides);
      } finally {
        setIsLoading(false);
      }
    };
    fetchGuides();
  }, []);

  if (isLoading) return null;

  return (
    <section className="py-12 lg:py-16 bg-cream-100 border-b border-cream-200">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">

        {/* Section Header with Decorative Lines */}
        <div className="text-center mb-10">
          <div className="flex items-center justify-center gap-4 max-w-md mx-auto mb-2">
            <div className="h-px bg-gradient-to-r from-transparent to-gold-600/40 flex-1" />
            <div className="w-2 h-2 rotate-45 bg-gold-600" />
            <div className="h-px bg-gradient-to-l from-transparent to-gold-600/40 flex-1" />
          </div>
          <h2 className="font-serif text-2xl sm:text-3xl lg:text-4xl font-extrabold text-gray-900 tracking-tight uppercase">
            FITNESS & NUTRITION GUIDES
          </h2>
        </div>

        <div className="flex justify-end mb-6">
          <Link href="/guides" className="hidden md:flex items-center gap-2 text-sm font-semibold text-gold-600 hover:text-gold-700 transition-colors">
            View All Articles <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-7">
          {guides.map((guide) => (
            <Link key={guide.id} href={`/guides/${guide.slug}`} className="group block">
              <div className="bg-white rounded-2xl border border-cream-300 shadow-luxury hover:shadow-xl hover:border-gold-300/80 hover:-translate-y-1 transition-all duration-300 overflow-hidden">
                {/* Image */}
                <div className="relative aspect-[16/10] w-full overflow-hidden bg-gray-100">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={guide.image}
                    alt={guide.title}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
                  <div className="absolute bottom-3 left-3 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full shadow-2xs">
                    <span className="text-[10px] font-black text-gray-900 tracking-wider uppercase">{guide.category}</span>
                  </div>
                </div>

                {/* Content */}
                <div className="p-5">
                  <h3 className="text-base sm:text-lg font-extrabold text-gray-900 leading-snug mb-2.5 group-hover:text-gold-700 transition-colors line-clamp-2">
                    {guide.title}
                  </h3>
                  <div className="flex items-center justify-between text-xs font-medium text-gray-400">
                    <span>{new Date(guide.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                    <span className="text-gold-600 font-bold">{guide.readTime}</span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
        <div className="mt-8 md:hidden flex justify-center">
          <Link href="/guides" className="flex items-center gap-2 text-sm font-semibold text-gold-600 hover:text-gold-700 transition-colors">
            View All Articles <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}
