import React from 'react';

interface BadgeProps {
  variant?: 'default' | 'academic' | 'organization' | 'simulation' | 'live' | 'pending' | 'rejected' | 'approved';
  children: React.ReactNode;
  className?: string;
  size?: 'sm' | 'md';
}

export const Badge: React.FC<BadgeProps> = ({
  variant = 'default',
  children,
  className = '',
  size = 'md',
}) => {
  const sizeClass = size === 'sm' ? 'text-[11px] px-2 py-0.5' : 'text-xs px-2.5 py-0.5';

  let variantClass = 'bg-stone-100 text-stone-700 border-stone-200';

  switch (variant) {
    case 'academic':
      variantClass = 'bg-[#1B4D36] text-white border-[#1B4D36] font-medium';
      break;
    case 'organization':
      variantClass = 'bg-[#EDF6F1] text-[#1B4D36] border-[#D5E5DC] font-medium';
      break;
    case 'simulation':
      variantClass = 'bg-amber-50 text-amber-800 border-amber-200 font-normal';
      break;
    case 'live':
      variantClass = 'bg-emerald-50 text-emerald-800 border-emerald-300 font-semibold';
      break;
    case 'approved':
      variantClass = 'bg-emerald-50 text-emerald-800 border-emerald-200';
      break;
    case 'pending':
      variantClass = 'bg-amber-50 text-amber-800 border-amber-200 font-medium';
      break;
    case 'rejected':
      variantClass = 'bg-rose-50 text-rose-800 border-rose-200';
      break;
  }

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-md border ${sizeClass} ${variantClass} ${className}`}
    >
      {children}
    </span>
  );
};
