// Utility for merging class names
// Combines clsx and tailwind-merge for optimal Tailwind CSS class handling

import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Merge class names with Tailwind CSS conflict resolution
 * 
 * @example
 * cn('px-4 py-2', 'px-6') // returns 'py-2 px-6' (px-6 overrides px-4)
 * cn('text-red-500', condition && 'text-blue-500') // conditional classes
 * cn('base-class', { 'active-class': isActive, 'disabled-class': isDisabled })
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Variant helper for creating component variants
 * 
 * @example
 * const buttonVariants = variant({
 *   base: 'px-4 py-2 rounded-lg font-medium',
 *   variants: {
 *     variant: {
 *       primary: 'bg-blue-500 text-white hover:bg-blue-600',
 *       secondary: 'bg-gray-200 text-gray-900 hover:bg-gray-300',
 *     },
 *     size: {
 *       sm: 'px-3 py-1.5 text-sm',
 *       md: 'px-4 py-2 text-base',
 *       lg: 'px-6 py-3 text-lg',
 *     },
 *   },
 *   defaultVariants: { variant: 'primary', size: 'md' },
 * });
 * 
 * buttonVariants({ variant: 'secondary', size: 'lg' })
 */
export function variant<T extends Record<string, Record<string, string>>>(
  config: {
    base: string;
    variants: T;
    defaultVariants?: Partial<{ [K in keyof T]: keyof T[K] }>;
  }
) {
  type VariantProps = {
    [K in keyof T]?: keyof T[K];
  } & { className?: string };

  return (props: VariantProps = {}) => {
    const { className, ...variantProps } = props;
    const { base, variants, defaultVariants = {} } = config;

    let classNames = base;

    for (const [key, value] of Object.entries(variantProps)) {
      if (value && variants[key as keyof T]) {
        classNames += ` ${variants[key as keyof T][value as keyof T[keyof T]]}`;
      }
    }

    // Apply default variants for unspecified props
    for (const [key, defaultValue] of Object.entries(defaultVariants)) {
      if (!(key in variantProps) && variants[key as keyof T]) {
        classNames += ` ${variants[key as keyof T][defaultValue as keyof T[keyof T]]}`;
      }
    }

    return cn(classNames, props.className);
  };
}

/**
 * Create responsive class names
 * 
 * @example
 * responsive({ base: 'text-base', md: 'text-lg', lg: 'text-xl' })
 * // returns 'text-base md:text-lg lg:text-xl'
 */
export function responsive(classes: Record<string, string>): string {
  const breakpoints = ['base', 'sm', 'md', 'lg', 'xl', '2xl'];
  return breakpoints
    .map(bp => {
      if (bp === 'base') return classes.base;
      return classes[bp] ? `${bp}:${classes[bp]}` : '';
    })
    .filter(Boolean)
    .join(' ');
}

/**
 * Create state-based class names
 * 
 * @example
 * states({
 *   base: 'transition-colors',
 *   hover: 'hover:bg-blue-600',
 *   focus: 'focus:ring-2 focus:ring-blue-500',
 *   active: 'active:bg-blue-700',
 *   disabled: 'disabled:opacity-50 disabled:cursor-not-allowed',
 * })
 */
export function states(classes: {
  base?: string;
  hover?: string;
  focus?: string;
  active?: string;
  disabled?: string;
  loading?: string;
}): string {
  return cn(
    classes.base,
    classes.hover,
    classes.focus,
    classes.active,
    classes.disabled,
    classes.loading,
  );
}