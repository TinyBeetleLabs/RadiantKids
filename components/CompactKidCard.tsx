/**
 * CompactKidCard Component
 * 
 * Displays a child's information in a compact card format for the "All" locations view.
 * Shows: Name, Security Code, Classroom, and a menu for actions.
 * Optimized for scanning and density.
 */

import React, { useState, useRef, useEffect } from 'react';
import { CheckInData } from '@/lib/mockData';

interface CompactKidCardProps {
  kid: CheckInData;
  onCheckOut: (securityCode: string) => void;
  onCheckIn: (securityCode: string) => void;
  onDismiss: (securityCode: string) => void;
  onRollOver: (securityCode: string) => void;
}

export default function CompactKidCard({
  kid,
  onCheckOut,
  onCheckIn,
  onDismiss,
  onRollOver,
}: CompactKidCardProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };

    if (isMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isMenuOpen]);

  const handleAction = (action: () => void) => {
    action();
    setIsMenuOpen(false);
  };

  return (
    <div className="compact-kid-card">
      {/* Single Row: Name and Code */}
      <div className="card-content">
        <div className="kid-name">{kid.childName}</div>
        <div className="security-code">{kid.securityCode}</div>
        
        {/* Menu Button */}
        <div className="menu-container" ref={menuRef}>
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="menu-button"
            title="Actions"
          >
            ⋮
          </button>
          
          {/* Dropdown Menu */}
          {isMenuOpen && (
            <div className="menu-dropdown">
              {!kid.checkedOut ? (
                <>
                  <button onClick={() => handleAction(() => onCheckOut(kid.securityCode))}>
                    ✓ Check Out
                  </button>
                  <button onClick={() => handleAction(() => onRollOver(kid.securityCode))}>
                    🔄 Roll Over
                  </button>
                  <button onClick={() => handleAction(() => onDismiss(kid.securityCode))}>
                    ⊗ Mark No-Show
                  </button>
                </>
              ) : (
                <button onClick={() => handleAction(() => onCheckIn(kid.securityCode))}>
                  ↩ Undo Check Out
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      <style jsx>{`
        .compact-kid-card {
          background: white;
          border-bottom: 1px solid #e5e7eb;
          padding: 10px 12px;
          transition: all 0.15s ease;
        }

        .compact-kid-card:hover {
          background: #f9fafb;
        }

        .compact-kid-card:last-child {
          border-bottom: none;
        }

        .card-content {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .kid-name {
          font-size: 15px;
          font-weight: 600;
          color: #1f2937;
          line-height: 1.4;
          flex: 1;
          min-width: 0;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .menu-container {
          position: relative;
          margin-left: 4px;
        }

        .menu-button {
          background: transparent;
          border: none;
          color: #6b7280;
          font-size: 18px;
          line-height: 1;
          padding: 2px 4px;
          cursor: pointer;
          transition: all 0.2s;
          border-radius: 4px;
        }

        .menu-button:hover {
          background: #f3f4f6;
          color: #3b82f6;
        }

        .menu-dropdown {
          position: absolute;
          top: 100%;
          right: 0;
          background: white;
          border: 1px solid #e5e7eb;
          border-radius: 8px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
          z-index: 50;
          min-width: 160px;
          margin-top: 4px;
          overflow: hidden;
        }

        .menu-dropdown button {
          display: block;
          width: 100%;
          padding: 10px 14px;
          text-align: left;
          background: white;
          border: none;
          color: #374151;
          font-size: 14px;
          cursor: pointer;
          transition: background 0.15s;
          border-bottom: 1px solid #f3f4f6;
        }

        .menu-dropdown button:last-child {
          border-bottom: none;
        }

        .menu-dropdown button:hover {
          background: #f9fafb;
          color: #3b82f6;
        }

        .security-code {
          font-size: 16px;
          font-weight: 700;
          color: #3b82f6;
          letter-spacing: 0.5px;
          padding: 4px 12px;
          background: #eff6ff;
          border-radius: 6px;
          white-space: nowrap;
        }
      `}</style>
    </div>
  );
}

