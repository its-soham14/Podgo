export default function AuthLayout({ children }) {
  return (
    <div className="relative min-h-dvh flex flex-col bg-surface pt-safe pb-safe overflow-hidden">
      {/* Ambient glow backgrounds */}
      <div className="absolute top-[-10%] left-[-10%] w-[300px] h-[300px] bg-primary/20 blur-[100px] rounded-full pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-20%] w-[250px] h-[250px] bg-secondary/15 blur-[100px] rounded-full pointer-events-none" />

      <div className="flex-1 flex flex-col px-4 z-10">
        {children}
      </div>
    </div>
  );
}
