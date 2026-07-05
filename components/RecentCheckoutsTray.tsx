import React, { useState } from 'react';
import { CheckInData } from '@/lib/mockData';
import Button from '@/components/ui/Button';

export interface RecentCheckoutItem {
  securityCode: string;
  kids: CheckInData[];
  timestamp: string;
}

interface RecentCheckoutsTrayProps {
  items: RecentCheckoutItem[];
  onUndo: (securityCode: string) => void;
}

export default function RecentCheckoutsTray({ items, onUndo }: RecentCheckoutsTrayProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);

  if (!items.length) return null;

  const truncateName = (full?: string, max = 26) => {
    if (!full) return '';
    if (full.length <= max) return full;
    return `${full.slice(0, max - 1)}…`;
  };

  return (
    <aside
      className="fixed bottom-lg right-lg z-40 w-[320px] max-w-[90vw] bg-canvas border border-hairline rounded-lg overflow-hidden"
      role="region"
      aria-label="Recent check-outs"
    >
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="w-full px-lg py-md bg-ink text-on-dark flex items-center justify-between focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary-focus min-h-[44px]"
        aria-expanded={!isCollapsed}
        aria-controls="recent-checkouts-panel"
      >
        <div className="font-text text-caption-strong flex items-center gap-xs">
          Recent check-outs
          <span className="font-text text-fine-print bg-white/15 px-sm py-xxs rounded-pill">
            {items.length}
          </span>
        </div>
        <svg
          className={`w-4 h-4 transition-transform ${isCollapsed ? 'rotate-180' : ''}`}
          viewBox="0 0 20 20"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          aria-hidden="true"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 8l4 4 4-4" />
        </svg>
      </button>

      {!isCollapsed && (
        <div id="recent-checkouts-panel" className="divide-y divide-hairline max-h-[320px] overflow-y-auto">
          {items.map((item) => {
            const first = item.kids[0];
            const isSingle = item.kids.length === 1;
            return (
              <div key={`${item.securityCode}-${item.timestamp}`} className="p-md">
                <div className="flex items-start justify-between gap-sm">
                  <div className="flex-1 min-w-0">
                    <div
                      className="font-text text-caption-strong text-ink truncate"
                      title={isSingle ? first.childName : `${first.familyName} Family (${item.kids.length} kids)`}
                    >
                      {isSingle
                        ? truncateName(first.childName)
                        : truncateName(`${first.familyName} Family (${item.kids.length} kids)`, 32)}
                    </div>
                    {!isSingle && (
                      <div className="mt-xxs font-text text-fine-print text-ink-muted-48 space-y-xxs">
                        {item.kids.map((kid) => (
                          <div key={kid.id} className="truncate">
                            • {kid.childName}
                          </div>
                        ))}
                      </div>
                    )}
                    <div className="mt-sm flex items-center gap-xs flex-wrap">
                      <span className="badge-security font-mono text-caption">{item.securityCode}</span>
                      {first.className && (
                        <span className="inline-flex items-center px-sm py-xxs rounded-md font-text text-fine-print text-ink-muted-80 bg-surface-pearl border-[3px] border-divider-soft">
                          {first.className}
                        </span>
                      )}
                    </div>
                  </div>
                  <Button
                    variant="secondary-pill"
                    className="!py-xs !px-md text-fine-print shrink-0"
                    onClick={() => onUndo(item.securityCode)}
                    aria-label={`Undo checkout for ${isSingle ? first.childName : `${first.familyName} family`} (${item.securityCode})`}
                  >
                    Undo
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </aside>
  );
}
