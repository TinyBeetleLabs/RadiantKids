// components/CheckOutActions.tsx
import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';

interface CheckOutActionsProps {
  familyName: string;
  securityCode: string;
  onCheckOut: () => void;
  onDismiss: () => void;
  onRollOver: () => void; // NEW: Roll over to next service
}

export default function CheckOutActions({ 
  familyName, 
  securityCode, 
  onCheckOut, 
  onDismiss,
  onRollOver 
}: CheckOutActionsProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [menuPosition, setMenuPosition] = useState({ top: 0, right: 0 });
  const buttonRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  // Calculate menu position when opening
  useEffect(() => {
    if (menuOpen && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      setMenuPosition({
        top: rect.bottom + 4, // 4px gap below button
        right: window.innerWidth - rect.right, // Align right edge with button
      });
    }
  }, [menuOpen]);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        menuRef.current && 
        !menuRef.current.contains(event.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target as Node)
      ) {
        setMenuOpen(false);
      }
    };
    if (menuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [menuOpen]);

  // Close menu on escape key
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setMenuOpen(false);
      }
    };
    if (menuOpen) {
      document.addEventListener('keydown', handleEscape);
    }
    return () => document.removeEventListener('keydown', handleEscape);
  }, [menuOpen]);

  // Render dropdown menu
  const dropdownMenu = menuOpen && (
    <div 
      ref={menuRef}
      className="fixed w-48 bg-white rounded-lg shadow-lg 
                border border-gray-200 py-1 z-50 hidden md:block animate-scale-in"
      style={{
        top: `${menuPosition.top}px`,
        right: `${menuPosition.right}px`,
      }}
      role="menu"
      aria-orientation="vertical"
    >
      <button
        onClick={() => {
          onCheckOut();
          setMenuOpen(false);
        }}
        className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 
                 flex items-center gap-2 transition-colors"
        role="menuitem"
      >
        <svg className="w-4 h-4 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5} aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
        </svg>
        <span>Check Out</span>
      </button>
      <button
        onClick={() => {
          onDismiss();
          setMenuOpen(false);
        }}
        className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 
                 flex items-center gap-2 transition-colors"
        role="menuitem"
      >
        <svg className="w-4 h-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
        <span>Mark as No-Show</span>
      </button>
      <button
        onClick={() => {
          onRollOver();
          setMenuOpen(false);
        }}
        className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 
                 flex items-center gap-2 transition-colors border-t border-gray-200"
        role="menuitem"
      >
        <svg className="w-4 h-4 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
        </svg>
        <span>Roll Over to Next Service</span>
      </button>
    </div>
  );

  // Render mobile bottom sheet
  const mobileBottomSheet = menuOpen && (
    <div 
      className="fixed inset-0 bg-black/50 z-50 md:hidden flex items-end" 
      onClick={() => setMenuOpen(false)}
      role="dialog"
      aria-modal="true"
    >
      <div 
        className="w-full bg-white rounded-t-2xl shadow-2xl animate-slide-up-mobile"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 border-b border-gray-200">
          <h3 className="font-semibold text-gray-900">{familyName} Family</h3>
          <p className="text-sm text-gray-500">Security Code: {securityCode}</p>
        </div>
        
        {/* Actions */}
        <div className="p-2">
          <button
            onClick={() => {
              onCheckOut();
              setMenuOpen(false);
            }}
            className="w-full px-4 py-3 text-left text-base text-gray-900 hover:bg-gray-100 
                     rounded-lg flex items-center gap-3 transition-colors"
          >
            <svg className="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5} aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
            <span className="font-medium">Check Out</span>
          </button>
          <button
            onClick={() => {
              onDismiss();
              setMenuOpen(false);
            }}
            className="w-full px-4 py-3 text-left text-base text-gray-700 hover:bg-gray-100 
                     rounded-lg flex items-center gap-3 transition-colors"
          >
            <svg className="w-5 h-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
            <span className="font-medium">Mark as No-Show</span>
          </button>
          <button
            onClick={() => {
              onRollOver();
              setMenuOpen(false);
            }}
            className="w-full px-4 py-3 text-left text-base text-gray-700 hover:bg-gray-100 
                     rounded-lg flex items-center gap-3 transition-colors border-t border-gray-200"
          >
            <svg className="w-5 h-5 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            <span className="font-medium">Roll Over to Next Service</span>
          </button>
        </div>
        
        {/* Cancel */}
        <div className="p-4 border-t border-gray-200">
          <button
            onClick={() => setMenuOpen(false)}
            className="w-full py-3 text-center text-gray-700 font-medium hover:bg-gray-50 
                     rounded-lg transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <>
      <div className="flex items-center gap-2">
        {/* Primary: Check Out Button */}
        <button
          onClick={onCheckOut}
          className="px-4 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 
                   text-sm font-medium transition-colors focus:outline-none focus:ring-2 
                   focus:ring-blue-500 focus:ring-offset-2"
          aria-label={`Check out ${familyName} family`}
        >
          Check Out
        </button>

        {/* Secondary: More Actions Menu */}
        <button
          ref={buttonRef}
          onClick={() => setMenuOpen(!menuOpen)}
          className="px-2 py-1.5 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 
                   transition-colors focus:outline-none focus:ring-2 focus:ring-gray-500 
                   focus:ring-offset-2"
          aria-label="More actions"
          aria-expanded={menuOpen}
          aria-haspopup="true"
        >
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
            <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
          </svg>
        </button>
      </div>

      {/* Render menus via portal to document.body */}
      {typeof document !== 'undefined' && createPortal(
        <>
          {dropdownMenu}
          {mobileBottomSheet}
        </>,
        document.body
      )}
    </>
  );
}

