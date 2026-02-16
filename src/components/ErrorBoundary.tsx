'use client';

/**
 * Error Boundary Component
 *
 * Catches React errors and displays user-friendly fallback UI.
 */

import React, { Component, ReactNode } from 'react';
import { logError, getFallbackProps, parseError } from '@/lib/ai/error-handling';
import { AlertCircle, RefreshCw, Home } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallback?: (error: Error, reset: () => void) => ReactNode;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

/**
 * Error Boundary Component
 *
 * Usage:
 * ```tsx
 * <ErrorBoundary>
 *   <YourComponent />
 * </ErrorBoundary>
 * ```
 */
export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
    // Log error
    logError(error, {
      componentStack: errorInfo.componentStack,
      errorBoundary: true,
    });

    // Call custom error handler if provided
    this.props.onError?.(error, errorInfo);
  }

  reset = (): void => {
    this.setState({ hasError: false, error: null });
  };

  render(): ReactNode {
    if (this.state.hasError && this.state.error) {
      // Use custom fallback if provided
      if (this.props.fallback) {
        return this.props.fallback(this.state.error, this.reset);
      }

      // Default fallback UI
      return <ErrorFallback error={this.state.error} reset={this.reset} />;
    }

    return this.props.children;
  }
}

/**
 * Default Error Fallback UI
 */
interface ErrorFallbackProps {
  error: Error;
  reset: () => void;
}

function ErrorFallback({ error, reset }: ErrorFallbackProps): React.ReactElement {
  const fallbackProps = getFallbackProps(error, reset, reset);
  const appError = parseError(error);

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 p-4">
      <div className="max-w-md w-full space-y-6">
        {/* Error Icon */}
        <div className="flex justify-center">
          <div className="w-16 h-16 rounded-full bg-red-500/20 flex items-center justify-center">
            <AlertCircle className="w-8 h-8 text-red-400" />
          </div>
        </div>

        {/* Error Content */}
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-bold text-white">{fallbackProps.title}</h1>
          <p className="text-slate-400">{fallbackProps.message}</p>
        </div>

        {/* Error Details (Development Only) */}
        {process.env.NODE_ENV === 'development' && (
          <div className="bg-slate-900/50 border border-slate-800 rounded-lg p-4 space-y-2">
            <div className="text-xs text-slate-500 font-mono">
              <div className="text-red-400 font-semibold mb-1">{appError.name}</div>
              <div className="text-slate-400">{appError.message}</div>
              {appError.statusCode && (
                <div className="mt-2">Status: {appError.statusCode}</div>
              )}
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3">
          {fallbackProps.action && (
            <button
              onClick={fallbackProps.action.onClick}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-purple-500 hover:bg-purple-600 text-white font-semibold rounded-lg transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              {fallbackProps.action.label}
            </button>
          )}
          <button
            onClick={() => (window.location.href = '/dashboard')}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-white/5 border border-white/10 hover:bg-white/10 text-slate-300 font-semibold rounded-lg transition-colors"
          >
            <Home className="w-4 h-4" />
            Go Home
          </button>
        </div>
      </div>
    </div>
  );
}

/**
 * Async Error Boundary for async operations
 *
 * Usage:
 * ```tsx
 * <AsyncErrorBoundary>
 *   <Suspense fallback={<Loading />}>
 *     <AsyncComponent />
 *   </Suspense>
 * </AsyncErrorBoundary>
 * ```
 */
export function AsyncErrorBoundary({ children }: { children: ReactNode }): React.ReactElement {
  return (
    <ErrorBoundary
      fallback={(error, reset) => (
        <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/20">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <h3 className="text-sm font-semibold text-red-400 mb-1">
                Failed to load content
              </h3>
              <p className="text-sm text-slate-400 mb-3">
                {parseError(error).message || 'Please try again'}
              </p>
              <button
                onClick={reset}
                className="text-sm text-purple-400 hover:text-purple-300 font-medium"
              >
                Try again
              </button>
            </div>
          </div>
        </div>
      )}
    >
      {children}
    </ErrorBoundary>
  );
}

