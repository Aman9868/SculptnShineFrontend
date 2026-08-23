import React from 'react';
import { FlaskConical, Award, Users, ShieldCheck, Sparkles, CheckCircle2 } from 'lucide-react';

const features = [
  {
    step: '01',
    icon: FlaskConical,
    title: 'Science Backed Formulas',
    description: 'Thoroughly lab-tested, clinically validated formulas designed for optimal bioavailability & safety.',
    badge: 'Lab Tested',
  },
  {
    step: '02',
    icon: Award,
    title: 'Premium Grade Quality',
    description: 'Only pure, clinically dosed ingredients sourced from world-class certified manufacturing facilities.',
    badge: '100% Pure',
  },
  {
    step: '03',
    icon: ShieldCheck,
    title: '100% Authentic Guarantee',
    description: 'Direct partnerships with official brand importers with tamper-proof security seals & verification codes.',
    badge: 'Certified Genuine',
  },
  {
    step: '04',
    icon: Users,
    title: 'Results-Driven Nutrition',
    description: 'Trusted by over 50,000+ athletes & fitness enthusiasts across India for proven body transformations.',
    badge: '50K+ Athletes',
  },
];

export default function WhyChooseUs() {
  return (
    <section className="py-12 lg:py-16 bg-white border-y border-cream-200 overflow-hidden relative">
      {/* Ambient background gold glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-gold-400/5 rounded-full blur-[140px] pointer-events-none" />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-10 sm:mb-12">
          <div className="flex items-center justify-center gap-3 mb-2">
            <div className="h-px bg-gradient-to-r from-transparent via-gold-600/50 to-transparent w-16" />
            <span className="text-[11px] sm:text-xs font-black uppercase tracking-[0.25em] text-gold-700 flex items-center gap-1.5">
              <Sparkles size={13} className="text-gold-600" />
              The Sculpt N Shine Promise
            </span>
            <div className="h-px bg-gradient-to-l from-transparent via-gold-600/50 to-transparent w-16" />
          </div>
          <h2 className="font-serif text-2xl sm:text-3xl lg:text-4xl font-extrabold text-brandDark tracking-tight uppercase">
            WHY CHOOSE SCULPT N SHINE?
          </h2>
          <p className="text-xs sm:text-sm text-gray-500 font-medium mt-2">
            India&apos;s trusted destination for authentic sports nutrition, clean wellness, and high-performance beauty care
          </p>
        </div>

        {/* 4-Column Feature Grid (Full Width, No cramped image) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 sm:gap-6">
          {features.map((feature, idx) => (
            <div
              key={idx}
              className="group relative bg-gradient-to-b from-cream-50 via-cream-50/70 to-cream-100/80 rounded-3xl border border-cream-200/90 p-6 sm:p-7 shadow-[0_2px_12px_-2px_rgba(0,0,0,0.04)] hover:shadow-[0_12px_28px_-6px_rgba(184,134,11,0.15)] hover:border-gold-400 hover:bg-white transition-all duration-300 flex flex-col justify-between hover:-translate-y-1 overflow-hidden"
            >
              {/* Subtle Step Number Watermark */}
              <span className="absolute top-4 right-5 text-4xl font-serif font-black text-cream-300/60 group-hover:text-gold-200/60 transition-colors select-none pointer-events-none">
                {feature.step}
              </span>

              {/* Top: Icon + Badge */}
              <div>
                <div className="flex items-center justify-between mb-5">
                  <div className="flex h-12 w-12 sm:h-13 sm:w-13 items-center justify-center rounded-2xl bg-white border border-cream-300 text-gold-600 shadow-2xs group-hover:scale-110 group-hover:bg-gold-50 group-hover:border-gold-400 transition-all duration-300">
                    <feature.icon className="h-6 w-6 stroke-[1.6]" />
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-wider bg-white/80 border border-cream-200 px-2.5 py-1 rounded-full text-gray-600 group-hover:border-gold-300 group-hover:text-gold-800 transition-colors">
                    {feature.badge}
                  </span>
                </div>

                {/* Title */}
                <h3 className="text-base sm:text-lg font-bold text-brandDark tracking-tight mb-2 group-hover:text-gold-700 transition-colors">
                  {feature.title}
                </h3>

                {/* Description */}
                <p className="text-xs sm:text-sm text-gray-500 leading-relaxed">
                  {feature.description}
                </p>
              </div>

              {/* Bottom Subtle Indicator */}
              <div className="pt-5 mt-4 border-t border-cream-200/60 flex items-center gap-1.5 text-[11px] font-bold text-gold-700 opacity-80 group-hover:opacity-100 transition-opacity">
                <CheckCircle2 size={13} className="text-gold-600" />
                <span>Verified Standard</span>
              </div>

              {/* Hover Accent Glow Top Border */}
              <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-transparent via-gold-500 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
