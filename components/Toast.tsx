/**
 * Toast Component
 * 
 * Displays temporary notifications with optional undo action
 * Used for check-out confirmations and undo functionality
 */

import React, { useEffect } from 'react';

interface ToastProps {
  message: string;
  onUndo?: () => void;
  onClose: () => void;
  duration?: number; // in milliseconds
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
      className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-50 animate-slide-up"
      role="status"
      aria-live="polite"
      aria-atomic="true"
    >
      <div className="bg-gray-900 text-white px-4 py-3 rounded-lg shadow-2xl flex items-center gap-4 max-w-md">
        {/* Checkmark Icon */}
        <div className="flex-shrink-0" aria-hidden="true">
          <svg className="w-5 h-5 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </div>
        
        {/* Message */}
        <div className="flex-1 text-sm font-medium">
          {message}
        </div>
        
        {/* Undo Button */}
        {onUndo && (
          <button
            onClick={() => {
              onUndo();
              onClose();
            }}
            className="flex-shrink-0 px-3 py-1 bg-white/20 hover:bg-white/30 rounded-md text-sm font-semibold transition-colors"
          >
            Undo
          </button>
        )}
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="flex-shrink-0 text-gray-400 hover:text-white transition-colors"
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

