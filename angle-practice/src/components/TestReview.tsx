'use client';

import React, { useState } from 'react';
import { TestSession, Angle } from '@/types';
import { generateQuestionResults } from '@/lib/scoring';

interface TestReviewProps {
  session: TestSession;
  onClose: () => void;
}

interface ReviewAngleDisplayProps {
  angle: Angle;
  isUserSelection: boolean;
  isCorrectSelection: boolean;
  userPosition?: number;
  correctPosition?: number;
}

function ReviewAngleDisplay({
  angle,
  isUserSelection,
  isCorrectSelection,
  userPosition,
  correctPosition
}: ReviewAngleDisplayProps) {
  // SVG dimensions and center point
  const svgSize = 140;
  const centerX = svgSize / 2;
  const centerY = svgSize / 2;
  
  // Convert degrees to radians for calculations
  const angleRadians = (angle.degrees * Math.PI) / 180;
  const rotationRadians = (angle.rotation * Math.PI) / 180;
  
  // Calculate arm endpoints based on rotation and lengths
  const arm1EndX = centerX + Math.cos(rotationRadians) * angle.armLength1;
  const arm1EndY = centerY + Math.sin(rotationRadians) * angle.armLength1;
  
  const arm2EndX = centerX + Math.cos(rotationRadians + angleRadians) * angle.armLength2;
  const arm2EndY = centerY + Math.sin(rotationRadians + angleRadians) * angle.armLength2;

  // Create arc path for the angle indicator
  const arcRadius = 20;
  const arcStartX = centerX + Math.cos(rotationRadians) * arcRadius;
  const arcStartY = centerY + Math.sin(rotationRadians) * arcRadius;
  const arcEndX = centerX + Math.cos(rotationRadians + angleRadians) * arcRadius;
  const arcEndY = centerY + Math.sin(rotationRadians + angleRadians) * arcRadius;
  
  const largeArcFlag = angle.degrees > 180 ? 1 : 0;
  const arcPath = `M ${arcStartX} ${arcStartY} A ${arcRadius} ${arcRadius} 0 ${largeArcFlag} 1 ${arcEndX} ${arcEndY}`;

  // Determine border and background colors based on correctness
  let borderColor = 'border-gray-300';
  let backgroundColor = 'bg-white';
  
  if (isUserSelection && isCorrectSelection) {
    borderColor = 'border-green-500';
    backgroundColor = 'bg-green-50';
  } else if (isUserSelection && !isCorrectSelection) {
    borderColor = 'border-red-500';
    backgroundColor = 'bg-red-50';
  } else if (!isUserSelection && isCorrectSelection) {
    borderColor = 'border-green-300';
    backgroundColor = 'bg-green-25';
  }

  return (
    <div className="relative">
      <div
        className={`
          relative w-35 h-35 border-2 rounded-lg transition-all duration-200
          ${borderColor} ${backgroundColor}
        `}
        aria-label={`Angle ${angle.degrees.toFixed(1)} degrees`}
      >
        <svg
          width={svgSize}
          height={svgSize}
          viewBox={`0 0 ${svgSize} ${svgSize}`}
          className="absolute inset-0"
        >
          {/* Angle arc indicator */}
          <path
            d={arcPath}
            fill="none"
            stroke="#3b82f6"
            strokeWidth="2"
            opacity="0.6"
          />
          
          {/* First arm */}
          <line
            x1={centerX}
            y1={centerY}
            x2={arm1EndX}
            y2={arm1EndY}
            stroke="#1f2937"
            strokeWidth="2.5"
            strokeLinecap="round"
          />
          
          {/* Second arm */}
          <line
            x1={centerX}
            y1={centerY}
            x2={arm2EndX}
            y2={arm2EndY}
            stroke="#1f2937"
            strokeWidth="2.5"
            strokeLinecap="round"
          />
          
          {/* Center point */}
          <circle
            cx={centerX}
            cy={centerY}
            r="2.5"
            fill="#1f2937"
          />
        </svg>
        
        {/* User selection badge */}
        {isUserSelection && userPosition && (
          <div className={`
            absolute -top-2 -right-2 w-6 h-6 rounded-full flex items-center justify-center text-sm font-bold shadow-lg
            ${isCorrectSelection ? 'bg-green-500 text-white' : 'bg-red-500 text-white'}
          `}>
            {userPosition}
          </div>
        )}
        
        {/* Correct position indicator for non-selected correct answers */}
        {!isUserSelection && isCorrectSelection && correctPosition && (
          <div className="absolute -top-2 -right-2 w-6 h-6 bg-green-300 text-green-800 rounded-full flex items-center justify-center text-sm font-bold shadow-lg border-2 border-green-500">
            {correctPosition}
          </div>
        )}
      </div>
      
      {/* Angle degree display */}
      <div className="text-center mt-1 text-xs text-gray-600">
        {angle.degrees.toFixed(1)}°
      </div>
    </div>
  );
}

