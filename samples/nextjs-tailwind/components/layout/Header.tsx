import React from 'react';
import { clsx } from 'clsx';

export interface HeaderProps {
  title?: string;
  subtitle?: string;
  children?: React.ReactNode;
  variant?: 'default' | 'bordered' | 'gradient';
  sticky?: boolean;
  className?: string;
}

/**
 * Page Header component with title, subtitle and actions
 * Supports different variants and sticky positioning
 * 
 * @example
 * <Header 
 *   title="Dashboard" 
 *   subtitle="Welcome back!"
 *   variant="gradient"
 *   sticky
 * >
 *   <Button variant="primary">Action</Button>
 * </Header>
 */
export const Header: React.FC<HeaderProps> = ({
  title,
  subtitle,
  children,
  variant = 'default',
  sticky = false,
  className,
}) => {
  const baseClasses = [
    'w-full',
    'px-4',
    'sm:px-6',
    'lg:px-8',
    'py-6',
    'flex',
    'items-center',
    'justify-between',
    'flex-wrap',
    'gap-4'
  ];

  const variantClasses = {
    default: [
      'bg-white',
      'border-b',
      'border-gray-200'
    ],
    bordered: [
      'bg-white',
      'border-b-2',
      'border-primary-200',
      'shadow-sm'
    ],
    gradient: [
      'bg-gradient-to-r',
      'from-primary-600',
      'to-primary-800',
      'text-white',
      'shadow-lg'
    ]
  };

  const stickyClasses = sticky ? [
    'sticky',
    'top-0',
    'z-40',
    'backdrop-blur-sm'
  ] : [];

  const headerClasses = clsx(
    baseClasses,
    variantClasses[variant],
    stickyClasses,
    className
  );

  const titleClasses = clsx(
    'font-bold',
    'leading-tight',
    {
      'text-gray-900': variant !== 'gradient',
      'text-white': variant === 'gradient'
    }
  );

  const subtitleClasses = clsx(
    'text-sm',
    'mt-1',
    {
      'text-gray-500': variant !== 'gradient',
      'text-primary-100': variant === 'gradient'
    }
  );

  return (
    <header className={headerClasses}>
      <div className="min-w-0 flex-1">
        {title && (
          <h1 className={clsx(titleClasses, 'text-2xl sm:text-3xl')}>
            {title}
          </h1>
        )}
        {subtitle && (
          <p className={subtitleClasses}>
            {subtitle}
          </p>
        )}
      </div>
      
      {children && (
        <div className="flex items-center gap-3 flex-shrink-0">
          {children}
        </div>
      )}
    </header>
  );
};