import React, { useState, useEffect } from 'react';
import { ChevronRight, X, SlidersHorizontal, RotateCcw, Search } from 'lucide-react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';

interface FilterItem {
  name: string;
  count: number;
}

interface RatingItem {
  stars: number;
  count: number;
}

interface FilterSidebarProps {
  categories: any[];
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
  categories, 
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

  // Local State for Filters
  const [localBrands, setLocalBrands] = useState<string[]>(parseList('brand'));
  const [localWeights, setLocalWeights] = useState<string[]>(parseList('weights'));
  const [localFlavors, setLocalFlavors] = useState<string[]>(parseList('flavors'));
  const [localPreferences, setLocalPreferences] = useState<string[]>(parseList('preferences'));
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

  // Helper to toggle local state lists
  const toggleLocalList = (setter: React.Dispatch<React.SetStateAction<string[]>>, list: string[], value: string) => {
    if (list.includes(value)) {
      setter(list.filter((v) => v !== value));
    } else {
      setter([...list, value]);
    }
  };

  // Apply Filters Button Click Handler
  const handleApplyFilters = () => {
    const params = new URLSearchParams(searchParams.toString());
    
    const updateParam = (key: string, list: string[]) => {
      if (list.length > 0) params.set(key, list.join(','));
      else params.delete(key);
    };
    
    updateParam('brand', localBrands);
    updateParam('weights', localWeights);
    updateParam('flavors', localFlavors);
    updateParam('preferences', localPreferences);
    
    if (localRating) params.set('rating', localRating.toString());
    else params.delete('rating');

    if (minPrice > MIN) params.set('minPrice', minPrice.toString());
    else params.delete('minPrice');
    
    if (maxPrice < MAX) params.set('maxPrice', maxPrice.toString());
    else params.delete('maxPrice');
    
    params.delete('page');
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
    onMobileClose?.();
  };

  const handleClearAll = () => {
    setLocalBrands([]);
    setLocalWeights([]);
    setLocalFlavors([]);
    setLocalPreferences([]);
    setLocalRating(null);
    setMinPrice(MIN);
    setMaxPrice(MAX);
    router.push(pathname, { scroll: false });
    onMobileClose?.();
  };

  const filteredBrands = dynamicFilters?.brands?.filter(b => 
    b.name.toLowerCase().includes(brandSearch.toLowerCase())
  ) || [];

