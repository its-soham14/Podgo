import { Link } from 'react-router-dom';
import { useState } from 'react';
import { useAuthStore } from '../store/authStore';
import DashboardLayout from '../components/layouts/DashboardLayout';
import { Info } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import api from '../services/api';
import ModeToggle from '../components/dashboard/ModeToggle';
import RiderDashboard from '../components/dashboard/RiderDashboard';
import DriverDashboard from '../components/dashboard/DriverDashboard';
import ChatWidget from '../components/chat/ChatWidget';
import { useWebSocket } from '../hooks/useWebSocket';

export default function DashboardPage() {
  const { user, activeMode } = useAuthStore();
  const { clientRef, isConnected, notifications } = useWebSocket(user?.id);
  const [activeChatId, setActiveChatId] = useState(null);

  const { data: verificationStatus } = useQuery({
    queryKey: ['verificationStatus'],
    queryFn: async () => {
      const res = await api.get('/drivers/verification-status');
      return res.data.data;
    },
    enabled: !!user,
    retry: false
  });

  const isVerified = verificationStatus?.status === 'VERIFIED';

  return (
    <DashboardLayout>
      <div className="flex flex-col gap-6 pt-4">
        {/* Top Header Row */}
        <div className="flex items-center justify-between px-4">
          <h1 className="font-display text-headline-lg font-bold text-on-surface">Dashboard</h1>
          <ModeToggle isVerified={isVerified} />
        </div>

        {/* Verification Warning (Unlock Driver Mode) */}
        {!isVerified && activeMode === 'RIDER' && (
          <div className="mx-4 bg-surface-container rounded-xl p-4 flex items-center justify-between shadow-sm">
            <div className="flex items-center gap-3">
              <div className="text-primary bg-surface w-8 h-8 rounded-full border border-primary flex items-center justify-center shrink-0">
                <Info size={20} />
              </div>
              <div className="flex flex-col">
                <h3 className="text-title-md font-bold text-on-surface">Unlock Driver Mode</h3>
                <p className="text-body-sm text-on-surface-variant max-w-[200px] leading-snug">
                  Complete verification to start earning rides.
                </p>
              </div>
            </div>
            <Link to="/driver-setup" className="shrink-0 ml-2">
              <button className="bg-primary text-on-primary font-bold px-5 py-2.5 rounded-lg active:scale-95 transition-transform">
                Setup
              </button>
            </Link>
          </div>
        )}

        {/* Dashboard Content based on Active Mode */}
        {activeMode === 'DRIVER' && isVerified ? (
          <DriverDashboard clientRef={clientRef} isConnected={isConnected} notifications={notifications} onOpenChat={setActiveChatId} />
        ) : (
          <RiderDashboard clientRef={clientRef} isConnected={isConnected} notifications={notifications} onOpenChat={setActiveChatId} />
        )}
      </div>

      {/* Floating Chat Widget */}
      {activeChatId && (
        <div className="fixed bottom-6 pb-safe right-4 z-40">
          <ChatWidget bookingId={activeChatId} clientRef={clientRef} isConnected={isConnected} onClose={() => setActiveChatId(null)} />
        </div>
      )}
    </DashboardLayout>
  );
}
