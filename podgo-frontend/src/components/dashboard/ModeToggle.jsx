import { CarFront, UserRound } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';

export default function ModeToggle({ isVerified = false }) {
  const { activeMode, setActiveMode } = useAuthStore();

  return (
    <div className="inline-flex p-1 bg-surface-container rounded-full shadow-inner border border-outline-variant/30">
      <button
        type="button"
        onClick={() => setActiveMode('RIDER')}
        aria-pressed={activeMode === 'RIDER'}
        className={`flex items-center gap-2 rounded-full px-5 py-2 text-label-lg font-bold transition-all ${
          activeMode === 'RIDER'
            ? 'bg-primary text-on-primary shadow-md'
            : 'text-on-surface-variant'
        }`}
      >
        <UserRound size={18} fill={activeMode === 'RIDER' ? 'currentColor' : 'none'} />
        Rider
      </button>
      
      <div className="relative group">
        <button
          type="button"
          onClick={() => {
            if (isVerified) setActiveMode('DRIVER');
          }}
          aria-pressed={activeMode === 'DRIVER'}
          disabled={!isVerified}
          className={`flex items-center gap-2 rounded-full px-5 py-2 text-label-lg font-bold transition-all ${
            activeMode === 'DRIVER'
              ? 'bg-primary text-on-primary shadow-md'
              : 'text-on-surface-variant'
          } ${!isVerified ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          <CarFront size={18} />
          Driver
        </button>
      </div>
    </div>
  );
}
