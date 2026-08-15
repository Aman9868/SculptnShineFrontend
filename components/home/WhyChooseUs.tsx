import React from 'react';
import { FlaskConical, Award, Users, ShieldCheck } from 'lucide-react';

const features = [
  {
    icon: FlaskConical,
    title: 'Science Backed',
    description: 'Formulas designed for real results.',
  },
  {
    icon: Award,
    title: 'Premium Ingredients',
    description: 'Sourced from the best in the world.',
  },
  {
    icon: Users,
    title: 'Result Driven',
    description: 'Trusted by thousands of fitness lovers.',
  },
  {
    icon: ShieldCheck,
    title: 'Made for You',
    description: 'Products for every goal, every lifestyle.',
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

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, idx) => (
            <div key={idx} className="flex flex-col items-center text-center p-6 group">
              <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-orange-50 text-gold-500 transition-transform duration-300 group-hover:scale-110">
                <feature.icon className="h-10 w-10 stroke-[1.5]" />
              </div>
              <h3 className="mb-2 text-lg font-bold text-gray-900">{feature.title}</h3>
              <p className="text-sm text-gray-500 max-w-[200px]">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
