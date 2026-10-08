import { Star } from 'lucide-react';
import { useState } from 'react';

export default function StarRating({ value = 0, onChange, readonly = false, size = 24 }) {
  const [hoverValue, setHoverValue] = useState(0);

  const displayValue = hoverValue > 0 ? hoverValue : value;

  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          disabled={readonly}
          onClick={() => onChange?.(star)}
          onMouseEnter={() => !readonly && setHoverValue(star)}
          onMouseLeave={() => !readonly && setHoverValue(0)}
          className={`flex items-center justify-center transition-colors touch-manipulation
            ${readonly ? 'cursor-default' : 'cursor-pointer hover:scale-110'}
            min-w-[44px] min-h-[44px] sm:min-w-0 sm:min-h-0 sm:p-1
          `}
          style={{ width: 'max-content' }}
        >
          <Star
            size={size}
            className={`transition-all duration-200 ${
              star <= displayValue
                ? 'fill-amber-400 text-amber-400'
                : 'text-[var(--border-strong)]'
            }`}
          />
        </button>
      ))}
    </div>
  );
}
