import React from 'react';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowLeft, Calendar, Clock, User } from 'lucide-react';

interface GuideProps {
  params: Promise<{
    slug: string;
  }>;
}

async function getGuideBySlug(slug: string) {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/guides/slug/${slug}`, {
      next: { revalidate: 60 }
    });
    
    if (!res.ok) {
      return null;
    }
    
    const data = await res.json();
    return data.success ? data.data : null;
  } catch (error) {
    console.error("Error fetching guide:", error);
    return null;
  }
}

export default async function GuideDetailPage({ params }: GuideProps) {
  const { slug } = await params;
  
  // Wait for the guide data
  const guide = await getGuideBySlug(slug);

  if (!guide) {
    // If not found in DB, try to see if it's one of the static ones (fallback for dev)
    const staticGuides = [
      {
        slug: 'how-much-protein-do-you-really-need',
        title: 'How Much Protein Do You Really Need Every Day?',
        category: 'NUTRITION',
        image: 'https://images.unsplash.com/photo-1579722820308-d74e571900a9?q=80&w=600',
        content: '<h2>The Protein Debate: How Much is Enough?</h2><p>Protein is the building block of your muscles, but there is a lot of confusion around how much you actually need to consume daily. The answer depends heavily on your lifestyle, activity level, and goals.</p><img src="https://images.unsplash.com/photo-1579722820308-d74e571900a9?q=80&w=1200" alt="Protein Shake" /><br/><h3>General Guidelines</h3><ul><li><strong>Sedentary Adults:</strong> 0.8g per kg of body weight.</li><li><strong>Endurance Athletes:</strong> 1.2g to 1.4g per kg of body weight.</li><li><strong>Strength Trainers:</strong> 1.6g to 2.2g per kg of body weight.</li></ul><p>If you\'re trying to build muscle, aiming for the higher end of the spectrum is crucial. Supplements like whey protein can help you hit these targets conveniently.</p>',
        createdAt: new Date().toISOString(),
      },
      {
        slug: 'pre-workout-when-to-take-how-it-works',
        title: 'Pre Workout: When to Take & How It Works',
        category: 'WORKOUT',
        image: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=600',
        content: '<h2>Maximizing Your Pre-Workout Supplements</h2><p>Pre-workouts are designed to give you that extra edge in the gym, providing energy, focus, and improved blood flow (the pump). But timing is everything.</p><h3>When to Take It</h3><p>For most pre-workouts containing caffeine, the sweet spot is <strong>20 to 30 minutes before your workout</strong>. This gives your body enough time to absorb the active ingredients.</p><h3>Key Ingredients to Look For</h3><ul><li><strong>Caffeine:</strong> For energy and focus.</li><li><strong>Citrulline Malate:</strong> Enhances blood flow and muscle pump.</li><li><strong>Beta-Alanine:</strong> Reduces muscle fatigue (and gives you those tingles!).</li></ul><p>Always start with a half scoop if you\'re new to pre-workouts to assess your tolerance.</p>',
        createdAt: new Date().toISOString(),
      },
      {
        slug: '5-daily-habits-for-healthier-stronger-you',
        title: '5 Daily Habits for a Healthier Stronger You',
        category: 'WELLNESS',
        image: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?q=80&w=600',
        content: '<h2>Small Habits, Big Results</h2><p>Building a healthier lifestyle isn\'t about massive, overnight changes. It\'s about small, consistent habits that compound over time.</p><ol><li><strong>Hydrate First Thing:</strong> Drink a large glass of water immediately upon waking to rehydrate your body after sleep.</li><li><strong>Prioritize Protein at Breakfast:</strong> A high-protein breakfast stabilizes blood sugar and keeps you full longer.</li><li><strong>Move Every Day:</strong> Even if it\'s just a 15-minute walk. Daily movement is crucial for joint health and mental clarity.</li><li><strong>Unplug Before Bed:</strong> Stop looking at screens 30 minutes before sleep to improve your sleep quality.</li><li><strong>Take Your Vitamins:</strong> A good multivitamin acts as an insurance policy for your diet.</li></ol><p>Start implementing these one by one, and watch your overall wellness improve drastically.</p>',
        createdAt: new Date().toISOString(),
      }
    ];
    
    const staticFallback = staticGuides.find(g => g.slug === slug);
    if (!staticFallback) {
      notFound();
    }
    
    return renderGuide(staticFallback);
  }

  return renderGuide(guide);
}

function renderGuide(guide: any) {
  // Format the date
  const publishDate = new Date(guide.createdAt || new Date()).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  // Extract headings for Table of Contents
  const headings: string[] = [];
  if (guide.content) {
    const regex = /<h2>(.*?)<\/h2>/g;
    let match;
    while ((match = regex.exec(guide.content)) !== null) {
      headings.push(match[1].replace(/<[^>]+>/g, ''));
    }
  }

  return (
    <main className="bg-cream-50 min-h-screen py-10 md:py-16 relative overflow-hidden">
      {/* Decorative Background Elements */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
        {/* Left Splash */}
        <div className="absolute top-1/4 -left-32 w-96 h-96 bg-gold-400/20 rounded-full blur-[100px] opacity-60"></div>
        
        {/* Right Splash */}
        <div className="absolute top-1/3 -right-32 w-[500px] h-[500px] bg-gold-400/20 rounded-full blur-[120px] opacity-60"></div>
        
        {/* Left Dotted Grid */}
        <div className="absolute top-1/4 left-10 opacity-30 hidden lg:block">
          <svg width="100" height="100" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="dotsLeft" x="0" y="0" width="12" height="12" patternUnits="userSpaceOnUse">
                <circle fill="#D99A2B" cx="2" cy="2" r="1.5"></circle>
              </pattern>
            </defs>
            <rect x="0" y="0" width="100" height="100" fill="url(#dotsLeft)"></rect>
          </svg>
        </div>

        {/* Right Dotted Grid */}
        <div className="absolute top-1/2 right-10 opacity-30 hidden lg:block">
          <svg width="100" height="100" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="dotsRight" x="0" y="0" width="12" height="12" patternUnits="userSpaceOnUse">
                <circle fill="#D99A2B" cx="2" cy="2" r="1.5"></circle>
              </pattern>
            </defs>
            <rect x="0" y="0" width="100" height="100" fill="url(#dotsRight)"></rect>
          </svg>
        </div>

        {/* Left Arrows */}
        <div className="absolute top-[35%] left-12 opacity-20 hidden xl:flex text-gold-600">
          <svg width="60" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
            <path d="M13 5l7 7-7 7M5 5l7 7-7 7"/>
          </svg>
        </div>

        {/* Right Silhouette */}
        <div className="absolute top-[5%] -right-16 opacity-[0.15] hidden lg:block z-0 mix-blend-multiply pointer-events-none w-[500px]">
          <img src="/assets/bodybuilder.png" alt="Bodybuilder Silhouette" className="w-full h-auto object-contain pointer-events-none" />
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Back Button */}
        <Link 
          href="/guides" 
          className="inline-flex items-center gap-2 text-gold-600 hover:text-gold-700 transition-colors font-medium mb-10 text-sm"
        >
          <ArrowLeft size={18} />
          Back to All Articles
        </Link>

        {/* Article Header */}
        <header className="mb-12 text-center">
          <div className="inline-block px-4 py-1 border border-gold-300 text-gold-700 text-xs font-bold tracking-widest uppercase rounded-full mb-6">
            {guide.category || 'Guide'}
          </div>
          
          <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-bold text-brandDark leading-tight mb-8">
            {guide.title}
          </h1>

          <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-gray-600 font-medium">
            <div className="flex items-center gap-2">
              <Calendar size={16} className="text-gold-600" />
              <span>{publishDate}</span>
            </div>
            {guide.readTime && (
              <div className="flex items-center gap-2">
                <Clock size={16} className="text-gold-600" />
                <span>{guide.readTime}</span>
              </div>
            )}
            <div className="flex items-center gap-2">
              <User size={16} className="text-gold-600" />
              <span>Sculpt & Shine Expert</span>
            </div>
          </div>
        </header>

        {/* Featured Image */}
        {guide.image && (
          <div className="relative w-full aspect-[21/9] rounded-2xl overflow-hidden shadow-lg mb-12">
            <img 
              src={guide.image} 
              alt={guide.title}
              className="w-full h-full object-cover"
            />
          </div>
        )}

        {/* Table of Contents Box */}
        {headings.length > 0 && (
          <div className="bg-[#FCF9F2] border border-gold-200 rounded-xl p-6 md:p-8 mb-12 shadow-sm">
            <h4 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-6">In This Article</h4>
            <ul className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-y-4 gap-x-6 text-sm text-gray-700 font-medium">
              {headings.map((heading, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <span className="text-gold-500 mt-1">•</span>
                  <span>{heading}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Article Content */}
        <article className="prose prose-lg max-w-none mb-16">
          <div 
            dangerouslySetInnerHTML={{ __html: guide.content || '<p>No content available.</p>' }} 
            className="guide-content"
          />
        </article>
      </div>

      {/* Basic prose styling injected for the article content */}
      <style dangerouslySetInnerHTML={{__html: `
        .guide-content h2 {
          font-family: 'Playfair Display', serif;
          color: #111827;
          font-size: 2rem;
          font-weight: 700;
          margin-top: 2.5rem;
          margin-bottom: 1rem;
        }
        .guide-content h3 {
          font-family: 'Playfair Display', serif;
          color: #1f2937;
          font-size: 1.5rem;
          font-weight: 600;
          margin-top: 2rem;
          margin-bottom: 0.75rem;
        }
        .guide-content p {
          color: #4b5563;
          line-height: 1.8;
          margin-bottom: 1.5rem;
        }
        .guide-content ul, .guide-content ol {
          margin-bottom: 1.5rem;
          padding-left: 1.5rem;
          color: #4b5563;
        }
        .guide-content li {
          margin-bottom: 0.5rem;
        }
        .guide-content img {
          border-radius: 1rem;
          margin: 2rem 0;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
        }
        .guide-content strong {
          color: #111827;
          font-weight: 600;
        }
      `}} />
    </main>
  );
}
