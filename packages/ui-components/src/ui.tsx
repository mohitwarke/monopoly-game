// General UI Components

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronDown, ChevronUp, Check, AlertCircle, Info, Loader2, Copy, ExternalLink, Settings, User, Trophy, History, Palette, Puzzle, Bot, Shield, Bell, Mail, Lock, Unlock, Eye, EyeOff } from 'lucide-react';
import './ui.css';

// ============================================
// Types
// ============================================

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'success';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  loading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  fullWidth?: boolean;
}

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  fullWidth?: boolean;
}

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  helperText?: string;
  options: Array<{ value: string; label: string; disabled?: boolean }>;
  placeholder?: string;
  fullWidth?: boolean;
}

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  closeOnOverlayClick?: boolean;
  showCloseButton?: boolean;
}

interface ToastProps {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message?: string;
  duration?: number;
  onClose: (id: string) => void;
  action?: { label: string; onClick: () => void };
}

interface ToasterProps {
  toasts: ToastProps[];
  onClose: (id: string) => void;
}

interface DropdownProps {
  trigger: React.ReactNode;
  items: Array<{
    label: string;
    onClick: () => void;
    icon?: React.ReactNode;
    disabled?: boolean;
    danger?: boolean;
    divider?: boolean;
  }>;
  align?: 'left' | 'right';
}

interface TabsProps {
  tabs: Array<{ id: string; label: string; icon?: React.ReactNode; disabled?: boolean }>;
  activeTab: string;
  onChange: (tabId: string) => void;
  variant?: 'line' | 'pills' | 'card';
  fullWidth?: boolean;
}

interface AccordionProps {
  items: Array<{
    id: string;
    title: string;
    content: React.ReactNode;
    icon?: React.ReactNode;
    disabled?: boolean;
  }>;
  allowMultiple?: boolean;
  defaultOpen?: string[];
}

interface TooltipProps {
  content: React.ReactNode;
  children: React.ReactElement;
  position?: 'top' | 'bottom' | 'left' | 'right';
  delay?: number;
}

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info';
  size?: 'sm' | 'md' | 'lg';
  dot?: boolean;
  removable?: boolean;
  onRemove?: () => void;
}

interface AvatarProps {
  src?: string;
  alt?: string;
  name?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  status?: 'online' | 'offline' | 'busy' | 'away';
  shape?: 'circle' | 'square';
}

interface ProgressProps {
  value: number;
  max?: number;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info';
  showLabel?: boolean;
  label?: string;
  animated?: boolean;
  striped?: boolean;
}

interface CardProps {
  children: React.ReactNode;
  variant?: 'default' | 'outlined' | 'elevated' | 'filled';
  padding?: 'none' | 'sm' | 'md' | 'lg';
  hoverable?: boolean;
  onClick?: () => void;
  className?: string;
}

interface DividerProps {
  orientation?: 'horizontal' | 'vertical';
  label?: string;
  variant?: 'solid' | 'dashed' | 'dotted';
  className?: string;
}

interface SkeletonProps {
  variant?: 'text' | 'circular' | 'rectangular';
  width?: string | number;
  height?: string | number;
  animation?: 'pulse' | 'wave' | 'none';
}

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: { label: string; onClick: () => void };
  className?: string;
}

interface LoadingOverlayProps {
  isLoading: boolean;
  children: React.ReactNode;
  message?: string;
  size?: 'sm' | 'md' | 'lg';
}

// ============================================
// Button Component
// ============================================

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({
    variant = 'primary',
    size = 'md',
    loading = false,
    leftIcon,
    rightIcon,
    fullWidth = false,
    disabled,
    className = '',
    children,
    ...props
  }, ref) => {
    const baseStyles = 'btn';
    const variantStyles = `btn-${variant}`;
    const sizeStyles = `btn-${size}`;
    const widthStyles = fullWidth ? 'btn-full' : '';

    return (
      <motion.button
        ref={ref}
        className={`${baseStyles} ${variantStyles} ${sizeStyles} ${widthStyles} ${className}`}
        disabled={disabled || loading}
        whileHover={!disabled && !loading ? { scale: 1.02 } : undefined}
        whileTap={!disabled && !loading ? { scale: 0.98 } : undefined}
        {...props}
      >
        {loading && (
          <motion.span className="btn-loader">
            <Loader2 size={16} className="spinning" />
          </motion.span>
        )}
        {!loading && leftIcon && <span className="btn-icon-left">{leftIcon}</span>}
        <span className="btn-text">{children}</span>
        {!loading && rightIcon && <span className="btn-icon-right">{rightIcon}</span>}
      </motion.button>
    );
  }
);

