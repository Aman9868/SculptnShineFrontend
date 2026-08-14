import React from 'react';
import { Star } from 'lucide-react';

interface RatingProps {
  value: number;
  count?: number;
  showNumeric?: boolean;
  size?: number;
}

export const Rating: React.FC<RatingProps> = ({
  value,
  count,
  showNumeric = false,
  size = 14,
}) => {
  return (
    <div className="flex items-center gap-1">
      <div className="flex items-center text-amber-500">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            size={size}
            className={`${
              star <= Math.round(value)
                ? 'fill-amber-400 text-amber-400'
                : 'fill-gray-200 text-gray-300'
            }`}
          />
        ))}
      </div>
      {showNumeric && (
        <span className="text-xs font-bold text-gray-800 ml-0.5">
          {value.toFixed(1)}
        </span>
      )}
      {count !== undefined && (
        <span className="text-xs text-gray-500 font-medium">({count})</span>
      )}
    </div>
  );
};
