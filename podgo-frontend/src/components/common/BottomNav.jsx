import { Search, Car, Clock, User } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';

export default function BottomNav() {
  const location = useLocation();
  const navigate = useNavigate();

  const navItems = [
    { id: 'find', label: 'Find', icon: Search, path: '/find-ride' },
    { id: 'offer', label: 'Offer', icon: Car, path: '/offer-ride' },
    { id: 'trips', label: 'Trips', icon: Clock, path: '/trips' },
    { id: 'profile', label: 'Profile', icon: User, path: '/profile' },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 h-16 pb-safe bg-surface/85 backdrop-blur-xl border-t border-outline-variant/30 flex items-center justify-around px-2">
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive = location.pathname.startsWith(item.path);

        return (
          <button
            key={item.id}
            onClick={() => navigate(item.path)}
            className="flex-1 flex flex-col items-center justify-center gap-0.5 min-h-[44px] focus:outline-none"
          >
            <div className="relative flex flex-col items-center">
              <Icon 
                size={22} 
                className={`transition-colors duration-200 ${
                  isActive ? 'text-secondary' : 'text-on-surface-variant'
                }`}
                strokeWidth={isActive ? 2.5 : 2}
              />
              {/* Active Indicator */}
              <div 
                className={`absolute -bottom-2 w-1 h-1 rounded-full bg-secondary transition-all duration-300 ${
                  isActive ? 'opacity-100 scale-100' : 'opacity-0 scale-0'
                }`} 
              />
            </div>
            <span 
              className={`text-[10px] leading-[12px] font-semibold mt-1.5 transition-colors duration-200 ${
                isActive ? 'text-secondary' : 'text-on-surface-variant'
              }`}
            >
              {item.label}
            </span>
          </button>
        );
      })}
    </nav>
  );
}
