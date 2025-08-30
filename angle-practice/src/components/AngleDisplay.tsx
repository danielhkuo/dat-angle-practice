'use client';

import React from 'react';
import { Angle } from '@/types';
import { AngleErrorBoundary } from './ErrorBoundary';

interface AngleDisplayProps {
  angle: Angle;
  isSelected: boolean;
  selectionOrder?: number;
  onClick: (angleId: string) => void;
  disabled?: boolean;
}

export function AngleDisplay({
  angle,
  isSelected,
  selectionOrder,
  onClick,
  disabled = false
}: AngleDisplayProps) {
  const handleClick = () => {
    if (!disabled) {
      onClick(angle.id);
    }
  };

  // SVG dimensions and center point
  const svgSize = 200;
  const centerX = svgSize / 2;
  const centerY = svgSize / 2;
  
  // Generate letter label from angle ID
  const letterLabel = String.fromCharCode(65 + (parseInt(angle.id.split('-')[1]) || 0));
  
  // Convert degrees to radians for calculations
  const angleRadians = (angle.degrees * Math.PI) / 180;
  const rotationRadians = (angle.rotation * Math.PI) / 180;
  
  // Calculate arm endpoints based on rotation and lengths
  const arm1EndX = centerX + Math.cos(rotationRadians) * angle.armLength1;
  const arm1EndY = centerY + Math.sin(rotationRadians) * angle.armLength1;
  
  const arm2EndX = centerX + Math.cos(rotationRadians + angleRadians) * angle.armLength2;
  const arm2EndY = centerY + Math.sin(rotationRadians + angleRadians) * angle.armLength2;



  return (
    <AngleErrorBoundary>
      <div className="relative">
        <div
          className={`
            relative w-50 h-50 cursor-pointer transition-all duration-200 p-4
            ${isSelected 
              ? 'bg-blue-50 rounded-lg shadow-lg' 
              : 'hover:bg-gray-50 rounded-lg'
            }
            ${disabled ? 'cursor-not-allowed opacity-50' : ''}
          `}
          onClick={handleClick}
          role="button"
          tabIndex={disabled ? -1 : 0}
          onKeyDown={(e) => {
            if ((e.key === 'Enter' || e.key === ' ') && !disabled) {
              e.preventDefault();
              handleClick();
            }
          }}
          aria-label={`Angle ${letterLabel}, ${angle.degrees.toFixed(1)} degrees${isSelected ? `, selected as position ${selectionOrder}` : ''}`}
        >
          <svg
            width={svgSize}
            height={svgSize}
            viewBox={`0 0 ${svgSize} ${svgSize}`}
            className="absolute inset-0"
          >
            {/* First arm */}
            <line
              x1={centerX}
              y1={centerY}
              x2={arm1EndX}
              y2={arm1EndY}
              stroke="#1f2937"
              strokeWidth="3"
              strokeLinecap="round"
            />
            
            {/* Second arm */}
            <line
              x1={centerX}
              y1={centerY}
              x2={arm2EndX}
              y2={arm2EndY}
              stroke="#1f2937"
              strokeWidth="3"
              strokeLinecap="round"
            />
            
            {/* Center point */}
            <circle
              cx={centerX}
              cy={centerY}
              r="3"
              fill="#1f2937"
            />
          </svg>
          
          {/* Floating letter label positioned away from angle endpoints */}
          <div className="absolute top-2 left-2 w-8 h-8 bg-white border-2 border-gray-300 rounded-full flex items-center justify-center text-lg font-bold shadow-md">
            {letterLabel}
          </div>
          
          {/* Selection badge */}
          {isSelected && selectionOrder && (
            <div className="absolute top-2 right-2 w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-bold shadow-lg">
              {selectionOrder}
            </div>
          )}
        </div>
      </div>
    </AngleErrorBoundary>
  );
}