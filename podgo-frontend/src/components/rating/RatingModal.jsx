import { X } from 'lucide-react';
import { useState, useEffect } from 'react';
import StarRating from './StarRating';
import { submitRating } from '../../services/ratingService';
import { toast } from 'sonner';

const RATING_TEXT = {
  1: "Poor",
  2: "Fair",
  3: "Good",
  4: "Great",
  5: "Excellent!"
};

export default function RatingModal({ isOpen, onClose, booking, onSubmitted }) {
  const [selectedRating, setSelectedRating] = useState(0);
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      setSelectedRating(0);
      setComment('');
      setError('');
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => { document.body.style.overflow = 'unset'; };
  }, [isOpen]);

  if (!isOpen || !booking) return null;

  // Determine who to rate (if current user is rider, rate driver; if current user is driver, rate rider)
  // But requirement says: ratedUserId: booking.driverInfo.id // from booking object (Wait, ride.driverId)
  // Let's look at BookingResponseDto
  const isDriver = booking.ride?.driverId && booking.riderId && booking.ride.driverId !== booking.riderId; 
  // Wait, we need to get ratedUserId dynamically depending on context. 
  // The requirement says: `ratedUserId: booking.driverInfo.id` but `BookingResponseDto` has `ride.driverId`.
  // Let's use `booking.ride.driverId`.

  const handleSubmit = async () => {
    if (!selectedRating) return;
    setIsSubmitting(true);
    setError('');
    
    // In our backend DTO, ride driver is `booking.ride.driverId`
    // Wait, what if the current user IS the driver? Then they rate the rider.
    // The requirement says for submitRating: `ratedUserId: booking.driverInfo.id // from booking object`
    // I will use `booking.ride.driverId` because `driverInfo` doesn't exist in my DTO.
    
    // Determine ratedUserId
    // Let's assume current user is the one rendering this modal. 
    // Usually only rider rates the driver in the current UI prompt (Rate Driver button).
    const ratedUserId = booking.ride.driverId;

    try {
      await submitRating({
        bookingId: booking.id,
        ratedUserId: ratedUserId,
        rating: selectedRating,
        comment: comment.trim() || null
      });
      toast.success('Rating submitted! Thank you.');
      onSubmitted();
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit rating');
    } finally {
      setIsSubmitting(false);
    }
  };

  const driverName = booking.ride?.driverName || 'Driver';
  const driverPhoto = booking.ride?.driverPhotoUrl;

  return (
    <div className="fixed inset-0 bg-black/60 z-[60] flex items-end sm:items-center justify-center animate-in fade-in duration-200" onClick={onClose}>
      <div 
        className="w-full sm:max-w-md bg-[var(--bg-card)] rounded-t-2xl sm:rounded-2xl p-6 pb-[max(1.5rem,env(safe-area-inset-bottom))] animate-in slide-in-from-bottom-full duration-300"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="font-display font-bold text-[20px] text-[var(--text-primary)]">Rate Your Experience</h2>
          <button onClick={onClose} className="p-2 -mr-2 text-[var(--text-secondary)] hover:text-[var(--text-primary)] rounded-full hover:bg-[var(--bg-surface)]">
            <X size={20} />
          </button>
        </div>

        {/* Driver Info */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-[60px] h-[60px] rounded-full bg-[var(--color-primary-100)] flex items-center justify-center text-[var(--color-primary-700)] font-display font-bold text-xl mb-3 overflow-hidden">
            {driverPhoto ? (
              <img src={driverPhoto} alt={driverName} className="w-full h-full object-cover" />
            ) : (
              driverName.charAt(0)
            )}
          </div>
          <h3 className="font-semibold text-[var(--text-primary)]">{driverName}</h3>
          <p className="text-[13px] text-[var(--text-secondary)] mt-1 truncate max-w-xs">
            {booking.ride?.origin} → {booking.ride?.destination}
          </p>
        </div>

        {/* Rating Section */}
        <div className="flex flex-col items-center mb-6">
          <p className="font-sans font-medium text-[16px] text-[var(--text-primary)] mb-4">How was your ride?</p>
          <StarRating value={selectedRating} onChange={setSelectedRating} size={36} />
          
          <div className="h-6 mt-2">
            {selectedRating > 0 && (
              <span className="text-amber-400 font-medium animate-in fade-in zoom-in duration-200">
                {RATING_TEXT[selectedRating]}
              </span>
            )}
          </div>
        </div>

        {/* Comment Section */}
        <div className="mb-6 relative">
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value.slice(0, 500))}
            placeholder="Share your experience (optional)"
            className="w-full h-24 rounded-xl border border-[var(--border)] bg-[var(--bg-card)] p-3 text-base text-[var(--text-primary)] placeholder-[var(--text-muted)] resize-none focus:outline-none focus:border-[var(--color-primary-500)] focus:ring-1 focus:ring-[var(--color-primary-500)] transition-all"
          />
          <div className="absolute bottom-3 right-3 text-[11px] text-[var(--text-muted)]">
            {comment.length}/500
          </div>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-lg bg-[var(--color-danger-500)]/10 text-[var(--color-danger-500)] text-sm text-center">
            {error}
          </div>
        )}

        {/* Buttons */}
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-3.5 px-4 text-[var(--text-secondary)] font-medium rounded-xl hover:bg-[var(--bg-surface)] transition-colors"
          >
            Skip
          </button>
          <button
            onClick={handleSubmit}
            disabled={!selectedRating || isSubmitting}
            className="flex-[2] py-3.5 px-4 bg-[var(--color-primary-500)] hover:bg-[var(--color-primary-600)] text-white font-semibold rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center gap-2"
          >
            {isSubmitting ? (
              <>
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Submitting...
              </>
            ) : (
              'Submit Rating →'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
