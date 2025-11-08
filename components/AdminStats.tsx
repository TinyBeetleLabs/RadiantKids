/**
 * AdminStats Component
 * 
 * Dashboard overview for admins showing totals across all services and classrooms
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
  locationOptions = []
}: AdminStatsProps) {
  // Filter check-ins by location if a specific location is selected
  const filteredCheckIns = useMemo(() => {
    if (selectedLocation === 'All' || !selectedLocation) {
      return checkIns;
    }
    return checkIns.filter(kid => kid.locationName === selectedLocation);
  }, [checkIns, selectedLocation]);

  // Extract just the time from serviceName (e.g., "Sunday Services – South Tampa • 8:00 AM" -> "8:00 AM")
  const extractServiceTime = (serviceName: string): string => {
    // Try to use serviceTime field first if available
    // Otherwise parse from serviceName
    const timeMatch = serviceName.match(/(\d{1,2}:\d{2}\s?[AP]M)/i);
    if (timeMatch) {
      return timeMatch[1];
    }
    return serviceName; // Fallback to full name if parsing fails
  };

  // Calculate stats by service time (group by time only, not full service name)
  const serviceStats = useMemo(() => {
    const stats: Record<string, ServiceStats> = {};
    
    filteredCheckIns.forEach(kid => {
      // Skip no-shows (they didn't actually show up to the classroom)
      if (kid.status === 'no-show') return;
      
      // Use serviceTime field if available, otherwise extract from serviceName
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

  // Calculate classroom breakdown
  const classroomStats = useMemo(() => {
    const stats: Record<string, ServiceStats> = {};
    
    filteredCheckIns.forEach(kid => {
      // Skip no-shows (they didn't actually show up to the classroom)
      if (kid.status === 'no-show') return;
      
      // Skip kids without a valid classroom name
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

  // Calculate totals (exclude no-shows)
  const actualCheckIns = filteredCheckIns.filter(k => k.status !== 'no-show');
  const totalKids = actualCheckIns.length;
  const totalCheckedOut = actualCheckIns.filter(k => k.checkedOut).length;
  const totalActive = totalKids - totalCheckedOut;

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 mb-6 fade-in">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
          <svg className="w-6 h-6 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
          Admin Overview
        </h2>
        <span className="text-sm text-gray-500">
          {selectedLocation === 'All' ? 'Church-wide stats' : `${selectedLocation} stats`}
        </span>
      </div>

      {/* Location Filter */}
      {onLocationChange && locationOptions.length > 0 && (
        <div className="mb-6">
          <label htmlFor="admin-location-select" className="flex items-center gap-2 text-sm font-semibold text-gray-700 uppercase tracking-wide mb-2">
            <svg className="w-4 h-4 text-primary-500" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
            </svg>
            Location
          </label>
          <select
            id="admin-location-select"
            value={selectedLocation}
            onChange={(e) => onLocationChange(e.target.value)}
            className="w-full md:w-auto px-4 py-2.5 rounded-lg border-2 border-gray-300 focus:border-primary-500 focus:ring-2 focus:ring-primary-200 outline-none transition-all text-base font-medium bg-white hover:border-gray-400 cursor-pointer"
          >
            {locationOptions.map((location) => {
              const count = location === 'All'
                ? checkIns.filter(c => !c.checkedOut && c.status !== 'no-show').length
                : checkIns.filter(c => 
                    !c.checkedOut &&
                    c.status !== 'no-show' &&
                    c.locationName === location
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

      {/* Total Summary */}
      <div className="bg-gradient-to-br from-primary-50 to-blue-50 rounded-lg p-6 mb-6">
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center">
            <div className="text-3xl font-bold text-gray-900">{totalKids}</div>
            <div className="text-sm text-gray-600 uppercase tracking-wide mt-1">Total Kids</div>
          </div>
          <div className="text-center border-l border-r border-gray-300">
            <div className="text-3xl font-bold text-green-600">{totalActive}</div>
            <div className="text-sm text-gray-600 uppercase tracking-wide mt-1">Still Here</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-gray-400">{totalCheckedOut}</div>
            <div className="text-sm text-gray-600 uppercase tracking-wide mt-1">Checked out</div>
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Service Time Breakdown */}
        <div>
          <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wide mb-3 flex items-center gap-2">
            <svg className="w-4 h-4 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
            </svg>
            By Service Time
          </h3>
          <div className="space-y-2">
            {Object.entries(serviceStats)
              .sort(([timeA], [timeB]) => {
                // Sort by time (convert to minutes for proper sorting)
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
              <div key={serviceTime} className="p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-semibold text-gray-900">{serviceTime}</span>
                  <span className="text-sm font-bold text-gray-600">{stats.total} kids</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <span className="text-green-600">✓ {stats.checkedIn} still here</span>
                  <span className="text-gray-400">• {stats.checkedOut} checked out</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Classroom Breakdown */}
        <div>
          <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wide mb-3 flex items-center gap-2">
            <svg className="w-4 h-4 text-primary-500" fill="currentColor" viewBox="0 0 20 20">
              <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
            </svg>
            By Classroom
          </h3>
          <div className="space-y-2">
            {Object.entries(classroomStats).map(([classroom, stats]) => (
              <button
                key={classroom}
                onClick={() => onClassroomClick(classroom)}
                className="w-full text-left p-3 bg-gray-50 rounded-lg hover:bg-primary-50 hover:border-primary-300 border-2 border-transparent transition-all cursor-pointer"
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-semibold text-gray-900">{classroom}</span>
                  <span className="text-sm font-bold text-gray-600">{stats.total} kids</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <span className="text-green-600">✓ {stats.checkedIn} still here</span>
                  <span className="text-gray-400">• {stats.checkedOut} checked out</span>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Admin Note */}
      <div className="mt-6 pt-6 border-t border-gray-200">
        <p className="text-sm text-gray-500 text-center">
          💡 <strong>Tip:</strong> Click any classroom to view its check-ins, or use filters below
        </p>
      </div>
    </div>
  );
}

