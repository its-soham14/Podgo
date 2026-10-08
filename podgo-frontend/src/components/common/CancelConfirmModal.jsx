import { AlertTriangle, CheckSquare, Square } from 'lucide-react';
import { useEffect } from 'react';
import Button from './Button';

export default function CancelConfirmModal({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title, 
  message, 
  confirmText, 
  isLoading,
  returnTripDetails,
  cancelReturnTrip,
  onCancelReturnTripChange
}) {
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-black/60 z-50 flex items-end sm:items-center justify-center animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div 
        className="bg-surface-container-high rounded-t-2xl sm:rounded-2xl p-6 w-full sm:max-w-md animate-in slide-in-from-bottom-full sm:slide-in-from-bottom-10 duration-300 shadow-xl border border-outline-variant/30 pb-safe"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex flex-col items-center text-center">
          <div className="w-12 h-12 rounded-full bg-error-container/20 flex items-center justify-center mb-4">
            <AlertTriangle size={32} className="text-error" />
          </div>
          
          <h2 className="font-display font-bold text-[18px] text-on-surface mb-2">
            {title}
          </h2>
          
          <p className="font-sans text-[14px] text-on-surface-variant mb-6">
            {message}
          </p>

          {returnTripDetails && (
            <div 
              className="w-full bg-surface-container-low border border-outline-variant/30 rounded-xl p-3 mb-6 flex flex-col gap-2 text-left cursor-pointer active:scale-95 transition-transform"
              onClick={() => onCancelReturnTripChange(!cancelReturnTrip)}
            >
              <div className="flex items-start gap-3">
                <div className="mt-0.5 text-secondary">
                  {cancelReturnTrip ? <CheckSquare size={20} /> : <Square size={20} />}
                </div>
                <div>
                  <p className="text-body-sm text-on-surface font-semibold mb-0.5">Cancel return trip as well?</p>
                  <p className="text-label-sm text-on-surface-variant">
                    {returnTripDetails}
                  </p>
                </div>
              </div>
            </div>
          )}

          <div className="w-full flex flex-col gap-3">
            <Button
              onClick={onConfirm}
              isLoading={isLoading}
              variant="danger"
              size="lg"
              className="w-full"
            >
              {confirmText}
            </Button>
            <Button
              onClick={onClose}
              disabled={isLoading}
              variant="ghost"
              size="lg"
              className="w-full text-on-surface hover:bg-surface-container"
            >
              Keep
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
