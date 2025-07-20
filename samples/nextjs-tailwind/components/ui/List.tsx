import React from 'react';
import { clsx } from 'clsx';

export interface ListItem {
  id: string;
  title: string;
  subtitle?: string;
  description?: string;
  avatar?: string;
  rightContent?: React.ReactNode;
  onClick?: () => void;
  href?: string;
}

export interface ListProps {
  items: ListItem[];
  variant?: 'default' | 'bordered' | 'divided' | 'cards';
  size?: 'sm' | 'md' | 'lg';
  showAvatars?: boolean;
  className?: string;
  itemClassName?: string;
  emptyState?: React.ReactNode;
}

/**
 * Flexible List component for displaying structured data
 * Supports various layouts and interactive elements
 * 
 * @example
 * <List 
 *   items={userList}
 *   variant="cards"
 *   size="md"
 *   showAvatars
 * />
 */
export const List: React.FC<ListProps> = ({
  items,
  variant = 'default',
  size = 'md',
  showAvatars = false,
  className,
  itemClassName,
  emptyState,
}) => {
  if (items.length === 0) {
    return (
      <div className="text-center py-12">
        {emptyState || (
          <div>
            <div className="text-gray-400 text-4xl mb-4">📋</div>
            <p className="text-gray-500">No items to display</p>
          </div>
        )}
      </div>
    );
  }

  const baseListClasses = [
    'w-full'
  ];

  const variantListClasses = {
    default: [],
    bordered: ['border', 'border-gray-200', 'rounded-lg', 'overflow-hidden'],
    divided: ['divide-y', 'divide-gray-200'],
    cards: ['space-y-3']
  };

  const listClasses = clsx(
    baseListClasses,
    variantListClasses[variant],
    className
  );

  const sizeClasses = {
    sm: ['px-3', 'py-2'],
    md: ['px-4', 'py-3'],
    lg: ['px-6', 'py-4']
  };

  const baseItemClasses = [
    'flex',
    'items-center',
    'justify-between',
    'w-full',
    'transition-all',
    'duration-200',
    'group'
  ];

  const variantItemClasses = {
    default: [
      'hover:bg-gray-50'
    ],
    bordered: [
      'hover:bg-gray-50',
      'first:border-t-0',
      'border-t',
      'border-gray-200'
    ],
    divided: [
      'hover:bg-gray-50'
    ],
    cards: [
      'bg-white',
      'border',
      'border-gray-200',
      'rounded-lg',
      'shadow-sm',
      'hover:shadow-md',
      'hover:border-gray-300'
    ]
  };

  const renderListItem = (item: ListItem) => {
    const itemClasses = clsx(
      baseItemClasses,
      variantItemClasses[variant],
      sizeClasses[size],
      itemClassName,
      {
        'cursor-pointer': item.onClick || item.href
      }
    );

    const content = (
      <>
        <div className="flex items-center space-x-3 min-w-0 flex-1">
          {showAvatars && (
            <div className="flex-shrink-0">
              {item.avatar ? (
                <img
                  className="h-10 w-10 rounded-full object-cover"
                  src={item.avatar}
                  alt={`${item.title} avatar`}
                />
              ) : (
                <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                  <span className="text-sm font-medium text-gray-700">
                    {item.title.charAt(0).toUpperCase()}
                  </span>
                </div>
              )}
            </div>
          )}
          
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium text-gray-900 truncate group-hover:text-primary-600 transition-colors">
              {item.title}
            </p>
            {item.subtitle && (
              <p className="text-sm text-gray-500 truncate">
                {item.subtitle}
              </p>
            )}
            {item.description && (
              <p className="text-xs text-gray-400 mt-1 line-clamp-2">
                {item.description}
              </p>
            )}
          </div>
        </div>
        
        {item.rightContent && (
          <div className="flex-shrink-0 ml-3">
            {item.rightContent}
          </div>
        )}
      </>
    );

    if (item.href) {
      return (
        <a
          key={item.id}
          href={item.href}
          className={itemClasses}
        >
          {content}
        </a>
      );
    }

    if (item.onClick) {
      return (
        <button
          key={item.id}
          onClick={item.onClick}
          className={itemClasses}
          type="button"
        >
          {content}
        </button>
      );
    }

    return (
      <div key={item.id} className={itemClasses}>
        {content}
      </div>
    );
  };

  if (variant === 'cards') {
    return (
      <div className={listClasses}>
        {items.map(renderListItem)}
      </div>
    );
  }

  return (
    <div className={listClasses}>
      {items.map(renderListItem)}
    </div>
  );
};