import { Star } from 'lucide-react';
import StarRating from './StarRating';

export default function RatingDisplay({ userId, compact = false, ratings = [], avgRating = 0, totalRatings = 0 }) {
  if (compact) {
    return (
      <div className="flex items-center gap-1">
        <StarRating value={avgRating} readonly size={14} />
        <span className="font-bold text-[13px] text-[var(--text-primary)]">{avgRating.toFixed(1)}</span>
        <span className="text-[12px] text-[var(--text-muted)]">({totalRatings})</span>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 w-full">
      <div className="flex items-center gap-4">
        <div className="flex items-baseline gap-1">
          <span className="font-display font-bold text-[32px] text-[var(--text-primary)]">
            ⭐ {avgRating.toFixed(1)}
          </span>
          <span className="text-[16px] text-[var(--text-muted)]">/5</span>
        </div>
        <span className="text-[14px] text-[var(--text-muted)]">
          ({totalRatings} rating{totalRatings !== 1 ? 's' : ''})
        </span>
      </div>

      <div className="flex flex-col gap-4">
        {ratings.length === 0 ? (
          <p className="text-[var(--text-muted)] text-[14px]">No ratings yet</p>
        ) : (
          ratings.map((review, idx) => (
            <div key={review.id} className="flex flex-col gap-2">
              {idx > 0 && <hr className="border-[var(--border)] my-2" />}
              
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-3">
                  <div className="w-[40px] h-[40px] rounded-full bg-[var(--bg-surface)] flex items-center justify-center text-[var(--text-secondary)] font-bold overflow-hidden">
                    {review.ratedByPhotoUrl ? (
                      <img src={review.ratedByPhotoUrl} alt={review.ratedByName} className="w-full h-full object-cover" />
                    ) : (
                      review.ratedByName.charAt(0)
                    )}
                  </div>
                  <div>
                    <h4 className="font-semibold text-[14px] text-[var(--text-primary)]">{review.ratedByName}</h4>
                    <StarRating value={review.rating} readonly size={12} />
                  </div>
                </div>
                <span className="text-[12px] text-[var(--text-muted)]">
                  {new Date(review.createdAt).toLocaleDateString()}
                </span>
              </div>
              
              {review.comment && (
                <p className="text-[13px] text-[var(--text-secondary)] leading-relaxed mt-1">
                  {review.comment}
                </p>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
