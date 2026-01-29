/**
 * Select Component
 *
 * Reusable select/dropdown component with label and error states.
 * Styled to match the application's design system.
 *
 * @module components/ui/Select
 */

import React, { forwardRef } from 'react';

type SelectSize = 'sm' | 'md' | 'lg';

interface SelectOption {
  /** Option value */
  value: string;
  /** Option display label */
  label: string;
  /** Disable this option */
  disabled?: boolean;
}

interface SelectProps extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, 'size'> {
  /** Select label */
  label?: string;
  /** Available options */
  options: SelectOption[];
  /** Error message */
  error?: string;
  /** Helper text below select */
  helperText?: string;
  /** Select size variant */
  size?: SelectSize;
  /** Placeholder text (shown as first disabled option) */
  placeholder?: string;
  /** Make select full width */
  fullWidth?: boolean;
}

/**
 * Size styles mapping
 */
const SIZE_STYLES: Record<SelectSize, string> = {
  sm: 'px-3 py-2 text-xs',
  md: 'px-4 py-3 text-sm',
  lg: 'px-5 py-4 text-base',
};

/**
 * Select component for choosing from options
 *
 * @example
 * ```tsx
 * // Basic select
 * <Select
 *   label="Category"
 *   options={[
 *     { value: 'tech', label: 'Technology' },
 *     { value: 'sports', label: 'Sports' },
 *   ]}
 *   value={category}
 *   onChange={(e) => setCategory(e.target.value)}
 * />
 *
 * // With placeholder
 * <Select
 *   label="Status"
 *   placeholder="Select a status"
 *   options={statusOptions}
 *   value={status}
 *   onChange={handleChange}
 * />
 * ```
 */
const Select = forwardRef<HTMLSelectElement, SelectProps>(({
  label,
  options,
  error,
  helperText,
  size = 'md',
  placeholder,
  fullWidth = true,
  className = '',
  id,
  ...props
}, ref) => {
  const selectId = id || label?.toLowerCase().replace(/\s+/g, '-');
  const hasError = !!error;

  const baseSelectStyles = [
    'border rounded-sm transition-all duration-200 bg-white',
    'focus:outline-none focus:ring-2 focus:ring-offset-0',
    'disabled:bg-gray-100 disabled:cursor-not-allowed',
    'appearance-none cursor-pointer',
    'bg-[url("data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20fill%3D%22none%22%20viewBox%3D%220%200%2024%2024%22%20stroke%3D%22%236b7280%22%3E%3Cpath%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%20stroke-width%3D%222%22%20d%3D%22M19%209l-7%207-7-7%22%2F%3E%3C%2Fsvg%3E")]',
    'bg-[length:1.25rem] bg-[right_0.5rem_center] bg-no-repeat pr-10',
  ].join(' ');

  const stateStyles = hasError
    ? 'border-red-500 focus:border-red-500 focus:ring-red-200'
    : 'border-gray-200 focus:border-[#001733] focus:ring-[#001733]/20';

  return (
    <div className={`${fullWidth ? 'w-full' : ''}`}>
      {label && (
        <label
          htmlFor={selectId}
          className="block text-xs font-black uppercase tracking-widest text-gray-500 mb-2"
        >
          {label}
        </label>
      )}
      <select
        ref={ref}
        id={selectId}
        className={`
          ${baseSelectStyles}
          ${stateStyles}
          ${SIZE_STYLES[size]}
          ${fullWidth ? 'w-full' : ''}
          ${className}
        `}
        {...props}
      >
        {placeholder && (
          <option value="" disabled>
            {placeholder}
          </option>
        )}
        {options.map((option) => (
          <option
            key={option.value}
            value={option.value}
            disabled={option.disabled}
          >
            {option.label}
          </option>
        ))}
      </select>
      {(error || helperText) && (
        <p className={`mt-1.5 text-xs ${hasError ? 'text-red-500' : 'text-gray-400'}`}>
          {error || helperText}
        </p>
      )}
    </div>
  );
});

Select.displayName = 'Select';

export default Select;
