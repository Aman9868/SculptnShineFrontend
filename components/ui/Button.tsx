import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'gold-gradient';
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  children,
  className = '',
  ...props
}) => {
  const baseStyles =
    'inline-flex items-center justify-center font-medium rounded-full transition-all duration-300 active:scale-95 disabled:opacity-50 disabled:pointer-events-none cursor-pointer';

  const variants = {
    primary:
      'bg-gold-600 hover:bg-gold-700 text-white shadow-md hover:shadow-lg shadow-gold-600/20',
    secondary:
      'bg-brandDark hover:bg-brandDark-soft text-white shadow-md',
    outline:
      'border-2 border-gold-600 text-gold-700 hover:bg-gold-600 hover:text-white',
    ghost:
      'bg-transparent hover:bg-gold-600/10 text-gray-800 hover:text-gold-700',
    'gold-gradient':
      'bg-gradient-to-r from-gold-500 via-gold-600 to-gold-700 hover:from-gold-600 hover:to-gold-800 text-white shadow-lg shadow-gold-600/30',
  };

  const sizes = {
    sm: 'px-4 py-1.5 text-xs font-semibold',
    md: 'px-5 py-2.5 text-sm font-semibold',
    lg: 'px-7 py-3 text-base font-bold',
  };

  return (
    <button
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};
