import { ArrowRight, Plus, ShieldCheck, Wallet, MessageSquare, CarFront, ChevronRight, Battery, Wifi, Signal } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Button from '../components/common/Button';

export default function HomePage() {
  const navigate = useNavigate();

  return (
    <div className="relative min-h-dvh flex flex-col bg-surface overflow-hidden">
      {/* Ambient glow divs */}
      <div className="absolute top-[-10%] left-[-10%] w-[300px] h-[300px] bg-primary/20 blur-[100px] rounded-full pointer-events-none" />
      <div className="absolute top-[40%] right-[-20%] w-[250px] h-[250px] bg-secondary/15 blur-[100px] rounded-full pointer-events-none" />
      <div className="absolute bottom-[-10%] left-[20%] w-[350px] h-[350px] bg-primary-container/10 blur-[100px] rounded-full pointer-events-none" />

      {/* Status bar area */}
      <div className="pt-safe flex items-center justify-between h-6 px-6 text-label-sm text-on-surface z-10 font-sans font-medium">
        <span>9:41</span>
        <div className="flex items-center gap-1.5">
          <Signal size={12} strokeWidth={3} />
          <Wifi size={12} strokeWidth={3} />
          <Battery size={14} strokeWidth={2.5} />
        </div>
      </div>

      <div className="flex-1 flex flex-col px-4 pt-8 pb-safe z-10 max-w-md mx-auto w-full">
        {/* Logo badge & Live pulse chip */}
        <div className="flex flex-col items-start gap-4 mb-8 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
          <div className="inline-flex items-center gap-2 bg-surface-container-high/60 backdrop-blur-md rounded-xl p-2 active:scale-95 transition-transform">
            <div className="w-8 h-8 rounded-lg bg-primary-container flex items-center justify-center text-on-primary-container">
              <CarFront size={18} />
            </div>
            <span className="font-display font-bold text-title-md text-on-surface pr-2 tracking-tight">PodGo</span>
          </div>

          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-surface-container-high border border-outline-variant/30">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-secondary opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-secondary"></span>
            </span>
            <span className="text-label-sm text-secondary uppercase tracking-[0.05em] font-bold">Intercity Pods Live</span>
          </div>
        </div>

        {/* Hero heading */}
        <div className="flex flex-col gap-1 mb-4 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
          <h1 className="font-display text-headline-lg text-on-surface tracking-tight">
            Skip the traffic.
          </h1>
          <h1 className="font-display text-headline-lg text-secondary tracking-tight drop-shadow-[0_2px_12px_rgba(79,219,200,0.35)]">
            Share the pod.
          </h1>
        </div>

        {/* Subtext */}
        <p className="text-body-md text-on-surface-variant max-w-[300px] mb-8 animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
          Next-gen intercity peer mobility. Match with verified professionals traveling your route.
        </p>

        {/* Trust badges strip */}
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 px-3 py-2.5 rounded-xl bg-surface-container-low border border-outline-variant/20 mb-8 w-fit animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
          <div className="flex items-center gap-1.5">
            <ShieldCheck size={14} className="text-primary" />
            <span className="text-[11px] font-semibold text-on-surface">Verified</span>
          </div>
          <div className="w-1 h-1 rounded-full bg-outline-variant" />
          <div className="flex items-center gap-1.5">
            <Wallet size={14} className="text-primary" />
            <span className="text-[11px] font-semibold text-on-surface">Cashless</span>
          </div>
          <div className="w-1 h-1 rounded-full bg-outline-variant" />
          <div className="flex items-center gap-1.5">
            <MessageSquare size={14} className="text-primary" />
            <span className="text-[11px] font-semibold text-on-surface">Chat</span>
          </div>
        </div>

        {/* CTA buttons */}
        <div className="flex flex-col gap-space-md mb-8 animate-fade-in-up" style={{ animationDelay: '0.5s' }}>
          <Button 
            variant="primary" 
            size="lg" 
            className="w-full group text-base"
            onClick={() => navigate('/login')}
          >
            Find a Ride 
            <ArrowRight size={18} className="transition-transform group-hover:translate-x-1" />
          </Button>
          <Button 
            variant="ghost" 
            size="lg" 
            className="w-full text-base"
            onClick={() => navigate('/login')}
          >
            <Plus size={18} />
            Offer a Ride
          </Button>
        </div>

        <div className="mt-auto animate-fade-in-up" style={{ animationDelay: '0.6s' }}>
          {/* Stats strip */}
          <div className="grid grid-cols-3 gap-2 bg-surface-container-low rounded-[14px] p-space-md mb-4 border border-outline-variant/20">
            <div className="flex flex-col items-center">
              <div className="flex items-baseline text-on-surface">
                <span className="font-display font-bold text-[24px] leading-tight">50</span>
                <span className="font-display font-bold text-headline-sm text-secondary">K+</span>
              </div>
              <span className="text-[9px] font-bold uppercase tracking-wider text-outline mt-1">Users</span>
            </div>
            <div className="flex flex-col items-center border-x border-outline-variant/30">
              <div className="flex items-baseline text-on-surface">
                <span className="font-display font-bold text-[24px] leading-tight">12</span>
                <span className="font-display font-bold text-headline-sm text-secondary">K+</span>
              </div>
              <span className="text-[9px] font-bold uppercase tracking-wider text-outline mt-1">Rides</span>
            </div>
            <div className="flex flex-col items-center">
              <div className="flex items-baseline text-on-surface">
                <span className="font-display font-bold text-[24px] leading-tight">4.8</span>
                <span className="font-display font-bold text-headline-sm text-secondary">/5</span>
              </div>
              <span className="text-[9px] font-bold uppercase tracking-wider text-outline mt-1">Rating</span>
            </div>
          </div>

          {/* Popular route pill */}
          <button 
            className="w-full bg-surface-container-high/60 backdrop-blur-md rounded-[14px] p-space-md flex items-center justify-between border border-outline-variant/20 active:scale-[0.98] transition-transform text-left"
            onClick={() => navigate('/login')}
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-surface-container flex items-center justify-center text-primary border border-outline-variant/30">
                <CarFront size={18} />
              </div>
              <div className="flex flex-col">
                <span className="text-label-md text-on-surface">Pune ⇄ Mumbai</span>
                <span className="text-label-sm font-medium text-secondary mt-0.5">Fares from ₹380</span>
              </div>
            </div>
            <ChevronRight size={18} className="text-on-surface-variant" />
          </button>
        </div>
      </div>
      
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in-up {
          animation: fadeInUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards;
          opacity: 0;
        }
        @media (prefers-reduced-motion: reduce) {
          .animate-fade-in-up {
            animation: none;
            opacity: 1;
            transform: none;
          }
        }
      `}} />
    </div>
  );
}