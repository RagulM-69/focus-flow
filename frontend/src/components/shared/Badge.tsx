import React from 'react';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'secondary' | 'outline' | 'high' | 'medium' | 'low';
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'default',
  className = ''
}) => {
  const baseStyle = 'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold border transition-colors';

  const variants = {
    default: 'border-transparent bg-primary text-primary-foreground',
    secondary: 'border-transparent bg-secondary text-secondary-foreground',
    outline: 'text-foreground border-border bg-background',
    high: 'border-red-200 bg-red-50 text-red-700 dark:border-red-950/30 dark:bg-red-950/20 dark:text-red-400',
    medium: 'border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-950/30 dark:bg-amber-950/20 dark:text-amber-400',
    low: 'border-neutral-200 bg-neutral-50 text-neutral-600 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-400'
  };

  return (
    <span className={`${baseStyle} ${variants[variant]} ${className}`}>
      {children}
    </span>
  );
};
