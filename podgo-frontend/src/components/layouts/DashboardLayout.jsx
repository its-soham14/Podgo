import Navbar from '../common/Navbar';

export default function DashboardLayout({ children }) {
  return (
    <div className="min-h-dvh flex flex-col bg-surface relative">
      <Navbar />
      
      <main className="flex-1 pb-safe w-full max-w-lg mx-auto">
        {children}
      </main>
    </div>
  );
}
