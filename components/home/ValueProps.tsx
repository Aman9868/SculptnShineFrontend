import React from 'react';
import { ShieldCheck, Truck, RefreshCw, Lock, Headset, Award } from 'lucide-react';
import { VALUE_PROPOSITIONS } from '@/data/categories';

async function getShippingThreshold() {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/shipping`, {
      next: { revalidate: 3600 },
    });
    if (!res.ok) return 1000;
    const data = await res.json();
    return data.success ? data.data.threshold || 1000 : 1000;
  } catch (error) {
    console.error('Error fetching shipping settings:', error);
    return 1000;
  }
}

export const ValueProps = async () => {
  const freeShippingThreshold = await getShippingThreshold();
  const valueProps = VALUE_PROPOSITIONS.map((prop) =>
    prop.id === 'vp-2'
      ? { ...prop, subtitle: `On orders above ₹${freeShippingThreshold.toLocaleString('en-IN')}` }
      : prop
  );

  const iconMap: Record<string, React.ReactNode> = {
    ShieldCheck: <ShieldCheck size={22} className="text-gold-600" />,
    Truck: <Truck size={22} className="text-gold-600" />,
    RefreshCw: <RefreshCw size={22} className="text-gold-600" />,
    Lock: <Lock size={22} className="text-gold-600" />,
    Headset: <Headset size={22} className="text-gold-600" />,
    Award: <Award size={22} className="text-gold-600" />,
  };

  return (
    <section className="bg-white border-b border-cream-300 py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 divide-y sm:divide-y-0 sm:divide-x divide-cream-300">
          {valueProps.map((prop, idx) => (
            <div
              key={prop.id}
              className={`flex items-center gap-4 justify-center sm:justify-start md:justify-center text-left ${
                idx !== 0 ? 'pt-4 sm:pt-0' : ''
              }`}
            >
              <div className="w-10 h-10 rounded-full bg-cream-100 border border-cream-300 flex items-center justify-center shrink-0">
                {iconMap[prop.icon]}
              </div>
              <div>
                <h4 className="text-xs font-bold text-gray-900 tracking-tight">
                  {prop.title}
                </h4>
                <p className="text-[11px] font-medium text-gray-500">
                  {prop.subtitle}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
