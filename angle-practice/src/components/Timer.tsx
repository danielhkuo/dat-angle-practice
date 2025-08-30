'use client';

import React from 'react';
import { useTestTimer } from '@/providers/TestProvider';

interface TimerProps {
  className?: string;
}

export function Timer({ className = '' }: TimerProps) {
  const { formattedTime, isWarning, isActive } = useTestTimer();

  if (!isActive) {
    return null;
  }

  return (
    <div 
      className={`
        flex items-center justify-center
        px-4 py-2 rounded-lg font-mono text-lg font-bold
        transition-colors duration-300
        ${isWarning 
          ? 'bg-red-100 text-red-700 border-2 border-red-300 animate-pulse' 
          : 'bg-blue-100 text-blue-700 border-2 border-blue-300'
        }
        ${className}
      `}
      role="timer"
      aria-label={`Time remaining: ${formattedTime}`}
      aria-live="polite"
    >
      <svg 
        className={`w-5 h-5 mr-2 ${isWarning ? 'text-red-600' : 'text-blue-600'}`}
        fill="none" 
        stroke="currentColor" 
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <path 
          strokeLinecap="round" 
          strokeLinejoin="round" 
          strokeWidth={2} 
          d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" 
        />
      </svg>
      <span className="tabular-nums">
        {formattedTime}
      </span>
      {isWarning && (
        <span className="ml-2 text-xs font-normal">
          TIME LOW!
        </span>
      )}
    </div>
  );
}

export default Timer;