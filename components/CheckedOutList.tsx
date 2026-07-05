/**
 * CheckedOutList Component
 */

import React from 'react';
import { CheckInData } from '@/lib/mockData';
import Button from '@/components/ui/Button';
import ServiceTimeChip from '@/components/ui/ServiceTimeChip';

interface CheckedOutListProps {
  checkedOutKids: CheckInData[];
  onUndo: (securityCode: string) => void;
  selectedServiceTime: string;
  selectedLocation?: string;
  serviceTimeOptions?: string[];
  onServiceTimeChange?: (value: string) => void;
}

export default function CheckedOutList({
  checkedOutKids,
  onUndo,
  selectedServiceTime,
  selectedLocation,
  serviceTimeOptions = [],
  onServiceTimeChange,
}: CheckedOutListProps) {
  if (checkedOutKids.length === 0) {
    return null;
  }

  const showLocation = selectedLocation === 'All';

  const formatTime = (isoString: string): string => {
    const date = new Date(isoString);
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  const groupedByFamily = checkedOutKids.reduce((acc, kid) => {
    const key = kid.securityCode;
    if (!acc[key]) {
      acc[key] = [];
    }
    acc[key].push(kid);
    return acc;
  }, {} as Record<string, CheckInData[]>);

  const groupedByLocationAndService = React.useMemo(() => {
    if (!showLocation) return null;
    const result: Record<string, Record<string, CheckInData[]>> = {};
    checkedOutKids.forEach((kid) => {
      const loc = kid.locationName || 'Unknown Location';
      const service = kid.serviceName || 'Unknown Service';
      if (!result[loc]) result[loc] = {};
      if (!result[loc][service]) result[loc][service] = [];
      result[loc][service].push(kid);
    });
    return result;
  }, [checkedOutKids, showLocation]);

  const renderClassBadge = (kid: CheckInData) =>
    kid.className ? (
      <span className="inline-flex items-center px-sm py-xxs rounded-md font-text text-fine-print text-ink-muted-80 bg-surface-pearl border-[3px] border-divider-soft">
        {kid.className}
      </span>
    ) : null;

  const renderServiceChips = () => {
    if (!serviceTimeOptions.length || !onServiceTimeChange) return null;
    return (
      <div className="px-lg py-md flex items-center gap-xs flex-wrap bg-canvas-parchment border-b border-hairline">
        <div className="font-text text-fine-print text-ink-muted-80 uppercase tracking-wide w-full sm:w-auto">
          Filter by service
        </div>
        {serviceTimeOptions.map((time) => (
          <ServiceTimeChip
            key={time}
            label={time}
            selected={selectedServiceTime === time}
            onClick={() => onServiceTimeChange(time)}
          />
        ))}
      </div>
    );
  };

  const renderUndoButton = (securityCode: string, label: string) => (
    <Button
      variant="secondary-pill"
      onClick={() => onUndo(securityCode)}
      className="gap-xs shrink-0"
      aria-label={label}
    >
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5} aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
      </svg>
      Undo
    </Button>
  );

  const renderFamilyRow = (securityCode: string, kids: CheckInData[]) => {
    const isSingleChild = kids.length === 1;
    const checkOutTime = kids[0].checkOutTime || kids[0].checkInTime;

    return (
      <div key={securityCode} className="px-lg py-md hover:bg-canvas-parchment transition-colors">
        <div className="flex items-center justify-between gap-lg">
          <div className="flex-1 min-w-0">
            <div className="font-text text-body-strong text-ink mb-xxs">
              {isSingleChild ? kids[0].childName : `${kids[0].familyName} Family (${kids.length} kids)`}
            </div>
            {!isSingleChild && (
              <div className="font-text text-caption text-ink-muted-80 ml-md">
                {kids.map((kid) => (
                  <div key={kid.id}>• {kid.childName}</div>
                ))}
              </div>
            )}
            <div className="flex items-center gap-sm mt-sm text-caption text-ink-muted-48 flex-wrap">
              <span className="badge-security font-mono">{securityCode}</span>
              {renderClassBadge(kids[0])}
              <span>Checked out at {formatTime(checkOutTime)}</span>
            </div>
          </div>
          {renderUndoButton(
            securityCode,
            `Undo checkout for ${isSingleChild ? kids[0].childName : kids[0].familyName} (${securityCode})`
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="mb-lg fade-in">
      <div className="bg-surface-tile-1 rounded-t-lg px-lg py-md">
        <h2 className="font-text text-tagline text-body-on-dark flex items-center justify-between flex-wrap gap-sm">
          <span className="flex items-center gap-sm">
            Checked Out
            <span className="font-text text-caption text-body-on-dark/80 bg-white/10 px-sm py-xxs rounded-pill">
              {checkedOutKids.length} {checkedOutKids.length === 1 ? 'child' : 'children'}
            </span>
          </span>
        </h2>
      </div>

      <div className="bg-canvas rounded-b-lg border border-hairline border-t-0 overflow-hidden">
        {renderServiceChips()}
        {showLocation && groupedByLocationAndService ? (
          <div className="divide-y divide-hairline">
            {Object.entries(groupedByLocationAndService).map(([locationName, services]) => (
              <div key={locationName}>
                <div className="px-lg py-sm bg-canvas-parchment font-text text-caption-strong text-ink uppercase tracking-wide border-b border-hairline">
                  {locationName}
                </div>
                {Object.entries(services).map(([serviceName, kidsInService]) => {
                  const groupedByFamilyService = kidsInService.reduce((acc, kid) => {
                    const key = kid.securityCode;
                    if (!acc[key]) acc[key] = [];
                    acc[key].push(kid);
                    return acc;
                  }, {} as Record<string, CheckInData[]>);
                  return (
                    <div key={serviceName} className="border-b border-hairline last:border-b-0">
                      <div className="px-lg py-sm font-text text-caption-strong text-ink-muted-80 bg-canvas">
                        {serviceName}
                      </div>
                      <div className="divide-y divide-hairline">
                        {Object.entries(groupedByFamilyService).map(([code, kids]) =>
                          renderFamilyRow(code, kids)
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        ) : (
          <div className="divide-y divide-hairline">
            {Object.entries(groupedByFamily).map(([code, kids]) => renderFamilyRow(code, kids))}
          </div>
        )}
      </div>
    </div>
  );
}
