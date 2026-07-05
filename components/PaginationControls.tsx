// components/PaginationControls.tsx
import React from 'react';
import Button from '@/components/ui/Button';

interface PaginationControlsProps {
  showing: number;
  total: number;
  onShowMore: () => void;
  onShowAll: () => void;
  onShowLess?: () => void;
  isShowingAll: boolean;
  pageSize: number;
}

export default function PaginationControls({
  showing,
  total,
  onShowMore,
  onShowAll,
  onShowLess,
  isShowingAll,
  pageSize,
}: PaginationControlsProps) {
  if (total <= pageSize && !isShowingAll) {
    return null;
  }

  const remaining = total - showing;
  const hasMore = showing < total;

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-sm px-lg py-md bg-canvas-parchment border-t border-hairline">
      <div className="font-text text-caption text-ink-muted-80">
        Showing <span className="font-text text-caption-strong text-ink">{showing}</span> of{' '}
        <span className="font-text text-caption-strong text-ink">{total}</span>{' '}
        {total === 1 ? 'kid' : 'kids'}
        {!isShowingAll && remaining > 0 && (
          <span className="ml-xs text-ink-muted-48">({remaining} more)</span>
        )}
      </div>

      <div className="flex items-center gap-xs flex-wrap justify-center">
        {!isShowingAll && hasMore ? (
          <>
            <Button variant="pearl-capsule" onClick={onShowMore} className="gap-xs">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
              </svg>
              Show Next {Math.min(pageSize, remaining)}
            </Button>
            <Button variant="primary" onClick={onShowAll} className="gap-xs">
              Show All ({total})
            </Button>
          </>
        ) : (
          onShowLess &&
          total > pageSize && (
            <Button variant="pearl-capsule" onClick={onShowLess} className="gap-xs">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 15l7-7 7 7" />
              </svg>
              Show Less
            </Button>
          )
        )}
      </div>
    </div>
  );
}
