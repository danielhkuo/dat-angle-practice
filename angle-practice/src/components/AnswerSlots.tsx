'use client';

import React from 'react';
import { Angle } from '@/types';

interface AnswerSlotsProps {
  selections: string[];
  angles: Angle[];
  onClear: () => void;
}

export function AnswerSlots({ selections, angles, onClear }: AnswerSlotsProps) {
  // Create a map of angle IDs to angles for quick lookup
  const angleMap = angles.reduce((map, angle) => {
    map[angle.id] = angle;
    return map;
  }, {} as Record<string, Angle>);

  // Create slots for the ranking (1-4, smallest to largest)
  const slots = ['Smallest', '2nd Smallest', '2nd Largest', 'Largest'];

  return (
    <div className="w-full max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-800">
          Rank the angles from smallest to largest:
        </h3>
        <button
          onClick={onClear}
          disabled={selections.length === 0}
          className={`
            px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200
            ${selections.length === 0
              ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
              : 'bg-red-100 text-red-700 hover:bg-red-200 border border-red-300'
            }
          `}
          aria-label="Clear all selections"
        >
          Clear Selections
        </button>
      </div>

      {/* Answer slots */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {slots.map((label, index) => {
          const selectedAngleId = selections[index];
          const selectedAngle = selectedAngleId ? angleMap[selectedAngleId] : null;
          
          return (
            <div
              key={index}
              className={`
                relative border-2 rounded-lg p-4 min-h-[120px]
                flex flex-col items-center justify-center
                transition-colors duration-200
                ${selectedAngle
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-300 bg-gray-50 border-dashed'
                }
              `}
            >
              {/* Slot label */}
              <div className="text-sm font-medium text-gray-600 mb-2 text-center">
                {label}
              </div>
              
              {/* Position number */}
              <div className={`
                absolute -top-2 -left-2 w-6 h-6 rounded-full
                flex items-center justify-center text-sm font-bold
                ${selectedAngle
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-400 text-white'
                }
              `}>
                {index + 1}
              </div>

              {/* Selected angle preview or empty state */}
              {selectedAngle ? (
                <div className="flex flex-col items-center">
                  {/* Mini angle preview */}
                  <div className="w-16 h-16 mb-2">
                    <svg
                      width="64"
                      height="64"
                      viewBox="0 0 64 64"
                      className="border border-blue-300 rounded bg-white"
                    >
                      {/* Simplified angle representation */}
                      <g transform="translate(32, 32)">
                        <line
                          x1="0"
                          y1="0"
                          x2={Math.cos(selectedAngle.rotation * Math.PI / 180) * 20}
                          y2={Math.sin(selectedAngle.rotation * Math.PI / 180) * 20}
                          stroke="#1f2937"
                          strokeWidth="2"
                          strokeLinecap="round"
                        />
                        <line
                          x1="0"
                          y1="0"
                          x2={Math.cos((selectedAngle.rotation + selectedAngle.degrees) * Math.PI / 180) * 20}
                          y2={Math.sin((selectedAngle.rotation + selectedAngle.degrees) * Math.PI / 180) * 20}
                          stroke="#1f2937"
                          strokeWidth="2"
                          strokeLinecap="round"
                        />
                        <circle cx="0" cy="0" r="2" fill="#1f2937" />
                      </g>
                    </svg>
                  </div>
                  
                  {/* Angle ID for reference */}
                  <div className="text-xs text-gray-500 font-mono">
                    {selectedAngle.id}
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center text-gray-400">
                  <div className="w-16 h-16 mb-2 border-2 border-dashed border-gray-300 rounded flex items-center justify-center">
                    <svg
                      className="w-8 h-8"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1}
                        d="M12 4v16m8-8H4"
                      />
                    </svg>
                  </div>
                  <div className="text-xs text-center">
                    Click an angle<br />to select
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Selection progress indicator */}
      <div className="mt-4 flex items-center justify-center">
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-600">
            Selected: {selections.length}/4
          </span>
          <div className="flex space-x-1">
            {[1, 2, 3, 4].map((num) => (
              <div
                key={num}
                className={`
                  w-3 h-3 rounded-full
                  ${num <= selections.length
                    ? 'bg-blue-500'
                    : 'bg-gray-300'
                  }
                `}
                aria-hidden="true"
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default AnswerSlots;