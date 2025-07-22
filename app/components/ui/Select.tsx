// components/ui/Select.tsx
import React from 'react';
import { AlertCircle, ChevronDown } from 'lucide-react';

interface SelectOption {
  value: string;
  label: string;
}

interface SelectProps {
  id?: string;
  name: string;
  label?: string;
  options: SelectOption[];
  required?: boolean;
  disabled?: boolean;
  error?: string | null;
  placeholder?: string;
  defaultValue?: string;
  autoComplete?: string;
  className?: string;
  containerClassName?: string;
  labelClassName?: string;
  selectClassName?: string;
  icon?: React.ReactNode;
  helperText?: string;
}

const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({
    id,
    name,
    label,
    options,
    required = false,
    disabled = false,
    error,
    placeholder,
    defaultValue,
    autoComplete,
    className,
    containerClassName = '',
    labelClassName = '',
    selectClassName = '',
    icon,
    helperText,
    ...props
  }, ref) => {
    const [isFocused, setIsFocused] = React.useState(false);
    const hasError = Boolean(error);

    return (
      <div className={`space-y-2 ${containerClassName}`}>
        {label && (
          <label 
            htmlFor={id || name} 
            className={`block text-sm font-bold text-gray-700 ${labelClassName}`}
          >
            {icon && (
              <div className="flex items-center space-x-2 mb-1">
                <div className="text-gray-500">{icon}</div>
                <span>{label}</span>
                {required && <span className="text-red-500">*</span>}
              </div>
            )}
            {!icon && (
              <>
                {label}
                {required && <span className="text-red-500 ml-1">*</span>}
              </>
            )}
          </label>
        )}
        
        <div className="relative">
          <select
            ref={ref}
            id={id || name}
            name={name}
            required={required}
            disabled={disabled}
            defaultValue={defaultValue}
            autoComplete={autoComplete}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            className={`
              w-full px-4 py-3 border rounded-xl shadow-sm appearance-none
              focus:outline-none focus:ring-2 focus:ring-offset-2 
              transition-all duration-200 bg-white/80 backdrop-blur-sm
              ${hasError 
                ? 'border-red-300 focus:ring-red-500 focus:border-red-500' 
                : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500 hover:border-gray-400'
              }
              ${disabled ? 'opacity-50 cursor-not-allowed bg-gray-50/80' : 'cursor-pointer'}
              ${isFocused ? 'transform scale-[1.02] shadow-lg' : ''}
              ${icon && !label ? 'pl-12' : ''}
              pr-12
              ${selectClassName}
              ${className || ''}
            `}
            {...props}
          >
            {placeholder && (
              <option value="" disabled>
                {placeholder}
              </option>
            )}
            {options.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          
          {/* Icono izquierdo cuando no hay label */}
          {icon && !label && (
            <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none">
              {icon}
            </div>
          )}
          
          {/* Icono de chevron */}
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
            {hasError ? (
              <AlertCircle className="h-5 w-5 text-red-500" />
            ) : (
              <ChevronDown className="h-5 w-5 text-gray-400" />
            )}
          </div>
        </div>
        
        {/* Mensaje de error */}
        {error && (
          <p className="text-sm text-red-600 font-medium flex items-center space-x-1">
            <AlertCircle className="h-4 w-4 flex-shrink-0" />
            <span>{error}</span>
          </p>
        )}
        
        {/* Texto de ayuda */}
        {helperText && !error && (
          <p className="text-sm text-gray-500">{helperText}</p>
        )}
      </div>
    );
  }
);

Select.displayName = 'Select';

export default Select;