// app/components/ui/Input.tsx
import React from 'react';
import { AlertCircle, Eye, EyeOff } from 'lucide-react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string | null;
  helperText?: string;
  icon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  showPasswordToggle?: boolean;
  containerClassName?: string;
  labelClassName?: string;
  inputClassName?: string;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({
    label,
    error,
    helperText,
    icon,
    rightIcon,
    showPasswordToggle = false,
    containerClassName = '',
    labelClassName = '',
    inputClassName = '',
    type = 'text',
    className,
    ...props
  }, ref) => {
    const [showPassword, setShowPassword] = React.useState(false);
    const [isFocused, setIsFocused] = React.useState(false);

    const inputType = showPasswordToggle ? (showPassword ? 'text' : 'password') : type;
    const hasError = Boolean(error);

    return (
      <div className={`space-y-2 ${containerClassName}`}>
        {label && (
          <label 
            htmlFor={props.id || props.name} 
            className={`block text-sm font-bold text-gray-700 ${labelClassName}`}
          >
            {icon && (
              <div className="flex items-center space-x-2 mb-1">
                <div className="text-gray-500">{icon}</div>
                <span>{label}</span>
                {props.required && <span className="text-red-500">*</span>}
              </div>
            )}
            {!icon && (
              <>
                {label}
                {props.required && <span className="text-red-500 ml-1">*</span>}
              </>
            )}
          </label>
        )}
        
        <div className="relative">
          <input
            ref={ref}
            type={inputType}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            className={`
              w-full px-4 py-3 border rounded-xl shadow-sm 
              focus:outline-none focus:ring-2 focus:ring-offset-2 
              transition-all duration-200 bg-white/80 backdrop-blur-sm
              ${hasError 
                ? 'border-red-300 focus:ring-red-500 focus:border-red-500' 
                : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500 hover:border-gray-400'
              }
              ${props.disabled ? 'opacity-50 cursor-not-allowed bg-gray-50/80' : ''}
              ${isFocused ? 'transform scale-[1.02] shadow-lg' : ''}
              ${icon && !label ? 'pl-12' : ''}
              ${rightIcon || showPasswordToggle ? 'pr-12' : ''}
              ${inputClassName}
              ${className || ''}
            `}
            {...props}
          />
          
          {/* Icono izquierdo cuando no hay label */}
          {icon && !label && (
            <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
              {icon}
            </div>
          )}
          
          {/* Icono derecho o toggle de password */}
          {(rightIcon || showPasswordToggle) && (
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
              {showPasswordToggle ? (
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-gray-400 hover:text-gray-600 transition-colors focus:outline-none"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              ) : (
                rightIcon
              )}
            </div>
          )}
          
          {/* Indicador de error */}
          {hasError && (
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
              <AlertCircle className="h-5 w-5 text-red-500" />
            </div>
          )}
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

Input.displayName = 'Input';

export default Input;