/**
 * Loader Component
 * 
 * A simple, elegant loading spinner for displaying while data is being fetched.
 * Uses Tailwind CSS for styling and animations.
 */

import React from 'react';

interface LoaderProps {
  message?: string;
}

export default function Loader({ message = 'Loading check-ins...' }: LoaderProps) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
      {/* Animated spinner */}
      <div className="relative w-16 h-16">
        <div className="absolute top-0 left-0 w-full h-full border-4 border-primary-200 rounded-full"></div>
        <div className="absolute top-0 left-0 w-full h-full border-4 border-primary-600 rounded-full border-t-transparent animate-spin"></div>
      </div>
      
      {/* Loading message */}
      <p className="text-lg font-medium text-gray-600 animate-pulse">
        {message}
      </p>
    </div>
  );
}

