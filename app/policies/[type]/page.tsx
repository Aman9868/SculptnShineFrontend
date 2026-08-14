import React from 'react';
import { notFound } from 'next/navigation';
import { policyApi } from '@/lib/api/policy';
import { ShieldAlert } from 'lucide-react';
import Link from 'next/link';

export const revalidate = 3600; // Cache for 1 hour

interface PolicyPageProps {
  params: Promise<{
    type: string;
  }>;
}

export default async function PolicyPage({ params }: PolicyPageProps) {
  const { type } = await params;

  try {
    const response = await policyApi.getPolicyByType(type);
    
    if (!response.success || !response.data) {
      return notFound();
    }

    const policy = response.data;

    return (
      <div className="min-h-screen bg-brandDark text-white pt-32 pb-24">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="mb-8">
            <Link href="/" className="text-gold-500 hover:text-gold-400 text-sm font-medium transition-colors">
              &larr; Back to Home
            </Link>
          </div>

          <div className="bg-brandDark-soft rounded-2xl border border-gray-800 p-8 md:p-12 shadow-2xl">
            <h1 className="text-3xl md:text-5xl font-serif font-bold text-gold-500 mb-8 pb-6 border-b border-gray-700">
              {policy.title}
            </h1>
            
            {/* 
              Render HTML securely. 
              The prose classes ensure standard HTML elements (h2, p, etc.) are styled beautifully.
            */}
            <div 
              className="prose prose-invert prose-gold max-w-none 
                         prose-headings:font-serif prose-headings:text-gold-400
                         prose-a:text-gold-500 hover:prose-a:text-gold-400
                         prose-p:text-gray-300 prose-p:leading-relaxed
                         prose-strong:text-white"
              dangerouslySetInnerHTML={{ __html: policy.content }}
            />
          </div>

          <div className="mt-12 flex items-center justify-center gap-3 text-gray-400 text-sm bg-brandDark-soft/50 py-4 px-6 rounded-lg border border-gray-800">
            <ShieldAlert size={18} className="text-gold-500" />
            <p>
              Last updated on {new Date(policy.updatedAt).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </p>
          </div>

        </div>
      </div>
    );
  } catch (error) {
    return notFound();
  }
}