  const renderFilterContent = () => (
    <>
      {/* Price Filter */}
      <div className="mb-8 border-b border-gray-100 pb-6">
        <h4 className="text-sm font-bold tracking-wider mb-6 uppercase text-gray-900">Price Range</h4>
        <div className="px-2 mb-2 relative h-12">
          <div className="absolute top-4 left-0 w-full h-1 bg-gray-200 rounded-full"></div>
          <div 
            className="absolute top-4 h-1 bg-gold-500 rounded-full transition-all duration-75"
            style={{ 
              left: `${((minPrice - MIN) / (MAX - MIN)) * 100}%`,
              right: `${100 - ((maxPrice - MIN) / (MAX - MIN)) * 100}%` 
            }}
          ></div>
          
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
            className="absolute top-3 w-full appearance-none bg-transparent pointer-events-none [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-gold-500 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:shadow"
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
            className="absolute top-3 w-full appearance-none bg-transparent pointer-events-none [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-gold-500 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:shadow"
          />
        </div>
        <div className="flex justify-between text-xs text-gray-600 font-medium px-1">
          <span>₹{minPrice}</span>
          <span>₹{maxPrice}{maxPrice === MAX ? '+' : ''}</span>
        </div>
      </div>

      {/* Brands */}
      {dynamicFilters && dynamicFilters.brands && dynamicFilters.brands.length > 0 && (
        <div className="mb-8 border-b border-gray-100 pb-6">
          <div className="flex justify-between items-center mb-4">
            <h4 className="text-sm font-bold tracking-wider uppercase text-gray-900">Brand</h4>
            {filteredBrands.length > 5 && (
              <span className="text-xs text-gray-400 font-medium">{filteredBrands.length} brands</span>
            )}
          </div>
          <div className="relative mb-3">
            <input 
              type="text" 
              placeholder="Search brand..." 
              value={brandSearch}
              onChange={(e) => setBrandSearch(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 text-xs sm:text-sm border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-gold-500 placeholder-gray-400"
            />
            <Search className="absolute left-2.5 top-2.5 w-3.5 h-3.5 text-gray-400" />
          </div>
          <ul className="space-y-2.5 max-h-52 overflow-y-auto no-scrollbar pr-1">
            {filteredBrands.map((brand, idx) => (
              <li key={idx} className="flex items-center justify-between group">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id={`brand-${idx}`}
                    checked={localBrands.includes(brand.name)}
                    onChange={() => toggleLocalList(setLocalBrands, localBrands, brand.name)}
                    className="w-4 h-4 rounded border-gray-300 text-gold-500 focus:ring-gold-500 cursor-pointer accent-gold-600"
                  />
                  <label htmlFor={`brand-${idx}`} className="ml-2.5 text-xs sm:text-sm text-gray-700 cursor-pointer group-hover:text-gray-950">
                    {brand.name}
                  </label>
                </div>
                <span className="text-xs text-gray-400 font-medium">({brand.count})</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Weights */}
      {dynamicFilters && dynamicFilters.weights && dynamicFilters.weights.length > 0 && (
        <div className="mb-8 border-b border-gray-100 pb-6">
          <div className="flex justify-between items-center mb-4">
            <h4 className="text-sm font-bold tracking-wider uppercase text-gray-900">Weight / Volume</h4>
          </div>
          <ul className="space-y-2.5 max-h-48 overflow-y-auto no-scrollbar pr-1">
            {dynamicFilters.weights.map((weight, idx) => (
              <li key={idx} className="flex items-center justify-between group">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id={`weight-${idx}`}
                    checked={localWeights.includes(weight.name)}
                    onChange={() => toggleLocalList(setLocalWeights, localWeights, weight.name)}
                    className="w-4 h-4 rounded border-gray-300 text-gold-500 focus:ring-gold-500 cursor-pointer accent-gold-600"
                  />
                  <label htmlFor={`weight-${idx}`} className="ml-2.5 text-xs sm:text-sm text-gray-700 cursor-pointer group-hover:text-gray-950">
                    {weight.name}
                  </label>
                </div>
                <span className="text-xs text-gray-400 font-medium">({weight.count})</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Flavors */}
      {dynamicFilters && dynamicFilters.flavors && dynamicFilters.flavors.length > 0 && (
        <div className="mb-8 border-b border-gray-100 pb-6">
          <div className="flex justify-between items-center mb-4">
            <h4 className="text-sm font-bold tracking-wider uppercase text-gray-900">Flavor</h4>
          </div>
          <ul className="space-y-2.5 max-h-48 overflow-y-auto no-scrollbar pr-1">
            {dynamicFilters.flavors.map((flavor, idx) => (
              <li key={idx} className="flex items-center justify-between group">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id={`flavor-${idx}`}
                    checked={localFlavors.includes(flavor.name)}
                    onChange={() => toggleLocalList(setLocalFlavors, localFlavors, flavor.name)}
                    className="w-4 h-4 rounded border-gray-300 text-gold-500 focus:ring-gold-500 cursor-pointer accent-gold-600"
                  />
                  <label htmlFor={`flavor-${idx}`} className="ml-2.5 text-xs sm:text-sm text-gray-700 cursor-pointer group-hover:text-gray-950">
                    {flavor.name}
                  </label>
                </div>
                <span className="text-xs text-gray-400 font-medium">({flavor.count})</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Preferences */}
      {dynamicFilters && dynamicFilters.preferences && dynamicFilters.preferences.length > 0 && (
        <div className="mb-8 border-b border-gray-100 pb-6">
          <h4 className="text-sm font-bold tracking-wider mb-4 uppercase text-gray-900">Dietary Preference</h4>
          <ul className="space-y-2.5">
            {dynamicFilters.preferences.map((pref, idx) => (
              <li key={idx} className="flex items-center justify-between group">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id={`pref-${idx}`}
                    checked={localPreferences.includes(pref.name)}
                    onChange={() => toggleLocalList(setLocalPreferences, localPreferences, pref.name)}
                    className="w-4 h-4 rounded border-gray-300 text-gold-500 focus:ring-gold-500 cursor-pointer accent-gold-600"
                  />
                  <label htmlFor={`pref-${idx}`} className="ml-2.5 text-xs sm:text-sm text-gray-700 cursor-pointer group-hover:text-gray-950 capitalize">
                    {pref.name.replace('_', ' ').toLowerCase()}
                  </label>
                </div>
                <span className="text-xs text-gray-400 font-medium">({pref.count})</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Ratings */}
      {dynamicFilters && dynamicFilters.ratings && dynamicFilters.ratings.length > 0 && (
        <div className="mb-8 border-b border-gray-100 pb-6">
          <h4 className="text-sm font-bold tracking-wider mb-4 uppercase text-gray-900">Rating</h4>
          <ul className="space-y-2.5">
            {dynamicFilters.ratings.map((item) => (
              <li key={item.stars} className="flex items-center justify-between group">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id={`rating-${item.stars}`}
                    checked={localRating === item.stars}
                    onChange={() => setLocalRating(localRating === item.stars ? null : item.stars)}
                    className="w-4 h-4 rounded border-gray-300 text-gold-500 focus:ring-gold-500 cursor-pointer accent-gold-600"
                  />
                  <label htmlFor={`rating-${item.stars}`} className="ml-2.5 text-xs sm:text-sm text-gray-700 cursor-pointer flex items-center gap-1 group-hover:text-gray-950">
                    <div className="flex text-gold-500">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <svg key={s} className={`w-3.5 h-3.5 ${s <= item.stars ? 'fill-current' : 'text-gray-200 fill-current'}`} viewBox="0 0 20 20">
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                      ))}
                    </div>
                    <span className="ml-1 text-xs font-medium text-gray-500">& up</span>
                  </label>
                </div>
                <span className="text-xs text-gray-400 font-medium">({item.count})</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </>
  );

  return (
    <>
      {/* Desktop Sticky Sidebar */}
      <aside className="w-72 flex-shrink-0 pr-6 hidden md:flex flex-col sticky top-24 h-[calc(100vh-6rem)]">
        <div className="flex-1 overflow-y-auto no-scrollbar pb-6 pr-4">
          {renderFilterContent()}
        </div>
        
        {/* Apply / Clear Buttons for Desktop */}
        <div className="shrink-0 pt-4 pb-4 bg-[#fcf9f2] border-t border-cream-200">
          <button
            onClick={handleApplyFilters}
            className="w-full bg-[#D99A2B] text-white py-2.5 rounded-md font-bold text-sm tracking-wide uppercase hover:bg-gold-600 transition-colors shadow mb-2"
          >
            Apply Filters
          </button>
          <button
            onClick={handleClearAll}
            className="w-full flex items-center justify-center gap-1.5 text-gold-700 hover:text-gold-800 text-xs font-semibold transition-colors"
          >
            <RotateCcw size={13} />
            Clear All
          </button>
        </div>
      </aside>

      {/* Mobile Filter Drawer */}
      {isMobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          {/* Backdrop */}
          <div 
            onClick={onMobileClose} 
            className="fixed inset-0 bg-black/50 backdrop-blur-xs transition-opacity animate-in fade-in-50"
          />

          {/* Slide-over Panel */}
          <div className="relative ml-auto w-full max-w-xs sm:max-w-sm bg-white h-full shadow-2xl flex flex-col z-10 animate-in slide-in-from-right duration-300">
            
            {/* Header */}
            <div className="p-4 border-b border-cream-300 bg-[#fcf9f2] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <SlidersHorizontal size={18} className="text-gold-600" />
                <h3 className="font-serif font-bold text-base text-gray-900">Filter Products</h3>
              </div>
              <button 
                onClick={onMobileClose}
                className="p-1.5 text-gray-500 hover:text-gray-800 rounded-full hover:bg-cream-200 transition-colors"
                aria-label="Close filters"
              >
                <X size={20} />
              </button>
            </div>

            {/* Scrollable Filters */}
            <div className="flex-1 overflow-y-auto p-4 space-y-2">
              {renderFilterContent()}
            </div>

            {/* Bottom Actions */}
            <div className="p-4 bg-[#fcf9f2] border-t border-cream-300 space-y-2">
              <button
                onClick={handleApplyFilters}
                className="w-full bg-gold-600 text-white py-3 rounded-xl font-bold text-sm tracking-wide uppercase hover:bg-gold-700 shadow-luxury transition-all active:scale-98"
              >
                Apply Filters
              </button>
              <button
                onClick={handleClearAll}
                className="w-full py-2 text-gray-600 hover:text-gold-700 text-xs font-semibold transition-colors flex items-center justify-center gap-1.5"
              >
                <RotateCcw size={13} />
                Reset All Filters
              </button>
            </div>

          </div>
        </div>
      )}
    </>
  );
};
