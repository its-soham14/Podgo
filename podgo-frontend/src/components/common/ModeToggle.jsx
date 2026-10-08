import { CarFront, UserRound } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';

export default function ModeToggle() {
  const { activeMode, setActiveMode } = useAuthStore();

  return (
    <div className="inline-flex items-center gap-1 rounded-full border border-[var(--border)] bg-[var(--bg-card)] p-1 shadow-[var(--shadow-card)]">
      <button
        type="button"
        onClick={() => setActiveMode('RIDER')}
        aria-pressed={activeMode === 'RIDER'}
        className={`flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-semibold transition-colors ${
          activeMode === 'RIDER'
            ? 'bg-[var(--color-accent-500)] text-white'
            : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
        }`}
      >
        <UserRound size={14} />
        Rider
      </button>
      <button
        type="button"
        onClick={() => setActiveMode('DRIVER')}
        aria-pressed={activeMode === 'DRIVER'}
        className={`flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-semibold transition-colors ${
          activeMode === 'DRIVER'
            ? 'bg-[var(--color-primary-500)] text-white'
            : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
        }`}
      >
        <CarFront size={14} />
        Driver
      </button>
    </div>
  );
}
