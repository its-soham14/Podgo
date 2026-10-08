import { Bell } from 'lucide-react';
import { Link } from 'react-router-dom';
import ThemeToggle from './ThemeToggle';
import { useAuthStore } from '../../store/authStore';

export default function Navbar({ transparent = false }) {
  const { user } = useAuthStore();

  return (
    <nav 
      className={`sticky top-0 z-50 w-full h-14 pt-safe flex items-center justify-between px-4 transition-colors duration-300 ${
        transparent 
          ? 'bg-transparent' 
          : 'bg-surface/95 backdrop-blur-xl border-b border-surface-container'
      }`}
    >
      <div className="flex items-center">
        <span className="font-display font-bold text-headline-lg tracking-tight text-primary">
          PodGo
        </span>
      </div>
      
      <div className="flex items-center gap-2 mt-1">
        <button 
          className="w-10 h-10 rounded-full flex items-center justify-center bg-surface-container text-primary hover:bg-outline-variant relative focus:outline-none"
          aria-label="Notifications"
        >
          <Bell size={20} />
          <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-primary rounded-full border-2 border-surface-container"></span>
        </button>
        
        <ThemeToggle />
        
        <Link 
          to="/profile"
          className="w-10 h-10 rounded-full bg-surface-container text-primary overflow-hidden flex items-center justify-center font-display font-bold text-label-md"
        >
          {user?.profilePhotoUrl ? (
            <img src={user.profilePhotoUrl} alt="Profile" className="w-full h-full object-cover" />
          ) : (
            <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
              <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
            </svg>
          )}
        </Link>
      </div>
    </nav>
  );
}
