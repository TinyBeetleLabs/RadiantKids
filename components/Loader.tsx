/**
 * Loader Component
 */

import React from 'react';

interface LoaderProps {
  message?: string;
}

export default function Loader({ message = 'Loading check-ins...' }: LoaderProps) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] gap-lg card-utility">
      <div className="relative w-11 h-11">
        <div className="absolute inset-0 border-4 border-hairline rounded-full" />
        <div className="absolute inset-0 border-4 border-primary rounded-full border-t-transparent animate-spin" />
      </div>
      <p className="font-text text-body text-ink-muted-48">{message}</p>
    </div>
  );
}
