export interface CategoryConfig {
  title: string;
  description: string;
  bannerImage: string;
  subcategories: string[];
  brands: string[];
}

export const CATEGORY_CONFIG: Record<string, CategoryConfig> = {
  salon: {
    title: 'SALON',
    description: 'Professional products for every salon need.',
    bannerImage: '/assets/salon_banner.png',
    subcategories: ['All Salon', 'Hair Care', 'Hair Color', 'Hair Styling', 'Hair Treatment', 'Shampoo & Conditioner', 'Tools & Accessories', 'Salon Furniture'],
    brands: ["L'Oréal Professionnel", "Schwarzkopf", "Wella Professionals", "Matrix", "Kérastase"],
  },
  supplements: {
    title: 'SUPPLEMENTS',
    description: 'Fuel your fitness journey with premium supplements.',
    bannerImage: '/assets/cat_supplements.png',
    subcategories: ['All Supplements', 'Whey Protein', 'Mass Gainer', 'Pre-Workout', 'BCAAs & EAAs', 'Creatine', 'Fat Burners'],
    brands: ['Optimum Nutrition', 'MuscleTech', 'Dymatize', 'MyProtein', 'BSN', 'Cellucor'],
  },
  'skin-care': {
    title: 'SKIN CARE',
    description: 'Radiant skin starts with the right routine.',
    bannerImage: '/assets/cat_skincare.png',
    subcategories: ['All Skin Care', 'Cleansers', 'Moisturizers', 'Serums & Essences', 'Sunscreens', 'Face Masks', 'Eye Care'],
    brands: ['Cetaphil', 'CeraVe', 'Neutrogena', 'The Ordinary', 'Kiehl\'s', 'La Roche-Posay'],
  },
  'hair-care': {
    title: 'HAIR CARE',
    description: 'Nourish and protect your hair everyday.',
    bannerImage: '/assets/cat_haircare.png',
    subcategories: ['All Hair Care', 'Shampoo', 'Conditioner', 'Hair Oil', 'Hair Masks', 'Hair Serums'],
    brands: ['Dove', 'Tresemme', 'Pantene', 'Garnier', 'Moroccanoil', 'Olaplex'],
  },
  wellness: {
    title: 'WELLNESS',
    description: 'Holistic well-being for body and mind.',
    bannerImage: '/assets/cat_wellness.png',
    subcategories: ['All Wellness', 'Multivitamins', 'Omega 3', 'Immunity Boosters', 'Weight Management', 'Sleep Aids'],
    brands: ['Nature Made', 'Centrum', 'Himalaya', 'Swisse', 'Now Foods'],
  },
  'beauty-tools': {
    title: 'BEAUTY TOOLS',
    description: 'Elevate your routine with professional tools.',
    bannerImage: '/assets/cat_beauty.png',
    subcategories: ['All Beauty Tools', 'Hair Dryers', 'Straighteners', 'Curling Irons', 'Face Rollers', 'Makeup Brushes'],
    brands: ['Dyson', 'Philips', 'Vega', 'Braun', 'Foreo'],
  },
};

import { Category, ValueProp, PromoBanner } from '@/types';

export const CATEGORIES: Category[] = [
  { id: 'cat-1', name: 'Proteins & Supplements', image: '/assets/cat_supplements.png', href: '/category/proteins-fitness-supplements', iconName: 'Activity' },
  { id: 'cat-2', name: 'Skincare & Facial Care', image: '/assets/cat_skincare.png', href: '/category/skincare-facial-care', iconName: 'Sparkles' },
  { id: 'cat-3', name: 'Salon & Haircare Excellence', image: '/assets/cat_haircare.png', href: '/category/salon-haircare-excellence', iconName: 'Droplet' },
  { id: 'cat-4', name: 'Wellness & Daily Health', image: '/assets/cat_wellness.png', href: '/category/wellness-daily-health', iconName: 'Heart' },
  { id: 'cat-5', name: 'Beauty & Luxury Cosmetics', image: '/assets/cat_beauty.png', href: '/category/beauty-luxury-cosmetics', iconName: 'Sparkles' },
];

export const VALUE_PROPOSITIONS: ValueProp[] = [
  { id: 'vp-1', title: '100% Original', subtitle: 'Authentic products guaranteed', icon: 'ShieldCheck' },
  { id: 'vp-2', title: 'Free Shipping', subtitle: 'On orders above ₹1000', icon: 'Truck' },
  { id: 'vp-3', title: 'Premium Quality', subtitle: 'Tested & certified', icon: 'Award' },
];

export const PROMO_BANNERS: PromoBanner[] = [
  { id: 'pb-1', title: 'Build Muscle', subtitle: 'Premium Whey Proteins', actionText: 'Shop Now', image: '/assets/promo_muscle.png', link: '/category/proteins-fitness-supplements' },
  { id: 'pb-2', title: 'Fuel Your Workout', subtitle: 'Explosive Pre-Workouts', actionText: 'Explore', image: '/assets/promo_workout.png', link: '/category/proteins-fitness-supplements' },
  { id: 'pb-3', title: 'Daily Health', subtitle: 'Vitamins & Wellness', actionText: 'Discover', image: '/assets/promo_track.png', link: '/category/wellness-daily-health' },
];
