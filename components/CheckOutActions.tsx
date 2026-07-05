// components/CheckOutActions.tsx
import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import Button from '@/components/ui/Button';

interface CheckOutActionsProps {
  familyName: string;
  securityCode: string;
  onCheckOut: () => void;
  onDismiss: () => void;
  onRollOver: () => void;
}

export default function CheckOutActions({
  familyName,
  securityCode,
  onCheckOut,
  onDismiss,
  onRollOver,
}: CheckOutActionsProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [menuPosition, setMenuPosition] = useState({ top: 0, right: 0 });
  const buttonRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (menuOpen && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      setMenuPosition({
        top: rect.bottom + 4,
        right: window.innerWidth - rect.right,
      });
    }
  }, [menuOpen]);

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

  const menuItemClass =
    'w-full px-lg py-sm text-left font-text text-body text-ink hover:bg-canvas-parchment flex items-center gap-xs transition-colors';

  const dropdownMenu = menuOpen && (
    <div
      ref={menuRef}
      className="fixed w-48 bg-canvas rounded-lg border border-hairline py-xs z-50 hidden md:block animate-scale-in"
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
        className={menuItemClass}
        role="menuitem"
      >
        <svg className="w-4 h-4 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5} aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
        </svg>
        <span>Check Out</span>
      </button>
      <button
        onClick={() => {
          onDismiss();
          setMenuOpen(false);
        }}
        className={menuItemClass}
        role="menuitem"
      >
        <svg className="w-4 h-4 text-ink-muted-48" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
        <span>Mark as No-Show</span>
      </button>
      <button
        onClick={() => {
          onRollOver();
          setMenuOpen(false);
        }}
        className={`${menuItemClass} border-t border-hairline`}
        role="menuitem"
      >
        <svg className="w-4 h-4 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
        </svg>
        <span>Roll Over to Next Service</span>
      </button>
    </div>
  );

  const mobileBottomSheet = menuOpen && (
    <div
      className="fixed inset-0 bg-black/50 z-50 md:hidden flex items-end"
      onClick={() => setMenuOpen(false)}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="w-full bg-canvas rounded-t-lg animate-slide-up-mobile"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-lg border-b border-hairline">
          <h3 className="font-text text-body-strong text-ink">{familyName} Family</h3>
          <p className="font-text text-caption text-ink-muted-48 mt-xxs">Security Code: {securityCode}</p>
        </div>

        <div className="p-sm">
          <button
            onClick={() => {
              onCheckOut();
              setMenuOpen(false);
            }}
            className="w-full px-lg py-md text-left font-text text-body text-ink hover:bg-canvas-parchment rounded-md flex items-center gap-sm transition-colors"
          >
            <svg className="w-5 h-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5} aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
            <span className="font-text text-body-strong">Check Out</span>
          </button>
          <button
            onClick={() => {
              onDismiss();
              setMenuOpen(false);
            }}
            className="w-full px-lg py-md text-left font-text text-body text-ink hover:bg-canvas-parchment rounded-md flex items-center gap-sm transition-colors"
          >
            <svg className="w-5 h-5 text-ink-muted-48" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
            <span className="font-text text-body-strong">Mark as No-Show</span>
          </button>
          <button
            onClick={() => {
              onRollOver();
              setMenuOpen(false);
            }}
            className="w-full px-lg py-md text-left font-text text-body text-ink hover:bg-canvas-parchment rounded-md flex items-center gap-sm transition-colors border-t border-hairline mt-xs pt-md"
          >
            <svg className="w-5 h-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            <span className="font-text text-body-strong">Roll Over to Next Service</span>
          </button>
        </div>

        <div className="p-lg border-t border-hairline">
          <button
            onClick={() => setMenuOpen(false)}
            className="w-full py-md text-center font-text text-body text-ink-muted-80 hover:bg-canvas-parchment rounded-md transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <>
      <div className="flex items-center gap-xs">
        <Button variant="primary" onClick={onCheckOut} aria-label={`Check out ${familyName} family`}>
          Check Out
        </Button>

        <button
          ref={buttonRef}
          onClick={() => setMenuOpen(!menuOpen)}
          className="btn-pearl-capsule !px-xs !py-xs min-w-[36px] min-h-[36px] justify-center"
          aria-label="More actions"
          aria-expanded={menuOpen}
          aria-haspopup="true"
        >
          <svg className="w-5 h-5 text-ink-muted-80" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
            <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
          </svg>
        </button>
      </div>

      {typeof document !== 'undefined' &&
        createPortal(
          <>
            {dropdownMenu}
            {mobileBottomSheet}
          </>,
          document.body
        )}
    </>
  );
}
