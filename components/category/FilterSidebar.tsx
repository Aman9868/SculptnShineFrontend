'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { ChevronRight, X, SlidersHorizontal, RotateCcw, Search, Plus, Minus, Star } from 'lucide-react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import Link from 'next/link';

interface FilterItem {
  name: string;
  count: number;
}

interface RatingItem {
  stars: number;
  count: number;
}

interface SubcategoryItem {
  id?: string;
  name: string;
  slug: string;
  count?: number;
}

interface FilterSidebarProps {
  categories?: any[];
  subcategories?: SubcategoryItem[];
  categoryName?: string;
  totalProducts?: number;
  dynamicFilters?: {
    brands: FilterItem[];
    flavors: FilterItem[];
    weights: FilterItem[];
    preferences: FilterItem[];
    ratings?: RatingItem[];
  };
  isMobileOpen?: boolean;
  onMobileClose?: () => void;
}

export const FilterSidebar: React.FC<FilterSidebarProps> = ({ 
  categories = [], 
  subcategories = [],
  categoryName = 'Products',
  totalProducts = 0,
  dynamicFilters,
  isMobileOpen,
  onMobileClose
}) => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Helper to parse comma-separated URL params into arrays
  const parseList = (key: string) => {
    const val = searchParams.get(key);
    return val ? val.split(',') : [];
  };

  const activeSubcategory = searchParams.get('subcategorySlug') || '';

  // Local State for Filters
  const [localBrands, setLocalBrands] = useState<string[]>(parseList('brand'));
  const [localWeights, setLocalWeights] = useState<string[]>(parseList('weights'));
  const [localFlavors, setLocalFlavors] = useState<string[]>(parseList('flavors'));
  const [localPreferences, setLocalPreferences] = useState<string[]>(parseList('preferences'));
  const [localAvailability, setLocalAvailability] = useState<string[]>(parseList('availability'));
  const [localRating, setLocalRating] = useState<number | null>(
    searchParams.get('rating') ? Number(searchParams.get('rating')) : null
  );
  const [brandSearch, setBrandSearch] = useState('');

  // Price Slider State
  const MIN = 50;
  const MAX = 10000;
  const [minPrice, setMinPrice] = useState(Number(searchParams.get('minPrice')) || MIN);
  const [maxPrice, setMaxPrice] = useState(Number(searchParams.get('maxPrice')) || MAX);

  // Sync local state with URL if it changes externally
  useEffect(() => {
    setLocalBrands(parseList('brand'));
    setLocalWeights(parseList('weights'));
    setLocalFlavors(parseList('flavors'));
    setLocalPreferences(parseList('preferences'));
    setLocalAvailability(parseList('availability'));
    setLocalRating(searchParams.get('rating') ? Number(searchParams.get('rating')) : null);
    setMinPrice(Number(searchParams.get('minPrice')) || MIN);
    setMaxPrice(Number(searchParams.get('maxPrice')) || MAX);
  }, [searchParams]);

  // Lock body scroll when mobile drawer is open
  useEffect(() => {
    if (isMobileOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isMobileOpen]);

  // Helper to toggle local state lists and apply immediately for checkboxes
  const toggleCheckbox = (key: string, list: string[], value: string, setter: React.Dispatch<React.SetStateAction<string[]>>) => {
    const updated = list.includes(value) ? list.filter((v) => v !== value) : [...list, value];
    setter(updated);

    const params = new URLSearchParams(searchParams.toString());
    if (updated.length > 0) {
      params.set(key, updated.join(','));
    } else {
      params.delete(key);
    }
    params.set('page', '1');
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  };

  // Handle Subcategory Click
  const handleSubcategoryClick = (slug: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (slug) {
      params.set('subcategorySlug', slug);
    } else {
      params.delete('subcategorySlug');
    }
    params.set('page', '1');
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
    if (onMobileClose) onMobileClose();
  };

  // Apply Price Filters
  const handleApplyPrice = () => {
    const params = new URLSearchParams(searchParams.toString());
    if (minPrice > MIN) params.set('minPrice', minPrice.toString());
    else params.delete('minPrice');

    if (maxPrice < MAX) params.set('maxPrice', maxPrice.toString());
    else params.delete('maxPrice');

    params.set('page', '1');
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
    if (onMobileClose) onMobileClose();
  };

  // Handle Rating Click
  const handleRatingClick = (stars: number) => {
    const params = new URLSearchParams(searchParams.toString());
    if (localRating === stars) {
      setLocalRating(null);
      params.delete('rating');
    } else {
      setLocalRating(stars);
      params.set('rating', stars.toString());
    }
    params.set('page', '1');
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  };

  // Clear All Filters
  const handleResetFilters = () => {
    setLocalBrands([]);
    setLocalWeights([]);
    setLocalFlavors([]);
    setLocalPreferences([]);
    setLocalAvailability([]);
    setLocalRating(null);
    setMinPrice(MIN);
    setMaxPrice(MAX);
    setBrandSearch('');
    
    // Preserve only sort and category
    const params = new URLSearchParams();
    const sort = searchParams.get('sort');
    if (sort) params.set('sort', sort);
    
    router.push(`${pathname}${params.toString() ? '?' + params.toString() : ''}`, { scroll: false });
    if (onMobileClose) onMobileClose();
  };

  // Filter brands based on search input
  const filteredBrands = useMemo(() => {
    if (!dynamicFilters?.brands) return [];
    if (!brandSearch.trim()) return dynamicFilters.brands;
    return dynamicFilters.brands.filter(b => 
      b.name.toLowerCase().includes(brandSearch.toLowerCase().trim())
    );
  }, [dynamicFilters?.brands, brandSearch]);

  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (activeSubcategory) count++;
    if (localBrands.length > 0) count += localBrands.length;
    if (localWeights.length > 0) count += localWeights.length;
    if (localFlavors.length > 0) count += localFlavors.length;
    if (localPreferences.length > 0) count += localPreferences.length;
    if (localAvailability.length > 0) count += localAvailability.length;
    if (localRating) count++;
    if (minPrice > MIN || maxPrice < MAX) count++;
    return count;
  }, [activeSubcategory, localBrands, localWeights, localFlavors, localPreferences, localAvailability, localRating, minPrice, maxPrice]);

  // Combine subcategories from props and categories
  const resolvedSubcategories = useMemo(() => {
    if (subcategories && subcategories.length > 0) return subcategories;
    if (categories && categories.length > 0) {
      return categories.map((c: any) => ({
        id: c.id,
        name: c.name,
        slug: c.slug,
        count: c._count?.products || c.count,
      }));
    }
    return [];
  }, [subcategories, categories]);

  const sidebarContent = (
    <div className="flex flex-col h-full">
      {/* Sidebar Header */}
      <div className="flex items-center justify-between pb-4 mb-5 border-b border-cream-300">
        <div className="flex items-center gap-2">
          <SlidersHorizontal size={17} className="text-gold-600" />
          <h3 className="font-serif font-extrabold text-base uppercase tracking-wider text-brandDark">
            Filter Products
          </h3>
          {activeFiltersCount > 0 && (
            <span className="bg-gold-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
              {activeFiltersCount}
            </span>
          )}
        </div>
        {activeFiltersCount > 0 && (
          <button 
            onClick={handleResetFilters}
            className="flex items-center gap-1 text-xs font-semibold text-red-600 hover:text-red-700 transition-colors cursor-pointer"
          >
            <RotateCcw size={12} />
            <span>Reset</span>
          </button>
        )}
      </div>

      {/* 1. AMAZON STYLE: Product Categories / Subcategories Tree */}
      {resolvedSubcategories.length > 0 && (
        <div className="mb-7 pb-6 border-b border-cream-200">
          <div className="flex items-center justify-between mb-3.5">
            <h4 className="text-xs sm:text-sm font-extrabold tracking-wider uppercase text-brandDark border-b-2 border-gold-500 pb-1 inline-block">
              Product Categories
            </h4>
          </div>
          <ul className="space-y-1.5 text-xs sm:text-sm">
            {/* All Products in Category */}
            <li>
              <button
                onClick={() => handleSubcategoryClick('')}
                className={`w-full text-left flex items-center justify-between py-1.5 px-2.5 rounded-lg transition-all cursor-pointer ${
                  !activeSubcategory
                    ? 'font-extrabold text-gold-700 bg-gold-50/80 border-l-3 border-gold-500'
                    : 'text-gray-700 hover:text-gold-600 hover:bg-cream-50'
                }`}
              >
                <span className="flex items-center gap-1.5">
                  <span className="text-gold-600 font-bold">•</span>
                  <span>All {categoryName}</span>
                </span>
                {totalProducts > 0 && (
                  <span className="text-[11px] text-gray-400 font-medium">({totalProducts})</span>
                )}
              </button>
            </li>

            {/* Subcategories List */}
            {resolvedSubcategories.map((sub, idx) => {
              const isActive = activeSubcategory === sub.slug;
              return (
                <li key={sub.slug || idx}>
                  <button
                    onClick={() => handleSubcategoryClick(sub.slug)}
                    className={`w-full text-left flex items-center justify-between py-1.5 px-2.5 rounded-lg transition-all cursor-pointer ${
                      isActive
                        ? 'font-extrabold text-gold-700 bg-gold-50/80 border-l-3 border-gold-500'
                        : 'text-gray-700 hover:text-gold-600 hover:bg-cream-50'
                    }`}
                  >
                    <span className="flex items-center gap-1.5 truncate pr-2">
                      <span className={`text-[11px] font-bold ${isActive ? 'text-gold-600' : 'text-gray-400'}`}>+</span>
                      <span className="truncate">{sub.name}</span>
                    </span>
                    {sub.count !== undefined && sub.count > 0 && (
                      <span className="text-[11px] text-gray-400 font-medium shrink-0">({sub.count})</span>
                    )}
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      )}

      {/* 2. Availability Filter (In Stock / Out of Stock) */}
      <div className="mb-7 pb-6 border-b border-cream-200">
        <h4 className="text-xs sm:text-sm font-extrabold tracking-wider uppercase text-brandDark mb-3.5 border-b-2 border-gold-500 pb-1 inline-block">
          Availability
        </h4>
        <ul className="space-y-2.5 text-xs sm:text-sm">
          <li className="flex items-center justify-between group">
            <label className="flex items-center cursor-pointer select-none">
              <input
                type="checkbox"
                checked={localAvailability.includes('in-stock')}
                onChange={() => toggleCheckbox('availability', localAvailability, 'in-stock', setLocalAvailability)}
                className="w-4 h-4 rounded border-gray-300 text-gold-600 focus:ring-gold-500 accent-gold-600 cursor-pointer"
              />
              <span className="ml-2.5 text-gray-700 group-hover:text-brandDark font-medium">In Stock</span>
            </label>
          </li>
          <li className="flex items-center justify-between group">
            <label className="flex items-center cursor-pointer select-none">
              <input
                type="checkbox"
                checked={localAvailability.includes('out-of-stock')}
                onChange={() => toggleCheckbox('availability', localAvailability, 'out-of-stock', setLocalAvailability)}
                className="w-4 h-4 rounded border-gray-300 text-gold-600 focus:ring-gold-500 accent-gold-600 cursor-pointer"
              />
              <span className="ml-2.5 text-gray-700 group-hover:text-brandDark font-medium">Out of Stock</span>
            </label>
          </li>
        </ul>
      </div>

      {/* 3. Price Range Slider */}
      <div className="mb-7 pb-6 border-b border-cream-200">
        <h4 className="text-xs sm:text-sm font-extrabold tracking-wider uppercase text-brandDark mb-4 border-b-2 border-gold-500 pb-1 inline-block">
          Price Range
        </h4>
        <div className="px-1 mb-3 relative h-10">
          <div className="absolute top-3 left-0 w-full h-1.5 bg-cream-200 rounded-full" />
          <div 
            className="absolute top-3 h-1.5 bg-gold-500 rounded-full transition-all duration-75"
            style={{ 
              left: `${((minPrice - MIN) / (MAX - MIN)) * 100}%`,
              right: `${100 - ((maxPrice - MIN) / (MAX - MIN)) * 100}%` 
            }}
          />
          <input
            type="range"
            min={MIN}
            max={MAX}
            step="50"
            value={minPrice}
            onChange={(e) => {
              const val = Math.min(Number(e.target.value), maxPrice - 50);
              setMinPrice(val);
            }}
            className="absolute top-2 w-full appearance-none bg-transparent pointer-events-none [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-gold-600 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:shadow-md"
          />
          <input
            type="range"
            min={MIN}
            max={MAX}
            step="50"
            value={maxPrice}
            onChange={(e) => {
              const val = Math.max(Number(e.target.value), minPrice + 50);
              setMaxPrice(val);
            }}
            className="absolute top-2 w-full appearance-none bg-transparent pointer-events-none [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-gold-600 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:shadow-md"
          />
        </div>
        <div className="flex items-center justify-between text-xs text-gray-700 font-bold mb-3">
          <span className="px-2.5 py-1 bg-cream-100 rounded-md border border-cream-300">₹{minPrice}</span>
          <span className="text-gray-400">—</span>
          <span className="px-2.5 py-1 bg-cream-100 rounded-md border border-cream-300">₹{maxPrice}{maxPrice === MAX ? '+' : ''}</span>
        </div>
        <button
          onClick={handleApplyPrice}
          className="w-full py-1.5 bg-brandDark hover:bg-gold-600 text-white text-xs font-bold uppercase tracking-wider rounded-lg transition-colors shadow-2xs cursor-pointer"
        >
          Apply Price
        </button>
      </div>

      {/* 4. Brand Filter with Instant Search */}
      {dynamicFilters && dynamicFilters.brands && dynamicFilters.brands.length > 0 && (
        <div className="mb-7 pb-6 border-b border-cream-200">
          <div className="flex justify-between items-center mb-3">
            <h4 className="text-xs sm:text-sm font-extrabold tracking-wider uppercase text-brandDark border-b-2 border-gold-500 pb-1 inline-block">
              Brand
            </h4>
            <span className="text-[11px] text-gray-400 font-medium">{filteredBrands.length} brands</span>
          </div>
          <div className="relative mb-3">
            <input 
              type="text" 
              placeholder="Search brand..." 
              value={brandSearch}
              onChange={(e) => setBrandSearch(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 text-xs bg-cream-50/80 border border-cream-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-gold-500 placeholder-gray-400"
            />
            <Search className="absolute left-2.5 top-2 w-3.5 h-3.5 text-gray-400" />
          </div>
          <ul className="space-y-2 max-h-52 overflow-y-auto hide-scrollbar pr-1">
            {filteredBrands.map((brand, idx) => (
              <li key={idx} className="flex items-center justify-between group">
                <label className="flex items-center cursor-pointer select-none truncate pr-2">
                  <input
                    type="checkbox"
                    checked={localBrands.includes(brand.name)}
                    onChange={() => toggleCheckbox('brand', localBrands, brand.name, setLocalBrands)}
                    className="w-4 h-4 rounded border-gray-300 text-gold-600 focus:ring-gold-500 accent-gold-600 cursor-pointer shrink-0"
                  />
                  <span className="ml-2.5 text-xs text-gray-700 group-hover:text-brandDark font-medium truncate">
                    {brand.name}
                  </span>
                </label>
                <span className="text-[11px] text-gray-400 font-medium shrink-0">({brand.count})</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* 5. Weight / Volume Filter */}
      {dynamicFilters && dynamicFilters.weights && dynamicFilters.weights.length > 0 && (
        <div className="mb-7 pb-6 border-b border-cream-200">
          <h4 className="text-xs sm:text-sm font-extrabold tracking-wider uppercase text-brandDark mb-3.5 border-b-2 border-gold-500 pb-1 inline-block">
            Weight / Volume
          </h4>
          <ul className="space-y-2 max-h-48 overflow-y-auto hide-scrollbar pr-1">
            {dynamicFilters.weights.map((weight, idx) => (
              <li key={idx} className="flex items-center justify-between group">
                <label className="flex items-center cursor-pointer select-none truncate pr-2">
                  <input
                    type="checkbox"
                    checked={localWeights.includes(weight.name)}
                    onChange={() => toggleCheckbox('weights', localWeights, weight.name, setLocalWeights)}
                    className="w-4 h-4 rounded border-gray-300 text-gold-600 focus:ring-gold-500 accent-gold-600 cursor-pointer shrink-0"
                  />
                  <span className="ml-2.5 text-xs text-gray-700 group-hover:text-brandDark font-medium truncate">
                    {weight.name}
                  </span>
                </label>
                <span className="text-[11px] text-gray-400 font-medium shrink-0">({weight.count})</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* 6. Flavor Filter */}
      {dynamicFilters && dynamicFilters.flavors && dynamicFilters.flavors.length > 0 && (
        <div className="mb-7 pb-6 border-b border-cream-200">
          <h4 className="text-xs sm:text-sm font-extrabold tracking-wider uppercase text-brandDark mb-3.5 border-b-2 border-gold-500 pb-1 inline-block">
            Flavor
          </h4>
          <ul className="space-y-2 max-h-48 overflow-y-auto hide-scrollbar pr-1">
            {dynamicFilters.flavors.map((flavor, idx) => (
              <li key={idx} className="flex items-center justify-between group">
                <label className="flex items-center cursor-pointer select-none truncate pr-2">
                  <input
                    type="checkbox"
                    checked={localFlavors.includes(flavor.name)}
                    onChange={() => toggleCheckbox('flavors', localFlavors, flavor.name, setLocalFlavors)}
                    className="w-4 h-4 rounded border-gray-300 text-gold-600 focus:ring-gold-500 accent-gold-600 cursor-pointer shrink-0"
                  />
                  <span className="ml-2.5 text-xs text-gray-700 group-hover:text-brandDark font-medium truncate">
                    {flavor.name}
                  </span>
                </label>
                <span className="text-[11px] text-gray-400 font-medium shrink-0">({flavor.count})</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* 7. Customer Review Ratings */}
      <div className="mb-4">
        <h4 className="text-xs sm:text-sm font-extrabold tracking-wider uppercase text-brandDark mb-3 border-b-2 border-gold-500 pb-1 inline-block">
          Customer Reviews
        </h4>
        <ul className="space-y-2">
          {[4, 3, 2, 1].map((stars) => (
            <li key={stars}>
              <button
                onClick={() => handleRatingClick(stars)}
                className={`flex items-center gap-1.5 text-xs w-full py-1 px-2 rounded-lg transition-colors cursor-pointer ${
                  localRating === stars
                    ? 'bg-gold-50 text-gold-800 font-bold'
                    : 'text-gray-700 hover:text-gold-600 hover:bg-cream-50'
                }`}
              >
                <div className="flex items-center">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      size={14}
                      className={i < stars ? 'text-amber-400 fill-amber-400' : 'text-gray-300 fill-gray-200'}
                    />
                  ))}
                </div>
                <span>& Up</span>
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sticky Left Sidebar (Width 280px) */}
      <aside className="hidden md:block w-64 lg:w-72 shrink-0 pr-6 border-r border-cream-300">
        <div className="sticky top-24 max-h-[calc(100vh-7rem)] overflow-y-auto hide-scrollbar pr-2 pb-8">
          {sidebarContent}
        </div>
      </aside>

      {/* Mobile Drawer */}
      {isMobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
            onClick={onMobileClose}
          />
          {/* Drawer Body */}
          <div className="relative ml-auto w-[85%] max-w-sm bg-white h-full shadow-2xl p-6 overflow-y-auto flex flex-col z-10 animate-in slide-in-from-right duration-300">
            <div className="flex justify-end mb-2">
              <button 
                onClick={onMobileClose}
                className="p-2 text-gray-500 hover:text-brandDark rounded-full bg-cream-100 hover:bg-cream-200 transition-colors"
                aria-label="Close filters"
              >
                <X size={18} />
              </button>
            </div>
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
};

export default FilterSidebar;
