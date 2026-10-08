import { Loader2 } from 'lucide-react';

export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  className = '',
  disabled,
  ...props
}) {
  const baseClasses = "relative inline-flex items-center justify-center rounded-[10px] font-semibold transition-all duration-200 active:scale-[0.98] min-h-[44px] overflow-hidden focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-surface";
  
  const variantClasses = {
    primary: "bg-primary-container text-on-primary-container hover:bg-primary-container/90 focus:ring-primary-container",
    secondary: "bg-secondary text-on-secondary hover:bg-secondary/90 focus:ring-secondary",
    ghost: "border border-outline-variant text-on-surface hover:bg-surface-container-high focus:ring-outline",
    danger: "bg-error-container text-error hover:bg-error-container/90 focus:ring-error-container"
  };

  const sizeClasses = {
    sm: "h-9 px-4 text-label-md",
    md: "h-11 px-6 text-label-lg",
    lg: "h-[52px] px-8 text-label-lg"
  };

  const disabledClasses = "disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100";

  return (
    <button
      className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${disabledClasses} ${className}`}
      disabled={isLoading || disabled}
      {...props}
    >
      {isLoading && (
        <Loader2 className="absolute left-1/2 -translate-x-1/2 animate-spin" size={20} />
      )}
      <span className={`flex items-center justify-center gap-2 ${isLoading ? 'opacity-0' : 'opacity-100'}`}>
        {children}
      </span>
    </button>
  );
}
