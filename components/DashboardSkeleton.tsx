/**
 * DashboardSkeleton — placeholder layout shown before profile setup
 */

import React from 'react';

const pulse = 'animate-pulse bg-divider-soft rounded-md';

export default function DashboardSkeleton() {
  return (
    <div className="space-y-md" aria-hidden="true">
      {/* Filters + stats row */}
      <div className="card-utility !p-md">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-lg">
          <div className="space-y-sm">
            <div className={`h-3 w-24 ${pulse}`} />
            <div className="flex gap-xs flex-wrap">
              {[72, 88, 96, 80].map((w) => (
                <div key={w} className={`h-9 rounded-pill ${pulse}`} style={{ width: w }} />
              ))}
            </div>
          </div>
          <div className="flex flex-wrap justify-end gap-xs">
            {[0, 1, 2].map((i) => (
              <div key={i} className={`card-utility !bg-canvas-parchment !p-sm min-w-[124px] h-[52px] ${pulse}`} />
            ))}
          </div>
        </div>
      </div>

      {/* Table skeleton */}
      <div className="card-utility overflow-hidden !p-0">
        <div className="px-md py-sm border-b border-hairline flex items-center justify-between gap-md">
          <div className={`h-4 w-32 ${pulse}`} />
          <div className={`h-8 w-48 rounded-pill ${pulse}`} />
        </div>
        <div className="divide-y divide-hairline">
          {[0, 1, 2, 3, 4, 5].map((row) => (
            <div key={row} className="px-md py-md flex items-center gap-md">
              <div className={`h-10 w-10 rounded-full shrink-0 ${pulse}`} />
              <div className="flex-1 space-y-xs min-w-0">
                <div className={`h-4 w-36 max-w-full ${pulse}`} />
                <div className={`h-3 w-24 max-w-full ${pulse}`} />
              </div>
              <div className={`h-6 w-16 rounded-pill shrink-0 hidden sm:block ${pulse}`} />
              <div className={`h-8 w-20 rounded-pill shrink-0 ${pulse}`} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
