import React from 'react';

interface StatItem {
  label: string;
  value: number;
  accent?: 'primary' | 'muted' | 'default';
  icon: 'checked-in' | 'checked-out' | 'total';
}

interface StatsBarProps {
  stats: StatItem[];
}

const icons: Record<StatItem['icon'], React.ReactNode> = {
  'checked-in': (
    <svg className="w-4 h-4 text-on-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  'checked-out': (
    <svg className="w-4 h-4 text-on-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  total: (
    <svg className="w-4 h-4 text-on-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
    </svg>
  ),
};

const iconBg: Record<StatItem['icon'], string> = {
  'checked-in': 'bg-primary',
  'checked-out': 'bg-surface-tile-1',
  total: 'bg-ink',
};

export default function StatsBar({ stats }: StatsBarProps) {
  return (
    <div className="flex flex-wrap justify-end gap-xs">
      {stats.map((stat) => (
        <div
          key={stat.label}
          className="card-utility !bg-canvas-parchment !p-sm min-w-[124px] sm:min-w-[140px] flex-1 sm:flex-none"
        >
          <div className="flex items-center gap-xs">
            <div className={`stat-icon ${iconBg[stat.icon]}`}>{icons[stat.icon]}</div>
            <div className="min-w-0">
              <div className="font-text text-fine-print text-ink-muted-48 uppercase tracking-wide leading-tight">
                {stat.label}
              </div>
              <div
                className={`font-text text-body-strong leading-tight text-[18px] ${
                  stat.accent === 'primary'
                    ? 'text-primary'
                    : stat.accent === 'muted'
                      ? 'text-ink-muted-48'
                      : 'text-ink'
                }`}
              >
                {stat.value}
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
