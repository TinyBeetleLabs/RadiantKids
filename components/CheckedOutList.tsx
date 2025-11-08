/**
 * CheckedOutList Component
 * 
 * Displays a list of children who have been checked out
 * Includes undo functionality for accidental check-outs
 */

import React from 'react';
import { CheckInData } from '@/lib/mockData';

interface CheckedOutListProps {
  checkedOutKids: CheckInData[];
  onUndo: (securityCode: string) => void;
  selectedServiceTime: string; // To show service time when viewing "All"
}

export default function CheckedOutList({ checkedOutKids, onUndo, selectedServiceTime }: CheckedOutListProps) {
  if (checkedOutKids.length === 0) {
    return null; // Don't show section if no one is checked out
  }

  const showServiceTime = selectedServiceTime === 'All'; // Show service time when viewing all services

  /**
   * Formats ISO date string to readable time
   */
  const formatTime = (isoString: string): string => {
    const date = new Date(isoString);
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  // Group by family
  const groupedByFamily = checkedOutKids.reduce((acc, kid) => {
    const key = kid.securityCode;
    if (!acc[key]) {
      acc[key] = [];
    }
    acc[key].push(kid);
    return acc;
  }, {} as Record<string, CheckInData[]>);

  return (
    <div className="mb-6 fade-in">
      {/* Header */}
      <div className="bg-gradient-to-r from-slate-500 to-slate-600 rounded-t-lg px-4 md:px-6 py-3 shadow-md">
        <h2 className="text-lg md:text-xl font-bold text-white flex items-center justify-between flex-wrap gap-2">
          <span className="flex items-center gap-2">
            ✓ Checked Out
            <span className="text-base font-normal bg-white/20 px-3 py-1 rounded-full">
              {checkedOutKids.length} {checkedOutKids.length === 1 ? 'child' : 'children'}
            </span>
          </span>
        </h2>
      </div>

      {/* Checked-Out List */}
      <div className="bg-white rounded-b-lg shadow-md overflow-hidden">
        <div className="divide-y divide-gray-200">
          {Object.entries(groupedByFamily).map(([securityCode, kids]) => {
            const isSingleChild = kids.length === 1;
            const checkOutTime = kids[0].checkOutTime || kids[0].checkInTime;
            
            return (
              <div key={securityCode} className="px-4 md:px-6 py-3 hover:bg-gray-50 transition-colors">
                <div className="flex items-center justify-between gap-4">
                  <div className="flex-1">
                    {/* Family/Child Name */}
                    <div className="font-semibold text-gray-900 mb-1">
                      {isSingleChild ? (
                        <span>{kids[0].childName}</span>
                      ) : (
                        <span>{kids[0].familyName} Family ({kids.length} kids)</span>
                      )}
                    </div>
                    
                    {/* Show individual names for families */}
                    {!isSingleChild && (
                      <div className="text-sm text-gray-600 ml-4">
                        {kids.map((kid, idx) => (
                          <div key={kid.id}>• {kid.childName}</div>
                        ))}
                      </div>
                    )}
                    
                    {/* Security Code & Time */}
                    <div className="flex items-center gap-3 mt-2 text-sm text-gray-500 flex-wrap">
                      <span className="inline-flex items-center px-2 py-1 rounded bg-gray-100 text-gray-700 font-mono font-semibold">
                        {securityCode}
                      </span>
                      {showServiceTime && (
                        <span className="inline-flex items-center px-2 py-1 rounded bg-blue-100 text-blue-700 font-medium">
                          {kids[0].serviceName}
                        </span>
                      )}
                      <span>
                        Checked out at {formatTime(checkOutTime)}
                      </span>
                    </div>
                  </div>
                  
                  {/* Undo Button */}
                  <button
                    onClick={() => onUndo(securityCode)}
                    className="px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors border border-blue-200 flex items-center gap-2 whitespace-nowrap"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
                    </svg>
                    Undo
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

