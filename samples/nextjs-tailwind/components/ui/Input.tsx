import React from 'react';
import { clsx } from 'clsx';

export interface InputProps {
  label?: string;
  placeholder?: string;
  value?: string;
  defaultValue?: string;
  type?: 'text' | 'email' | 'password' | 'number' | 'tel' | 'url' | 'search';
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'filled' | 'flushed';
  disabled?: boolean;
  required?: boolean;
  error?: string;
  helperText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  className?: string;
  onChange?: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onFocus?: (event: React.FocusEvent<HTMLInputElement>) => void;
  onBlur?: (event: React.FocusEvent<HTMLInputElement>) => void;
}

/**
 * Versatile Input component with multiple variants
 * Includes label, helper text, and error state support
 * 
 * @example
 * <Input 
 *   label="Email"
 *   type="email"
 *   placeholder="Enter your email"
 *   value={email}
 *   onChange={(e) => setEmail(e.target.value)}
 * />
 */
export const Input: React.FC<InputProps> = ({
  label,
  placeholder,
  value,
  defaultValue,
  type = 'text',
  size = 'md',
  variant = 'default',
  disabled = false,
  required = false,
  error,
  helperText,
  leftIcon,
  rightIcon,
  className,
  onChange,
  onFocus,
  onBlur,
  ...props
}) => {
  const baseInputClasses = [
    'w-full',
    'font-medium',
    'transition-all',
    'duration-200',
    'focus:outline-none',
    'focus:ring-2',
    'focus:ring-offset-1',
    'disabled:opacity-50',
    'disabled:cursor-not-allowed',
    'placeholder:text-gray-400'
  ];

  const sizeClasses = {
    sm: ['px-3', 'py-2', 'text-sm', 'min-h-[36px]'],
    md: ['px-4', 'py-2.5', 'text-base', 'min-h-[44px]'],
    lg: ['px-5', 'py-3', 'text-lg', 'min-h-[52px]']
  };

  const variantClasses = {
    default: [
      'bg-white',
      'border',
      'border-gray-300',
      'rounded-lg',
      'focus:border-primary-500',
      'focus:ring-primary-500'
    ],
    filled: [
      'bg-gray-50',
      'border',
      'border-gray-200',
      'rounded-lg',
      'focus:bg-white',
      'focus:border-primary-500',
      'focus:ring-primary-500'
    ],
    flushed: [
      'bg-transparent',
      'border-0',
      'border-b-2',
      'border-gray-300',
      'rounded-none',
      'px-0',
      'focus:border-primary-500',
      'focus:ring-0'
    ]
  };

  const errorClasses = error ? [
    'border-danger-500',
    'focus:border-danger-500',
    'focus:ring-danger-500'
  ] : [];

  const inputClasses = clsx(
    baseInputClasses,
    sizeClasses[size],
    variantClasses[variant],
    errorClasses,
    {
      'pl-10': leftIcon && variant !== 'flushed',
      'pr-10': rightIcon && variant !== 'flushed'
    }
  );

  const containerClasses = clsx(
    'relative',
    className
  );

  const labelClasses = clsx(
    'block',
    'text-sm',
    'font-medium',
    'text-gray-700',
    'mb-2',
    {
      'text-danger-600': error
    }
  );

  const helperTextClasses = clsx(
    'mt-2',
    'text-sm',
    {
      'text-danger-600': error,
      'text-gray-500': !error
    }
  );

  const iconBaseClasses = [
    'absolute',
    'top-1/2',
    'transform',
    '-translate-y-1/2',
    'text-gray-400',
    'pointer-events-none'
  ];

  const leftIconClasses = clsx(
    iconBaseClasses,
    'left-3'
  );

  const rightIconClasses = clsx(
    iconBaseClasses,
    'right-3'
  );

  return (
    <div className={containerClasses}>
      {label && (
        <label className={labelClasses}>
          {label}
          {required && <span className="text-danger-500 ml-1">*</span>}
        </label>
      )}
      
      <div className="relative">
        {leftIcon && (
          <div className={leftIconClasses}>
            {leftIcon}
          </div>
        )}
        
        <input
          type={type}
          placeholder={placeholder}
          value={value}
          defaultValue={defaultValue}
          disabled={disabled}
          required={required}
          className={inputClasses}
          onChange={onChange}
          onFocus={onFocus}
          onBlur={onBlur}
          {...props}
        />
        
        {rightIcon && (
          <div className={rightIconClasses}>
            {rightIcon}
          </div>
        )}
      </div>
      
      {(error || helperText) && (
        <p className={helperTextClasses}>
          {error || helperText}
        </p>
      )}
    </div>
  );
};