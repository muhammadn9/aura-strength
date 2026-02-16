'use client';

/**
 * Toast Notification System
 *
 * Displays temporary notifications for errors, warnings, and success messages.
 */

import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { X, AlertCircle, CheckCircle, AlertTriangle, Info } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// ============================================================================
// Types
// ============================================================================

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface Toast {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
  duration?: number;
}

interface ToastContextValue {
  showToast: (toast: Omit<Toast, 'id'>) => void;
  showSuccess: (title: string, message?: string) => void;
  showError: (title: string, message?: string) => void;
  showWarning: (title: string, message?: string) => void;
  showInfo: (title: string, message?: string) => void;
  dismissToast: (id: string) => void;
}

// ============================================================================
// Context
// ============================================================================

const ToastContext = createContext<ToastContextValue | undefined>(undefined);

export function useToast(): ToastContextValue {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within ToastProvider');
  }
  return context;
}

// ============================================================================
// Provider
// ============================================================================

interface ToastProviderProps {
  children: ReactNode;
  maxToasts?: number;
}

export function ToastProvider({ children, maxToasts = 3 }: ToastProviderProps): React.ReactElement {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  const showToast = useCallback(
    (toast: Omit<Toast, 'id'>) => {
      const id = Math.random().toString(36).substring(7);
      const newToast: Toast = {
        ...toast,
        id,
        duration: toast.duration ?? 5000,
      };

      setToasts((prev) => {
        const updated = [...prev, newToast];
        // Keep only the latest maxToasts
        return updated.slice(-maxToasts);
      });

      // Auto dismiss
      if (newToast.duration) {
        setTimeout(() => {
          dismissToast(id);
        }, newToast.duration);
      }
    },
    [maxToasts, dismissToast]
  );

  const showSuccess = useCallback(
    (title: string, message?: string) => {
      showToast({ type: 'success', title, message });
    },
    [showToast]
  );

  const showError = useCallback(
    (title: string, message?: string) => {
      showToast({ type: 'error', title, message, duration: 7000 });
    },
    [showToast]
  );

  const showWarning = useCallback(
    (title: string, message?: string) => {
      showToast({ type: 'warning', title, message });
    },
    [showToast]
  );

  const showInfo = useCallback(
    (title: string, message?: string) => {
      showToast({ type: 'info', title, message });
    },
    [showToast]
  );

  return (
    <ToastContext.Provider
      value={{ showToast, showSuccess, showError, showWarning, showInfo, dismissToast }}
    >
      {children}
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />
    </ToastContext.Provider>
  );
}

// ============================================================================
// Toast Container
// ============================================================================

interface ToastContainerProps {
  toasts: Toast[];
  onDismiss: (id: string) => void;
}

function ToastContainer({ toasts, onDismiss }: ToastContainerProps): React.ReactElement {
  return (
    <div className="fixed bottom-4 right-4 z-50 space-y-2 max-w-sm w-full pointer-events-none">
      <AnimatePresence>
        {toasts.map((toast) => (
          <ToastItem key={toast.id} toast={toast} onDismiss={onDismiss} />
        ))}
      </AnimatePresence>
    </div>
  );
}

// ============================================================================
// Toast Item
// ============================================================================

interface ToastItemProps {
  toast: Toast;
  onDismiss: (id: string) => void;
}

function ToastItem({ toast, onDismiss }: ToastItemProps): React.ReactElement {
  const config = getToastConfig(toast.type);

  return (
    <motion.div
      initial={{ opacity: 0, x: 100, scale: 0.95 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: 100, scale: 0.95 }}
      transition={{ duration: 0.2 }}
      className="pointer-events-auto"
    >
      <div
        className={`
          rounded-lg p-4 backdrop-blur-md shadow-lg border
          ${config.bgClass} ${config.borderClass}
        `}
      >
        <div className="flex items-start gap-3">
          {/* Icon */}
          <div className={`flex-shrink-0 ${config.iconClass}`}>
            <config.Icon className="w-5 h-5" />
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <h4 className={`text-sm font-semibold ${config.titleClass}`}>{toast.title}</h4>
            {toast.message && (
              <p className="text-sm text-slate-400 mt-1">{toast.message}</p>
            )}
          </div>

          {/* Dismiss Button */}
          <button
            onClick={() => onDismiss(toast.id)}
            className="flex-shrink-0 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </motion.div>
  );
}

// ============================================================================
// Config
// ============================================================================

interface ToastConfig {
  Icon: React.FC<{ className?: string }>;
  bgClass: string;
  borderClass: string;
  iconClass: string;
  titleClass: string;
}

function getToastConfig(type: ToastType): ToastConfig {
  switch (type) {
    case 'success':
      return {
        Icon: CheckCircle,
        bgClass: 'bg-green-500/10',
        borderClass: 'border-green-500/20',
        iconClass: 'text-green-400',
        titleClass: 'text-green-400',
      };
    case 'error':
      return {
        Icon: AlertCircle,
        bgClass: 'bg-red-500/10',
        borderClass: 'border-red-500/20',
        iconClass: 'text-red-400',
        titleClass: 'text-red-400',
      };
    case 'warning':
      return {
        Icon: AlertTriangle,
        bgClass: 'bg-yellow-500/10',
        borderClass: 'border-yellow-500/20',
        iconClass: 'text-yellow-400',
        titleClass: 'text-yellow-400',
      };
    case 'info':
    default:
      return {
        Icon: Info,
        bgClass: 'bg-blue-500/10',
        borderClass: 'border-blue-500/20',
        iconClass: 'text-blue-400',
        titleClass: 'text-blue-400',
      };
  }
}

