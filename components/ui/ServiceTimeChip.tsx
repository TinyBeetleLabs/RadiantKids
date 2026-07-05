import React from 'react';

interface ServiceTimeChipProps {
  label: string;
  selected: boolean;
  count?: number;
  onClick: () => void;
  'data-service-time'?: string;
}

export default function ServiceTimeChip({
  label,
  selected,
  count,
  onClick,
  'data-service-time': dataServiceTime,
}: ServiceTimeChipProps) {
  return (
    <button
      type="button"
      data-service-time={dataServiceTime}
      onClick={onClick}
      aria-pressed={selected}
      className={
        selected
          ? 'chip-option-selected font-text text-caption-strong shrink-0 whitespace-nowrap'
          : 'chip-option shrink-0 whitespace-nowrap'
      }
    >
      {label}
      {count !== undefined && (
        <span
          className={`ml-xs px-xs py-xxs rounded-pill text-fine-print ${
            selected ? 'bg-primary/10 text-primary' : 'bg-canvas-parchment text-ink-muted-80'
          }`}
        >
          {count}
        </span>
      )}
    </button>
  );
}
