import React from 'react';
import { FlaskConical, Award, Users, ShieldCheck } from 'lucide-react';

const features = [
  {
    icon: FlaskConical,
    title: 'Science Backed',
    description: 'Formulas designed for real results.',
    stat: '100+',
    statLabel: 'Lab Tested',
  },
  {
    icon: Award,
    title: 'Premium Ingredients',
    description: 'Sourced from the best in the world.',
    stat: 'A+',
    statLabel: 'Grade Quality',
  },
  {
    icon: Users,
    title: 'Result Driven',
    description: 'Trusted by thousands of fitness lovers.',
    stat: '50K+',
    statLabel: 'Happy Customers',
  },
  {
    icon: ShieldCheck,
    title: 'Made for You',
    description: 'Products for every goal, every lifestyle.',
    stat: '100%',
    statLabel: 'Authentic',
  },
];

export default function WhyChooseUs() {
  return (
    <section className="py-12 lg:py-16 bg-cream-100">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section Header with Decorative Lines */}
        <div className="text-center mb-10">
          <div className="flex items-center justify-center gap-4 max-w-md mx-auto mb-2">
            <div className="h-px bg-gradient-to-r from-transparent to-gold-600/40 flex-1" />
            <div className="w-2 h-2 rotate-45 bg-gold-600" />
            <div className="h-px bg-gradient-to-l from-transparent to-gold-600/40 flex-1" />
          </div>
          <h2 className="font-serif text-2xl sm:text-3xl lg:text-4xl font-extrabold text-gray-900 tracking-tight uppercase">
            WHY CHOOSE SCULPT N SHINE?
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
          {features.map((feature, idx) => (
            <div
              key={idx}
              className="relative bg-white rounded-3xl border border-cream-200 p-6 sm:p-8 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] hover:shadow-[0_8px_30px_-4px_rgba(184,134,11,0.15)] hover:border-gold-300/60 transition-all duration-500 group flex flex-col items-center text-center overflow-hidden hover:-translate-y-1"
            >
              {/* Subtle top glow on hover */}
              <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-transparent via-gold-400 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              
              {/* Icon Container */}
              <div className="relative mb-6">
                <div className="absolute inset-0 bg-gold-200 blur-xl opacity-0 group-hover:opacity-40 transition-opacity duration-500 rounded-full" />
                <div className="relative flex h-16 w-16 sm:h-20 sm:w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-cream-50 to-cream-100 border border-cream-200 text-gold-600 transition-all duration-500 group-hover:scale-110 group-hover:rotate-3 shadow-inner">
                  <feature.icon className="h-8 w-8 sm:h-10 sm:w-10 stroke-[1.5]" />
                </div>
              </div>

              {/* Title */}
              <h3 className="mb-2.5 text-lg sm:text-xl font-extrabold text-gray-900 tracking-tight group-hover:text-gold-700 transition-colors">
                {feature.title}
              </h3>

              {/* Description */}
              <p className="text-sm text-gray-500 mb-6 leading-relaxed flex-1">
                {feature.description}
              </p>

              {/* Divider & Stat Container */}
              <div className="w-full pt-5 border-t border-cream-200/80 relative">
                 <div className="absolute -top-px inset-x-12 h-px bg-gradient-to-r from-transparent via-gold-300 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                 
                <div className="flex flex-col items-center justify-center gap-1">
                  <span className="text-2xl sm:text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-gold-600 to-amber-700 tracking-tight">
                    {feature.stat}
                  </span>
                  <p className="text-[10px] sm:text-[11px] font-bold uppercase tracking-[0.2em] text-gray-400">
                    {feature.statLabel}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

