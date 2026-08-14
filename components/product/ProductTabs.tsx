'use client';

import React, { useState, useMemo } from 'react';
import Image from 'next/image';
import { 
  CheckCircle2, 
  ShieldCheck, 
  Flame, 
  Info, 
  HelpCircle, 
  Droplet, 
  Sparkles, 
  Star, 
  BookOpen, 
  Utensils, 
  Award, 
  FileText,
  MessageSquare
} from 'lucide-react';
import { Product } from '@/lib/api/product';
import ProductReviews from '@/components/product/ProductReviews';

interface ProductTabsProps {
  product: Product;
}

interface ParsedSections {
  description: string;
  ingredients: string | null;
  nutrition: string | null;
  howToUse: string | null;
  faqs: string | null;
  customSections: { id: string; label: string; content: string }[];
}

function formatTabContent(html: string): string {
  if (!html) return '';

  // Clean any corrupted nested img tags
  let cleaned = html.replace(/<img[^>]*src=["']\s*<img[^>]*src=["']([^"']+)["'][^>]*>["'][^>]*>/gi, '<img src="$1" alt="Product image" class="rounded-2xl max-w-full my-4 border border-gray-200 shadow-sm" style="max-height: 480px; width: auto; object-fit: contain;" />');

  // Convert standalone plain text image URLs into <img>
  return cleaned.replace(
    /(?:<p>|<div>)?\s*(https?:\/\/[^\s<"']+\.(?:png|jpg|jpeg|webp|svg|gif)(?:\?[^\s<"']*)?|https?:\/\/[^\s<"']*(?:gstatic\.com\/images|googleusercontent\.com)[^\s<"']*)\s*(?:<\/p>|<\/div>)?/gi,
    (match, url, offset, fullStr) => {
      const preceding = fullStr.slice(Math.max(0, offset - 12), offset);
      if (/src\s*=\s*["']?$/i.test(preceding) || /href\s*=\s*["']?$/i.test(preceding) || match.includes('<img')) {
        return match;
      }
      return `<img src="${url}" alt="Product image" class="rounded-2xl max-w-full my-4 border border-gray-200 shadow-sm" style="max-height: 480px; width: auto; object-fit: contain;" />`;
    }
  );
}

// Parses raw HTML by headings into exact tab buckets
function parseProductTabs(rawHtml: string): ParsedSections {
  if (!rawHtml || !rawHtml.trim()) {
    return {
      description: '',
      ingredients: null,
      nutrition: null,
      howToUse: null,
      faqs: null,
      customSections: [],
    };
  }

  // Split only by major section heading tags H2 and H3
  const delimiterRegex = /(<h[23][^>]*>[\s\S]*?<\/h[23]>)/gi;
  const tokens = rawHtml.split(delimiterRegex);

  const buckets: Record<string, string[]> = {
    description: [],
    ingredients: [],
    nutrition: [],
    howToUse: [],
    faqs: [],
  };

  const customSectionsMap: Record<string, { label: string; content: string[] }> = {};
  let currentTarget = 'description';

  for (let i = 0; i < tokens.length; i++) {
    const token = tokens[i];
    if (!token || !token.trim()) continue;

    const headingMatch = token.match(/<h[23][^>]*>([\s\S]*?)<\/h[23]>/i);

    if (headingMatch) {
      const cleanHeading = headingMatch[1].replace(/<[^>]+>/g, '').replace(/[:\-–—]+$/, '').trim().toLowerCase();

      if (cleanHeading.includes('ingredient') || cleanHeading.includes('composition') || cleanHeading.includes('formulation')) {
        currentTarget = 'ingredients';
      } else if (cleanHeading.includes('nutrition') || cleanHeading.includes('supplement fact') || cleanHeading.includes('nutritional')) {
        currentTarget = 'nutrition';
      } else if (cleanHeading.includes('how to use') || cleanHeading.includes('usage') || cleanHeading.includes('direction') || cleanHeading.includes('suggested use') || cleanHeading.includes('how to consume') || cleanHeading.includes('dosage')) {
        currentTarget = 'howToUse';
      } else if (cleanHeading.includes('faq') || cleanHeading.includes('frequently asked') || cleanHeading.includes('questions')) {
        currentTarget = 'faqs';
      } else if (cleanHeading.includes('description') || cleanHeading.includes('overview') || cleanHeading.includes('about') || cleanHeading.includes('product story')) {
        currentTarget = 'description';
      } else {
        // Custom additional section (e.g. Benefits, Certifications)
        const customId = cleanHeading.toUpperCase().replace(/[^A-Z0-9]+/g, '_');
        currentTarget = customId;
        if (!customSectionsMap[customId]) {
          customSectionsMap[customId] = {
            label: headingMatch[1].replace(/<[^>]+>/g, '').trim().toUpperCase(),
            content: [],
          };
        }
      }
    } else {
      if (buckets[currentTarget]) {
        buckets[currentTarget].push(token);
      } else if (customSectionsMap[currentTarget]) {
        customSectionsMap[currentTarget].content.push(token);
      } else {
        buckets.description.push(token);
      }
    }
  }

  const customSections = Object.entries(customSectionsMap).map(([id, sec]) => ({
    id,
    label: sec.label,
    content: formatTabContent(sec.content.join('').trim()),
  })).filter(s => s.content.length > 0);

  return {
    description: formatTabContent(buckets.description.join('').trim() || rawHtml),
    ingredients: buckets.ingredients.length > 0 ? formatTabContent(buckets.ingredients.join('').trim()) : null,
    nutrition: buckets.nutrition.length > 0 ? formatTabContent(buckets.nutrition.join('').trim()) : null,
    howToUse: buckets.howToUse.length > 0 ? formatTabContent(buckets.howToUse.join('').trim()) : null,
    faqs: buckets.faqs.length > 0 ? formatTabContent(buckets.faqs.join('').trim()) : null,
    customSections,
  };
}

export const ProductTabs: React.FC<ProductTabsProps> = ({ product }) => {
  const rawDescription = product.description || '';
  const parsed = useMemo(() => parseProductTabs(rawDescription), [rawDescription]);

  const reviewCount = Number((product as any).reviewCount || 0);
  const averageRating = Number((product as any).averageRating || 0);
  const promoImage = (product.images && product.images.length > 1) ? product.images[1] : null;

  // Build full tab list (Standard 6 tabs + any extra custom sections)
  const TABS = useMemo(() => {
    const list = [
      { id: 'DESCRIPTION', label: 'DESCRIPTION', icon: <FileText className="w-4 h-4 text-gold-500" /> },
      { id: 'INGREDIENTS', label: 'INGREDIENTS', icon: <Sparkles className="w-4 h-4 text-gold-500" /> },
      { id: 'NUTRITION FACTS', label: 'NUTRITION FACTS', icon: <Utensils className="w-4 h-4 text-gold-500" /> },
      { id: 'HOW TO USE', label: 'HOW TO USE', icon: <BookOpen className="w-4 h-4 text-gold-500" /> },
      { id: 'REVIEWS', label: reviewCount > 0 ? `REVIEWS (${reviewCount})` : 'REVIEWS', icon: <Star className="w-4 h-4 text-gold-500" /> },
      { id: 'FAQS', label: 'FAQS', icon: <HelpCircle className="w-4 h-4 text-gold-500" /> },
    ];

    // Add any extra custom sections
    if (parsed.customSections.length > 0) {
      for (const cs of parsed.customSections) {
        list.splice(4, 0, {
          id: cs.id,
          label: cs.label,
          icon: <Award className="w-4 h-4 text-gold-500" />,
        });
      }
    }

    return list;
  }, [parsed.customSections, reviewCount]);

  const [activeTab, setActiveTab] = useState('DESCRIPTION');
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const descText = rawDescription + ' ' + (product.title || '');
  const proteinMatch = descText.match(/(\d+(?:\.\d+)?\s*g)\s*(?:of\s*)?protein/i);
  const bcaaMatch = descText.match(/(\d+(?:\.\d+)?\s*g)\s*(?:of\s*)?(?:bcaa|bcaas)/i);
  const servingsMatch = descText.match(/(\d+)\s*servings/i);

  const proteinVal = proteinMatch ? proteinMatch[1].trim() : '25g';
  const bcaaVal = bcaaMatch ? bcaaMatch[1].trim() : '5.5g';
  const servingsVal = servingsMatch ? servingsMatch[1] : '60';

  const isSupplement = 
    descText.toLowerCase().includes('protein') ||
    descText.toLowerCase().includes('whey') ||
    descText.toLowerCase().includes('isolate') ||
    descText.toLowerCase().includes('gainer') ||
    descText.toLowerCase().includes('creatine') ||
    (product.category?.name || '').toLowerCase().includes('protein') ||
    (product.category?.name || '').toLowerCase().includes('supplement');

  const defaultFaqs = [
    {
      q: 'How do I verify the authenticity of this product?',
      a: 'Every product sold on Sculpt & Shine is 100% authentic, imported directly through official brand authorized importers. Each tub comes with an authentic importer seal, scratch code, and verifiable batch verification.'
    },
    {
      q: 'When is the best time to consume this product?',
      a: isSupplement 
        ? 'For optimal recovery, consume 1 scoop immediately within 30-45 minutes post-workout. You can also consume it in the morning or between major meals to meet your daily protein targets.'
        : 'Use daily as directed on the label, ideally after cleansing or as part of your morning and evening wellness routine.'
    },
    {
      q: 'How should I store this product?',
      a: 'Store in a cool, dry place away from direct sunlight, moisture, and extreme heat. Always keep the container tightly sealed after each use.'
    },
    {
      q: 'What is the shelf life and expiry period?',
      a: (product as any).expiryDate 
        ? `This batch has an expiry date of ${new Date((product as any).expiryDate).toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })} with fresh sealed packaging.`
        : 'All our stock is guaranteed fresh with 12 to 24 months of remaining shelf life from the manufacturing date.'
    }
  ];

  // Match custom section if active
  const activeCustom = parsed.customSections.find(c => c.id === activeTab);

  return (
    <div id="product-tabs-section" className="w-full mb-16 scroll-mt-20">
      {/* Tab Headers */}
      <div className="flex overflow-x-auto hide-scrollbar border-b border-gray-200 mb-8 gap-6 sm:gap-8">
        {TABS.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`pb-4 text-xs sm:text-sm font-bold tracking-wider shrink-0 transition-colors relative flex items-center gap-2 ${
              activeTab === tab.id ? 'text-brandDark' : 'text-gray-400 hover:text-gray-600'
            }`}
          >
            {tab.icon}
            <span>{tab.label}</span>
            {activeTab === tab.id && (
              <div className="absolute bottom-0 left-0 w-full h-1 bg-[#D99A2B] rounded-t-full" />
            )}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="min-h-[250px]">
        {/* 1. DESCRIPTION TAB */}
        {activeTab === 'DESCRIPTION' && (
          <div className="w-full">
            <div className="space-y-6 max-w-4xl">
              {parsed.description ? (
                <div 
                  className="text-gray-700 leading-relaxed prose max-w-none text-sm font-normal space-y-3 [&_img]:max-w-full [&_img]:rounded-2xl [&_img]:my-4 [&_img]:border [&_img]:border-gray-100 [&_img]:shadow-sm"
                  dangerouslySetInnerHTML={{ __html: parsed.description }}
                />
              ) : (
                <p className="text-gray-600 leading-relaxed text-sm">
                  {product.title} provides premium grade formulation crafted to deliver optimal results. Formulated with tested, highest-quality ingredients with maximum bioavailability and rapid absorption.
                </p>
              )}
            </div>
          </div>
        )}

        {/* 2. INGREDIENTS TAB */}
        {activeTab === 'INGREDIENTS' && (
          <div className="max-w-3xl space-y-6">
            <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100">
              <h3 className="text-base font-bold text-gray-900 mb-3 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-gold-500" />
                Active Formulation & Ingredients
              </h3>
              
              {parsed.ingredients ? (
                <div 
                  className="text-sm text-gray-700 leading-relaxed mb-4 prose max-w-none font-normal"
                  dangerouslySetInnerHTML={{ __html: parsed.ingredients }}
                />
              ) : (
                <p className="text-sm text-gray-700 leading-relaxed mb-4">
                  {isSupplement 
                    ? 'Hydrolyzed Whey Protein Isolate, Whey Protein Isolate, Cocoa Powder (Processed with Alkali), Natural and Artificial Flavors, Soy Lecithin / Sunflower Lecithin, Salt, Sucralose, Steviol Glycosides, Digestive Enzyme Blend (Protease, Lactase, Amylase).'
                    : 'Purified Aqua, Botanical Extracts, Glycerin, Niacinamide, Sodium Hyaluronate, Vitamin E Acetate, Natural Essential Oils, Phenoxyethanol, Ethylhexylglycerin.'}
                </p>
              )}
              
              <div className="flex items-center gap-2 text-xs font-semibold text-amber-800 bg-amber-50/80 border border-amber-200 px-3 py-2 rounded-xl">
                <Info className="w-4 h-4 text-amber-600 shrink-0" />
                <span>Allergen Warning: Contains milk and soy derivatives. Manufactured on equipment that also processes peanuts, tree nuts, and egg.</span>
              </div>
            </div>
          </div>
        )}

        {/* 3. NUTRITION FACTS TAB */}
        {activeTab === 'NUTRITION FACTS' && (
          <div className="max-w-2xl space-y-6">
            {parsed.nutrition ? (
              <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-xs">
                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <Utensils className="w-5 h-5 text-gold-500" />
                  Nutritional Breakdown
                </h3>
                <div 
                  className="text-sm text-gray-700 leading-relaxed prose max-w-none font-normal space-y-2"
                  dangerouslySetInnerHTML={{ __html: parsed.nutrition }}
                />
              </div>
            ) : (
              <div className="max-w-xl bg-white border border-gray-200 rounded-2xl p-6 shadow-xs font-mono text-xs">
                <h3 className="text-xl font-black text-gray-900 border-b-8 border-black pb-1 uppercase font-sans">
                  Nutrition Facts
                </h3>
                <div className="flex justify-between py-1.5 border-b border-gray-200 font-sans text-sm">
                  <span className="font-bold">Serving Size:</span>
                  <span>1 Scoop (~30g)</span>
                </div>
                <div className="flex justify-between py-1.5 border-b-4 border-black font-sans text-sm">
                  <span className="font-bold">Servings Per Container:</span>
                  <span>Approx. {servingsVal}</span>
                </div>
                <div className="flex justify-between items-baseline py-2 border-b border-gray-200">
                  <span className="text-sm font-black font-sans">Calories</span>
                  <span className="text-xl font-extrabold">120 kcal</span>
                </div>
                <div className="space-y-1.5 divide-y divide-gray-100 py-1">
                  <div className="flex justify-between pt-1">
                    <span><strong>Total Fat</strong> 1.5g</span>
                    <span className="font-bold">2%</span>
                  </div>
                  <div className="flex justify-between pt-1">
                    <span><strong>Total Carbohydrate</strong> 2g</span>
                    <span className="font-bold">1%</span>
                  </div>
                  <div className="flex justify-between pt-1.5 font-bold border-t-4 border-black text-sm">
                    <span>Protein {proteinVal}</span>
                    <span>50%</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* 4. HOW TO USE TAB */}
        {activeTab === 'HOW TO USE' && (
          <div className="max-w-3xl space-y-6">
            {parsed.howToUse ? (
              <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100">
                <h3 className="text-base font-bold text-gray-900 mb-3 flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-gold-500" />
                  Usage Guidelines & Directions
                </h3>
                <div 
                  className="text-sm text-gray-700 leading-relaxed prose max-w-none font-normal"
                  dangerouslySetInnerHTML={{ __html: parsed.howToUse }}
                />
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-gray-50 p-5 rounded-2xl border border-gray-100 text-center flex flex-col items-center">
                  <div className="w-10 h-10 rounded-full bg-gold-100 text-gold-700 font-bold flex items-center justify-center mb-3 text-sm">1</div>
                  <h4 className="font-bold text-gray-900 text-sm mb-1">Add to Shaker</h4>
                  <p className="text-xs text-gray-600">Add 1 scoop of powder into 200–250 ml of cold water, milk, or beverage.</p>
                </div>
                <div className="bg-gray-50 p-5 rounded-2xl border border-gray-100 text-center flex flex-col items-center">
                  <div className="w-10 h-10 rounded-full bg-gold-100 text-gold-700 font-bold flex items-center justify-center mb-3 text-sm">2</div>
                  <h4 className="font-bold text-gray-900 text-sm mb-1">Shake & Blend</h4>
                  <p className="text-xs text-gray-600">Shake for 25–30 seconds until smooth, lump-free, and thoroughly mixed.</p>
                </div>
                <div className="bg-gray-50 p-5 rounded-2xl border border-gray-100 text-center flex flex-col items-center">
                  <div className="w-10 h-10 rounded-full bg-gold-100 text-gold-700 font-bold flex items-center justify-center mb-3 text-sm">3</div>
                  <h4 className="font-bold text-gray-900 text-sm mb-1">Enjoy & Recover</h4>
                  <p className="text-xs text-gray-600">Consume immediately post-workout or in the morning for optimal recovery.</p>
                </div>
              </div>
            )}

            <div className="p-4 bg-gold-50/70 border border-gold-200/80 rounded-xl flex items-center gap-3 text-xs font-semibold text-brandDark">
              <Sparkles className="w-5 h-5 text-gold-600 shrink-0" />
              <span>Pro Tip: For extra rich creaminess, mix with chilled almond milk or blend with a banana and peanut butter!</span>
            </div>
          </div>
        )}

        {/* 5. CUSTOM EXTRA TABS */}
        {activeCustom && (
          <div className="max-w-4xl space-y-6">
            <div className="bg-white border border-gray-100 rounded-2xl p-6 sm:p-8 shadow-xs">
              <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2 border-b border-gray-100 pb-3">
                <Award className="w-5 h-5 text-gold-500" />
                <span>{activeCustom.label}</span>
              </h3>
              <div 
                className="text-gray-700 leading-relaxed prose max-w-none text-sm font-normal space-y-3"
                dangerouslySetInnerHTML={{ __html: activeCustom.content }}
              />
            </div>
          </div>
        )}

        {/* 6. REVIEWS TAB */}
        {activeTab === 'REVIEWS' && (
          <div className="w-full">
            <ProductReviews 
              productId={product.id} 
              averageRating={averageRating} 
              reviewCount={reviewCount} 
            />
          </div>
        )}

        {/* 7. FAQS TAB */}
        {activeTab === 'FAQS' && (
          <div className="max-w-3xl space-y-3">
            {parsed.faqs ? (
              <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100">
                <div 
                  className="text-sm text-gray-700 leading-relaxed prose max-w-none font-normal"
                  dangerouslySetInnerHTML={{ __html: parsed.faqs }}
                />
              </div>
            ) : (
              defaultFaqs.map((faq, idx) => (
                <div key={idx} className="border border-gray-100 rounded-xl overflow-hidden bg-white shadow-2xs">
                  <button
                    onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                    className="w-full p-4 text-left font-bold text-sm text-gray-900 flex justify-between items-center hover:bg-gray-50/60 transition-colors"
                  >
                    <span className="flex items-center gap-2">
                      <HelpCircle className="w-4 h-4 text-gold-500 shrink-0" />
                      {faq.q}
                    </span>
                    <span className="text-gray-400 text-base font-bold ml-2">
                      {openFaq === idx ? '−' : '+'}
                    </span>
                  </button>
                  {openFaq === idx && (
                    <div className="px-4 pb-4 pt-1 text-xs sm:text-sm text-gray-600 leading-relaxed border-t border-gray-50 bg-gray-50/30">
                      {faq.a}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
};
