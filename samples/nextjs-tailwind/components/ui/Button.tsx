import React from 'react';
import { clsx } from 'clsx';

export interface ButtonProps {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  disabled?: boolean;
  loading?: boolean;
  fullWidth?: boolean;
  onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void;
  className?: string;
  type?: 'button' | 'submit' | 'reset';
}

/**
 * Reusable Button component with multiple variants and sizes
 * Built with TailwindCSS for consistent design system
 * 
 * @example
 * <Button variant="primary" size="md" onClick={handleClick}>
 *   Click me
 * </Button>
 */
export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  fullWidth = false,
  onClick,
  className,
  type = 'button',
  ...props
}) => {
  const baseClasses = [
    'inline-flex',
    'items-center',
    'justify-center',
    'font-medium',
    'rounded-lg',
    'border',
    'transition-all',
    'duration-200',
    'focus:outline-none',
    'focus:ring-2',
    'focus:ring-offset-2',
    'disabled:opacity-50',
    'disabled:cursor-not-allowed',
    'active:scale-[0.98]'
  ];

  const variantClasses = {
    primary: [
      'bg-primary-600',
      'border-primary-600',
      'text-white',
      'hover:bg-primary-700',
      'hover:border-primary-700',
      'focus:ring-primary-500'
    ],
    secondary: [
      'bg-secondary-100',
      'border-secondary-300',
      'text-secondary-700',
      'hover:bg-secondary-200',
      'hover:border-secondary-400',
      'focus:ring-secondary-500'
    ],
    success: [
      'bg-success-600',
      'border-success-600',
      'text-white',
      'hover:bg-success-700',
      'hover:border-success-700',
      'focus:ring-success-500'
    ],
    warning: [
      'bg-warning-600',
      'border-warning-600',
      'text-white',
      'hover:bg-warning-700',
      'hover:border-warning-700',
      'focus:ring-warning-500'
    ],
    danger: [
      'bg-danger-600',
      'border-danger-600',
      'text-white',
      'hover:bg-danger-700',
      'hover:border-danger-700',
      'focus:ring-danger-500'
    ],
    ghost: [
      'bg-transparent',
      'border-transparent',
      'text-secondary-600',
      'hover:bg-secondary-100',
      'hover:text-secondary-700',
      'focus:ring-secondary-500'
    ]
  };

  const sizeClasses = {
    sm: ['px-3', 'py-1.5', 'text-sm', 'min-h-[32px]'],
    md: ['px-4', 'py-2', 'text-base', 'min-h-[40px]'],
    lg: ['px-6', 'py-3', 'text-lg', 'min-h-[48px]'],
    xl: ['px-8', 'py-4', 'text-xl', 'min-h-[56px]']
  };

  const widthClasses = fullWidth ? ['w-full'] : [];

  const buttonClasses = clsx(
    baseClasses,
    variantClasses[variant],
    sizeClasses[size],
    widthClasses,
    className
  );

  return (
    <button
      type={type}
      className={buttonClasses}
      disabled={disabled || loading}
      onClick={onClick}
      {...props}
    >
      {loading && (
        <svg
          className="animate-spin -ml-1 mr-3 h-5 w-5 text-current"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
      )}
      {children}
    </button>
  );
};