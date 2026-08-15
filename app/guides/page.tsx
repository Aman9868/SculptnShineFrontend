import React from 'react';
import Link from 'next/link';
import { ArrowLeft, Calendar, Clock, ArrowRight, BookOpen } from 'lucide-react';

export const metadata = {
  title: 'Fitness & Nutrition Guides | Sculpt & Shine',
  description: 'Expert workout guides, nutrition advice, and wellness tips to transform your fitness journey.',
};

const staticGuides = [
  {
    id: 'g1',
    title: 'How Much Protein Do You Really Need Every Day?',
    slug: 'how-much-protein-do-you-really-need',
    category: 'NUTRITION',
    image: 'https://images.unsplash.com/photo-1579722820308-d74e571900a9?q=80&w=600',
    readTime: '4 min read',
    createdAt: '2026-08-14T00:00:00.000Z',
    excerpt: 'Protein is the building block of your muscles. Find out your optimal daily target based on your workout routine and fitness goals.',
  },
  {
    id: 'g2',
    title: 'Pre Workout: When to Take & How It Works',
    slug: 'pre-workout-when-to-take-how-it-works',
    category: 'WORKOUT',
    image: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=600',
    readTime: '5 min read',
    createdAt: '2026-08-14T00:00:00.000Z',
    excerpt: 'Maximize energy, blood flow, and mental focus during your training with the right pre-workout timing and ingredients.',
  },
  {
    id: 'g3',
    title: '5 Daily Habits for a Healthier Stronger You',
    slug: '5-daily-habits-for-healthier-stronger-you',
    category: 'WELLNESS',
    image: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?q=80&w=600',
    readTime: '6 min read',
    createdAt: '2026-08-14T00:00:00.000Z',
    excerpt: 'Small, daily health rituals that compound over time for sustainable energy, recovery, and peak longevity.',
  }
];

async function getGuides() {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/guides?status=true&limit=20`, {
      next: { revalidate: 60 }
    });
    if (res.ok) {
      const data = await res.json();
      if (data.success && data.guides && data.guides.length > 0) {
        return data.guides;
      }
    }
    return staticGuides;
  } catch {
    return staticGuides;
  }
}

export default async function GuidesPage() {
  const guides = await getGuides();

  return (
    <main className="bg-cream-50 min-h-screen py-10 md:py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Top Back Navigation */}
        <div className="mb-8">
          <Link 
            href="/" 
            className="inline-flex items-center gap-2 text-gold-700 hover:text-gold-800 transition-colors font-semibold text-xs sm:text-sm bg-white px-4 py-2 rounded-full border border-cream-300 shadow-xs active:scale-95"
          >
            <ArrowLeft size={16} />
            Back to Home Screen
          </Link>
        </div>

        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="flex items-center justify-center gap-4 max-w-md mx-auto mb-3">
            <div className="h-px bg-gradient-to-r from-transparent to-gold-600/40 flex-1" />
            <div className="w-2 h-2 rotate-45 bg-gold-600" />
            <div className="h-px bg-gradient-to-l from-transparent to-gold-600/40 flex-1" />
          </div>
          <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl font-extrabold text-gray-900 tracking-tight uppercase mb-4">
            Fitness & Nutrition Guides
          </h1>
          <p className="text-gray-600 text-sm sm:text-base leading-relaxed">
            Evidence-backed strategies, supplement breakdowns, and training advice curated by Sculpt & Shine wellness experts.
          </p>
        </div>

        {/* Guides Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          {guides.map((guide: any) => (
            <Link 
              key={guide.id || guide.slug} 
              href={`/guides/${guide.slug}`}
              className="group bg-white rounded-2xl overflow-hidden border border-cream-300 shadow-luxury hover:shadow-luxury-hover transition-all duration-300 flex flex-col justify-between"
            >
              <div>
                <div className="relative aspect-[16/10] w-full overflow-hidden bg-cream-100">
                  <img
                    src={guide.image}
                    alt={guide.title}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute top-3 left-3 bg-white/95 backdrop-blur-sm px-3 py-1 rounded-full border border-cream-200">
                    <span className="text-[11px] font-extrabold text-gold-700 tracking-wider uppercase">
                      {guide.category || 'GUIDE'}
                    </span>
                  </div>
                </div>

                <div className="p-6">
                  <h2 className="text-lg font-bold text-gray-900 leading-snug mb-3 group-hover:text-gold-700 transition-colors line-clamp-2">
                    {guide.title}
                  </h2>
                  <p className="text-xs sm:text-sm text-gray-600 line-clamp-2 mb-4 leading-relaxed">
                    {guide.excerpt || 'Explore this comprehensive guide for tips and actionable advice.'}
                  </p>
                </div>
              </div>

              <div className="px-6 pb-6 pt-2 flex items-center justify-between text-xs text-gray-500 border-t border-cream-200">
                <div className="flex items-center gap-2">
                  <Calendar size={13} className="text-gold-600" />
                  <span>{new Date(guide.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                </div>
                {guide.readTime && (
                  <div className="flex items-center gap-1">
                    <Clock size={13} className="text-gold-600" />
                    <span>{guide.readTime}</span>
                  </div>
                )}
              </div>
            </Link>
          ))}
        </div>

      </div>
    </main>
  );
}
