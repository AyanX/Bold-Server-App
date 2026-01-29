/**
 * Toggle Component
 *
 * Reusable toggle/switch component for boolean settings.
 * Accessible and follows WAI-ARIA switch pattern.
 *
 * @module components/ui/Toggle
 */

import React from 'react';

type ToggleSize = 'sm' | 'md' | 'lg';

interface ToggleProps {
  /** Current toggle state */
  checked: boolean;
  /** Callback when toggle state changes */
  onChange: (checked: boolean) => void;
  /** Label text displayed next to toggle */
  label?: string;
  /** Description text below label */
  description?: string;
  /** Toggle size variant */
  size?: ToggleSize;
  /** Disable toggle interaction */
  disabled?: boolean;
  /** Additional CSS classes */
  className?: string;
  /** Unique identifier */
  id?: string;
}

/**
 * Size configuration for toggle dimensions
 */
const SIZE_CONFIG: Record<ToggleSize, { track: string; thumb: string; translate: string }> = {
  sm: { track: 'w-8 h-4', thumb: 'w-3 h-3', translate: 'translate-x-4' },
  md: { track: 'w-11 h-6', thumb: 'w-4 h-4', translate: 'translate-x-5' },
  lg: { track: 'w-14 h-7', thumb: 'w-5 h-5', translate: 'translate-x-7' },
};

/**
 * Toggle component for boolean settings
 *
 * @example
 * ```tsx
 * // Basic toggle
 * <Toggle
 *   checked={isEnabled}
 *   onChange={setIsEnabled}
 *   label="Enable notifications"
 * />
 *
 * // With description
 * <Toggle
 *   checked={darkMode}
 *   onChange={setDarkMode}
 *   label="Dark Mode"
 *   description="Use dark theme for better visibility at night"
 * />
 * ```
 */
const Toggle: React.FC<ToggleProps> = ({
  checked,
  onChange,
  label,
  description,
  size = 'md',
  disabled = false,
  className = '',
  id,
}) => {
  const toggleId = id || label?.toLowerCase().replace(/\s+/g, '-');
  const config = SIZE_CONFIG[size];

  return (
    <div className={`flex items-center justify-between py-3 ${className}`}>
      <div className="flex-1">
        {label && (
          <label
            htmlFor={toggleId}
            className={`block text-sm font-medium ${disabled ? 'text-gray-400' : 'text-gray-700'} cursor-pointer`}
          >
            {label}
          </label>
        )}
        {description && (
          <p className="text-xs text-gray-400 mt-0.5">{description}</p>
        )}
      </div>
      <button
        id={toggleId}
        type="button"
        role="switch"
        aria-checked={checked}
        aria-label={label}
        disabled={disabled}
        onClick={() => onChange(!checked)}
        className={`
          relative inline-flex flex-shrink-0 cursor-pointer rounded-full
          transition-colors duration-200 ease-in-out
          focus:outline-none focus:ring-2 focus:ring-[#001733] focus:ring-offset-2
          disabled:opacity-50 disabled:cursor-not-allowed
          ${config.track}
          ${checked ? 'bg-[#e5002b]' : 'bg-gray-200'}
        `}
      >
        <span
          className={`
            pointer-events-none inline-block rounded-full bg-white shadow-lg
            transform transition-transform duration-200 ease-in-out
            ${config.thumb}
            ${checked ? config.translate : 'translate-x-1'}
            mt-0.5 ml-0.5
          `}
        />
      </button>
    </div>
  );
};

export default Toggle;