Button.displayName = 'Button';

// ============================================
// Input Component
// ============================================

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({
    label,
    error,
    helperText,
    leftIcon,
    rightIcon,
    fullWidth = false,
    className = '',
    id,
    ...props
  }, ref) => {
    const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`;
    const errorId = error ? `${inputId}-error` : undefined;
    const helperId = helperText ? `${inputId}-helper` : undefined;

    return (
      <div className={`input-wrapper ${fullWidth ? 'full-width' : ''} ${className}`}>
        {label && (
          <label htmlFor={inputId} className="input-label">
            {label}
            {props.required && <span className="required">*</span>}
          </label>
        )}
        <div className="input-container">
          {leftIcon && <span className="input-icon left">{leftIcon}</span>}
          <input
            ref={ref}
            id={inputId}
            className={`input ${error ? 'has-error' : ''}`}
            aria-invalid={error ? 'true' : 'false'}
            aria-describedby={`${errorId || ''} ${helperId || ''}`.trim() || undefined}
            {...props}
          />
          {rightIcon && <span className="input-icon right">{rightIcon}</span>}
        </div>
        {error && (
          <motion.p id={errorId} className="input-error" initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }}>
            <AlertCircle size={14} />
            {error}
          </motion.p>
        )}
        {helperText && !error && (
          <p id={helperId} className="input-helper">{helperText}</p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

// ============================================
// Select Component
// ============================================

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({
    label,
    error,
    helperText,
    options,
    placeholder,
    fullWidth = false,
    className = '',
    id,
    ...props
  }, ref) => {
    const selectId = id || `select-${Math.random().toString(36).substr(2, 9)}`;
    const errorId = error ? `${selectId}-error` : undefined;
    const helperId = helperText ? `${selectId}-helper` : undefined;

    return (
      <div className={`select-wrapper ${fullWidth ? 'full-width' : ''} ${className}`}>
        {label && (
          <label htmlFor={selectId} className="select-label">
            {label}
            {props.required && <span className="required">*</span>}
          </label>
        )}
        <div className="select-container">
          <select
            ref={ref}
            id={selectId}
            className={`select ${error ? 'has-error' : ''}`}
            aria-invalid={error ? 'true' : 'false'}
            aria-describedby={`${errorId || ''} ${helperId || ''}`.trim() || undefined}
            {...props}
          >
            {placeholder && (
              <option value="" disabled>
                {placeholder}
              </option>
            )}
            {options.map(option => (
              <option key={option.value} value={option.value} disabled={option.disabled}>
                {option.label}
              </option>
            ))}
          </select>
          <ChevronDown className="select-arrow" size={20} />
        </div>
        {error && (
          <motion.p id={errorId} className="select-error" initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }}>
            <AlertCircle size={14} />
            {error}
          </motion.p>
        )}
        {helperText && !error && (
          <p id={helperId} className="select-helper">{helperText}</p>
        )}
      </div>
    );
  }
);

Select.displayName = 'Select';

// ============================================
// Modal Component
// ============================================

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  size = 'md',
  closeOnOverlayClick = true,
  showCloseButton = true,
}) => {
  if (!isOpen) return null;

  const sizeStyles = {
    sm: 'modal-sm',
    md: 'modal-md',
    lg: 'modal-lg',
    xl: 'modal-xl',
    full: 'modal-full',
  };

  return (
    <AnimatePresence>
      <motion.div
        className="modal-overlay"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={closeOnOverlayClick ? onClose : undefined}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? 'modal-title' : undefined}
      >
        <motion.div
          className={`modal ${sizeStyles[size]}`}
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          onClick={e => e.stopPropagation()}
        >
          {(title || showCloseButton) && (
            <div className="modal-header">
              {title && <h2 id="modal-title" className="modal-title">{title}</h2>}
              {showCloseButton && (
                <motion.button
                  className="modal-close"
                  onClick={onClose}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  aria-label="Close modal"
                >
                  <X size={20} />
                </motion.button>
              )}
            </div>
          )}
          <div className="modal-content">
            {children}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

// ============================================
// Toast/Notification Components
// ============================================

export const Toast: React.FC<ToastProps> = ({
  id,
  type,
  title,
  message,
  duration = 5000,
  onClose,
  action,
}) => {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false);
      setTimeout(() => onClose(id), 300);
    }, duration);
    return () => clearTimeout(timer);
  }, [id, duration, onClose]);

  if (!visible) return null;

  const icons = {
    success: <Check className="toast-icon success" size={20} />,
    error: <AlertCircle className="toast-icon error" size={20} />,
    warning: <AlertCircle className="toast-icon warning" size={20} />,
    info: <Info className="toast-icon info" size={20} />,
  };

  return (
    <motion.div
      className={`toast toast-${type}`}
      initial={{ opacity: 0, x: 300 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 300 }}
      transition={{ duration: 0.3 }}
    >
      <div className="toast-icon-wrapper">
        {icons[type]}
      </div>
      <div className="toast-content">
        <h4 className="toast-title">{title}</h4>
        {message && <p className="toast-message">{message}</p>}
      </div>
      {action && (
        <motion.button
          className="toast-action"
          onClick={() => { action.onClick(); onClose(id); }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          {action.label}
        </motion.button>
      )}
      <motion.button
        className="toast-close"
        onClick={() => { setVisible(false); setTimeout(() => onClose(id), 300); }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        aria-label="Dismiss"
      >
        <X size={16} />
      </motion.button>
    </motion.div>
  );
};

export const Toaster: React.FC<ToasterProps> = ({ toasts, onClose }) => {
  return (
    <AnimatePresence>
      <div className="toaster">
        {toasts.map(toast => (
          <Toast key={toast.id} {...toast} onClose={onClose} />
        ))}
      </div>
    </AnimatePresence>
  );
};

// ============================================
// Dropdown Component
// ============================================

export const Dropdown: React.FC<DropdownProps> = ({ trigger, items, align = 'right' }) => {
  const [open, setOpen] = useState(false);
  const dropdownRef = React.useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="dropdown" ref={dropdownRef}>
      <div className="dropdown-trigger" onClick={() => setOpen(!open)}>
        {trigger}
      </div>
      <AnimatePresence>
        {open && (
          <motion.div
            className={`dropdown-menu ${align === 'right' ? 'align-right' : ''}`}
            initial={{ opacity: 0, y: -8, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            role="menu"
          >
            {items.map((item, index) => (
              item.divider ? (
                <div key={`divider-${index}`} className="dropdown-divider" />
              ) : (
                <motion.button
                  key={index}
                  className={`dropdown-item ${item.disabled ? 'disabled' : ''} ${item.danger ? 'danger' : ''}`}
                  onClick={() => { item.onClick(); setOpen(false); }}
                  disabled={item.disabled}
                  role="menuitem"
                  whileHover={!item.disabled ? { x: 4 } : undefined}
                  whileTap={!item.disabled ? { scale: 0.98 } : undefined}
                >
                  {item.icon && <span className="dropdown-item-icon">{item.icon}</span>}
                  <span className="dropdown-item-label">{item.label}</span>
                </motion.button>
              )
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// ============================================
// Tabs Component
// ============================================

export const Tabs: React.FC<TabsProps> = ({
  tabs,
  activeTab,
  onChange,
  variant = 'line',
  fullWidth = false,
}) => {
  return (
    <div className={`tabs tabs-${variant} ${fullWidth ? 'full-width' : ''}`} role="tablist">
      {tabs.map((tab, index) => (
        <motion.button
          key={tab.id}
          className={`tab ${activeTab === tab.id ? 'active' : ''} ${tab.disabled ? 'disabled' : ''}`}
          onClick={() => !tab.disabled && onChange(tab.id)}
          disabled={tab.disabled}
          role="tab"
          aria-selected={activeTab === tab.id}
          aria-controls={`panel-${tab.id}`}
          id={`tab-${tab.id}`}
          whileHover={!tab.disabled ? { scale: 1.02 } : undefined}
          whileTap={!tab.disabled ? { scale: 0.98 } : undefined}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.05 }}
        >
          {tab.icon && <span className="tab-icon">{tab.icon}</span>}
          <span className="tab-label">{tab.label}</span>
          {variant === 'line' && (
            <motion.span
              className="tab-indicator"
              initial={{ scaleX: 0 }}
              animate={{ scaleX: activeTab === tab.id ? 1 : 0 }}
            />
          )}
        </motion.button>
      ))}
    </div>
  );
};

// ============================================
// Accordion Component
// ============================================

export const Accordion: React.FC<AccordionProps> = ({ items, allowMultiple = false, defaultOpen = [] }) => {
  const [openItems, setOpenItems] = useState<Set<string>>(new Set(defaultOpen));

  const toggleItem = (id: string) => {
    setOpenItems(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        if (!allowMultiple) next.clear();
        next.add(id);
      }
      return next;
    });
  };

  return (
    <div className="accordion">
      {items.map((item, index) => (
        <motion.div
          key={item.id}
          className={`accordion-item ${openItems.has(item.id) ? 'open' : ''} ${item.disabled ? 'disabled' : ''}`}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.05 }}
        >
          <button
            className="accordion-header"
            onClick={() => !item.disabled && toggleItem(item.id)}
            disabled={item.disabled}
            aria-expanded={openItems.has(item.id)}
            aria-controls={`accordion-content-${item.id}`}
            id={`accordion-header-${item.id}`}
          >
            {item.icon && <span className="accordion-icon">{item.icon}</span>}
            <span className="accordion-title">{item.title}</span>
            <motion.span
              className="accordion-chevron"
              animate={{ rotate: openItems.has(item.id) ? 180 : 0 }}
            >
              <ChevronDown size={20} />
            </motion.span>
          </button>
          <AnimatePresence>
            {openItems.has(item.id) && (
              <motion.div
                id={`accordion-content-${item.id}`}
                className="accordion-content"
                role="region"
                aria-labelledby={`accordion-header-${item.id}`}
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
              >
                <div className="accordion-content-inner">
                  {item.content}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      ))}
    </div>
  );
};

// ============================================
// Tooltip Component
// ============================================

export const Tooltip: React.FC<TooltipProps> = ({ content, children, position = 'top', delay = 200 }) => {
  const [visible, setVisible] = useState(false);
  const [timeoutId, setTimeoutId] = useState<ReturnType<typeof setTimeout>>();

  const show = useCallback(() => {
    const id = setTimeout(() => setVisible(true), delay);
    setTimeoutId(id);
  }, [delay]);

  const hide = useCallback(() => {
    if (timeoutId) clearTimeout(timeoutId);
    setVisible(false);
  }, [timeoutId]);

  const child = React.Children.only(children);

  return (
    <>
      {React.cloneElement(child, {
        onMouseEnter: show,
        onMouseLeave: hide,
        onFocus: show,
        onBlur: hide,
      })}
      <AnimatePresence>
        {visible && (
          <motion.div
            className={`tooltip tooltip-${position}`}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
          >
            <div className="tooltip-content">{content}</div>
            <div className="tooltip-arrow" />
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

// ============================================
// Badge Component
// ============================================

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'default',
  size = 'md',
  dot = false,
  removable = false,
  onRemove,
}) => {
  return (
    <span className={`badge badge-${variant} badge-${size} ${dot ? 'with-dot' : ''}`}>
      {dot && <span className="badge-dot" />}
      <span className="badge-text">{children}</span>
      {removable && (
        <motion.button
          className="badge-remove"
          onClick={onRemove}
          whileHover={{ scale: 1.2 }}
          whileTap={{ scale: 0.8 }}
          aria-label="Remove"
        >
          <X size={12} />
        </motion.button>
      )}
    </span>
  );
};

// ============================================
// Avatar Component
// ============================================

export const Avatar: React.FC<AvatarProps> = ({
  src,
  alt,
  name,
  size = 'md',
  status,
  shape = 'circle',
}) => {
  const sizeStyles = {
    xs: 24,
    sm: 32,
    md: 40,
    lg: 56,
    xl: 80,
  };

  const dimension = sizeStyles[size];

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div
      className={`avatar avatar-${size} ${shape === 'square' ? 'square' : ''} ${status ? `status-${status}` : ''}`}
      style={{ width: dimension, height: dimension }}
    >
      {src ? (
        <img src={src} alt={alt || name || 'Avatar'} className="avatar-image" />
      ) : (
        <span className="avatar-initials">{name ? getInitials(name) : '?'}</span>
      )}
      {status && (
        <span className={`avatar-status status-${status}`} />
      )}
    </div>
  );
};

// ============================================
// Progress Component
// ============================================

export const Progress: React.FC<ProgressProps> = ({
  value,
  max = 100,
  size = 'md',
  variant = 'default',
  showLabel = false,
  label,
  animated = false,
  striped = false,
}) => {
  const percentage = Math.min(100, Math.max(0, (value / max) * 100));

  const sizeStyles = {
    sm: 4,
    md: 8,
    lg: 12,
  };

  return (
    <div className={`progress progress-${size} progress-${variant} ${animated ? 'animated' : ''} ${striped ? 'striped' : ''}`} style={{ height: sizeStyles[size] }}>
      <motion.div
        className="progress-bar"
        initial={{ width: 0 }}
        animate={{ width: `${percentage}%` }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        role="progressbar"
        aria-valuenow={value}
        aria-valuemin={0}
        aria-valuemax={max}
      />
      {(showLabel || label) && (
        <div className="progress-label">
          {label || `${Math.round(percentage)}%`}
        </div>
      )}
    </div>
  );
};

// ============================================
// Card Component
// ============================================

export const Card: React.FC<CardProps> = ({
  children,
  variant = 'default',
  padding = 'md',
  hoverable = false,
  onClick,
  className = '',
}) => {
  const paddingStyles = {
    none: 'p-0',
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8',
  };

  return (
    <motion.div
      className={`card card-${variant} ${paddingStyles[padding]} ${hoverable ? 'hoverable' : ''} ${onClick ? 'clickable' : ''} ${className}`}
      onClick={onClick}
      whileHover={hoverable ? { y: -4, boxShadow: '0 12px 40px rgba(0,0,0,0.15)' } : undefined}
      whileTap={onClick ? { scale: 0.98 } : undefined}
    >
      {children}
    </motion.div>
  );
};

// ============================================
// Divider Component
// ============================================

export const Divider: React.FC<DividerProps> = ({
  orientation = 'horizontal',
  label,
  variant = 'solid',
  className = '',
}) => {
  if (orientation === 'vertical') {
    return (
      <div className={`divider divider-vertical divider-${variant} ${className}`} />
    );
  }

  return (
    <div className={`divider divider-horizontal divider-${variant} ${className}`}>
      {label && (
        <span className="divider-label">{label}</span>
      )}
    </div>
  );
};

// ============================================
// Skeleton Component
// ============================================

export const Skeleton: React.FC<SkeletonProps> = ({
  variant = 'text',
  width = '100%',
  height,
  animation = 'pulse',
}) => {
  const baseHeight = height || (variant === 'text' ? '1rem' : variant === 'circular' ? '40px' : '100px');

  return (
    <motion.div
      className={`skeleton skeleton-${variant} ${animation !== 'none' ? `skeleton-${animation}` : ''}`}
      style={{ width, height: baseHeight }}
      animate={animation === 'pulse' ? { opacity: [1, 0.4, 1] } : animation === 'wave' ? { backgroundPosition: ['-200%', '200%'] } : undefined}
      transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
    />
  );
};

// ============================================
// Empty State Component
// ============================================

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  description,
  action,
  className = '',
}) => {
  return (
    <div className={`empty-state ${className}`}>
      {icon && <div className="empty-icon">{icon}</div>}
      <h3 className="empty-title">{title}</h3>
      {description && <p className="empty-description">{description}</p>}
      {action && (
        <Button variant="primary" onClick={action.onClick}>
          {action.label}
        </Button>
      )}
    </div>
  );
};

// ============================================
// Loading Overlay Component
// ============================================

export const LoadingOverlay: React.FC<LoadingOverlayProps> = ({
  isLoading,
  children,
  message = 'Loading...',
  size = 'md',
}) => {
  const sizeStyles = {
    sm: 24,
    md: 40,
    lg: 56,
  };

  return (
    <div className="loading-overlay-wrapper" style={{ position: 'relative' }}>
      {children}
      <AnimatePresence>
        {isLoading && (
          <motion.div
            className="loading-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="loading-content">
              <motion.div
                className="loading-spinner"
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                style={{ width: sizeStyles[size], height: sizeStyles[size] }}
              >
                <Loader2 size={sizeStyles[size]} />
              </motion.div>
              <p className="loading-message">{message}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// ============================================
// Utility Hook: useToast
// ============================================

export function useToast() {
  const [toasts, setToasts] = useState<ToastProps[]>([]);

  const addToast = useCallback((toast: Omit<ToastProps, 'id' | 'onClose'>) => {
    const id = Math.random().toString(36).substr(2, 9);
    const newToast = { ...toast, id, onClose: removeToast };
    setToasts(prev => [...prev, newToast]);
    return id;
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  const success = useCallback((title: string, message?: string, options?: Partial<ToastProps>) => {
    return addToast({ type: 'success', title, message, ...options });
  }, [addToast]);

  const error = useCallback((title: string, message?: string, options?: Partial<ToastProps>) => {
    return addToast({ type: 'error', title, message, ...options });
  }, [addToast]);

  const warning = useCallback((title: string, message?: string, options?: Partial<ToastProps>) => {
    return addToast({ type: 'warning', title, message, ...options });
  }, [addToast]);

  const info = useCallback((title: string, message?: string, options?: Partial<ToastProps>) => {
    return addToast({ type: 'info', title, message, ...options });
  }, [addToast]);

  return { toasts, addToast, removeToast, success, error, warning, info };
}