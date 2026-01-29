/**
 * Button Component
 *
 * Reusable button component with multiple variants, sizes, and states.
 * Follows the application's design system.
 *
 * @module components/ui/Button
 */

import React from 'react';
import { LoadingSpinner } from '../common/LoadingSpinner';

type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /** Visual style variant */
  variant?: ButtonVariant;
  /** Button size */
  size?: ButtonSize;
  /** Show loading spinner and disable button */
  isLoading?: boolean;
  /** Loading text (shown when isLoading is true) */
  loadingText?: string;
  /** Icon to show before text */
  leftIcon?: React.ReactNode;
  /** Icon to show after text */
  rightIcon?: React.ReactNode;
  /** Make button full width */
  fullWidth?: boolean;
}

/**
 * Variant styles mapping
 */
const VARIANT_STYLES: Record<ButtonVariant, string> = {
  primary: 'bg-[#e5002b] text-white hover:bg-[#c50025] active:bg-[#a50020]',
  secondary: 'bg-[#001733] text-white hover:bg-[#002855] active:bg-[#001122]',
  outline: 'border-2 border-[#001733] text-[#001733] hover:bg-[#001733] hover:text-white',
  ghost: 'text-[#001733] hover:bg-gray-100 active:bg-gray-200',
  danger: 'bg-red-600 text-white hover:bg-red-700 active:bg-red-800',
};

/**
 * Size styles mapping
 */
const SIZE_STYLES: Record<ButtonSize, string> = {
  sm: 'px-3 py-1.5 text-xs',
  md: 'px-5 py-2.5 text-sm',
  lg: 'px-6 py-3 text-base',
};

/**
 * Button component for user interactions
 *
 * @example
 * ```tsx
 * // Primary button
 * <Button variant="primary" onClick={handleClick}>
 *   Save Changes
 * </Button>
 *
 * // Loading state
 * <Button variant="primary" isLoading loadingText="Saving...">
 *   Save
 * </Button>
 *
 * // With icons
 * <Button leftIcon={<PlusIcon />} variant="secondary">
 *   Add Item
 * </Button>
 * ```
 */
const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  loadingText,
  leftIcon,
  rightIcon,
  fullWidth = false,
  disabled,
  className = '',
  ...props
}) => {
  const isDisabled = disabled || isLoading;

  const baseStyles = [
    'inline-flex items-center justify-center gap-2',
    'font-black uppercase tracking-widest',
    'rounded-sm transition-all duration-200',
    'focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#001733]',
    'disabled:opacity-50 disabled:cursor-not-allowed',
  ].join(' ');

  return (
    <button
      className={`
        ${baseStyles}
        ${VARIANT_STYLES[variant]}
        ${SIZE_STYLES[size]}
        ${fullWidth ? 'w-full' : ''}
        ${className}
      `}
      disabled={isDisabled}
      {...props}
    >
      {isLoading ? (
        <>
          <LoadingSpinner size="sm" color="currentColor" />
          {loadingText || children}
        </>
      ) : (
        <>
          {leftIcon}
          {children}
          {rightIcon}
        </>
      )}
    </button>
  );
};

export default Button;
