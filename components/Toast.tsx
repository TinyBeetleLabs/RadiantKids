/**
 * Toast Component
 */

import React, { useEffect } from 'react';
import Button from '@/components/ui/Button';

interface ToastProps {
  message: string;
  onUndo?: () => void;
  onClose: () => void;
  duration?: number;
}

export default function Toast({ message, onUndo, onClose, duration = 5000 }: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  return (
    <div
      className="fixed bottom-lg left-1/2 -translate-x-1/2 z-50 animate-slide-up floating-bar max-w-md w-[calc(100%-32px)]"
      role="status"
      aria-live="polite"
      aria-atomic="true"
    >
      <div className="flex items-center gap-md w-full">
        <div className="flex-shrink-0 text-primary" aria-hidden="true">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </div>

        <div className="flex-1 font-text text-body text-ink">{message}</div>

        {onUndo && (
          <Button
            variant="secondary-pill"
            className="!py-xs !px-md text-caption-strong shrink-0"
            onClick={() => {
              onUndo();
              onClose();
            }}
          >
            Undo
          </Button>
        )}

        <button
          onClick={onClose}
          className="flex-shrink-0 text-ink-muted-48 hover:text-ink transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center"
          aria-label="Close"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  );
}
