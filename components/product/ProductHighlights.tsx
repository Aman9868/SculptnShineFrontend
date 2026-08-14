import React from 'react';
import { Product } from '@/lib/api/product';
import { ShieldCheck, Sparkles, Award, Zap, HeartHandshake } from 'lucide-react';

interface ProductHighlightsProps {
  product?: Product;
  protein?: string;
  bcaas?: string;
  glutamine?: string;
  eaas?: string;
}

export const ProductHighlights: React.FC<ProductHighlightsProps> = ({ 
  product,
  protein: customProtein,
  bcaas: customBcaas,
  glutamine: customGlutamine,
  eaas: customEaas
}) => {
  const desc = (product?.description || '') + ' ' + (product?.title || '');

  // Dynamic regex extraction from title / description
  const proteinMatch = desc.match(/(\d+(?:\.\d+)?\s*g)\s*(?:of\s*)?protein/i);
  const bcaaMatch = desc.match(/(\d+(?:\.\d+)?\s*g)\s*(?:of\s*)?(?:bcaa|bcaas)/i);
  const glutamineMatch = desc.match(/(\d+(?:\.\d+)?\s*g)\s*(?:of\s*)?glutamine/i);
  const eaaMatch = desc.match(/(\d+(?:\.\d+)?\s*g)\s*(?:of\s*)?(?:eaa|eaas)/i);
  const servingsMatch = desc.match(/(\d+)\s*servings/i);

  const isSupplement = 
    desc.toLowerCase().includes('protein') ||
    desc.toLowerCase().includes('whey') ||
    desc.toLowerCase().includes('isolate') ||
    desc.toLowerCase().includes('gainer') ||
    desc.toLowerCase().includes('bcaa') ||
    desc.toLowerCase().includes('creatine') ||
    (product?.category?.name || '').toLowerCase().includes('protein') ||
    (product?.category?.name || '').toLowerCase().includes('supplement');

  if (isSupplement) {
    const proteinVal = customProtein || (proteinMatch ? proteinMatch[1].trim() : '25g');
    const bcaasVal = customBcaas || (bcaaMatch ? bcaaMatch[1].trim() : '5.5g');
    const glutamineVal = customGlutamine || (glutamineMatch ? glutamineMatch[1].trim() : '4.2g');
    const eaasVal = customEaas || (eaaMatch ? eaaMatch[1].trim() : '11.7g');
    const servingsVal = servingsMatch ? `${servingsMatch[1]} Servings` : 'Ultra Filtered';

    return (
      <div className="w-full bg-[#FAF9F6] border border-gray-100 rounded-xl py-6 px-4 sm:px-6 my-10 hidden sm:flex items-center justify-around divide-x divide-gray-200">
        <div className="flex flex-col items-center px-4 text-center">
          <span className="text-2xl font-extrabold text-brandDark mb-0.5">{proteinVal}</span>
          <span className="text-xs sm:text-sm font-semibold text-gray-800">Protein</span>
          <span className="text-[11px] text-gray-500 mt-0.5">Per Serving</span>
        </div>
        <div className="flex flex-col items-center px-4 text-center">
          <span className="text-2xl font-extrabold text-brandDark mb-0.5">{bcaasVal}</span>
          <span className="text-xs sm:text-sm font-semibold text-gray-800">BCAAs</span>
          <span className="text-[11px] text-gray-500 mt-0.5">Per Serving</span>
        </div>
        <div className="flex flex-col items-center px-4 text-center">
          <span className="text-2xl font-extrabold text-brandDark mb-0.5">{glutamineVal}</span>
          <span className="text-xs sm:text-sm font-semibold text-gray-800">Glutamine</span>
          <span className="text-[11px] text-gray-500 mt-0.5">Per Serving</span>
        </div>
        <div className="flex flex-col items-center px-4 text-center">
          <span className="text-2xl font-extrabold text-brandDark mb-0.5">{eaasVal}</span>
          <span className="text-xs sm:text-sm font-semibold text-gray-800">EAAs</span>
          <span className="text-[11px] text-gray-500 mt-0.5">Per Serving</span>
        </div>
        <div className="flex flex-col items-center px-4 text-center">
          <span className="text-base sm:text-lg font-extrabold text-brandDark mb-0.5">{servingsVal}</span>
          <span className="text-xs sm:text-sm font-semibold text-gray-800">Fast Absorbing</span>
          <span className="text-[11px] text-gray-500 mt-0.5">Superior Quality</span>
        </div>
      </div>
    );
  }

  // Non-supplement (Skincare, Cosmetics, Salon) feature highlights
  return (
    <div className="w-full bg-[#FAF9F6] border border-gray-100 rounded-xl py-6 px-4 sm:px-6 my-10 hidden sm:flex items-center justify-around divide-x divide-gray-200">
      <div className="flex flex-col items-center px-4 text-center">
        <ShieldCheck className="w-6 h-6 text-gold-600 mb-1" />
        <span className="text-sm font-bold text-gray-900">100% Authentic</span>
        <span className="text-[11px] text-gray-500 mt-0.5">Direct from Brand</span>
      </div>
      <div className="flex flex-col items-center px-4 text-center">
        <Sparkles className="w-6 h-6 text-gold-600 mb-1" />
        <span className="text-sm font-bold text-gray-900">Dermatologist Tested</span>
        <span className="text-[11px] text-gray-500 mt-0.5">Gentle & Safe</span>
      </div>
      <div className="flex flex-col items-center px-4 text-center">
        <Award className="w-6 h-6 text-gold-600 mb-1" />
        <span className="text-sm font-bold text-gray-900">Premium Grade</span>
        <span className="text-[11px] text-gray-500 mt-0.5">High Performance</span>
      </div>
      <div className="flex flex-col items-center px-4 text-center">
        <Zap className="w-6 h-6 text-gold-600 mb-1" />
        <span className="text-sm font-bold text-gray-900">Fast Acting</span>
        <span className="text-[11px] text-gray-500 mt-0.5">Visible Results</span>
      </div>
      <div className="flex flex-col items-center px-4 text-center">
        <HeartHandshake className="w-6 h-6 text-gold-600 mb-1" />
        <span className="text-sm font-bold text-gray-900">Cruelty Free</span>
        <span className="text-[11px] text-gray-500 mt-0.5">Ethically Sourced</span>
      </div>
    </div>
  );
};
