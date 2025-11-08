// components/PaginationControls.tsx
import React from 'react';

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
  pageSize
}: PaginationControlsProps) {
  // Don't show controls if all items are already visible
  if (total <= pageSize && !isShowingAll) {
    return null;
  }

  const remaining = total - showing;
  const hasMore = showing < total;

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-4 md:px-6 py-3 bg-gray-50 border-t border-gray-200">
      {/* Info Text */}
      <div className="text-sm text-gray-600">
        Showing <span className="font-semibold text-gray-900">{showing}</span> of{' '}
        <span className="font-semibold text-gray-900">{total}</span> {total === 1 ? 'kid' : 'kids'}
        {!isShowingAll && remaining > 0 && (
          <span className="ml-1 text-gray-500">
            ({remaining} more)
          </span>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-2">
        {!isShowingAll && hasMore ? (
          <>
            {/* Show More Button */}
            <button
              onClick={onShowMore}
              className="px-4 py-2 bg-white border border-gray-300 text-gray-700 
                       rounded-md text-sm font-medium hover:bg-gray-100 transition-all 
                       flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
              </svg>
              Show Next {Math.min(pageSize, remaining)}
            </button>

            {/* Show All Button */}
            <button
              onClick={onShowAll}
              className="px-4 py-2 bg-gray-700 text-white rounded-md text-sm 
                       font-medium hover:bg-gray-800 transition-all
                       flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
              Show All ({total})
            </button>
          </>
        ) : (
          /* Show Less Button - appears when all items are showing (either via "Show All" or multiple "Show Next" clicks) */
          onShowLess && total > pageSize && (
            <button
              onClick={onShowLess}
              className="px-4 py-2 bg-white border border-gray-300 text-gray-700 
                       rounded-md text-sm font-medium hover:bg-gray-100 transition-all 
                       flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 15l7-7 7 7" />
              </svg>
              Show Less
            </button>
          )
        )}
      </div>
    </div>
  );
}

