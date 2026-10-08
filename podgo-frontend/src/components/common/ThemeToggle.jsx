import { Sun } from 'lucide-react';
import { useEffect } from 'react';

export default function ThemeToggle() {
  useEffect(() => {
    // Force light mode
    document.documentElement.classList.remove('dark');
  }, []);

  return (
    <button
      className="w-10 h-10 rounded-full flex items-center justify-center bg-surface-container text-primary hover:bg-outline-variant transition-colors focus:outline-none"
      aria-label="Toggle theme"
    >
      <Sun size={20} />
    </button>
  );
}
