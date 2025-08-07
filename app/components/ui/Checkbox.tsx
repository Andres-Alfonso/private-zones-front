// app/components/ui/Checkbox.tsx

import { forwardRef } from 'react';

interface CheckboxProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange'> {
  label: string;
  error?: string | null;
  helperText?: string;
  onChange?: (checked: boolean) => void;
}

const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  ({ label, error, helperText, className = '', onChange, ...props }, ref) => {
    
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (onChange) {
        onChange(e.target.checked);
      }
    };

    return (
      <div className="space-y-1">
        <div className="flex items-start">
          <input
            ref={ref}
            type="checkbox"
            className={`h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded mt-0.5 ${
              error ? 'border-red-300' : ''
            } ${className}`}
            onChange={handleChange}
            {...props}
          />
          <div className="ml-2 flex-1">
            <label 
              htmlFor={props.id} 
              className="block text-sm text-gray-700 cursor-pointer"
            >
              {label}
              {props.required && <span className="text-red-500 ml-1">*</span>}
            </label>
            
            {helperText && (
              <p className="mt-1 text-xs text-gray-500">
                {helperText}
              </p>
            )}
          </div>
        </div>
        
        {error && (
          <p className="text-sm text-red-600 flex items-center">
            <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
              <path 
                fillRule="evenodd" 
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" 
                clipRule="evenodd" 
              />
            </svg>
            {error}
          </p>
        )}
      </div>
    );
  }
);

Checkbox.displayName = 'Checkbox';

export default Checkbox;