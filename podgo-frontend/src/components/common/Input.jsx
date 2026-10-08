import { forwardRef } from 'react';

const Input = forwardRef(({
  label,
  icon: Icon,
  error,
  className = '',
  id,
  ...props
}, ref) => {
  const inputId = id || label?.toLowerCase().replace(/\s+/g, '-');

  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      {label && (
        <label 
          htmlFor={inputId} 
          className="text-label-sm uppercase tracking-[0.05em] text-on-surface-variant pl-1"
        >
          {label}
        </label>
      )}
      
      <div className="relative flex items-center">
        {Icon && (
          <div className="absolute left-3.5 text-on-surface-variant pointer-events-none">
            <Icon size={20} />
          </div>
        )}
        
        <input
          ref={ref}
          id={inputId}
          className={`
            w-full h-11 bg-surface-container rounded-[10px] 
            border text-body-lg text-on-surface placeholder:text-on-surface-variant/50
            transition-all duration-200 outline-none
            focus:ring-1 focus:outline-none min-h-[44px]
            ${Icon ? 'pl-11 pr-4' : 'px-4'}
            ${error 
              ? 'border-error focus:border-error focus:ring-error/30' 
              : 'border-outline-variant focus:border-primary focus:ring-primary/30'
            }
          `}
          {...props}
        />
      </div>
      
      {error && (
        <p className="text-body-sm text-error pl-1 mt-0.5 animate-in fade-in slide-in-from-top-1 duration-200">
          {error}
        </p>
      )}
    </div>
  );
});

Input.displayName = 'Input';

export default Input;
