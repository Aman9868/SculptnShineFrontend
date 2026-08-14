import React, { useState, useEffect } from 'react';
import { ChevronRight } from 'lucide-react';
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
}

export const FilterSidebar: React.FC<FilterSidebarProps> = ({ categories, dynamicFilters }) => {
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

  // Price Slider State
  const MIN = 50;
  const MAX = 10000;
  const [minPrice, setMinPrice] = useState(Number(searchParams.get('minPrice')) || MIN);
  const [maxPrice, setMaxPrice] = useState(Number(searchParams.get('maxPrice')) || MAX);

  // Sync local state with URL if it changes externally (e.g., clicking a subcategory or refreshing)
  useEffect(() => {
    setLocalBrands(parseList('brand'));
    setLocalWeights(parseList('weights'));
    setLocalFlavors(parseList('flavors'));
    setLocalPreferences(parseList('preferences'));
    setLocalRating(searchParams.get('rating') ? Number(searchParams.get('rating')) : null);
    setMinPrice(Number(searchParams.get('minPrice')) || MIN);
    setMaxPrice(Number(searchParams.get('maxPrice')) || MAX);
  }, [searchParams]);

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
    
    // Update List Params
    const updateParam = (key: string, list: string[]) => {
      if (list.length > 0) params.set(key, list.join(','));
      else params.delete(key);
    };
    
    updateParam('brand', localBrands);
    updateParam('weights', localWeights);
    updateParam('flavors', localFlavors);
    updateParam('preferences', localPreferences);
    
    // Update Rating Param
    if (localRating) params.set('rating', localRating.toString());
    else params.delete('rating');

    // Update Price Params
    if (minPrice > MIN) params.set('minPrice', minPrice.toString());
    else params.delete('minPrice');
    
    if (maxPrice < MAX) params.set('maxPrice', maxPrice.toString());
    else params.delete('maxPrice');
    
    // Reset page on filter change
    params.delete('page');
    
    // Push the new URL to trigger server re-render
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  };

  return (
    <aside className="w-72 flex-shrink-0 pr-6 hidden md:flex flex-col sticky top-24 h-[calc(100vh-6rem)]">
      <div className="flex-1 overflow-y-auto no-scrollbar pb-6 pr-4">
        {/* Price Filter */}
      <div className="mb-8 border-b border-gray-100 pb-6">
        <h4 className="text-sm font-bold tracking-wider mb-6 uppercase">Price Range</h4>
        <div className="px-2 mb-2 relative h-12">
          {/* Custom Dual Range Slider */}
          <div className="absolute top-4 left-0 w-full h-1 bg-gray-200 rounded-full"></div>
          <div 
            className="absolute top-4 h-1 bg-gold-400 rounded-full transition-all duration-75"
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
        <div className="flex justify-between text-xs text-gray-500 font-medium px-1">
          <span>₹{minPrice}</span>
          <span>₹{maxPrice}{maxPrice === MAX ? '+' : ''}</span>
        </div>
      </div>

      {/* Brands */}
      {dynamicFilters && dynamicFilters.brands && dynamicFilters.brands.length > 0 && (
        <div className="mb-8 border-b border-gray-100 pb-6">
          <div className="flex justify-between items-center mb-4">
            <h4 className="text-sm font-bold tracking-wider uppercase">Brand</h4>
            <button className="text-xs text-gold-600 font-semibold hover:text-gold-700">View All</button>
          </div>
          <div className="relative mb-4">
            <input 
              type="text" 
              placeholder="Search brand..." 
              className="w-full pl-8 pr-3 py-2 text-sm border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-gold-500 placeholder-gray-400"
            />
            <svg className="absolute left-2.5 top-2.5 w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <ul className="space-y-3">
            {dynamicFilters.brands.map((brand, idx) => (
              <li key={idx} className="flex items-center justify-between group">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id={`brand-${idx}`}
                    checked={localBrands.includes(brand.name)}
                    onChange={() => toggleLocalList(setLocalBrands, localBrands, brand.name)}
                    className="w-4 h-4 rounded border-gray-300 text-gold-500 focus:ring-gold-500 cursor-pointer"
                  />
                  <label htmlFor={`brand-${idx}`} className="ml-3 text-sm text-gray-600 cursor-pointer group-hover:text-gray-900">
                    {brand.name}
                  </label>
                </div>
                <span className="text-xs text-gray-400 font-medium">({brand.count})</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Dynamic Filters: Weights / Volumes */}
      {dynamicFilters && dynamicFilters.weights && dynamicFilters.weights.length > 0 && (
        <div className="mb-8 border-b border-gray-100 pb-6">
          <div className="flex justify-between items-center mb-4">
            <h4 className="text-sm font-bold tracking-wider uppercase">Weight / Volume</h4>
          </div>
          <ul className="space-y-3">
            {dynamicFilters.weights.map((weight, idx) => (
              <li key={idx} className="flex items-center justify-between group">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id={`weight-${idx}`}
                    checked={localWeights.includes(weight.name)}
                    onChange={() => toggleLocalList(setLocalWeights, localWeights, weight.name)}
                    className="w-4 h-4 rounded border-gray-300 text-gold-500 focus:ring-gold-500 cursor-pointer"
                  />
                  <label htmlFor={`weight-${idx}`} className="ml-3 text-sm text-gray-600 cursor-pointer group-hover:text-gray-900">
                    {weight.name}
                  </label>
                </div>
                <span className="text-xs text-gray-400 font-medium">({weight.count})</span>
              </li>
            ))}
          </ul>
          <button className="text-xs text-gold-600 font-medium mt-3 hover:text-gold-700 flex items-center gap-1">
            + View more
          </button>
        </div>
      )}

      {/* Dynamic Filters: Flavors */}
      {dynamicFilters && dynamicFilters.flavors && dynamicFilters.flavors.length > 0 && (
        <div className="mb-8 border-b border-gray-100 pb-6">
          <div className="flex justify-between items-center mb-4">
            <h4 className="text-sm font-bold tracking-wider uppercase">Flavor</h4>
          </div>
          <ul className="space-y-3">
            {dynamicFilters.flavors.map((flavor, idx) => (
              <li key={idx} className="flex items-center justify-between group">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id={`flavor-${idx}`}
                    checked={localFlavors.includes(flavor.name)}
                    onChange={() => toggleLocalList(setLocalFlavors, localFlavors, flavor.name)}
                    className="w-4 h-4 rounded border-gray-300 text-gold-500 focus:ring-gold-500 cursor-pointer"
                  />
                  <label htmlFor={`flavor-${idx}`} className="ml-3 text-sm text-gray-600 cursor-pointer group-hover:text-gray-900">
                    {flavor.name}
                  </label>
                </div>
                <span className="text-xs text-gray-400 font-medium">({flavor.count})</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Dynamic Filters: Preferences */}
      {dynamicFilters && dynamicFilters.preferences && dynamicFilters.preferences.length > 0 && (
        <div className="mb-8 border-b border-gray-100 pb-6">
          <h4 className="text-sm font-bold tracking-wider mb-4 uppercase">Dietary Preference</h4>
          <ul className="space-y-3">
            {dynamicFilters.preferences.map((pref, idx) => (
              <li key={idx} className="flex items-center justify-between group">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id={`pref-${idx}`}
                    checked={localPreferences.includes(pref.name)}
                    onChange={() => toggleLocalList(setLocalPreferences, localPreferences, pref.name)}
                    className="w-4 h-4 rounded border-gray-300 text-gold-500 focus:ring-gold-500 cursor-pointer"
                  />
                  <label htmlFor={`pref-${idx}`} className="ml-3 text-sm text-gray-600 cursor-pointer group-hover:text-gray-900 capitalize">
                    {pref.name.replace('_', ' ').toLowerCase()}
                  </label>
                </div>
                <span className="text-xs text-gray-400 font-medium">({pref.count})</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Dynamic Ratings Filter - Only rendered when rated products exist */}
      {dynamicFilters && dynamicFilters.ratings && dynamicFilters.ratings.length > 0 && (
        <div className="mb-8 border-b border-gray-100 pb-6">
          <h4 className="text-sm font-bold tracking-wider mb-4 uppercase">Rating</h4>
          <ul className="space-y-3">
            {dynamicFilters.ratings.map((item) => (
              <li key={item.stars} className="flex items-center justify-between group">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id={`rating-${item.stars}`}
                    checked={localRating === item.stars}
                    onChange={() => setLocalRating(localRating === item.stars ? null : item.stars)}
                    className="w-4 h-4 rounded border-gray-300 text-gold-500 focus:ring-gold-500 cursor-pointer"
                  />
                  <label htmlFor={`rating-${item.stars}`} className="ml-3 text-sm text-gray-600 cursor-pointer flex items-center gap-1 group-hover:text-gray-900">
                    <div className="flex text-gold-500">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <svg key={s} className={`w-4 h-4 ${s <= item.stars ? 'fill-current' : 'text-gray-200 fill-current'}`} viewBox="0 0 20 20">
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

      </div>
      
      {/* Apply Filters Button */}
      <div className="shrink-0 pt-4 pb-4 bg-[#fcf9f2] border-t border-cream-200">
        <button
          onClick={handleApplyFilters}
          className="w-full bg-[#D99A2B] text-white py-3 rounded-md font-bold text-sm tracking-wide uppercase hover:bg-gold-600 transition-colors shadow mb-3"
        >
          Apply Filters
        </button>
        <button
          onClick={() => {
            setLocalBrands([]);
            setLocalWeights([]);
            setLocalFlavors([]);
            setLocalPreferences([]);
            setLocalRating(null);
            setMinPrice(MIN);
            setMaxPrice(MAX);
            router.push(pathname, { scroll: false });
          }}
          className="w-full flex items-center justify-center gap-2 text-gold-600 hover:text-gold-700 text-sm font-semibold transition-colors"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          Clear All
        </button>
      </div>
    </aside>
  );
};
