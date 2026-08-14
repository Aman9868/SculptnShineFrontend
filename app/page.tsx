import React from 'react';
import { HomeScreenBanner } from '@/components/home/HomeScreenBanner';
import { ValueProps } from '@/components/home/ValueProps';
import { ShopByCategory } from '@/components/home/ShopByCategory';
import { BestSellers } from '@/components/home/BestSellers';
import WhyChooseUs from '@/components/home/WhyChooseUs';
import Testimonials from '@/components/home/Testimonials';
import GuidesSection from '@/components/home/GuidesSection';

export default function HomePage() {
  return (
    <div className="space-y-0">
      <HomeScreenBanner />
      <ValueProps />
      <ShopByCategory />
      <BestSellers />
      <WhyChooseUs />
      <Testimonials />
      <GuidesSection />
    </div>
  );
}
