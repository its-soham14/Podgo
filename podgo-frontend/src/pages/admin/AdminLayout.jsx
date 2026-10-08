import { Link, useLocation, Outlet } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { LayoutDashboard, Users, Car, CheckSquare, LogOut } from 'lucide-react';

export default function AdminLayout() {
  const { logout } = useAuthStore();
  const location = useLocation();

  const navItems = [
    { name: 'Dashboard', path: '/admin', icon: LayoutDashboard },
    { name: 'Driver Verifications', path: '/admin/verifications', icon: CheckSquare },
    { name: 'All Users', path: '/admin/users', icon: Users },
    { name: 'All Rides', path: '/admin/rides', icon: Car },
  ];

  return (
    <div className="min-h-screen bg-[var(--bg-page)] flex">
      {/* Sidebar */}
      <aside className="w-64 bg-[var(--bg-card)] border-r border-[var(--border)] hidden md:flex flex-col">
        <div className="p-6 border-b border-[var(--border)]">
          <h1 className="text-2xl font-display font-bold text-[var(--color-primary-500)]">PodGo Admin</h1>
        </div>
        
        <nav className="flex-1 p-4 space-y-2">
          {navItems.map(item => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link 
                key={item.path} 
                to={item.path}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-colors ${isActive ? 'bg-[var(--color-primary-100)] text-[var(--color-primary-600)]' : 'text-[var(--text-secondary)] hover:bg-[var(--bg-surface)] hover:text-[var(--text-primary)]'}`}
              >
                <Icon size={20} />
                {item.name}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-[var(--border)]">
          <button 
            onClick={logout}
            className="flex items-center gap-3 px-4 py-3 w-full rounded-lg font-medium text-[var(--color-danger-500)] hover:bg-[var(--color-danger-900)]/20 transition-colors"
          >
            <LogOut size={20} />
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        <header className="h-16 bg-[var(--bg-card)] border-b border-[var(--border)] flex items-center px-6 shadow-sm z-10 md:hidden">
            <h1 className="text-xl font-display font-bold text-[var(--color-primary-500)]">PodGo Admin</h1>
        </header>
        
        <div className="flex-1 overflow-y-auto p-6 lg:p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