export function TestReview({ session, onClose }: TestReviewProps) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const questionResults = generateQuestionResults(session);
  
  if (!session.isCompleted || questionResults.length === 0) {
    return null;
  }

  const currentQuestion = session.questions[currentQuestionIndex];
  const currentResult = questionResults[currentQuestionIndex];
  const userAnswer = currentResult.userAnswer;
  const correctAnswer = currentResult.correctAnswer;

  // Create angle lookup for easier access
  const angleMap = new Map(currentQuestion.angles.map(angle => [angle.id, angle]));

  const goToPreviousQuestion = () => {
    setCurrentQuestionIndex(Math.max(0, currentQuestionIndex - 1));
  };

  const goToNextQuestion = () => {
    setCurrentQuestionIndex(Math.min(questionResults.length - 1, currentQuestionIndex + 1));
  };

  const goToQuestion = (index: number) => {
    setCurrentQuestionIndex(index);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Test Review
            </h1>
            <p className="text-gray-600">
              Review your answers and see the correct solutions
            </p>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
          >
            Close Review
          </button>
        </div>

        {/* Question Navigation */}
        <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">
              Question {currentQuestionIndex + 1} of {questionResults.length}
            </h2>
            <div className={`
              px-3 py-1 rounded-full text-sm font-medium
              ${currentResult.isCorrect 
                ? 'bg-green-100 text-green-800' 
                : 'bg-red-100 text-red-800'
              }
            `}>
              {currentResult.isCorrect ? 'Correct' : 'Incorrect'}
            </div>
          </div>
          
          {/* Question grid navigation */}
          <div className="grid grid-cols-15 gap-1 mb-4">
            {questionResults.map((result, index) => (
              <button
                key={index}
                onClick={() => goToQuestion(index)}
                className={`
                  w-8 h-8 text-xs font-medium rounded transition-colors
                  ${index === currentQuestionIndex
                    ? 'bg-blue-600 text-white'
                    : result.isCorrect
                    ? 'bg-green-100 text-green-800 hover:bg-green-200'
                    : 'bg-red-100 text-red-800 hover:bg-red-200'
                  }
                `}
                title={`Question ${index + 1}: ${result.isCorrect ? 'Correct' : 'Incorrect'}`}
              >
                {index + 1}
              </button>
            ))}
          </div>

          {/* Navigation buttons */}
          <div className="flex justify-between">
            <button
              onClick={goToPreviousQuestion}
              disabled={currentQuestionIndex === 0}
              className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
            >
              ← Previous
            </button>
            <button
              onClick={goToNextQuestion}
              disabled={currentQuestionIndex === questionResults.length - 1}
              className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
            >
              Next →
            </button>
          </div>
        </div>

        {/* Question Content */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">
            Rank these angles from smallest to largest:
          </h3>

          {/* Angles Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
            {currentQuestion.angles.map((angle) => {
              const userPosition = userAnswer.indexOf(angle.id) + 1;
              const correctPosition = correctAnswer.indexOf(angle.id) + 1;
              const isUserSelection = userAnswer.includes(angle.id);
              const isCorrectSelection = correctAnswer.includes(angle.id);
              const isCorrectlyPlaced = userAnswer.indexOf(angle.id) === correctAnswer.indexOf(angle.id);

              return (
                <div key={angle.id} className="text-center">
                  <ReviewAngleDisplay
                    angle={angle}
                    isUserSelection={isUserSelection}
                    isCorrectSelection={isCorrectSelection && isCorrectlyPlaced}
                    userPosition={userPosition || undefined}
                    correctPosition={correctPosition}
                  />
                </div>
              );
            })}
          </div>

          {/* Answer Comparison */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Your Answer */}
            <div>
              <h4 className="text-md font-semibold text-gray-900 mb-4">
                Your Answer:
              </h4>
              <div className="space-y-3">
                {userAnswer.length > 0 ? (
                  userAnswer.map((angleId, index) => {
                    const angle = angleMap.get(angleId);
                    if (!angle) return null;
                    
                    const isCorrectPosition = correctAnswer[index] === angleId;
                    
                    return (
                      <div
                        key={angleId}
                        className={`
                          flex items-center p-3 rounded-lg border-2
                          ${isCorrectPosition 
                            ? 'border-green-300 bg-green-50' 
                            : 'border-red-300 bg-red-50'
                          }
                        `}
                      >
                        <div className={`
                          w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold mr-3
                          ${isCorrectPosition ? 'bg-green-500 text-white' : 'bg-red-500 text-white'}
                        `}>
                          {index + 1}
                        </div>
                        <div className="flex-1">
                          <div className="font-medium text-gray-900">
                            {angle.degrees.toFixed(1)}°
                          </div>
                          <div className="text-sm text-gray-600">
                            {isCorrectPosition ? 'Correct position' : 'Incorrect position'}
                          </div>
                        </div>
                        {isCorrectPosition ? (
                          <div className="text-green-600">✓</div>
                        ) : (
                          <div className="text-red-600">✗</div>
                        )}
                      </div>
                    );
                  })
                ) : (
                  <div className="text-gray-500 italic">No answer provided</div>
                )}
              </div>
            </div>

            {/* Correct Answer */}
            <div>
              <h4 className="text-md font-semibold text-gray-900 mb-4">
                Correct Answer:
              </h4>
              <div className="space-y-3">
                {correctAnswer.map((angleId, index) => {
                  const angle = angleMap.get(angleId);
                  if (!angle) return null;
                  
                  return (
                    <div
                      key={angleId}
                      className="flex items-center p-3 rounded-lg border-2 border-green-300 bg-green-50"
                    >
                      <div className="w-8 h-8 bg-green-500 text-white rounded-full flex items-center justify-center text-sm font-bold mr-3">
                        {index + 1}
                      </div>
                      <div className="flex-1">
                        <div className="font-medium text-gray-900">
                          {angle.degrees.toFixed(1)}°
                        </div>
                        <div className="text-sm text-gray-600">
                          Position {index + 1}
                        </div>
                      </div>
                      <div className="text-green-600">✓</div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Legend */}
          <div className="mt-8 p-4 bg-gray-50 rounded-lg">
            <h5 className="font-semibold text-gray-900 mb-3">Legend:</h5>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div className="flex items-center">
                <div className="w-4 h-4 bg-green-500 rounded mr-2"></div>
                <span>Correct selection and position</span>
              </div>
              <div className="flex items-center">
                <div className="w-4 h-4 bg-red-500 rounded mr-2"></div>
                <span>Incorrect selection or position</span>
              </div>
              <div className="flex items-center">
                <div className="w-4 h-4 border-2 border-green-300 bg-green-25 rounded mr-2"></div>
                <span>Correct answer (not selected by you)</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}