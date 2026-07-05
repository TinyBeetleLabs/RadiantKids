/**
 * AdminStats Component
 */

import React, { useMemo } from 'react';
import { CheckInData } from '@/lib/mockData';

interface AdminStatsProps {
  checkIns: CheckInData[];
  onClassroomClick: (classroom: string) => void;
  selectedLocation?: string;
  onLocationChange?: (location: string) => void;
  locationOptions?: string[];
}

interface ServiceStats {
  total: number;
  checkedIn: number;
  checkedOut: number;
}

export default function AdminStats({
  checkIns,
  onClassroomClick,
  selectedLocation = 'All',
  onLocationChange,
  locationOptions = [],
}: AdminStatsProps) {
  const filteredCheckIns = useMemo(() => {
    if (selectedLocation === 'All' || !selectedLocation) {
      return checkIns;
    }
    return checkIns.filter((kid) => kid.locationName === selectedLocation);
  }, [checkIns, selectedLocation]);

  const extractServiceTime = (serviceName: string): string => {
    const timeMatch = serviceName.match(/(\d{1,2}:\d{2}\s?[AP]M)/i);
    if (timeMatch) {
      return timeMatch[1];
    }
    return serviceName;
  };

  const serviceStats = useMemo(() => {
    const stats: Record<string, ServiceStats> = {};

    filteredCheckIns.forEach((kid) => {
      if (kid.status === 'no-show') return;

      const serviceTime = kid.serviceTime || extractServiceTime(kid.serviceName);

      if (!stats[serviceTime]) {
        stats[serviceTime] = { total: 0, checkedIn: 0, checkedOut: 0 };
      }
      stats[serviceTime].total++;
      if (kid.checkedOut) {
        stats[serviceTime].checkedOut++;
      } else {
        stats[serviceTime].checkedIn++;
      }
    });

    return stats;
  }, [filteredCheckIns]);

  const classroomStats = useMemo(() => {
    const stats: Record<string, ServiceStats> = {};

    filteredCheckIns.forEach((kid) => {
      if (kid.status === 'no-show') return;
      if (!kid.className || kid.className === 'undefined') {
        return;
      }

      if (!stats[kid.className]) {
        stats[kid.className] = { total: 0, checkedIn: 0, checkedOut: 0 };
      }
      stats[kid.className].total++;
      if (kid.checkedOut) {
        stats[kid.className].checkedOut++;
      } else {
        stats[kid.className].checkedIn++;
      }
    });

    return stats;
  }, [filteredCheckIns]);

  const actualCheckIns = filteredCheckIns.filter((k) => k.status !== 'no-show');
  const totalKids = actualCheckIns.length;
  const totalCheckedOut = actualCheckIns.filter((k) => k.checkedOut).length;
  const totalActive = totalKids - totalCheckedOut;

  const selectClass =
    'w-full md:w-auto px-md py-xs rounded-pill border border-hairline font-text text-caption text-ink bg-canvas focus:outline-none focus:ring-2 focus:ring-primary-focus cursor-pointer min-h-[36px]';

  return (
    <div className="card-utility mb-md fade-in">
      <div className="flex items-center justify-between mb-md">
        <h2 className="font-text text-tagline text-ink flex items-center gap-sm">
          <svg className="w-6 h-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
          Admin Overview
        </h2>
        <span className="font-text text-caption text-ink-muted-48">
          {selectedLocation === 'All' ? 'Church-wide stats' : `${selectedLocation} stats`}
        </span>
      </div>

      {onLocationChange && locationOptions.length > 0 && (
        <div className="mb-md">
          <label htmlFor="admin-location-select" className="flex items-center gap-xs font-text text-caption-strong text-ink mb-xs">
            <svg className="w-4 h-4 text-primary shrink-0" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
              <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
            </svg>
            Location
          </label>
          <select
            id="admin-location-select"
            value={selectedLocation}
            onChange={(e) => onLocationChange(e.target.value)}
            className={selectClass}
          >
            {locationOptions.map((location) => {
              const count =
                location === 'All'
                  ? checkIns.filter((c) => !c.checkedOut && c.status !== 'no-show').length
                  : checkIns.filter(
                      (c) => !c.checkedOut && c.status !== 'no-show' && c.locationName === location
                    ).length;
              return (
                <option key={location} value={location}>
                  {location} ({count} {count === 1 ? 'kid' : 'kids'})
                </option>
              );
            })}
          </select>
        </div>
      )}

      <div className="bg-canvas-parchment rounded-lg p-md mb-md border border-hairline">
        <div className="grid grid-cols-3 gap-md">
          <div className="text-center">
            <div className="font-text text-body-strong text-ink text-xl">{totalKids}</div>
            <div className="font-text text-fine-print text-ink-muted-48 uppercase tracking-wide mt-xs">Total Kids</div>
          </div>
          <div className="text-center border-l border-r border-hairline">
            <div className="font-text text-body-strong text-primary text-xl">{totalActive}</div>
            <div className="font-text text-fine-print text-ink-muted-48 uppercase tracking-wide mt-xs">Still Here</div>
          </div>
          <div className="text-center">
            <div className="font-text text-body-strong text-ink-muted-48 text-xl">{totalCheckedOut}</div>
            <div className="font-text text-fine-print text-ink-muted-48 uppercase tracking-wide mt-xs">Checked out</div>
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-md">
        <div>
          <h3 className="font-text text-caption-strong text-ink mb-xs flex items-center gap-xs">
            <svg className="w-4 h-4 text-primary shrink-0" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
            </svg>
            By Service Time
          </h3>
          <div className="space-y-xs">
            {Object.entries(serviceStats)
              .sort(([timeA], [timeB]) => {
                const parseTime = (time: string) => {
                  const match = time.match(/(\d{1,2}):(\d{2})\s?([AP]M)/i);
                  if (!match) return 0;
                  let hours = parseInt(match[1]);
                  const minutes = parseInt(match[2]);
                  const period = match[3].toUpperCase();
                  if (period === 'PM' && hours !== 12) hours += 12;
                  if (period === 'AM' && hours === 12) hours = 0;
                  return hours * 60 + minutes;
                };
                return parseTime(timeA) - parseTime(timeB);
              })
              .map(([serviceTime, stats]) => (
                <div key={serviceTime} className="p-md bg-canvas-parchment rounded-md border border-hairline">
                  <div className="flex items-center justify-between mb-xxs">
                    <span className="font-text text-body-strong text-ink">{serviceTime}</span>
                    <span className="font-text text-caption-strong text-ink-muted-80">{stats.total} kids</span>
                  </div>
                  <div className="flex items-center gap-sm font-text text-caption">
                    <span className="text-primary">{stats.checkedIn} still here</span>
                    <span className="text-ink-muted-48">• {stats.checkedOut} checked out</span>
                  </div>
                </div>
              ))}
          </div>
        </div>

        <div>
          <h3 className="font-text text-caption-strong text-ink mb-xs flex items-center gap-xs">
            <svg className="w-4 h-4 text-primary shrink-0" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
              <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
            </svg>
            By Classroom
          </h3>
          <div className="space-y-xs">
            {Object.entries(classroomStats).map(([classroom, stats]) => (
              <button
                key={classroom}
                onClick={() => onClassroomClick(classroom)}
                className="w-full text-left p-md bg-canvas-parchment rounded-md border border-hairline hover:border-primary-focus transition-colors cursor-pointer active:scale-[0.98]"
              >
                <div className="flex items-center justify-between mb-xxs">
                  <span className="font-text text-body-strong text-ink">{classroom}</span>
                  <span className="font-text text-caption-strong text-ink-muted-80">{stats.total} kids</span>
                </div>
                <div className="flex items-center gap-sm font-text text-caption">
                  <span className="text-primary">{stats.checkedIn} still here</span>
                  <span className="text-ink-muted-48">• {stats.checkedOut} checked out</span>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-lg pt-lg border-t border-hairline">
        <p className="font-text text-caption text-ink-muted-48 text-center">
          <strong className="text-ink-muted-80">Tip:</strong> Click any classroom to view its check-ins, or use filters below
        </p>
      </div>
    </div>
  );
}
