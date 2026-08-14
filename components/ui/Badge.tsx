import React from 'react';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'gold' | 'dark' | 'cream' | 'accent';
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'gold',
  className = '',
}) => {
  const variantStyles = {
    gold: 'bg-gold-600/10 text-gold-700 border border-gold-600/30',
    dark: 'bg-brandDark text-white border border-brandDark-lighter',
    cream: 'bg-cream-200 text-gray-800 border border-cream-300',
    accent: 'bg-amber-500 text-white font-bold',
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-3 py-1 text-xs font-semibold uppercase tracking-wider rounded-full ${variantStyles[variant]} ${className}`}
    >
      {children}
    </span>
  );
};
