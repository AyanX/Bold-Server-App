/**
 * Input Component
 *
 * Reusable form input component with label, validation, and error states.
 * Supports text, email, password, number, and other input types.
 *
 * @module components/ui/Input
 */

import React, { forwardRef } from 'react';

type InputSize = 'sm' | 'md' | 'lg';

interface InputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> {
  /** Input label */
  label?: string;
  /** Error message */
  error?: string;
  /** Helper text below input */
  helperText?: string;
  /** Input size variant */
  size?: InputSize;
  /** Icon to show at the start of input */
  leftIcon?: React.ReactNode;
  /** Icon to show at the end of input */
  rightIcon?: React.ReactNode;
  /** Make input full width */
  fullWidth?: boolean;
}

/**
 * Size styles mapping
 */
const SIZE_STYLES: Record<InputSize, string> = {
  sm: 'px-3 py-2 text-xs',
  md: 'px-4 py-3 text-sm',
  lg: 'px-5 py-4 text-base',
};

/**
 * Input component for form data entry
 *
 * @example
 * ```tsx
 * // Basic input with label
 * <Input
 *   label="Email Address"
 *   type="email"
 *   placeholder="Enter your email"
 * />
 *
 * // With error state
 * <Input
 *   label="Password"
 *   type="password"
 *   error="Password must be at least 8 characters"
 * />
 *
 * // With icons
 * <Input
 *   label="Search"
 *   leftIcon={<SearchIcon />}
 *   placeholder="Search articles..."
 * />
 * ```
 */
const Input = forwardRef<HTMLInputElement, InputProps>(({
  label,
  error,
  helperText,
  size = 'md',
  leftIcon,
  rightIcon,
  fullWidth = true,
  className = '',
  id,
  ...props
}, ref) => {
  const inputId = id || label?.toLowerCase().replace(/\s+/g, '-');
  const hasError = !!error;

  const baseInputStyles = [
    'border rounded-sm transition-all duration-200',
    'focus:outline-none focus:ring-2 focus:ring-offset-0',
    'disabled:bg-gray-100 disabled:cursor-not-allowed',
  ].join(' ');

  const stateStyles = hasError
    ? 'border-red-500 focus:border-red-500 focus:ring-red-200'
    : 'border-gray-200 focus:border-[#001733] focus:ring-[#001733]/20';

  return (
    <div className={`${fullWidth ? 'w-full' : ''}`}>
      {label && (
        <label
          htmlFor={inputId}
          className="block text-xs font-black uppercase tracking-widest text-gray-500 mb-2"
        >
          {label}
        </label>
      )}
      <div className="relative">
        {leftIcon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
            {leftIcon}
          </div>
        )}
        <input
          ref={ref}
          id={inputId}
          className={`
            ${baseInputStyles}
            ${stateStyles}
            ${SIZE_STYLES[size]}
            ${leftIcon ? 'pl-10' : ''}
            ${rightIcon ? 'pr-10' : ''}
            ${fullWidth ? 'w-full' : ''}
            ${className}
          `}
          {...props}
        />
        {rightIcon && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
            {rightIcon}
          </div>
        )}
      </div>
      {(error || helperText) && (
        <p className={`mt-1.5 text-xs ${hasError ? 'text-red-500' : 'text-gray-400'}`}>
          {error || helperText}
        </p>
      )}
    </div>
  );
});

Input.displayName = 'Input';

export default Input;
