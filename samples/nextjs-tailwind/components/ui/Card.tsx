import React from 'react';
import { clsx } from 'clsx';

export interface CardProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
  variant?: 'default' | 'bordered' | 'shadow' | 'elevated';
  padding?: 'none' | 'sm' | 'md' | 'lg';
  className?: string;
  headerClassName?: string;
  bodyClassName?: string;
}

/**
 * Flexible Card component for content organization
 * Built with TailwindCSS design system
 * 
 * @example
 * <Card title="Product Info" variant="shadow" padding="lg">
 *   <p className="text-gray-600">Product details here</p>
 * </Card>
 */
export const Card: React.FC<CardProps> = ({
  children,
  title,
  subtitle,
  variant = 'default',
  padding = 'md',
  className,
  headerClassName,
  bodyClassName,
}) => {
  const baseClasses = [
    'bg-white',
    'rounded-lg',
    'overflow-hidden',
    'transition-all',
    'duration-200'
  ];

  const variantClasses = {
    default: ['border', 'border-gray-200'],
    bordered: ['border-2', 'border-gray-300'],
    shadow: ['shadow-md', 'border', 'border-gray-100'],
    elevated: ['shadow-lg', 'shadow-gray-200/50', 'border', 'border-gray-100']
  };

  const paddingClasses = {
    none: [],
    sm: ['p-3'],
    md: ['p-4'],
    lg: ['p-6']
  };

  const cardClasses = clsx(
    baseClasses,
    variantClasses[variant],
    className
  );

  const headerClasses = clsx(
    'border-b',
    'border-gray-200',
    'pb-3',
    'mb-4',
    headerClassName
  );

  const bodyClasses = clsx(
    paddingClasses[padding],
    bodyClassName
  );

  const hasHeader = title || subtitle;

  return (
    <div className={cardClasses}>
      <div className={bodyClasses}>
        {hasHeader && (
          <div className={headerClasses}>
            {title && (
              <h3 className="text-lg font-semibold text-gray-900 leading-6">
                {title}
              </h3>
            )}
            {subtitle && (
              <p className="text-sm text-gray-500 mt-1">
                {subtitle}
              </p>
            )}
          </div>
        )}
        <div className="text-gray-700">
          {children}
        </div>
      </div>
    </div>
  );
};