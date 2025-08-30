'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  useTest, 
  useTestActions, 
  useCurrentQuestion, 
  useTestProgress, 
  useSelectionState 
} from '@/providers/TestProvider';
import { Timer, AngleDisplay, AnswerSlots } from '@/components';
import { TestFlowErrorBoundary } from '@/components/ErrorBoundary';

export default function TestPage() {
  const router = useRouter();
  const { state } = useTest();
  const { selectAngle, clearSelections, nextQuestion, submitTest } = useTestActions();
  const currentQuestion = useCurrentQuestion();
  const { currentQuestionIndex, totalQuestions, isLastQuestion } = useTestProgress();
  const { currentSelections, canProceed, getSelectionOrder, isAngleSelected } = useSelectionState();

  // Redirect if no active test session
  useEffect(() => {
    if (!state.currentSession || !state.isActive) {
      router.push('/');
    }
  }, [state.currentSession, state.isActive, router]);

  // Redirect to results when test is completed
  useEffect(() => {
    if (state.currentSession?.isCompleted) {
      router.push('/results');
    }
  }, [state.currentSession?.isCompleted, router]);

  // Handle angle selection
  const handleAngleClick = (angleId: string) => {
    selectAngle(angleId);
  };

  // Handle next question
  const handleNext = () => {
    if (canProceed) {
      nextQuestion();
    }
  };

  // Handle test submission (for last question or manual submission)
  const handleSubmit = () => {
    submitTest();
  };

  // Show loading state while redirecting
  if (!state.currentSession || !state.isActive || !currentQuestion) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading test...</p>
        </div>
      </div>
    );
  }

  return (
    <TestFlowErrorBoundary>
      <div className="min-h-screen bg-gray-50">
        {/* Header with timer and progress */}
        <div className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between py-4">
              {/* Progress indicator */}
              <div className="flex items-center space-x-4">
                <h1 className="text-xl font-semibold text-gray-900">
                  DAT Angle Practice
                </h1>
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-600">Question</span>
                  <span className="text-lg font-bold text-blue-600">
                    {currentQuestionIndex + 1}
                  </span>
                  <span className="text-sm text-gray-600">of</span>
                  <span className="text-lg font-bold text-gray-900">
                    {totalQuestions}
                  </span>
                </div>
              </div>

              {/* Timer */}
              <Timer />
            </div>

            {/* Progress bar */}
            <div className="pb-4">
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{
                    width: `${((currentQuestionIndex + 1) / totalQuestions) * 100}%`
                  }}
                  role="progressbar"
                  aria-valuenow={currentQuestionIndex + 1}
                  aria-valuemin={1}
                  aria-valuemax={totalQuestions}
                  aria-label={`Question ${currentQuestionIndex + 1} of ${totalQuestions}`}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Main content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="space-y-8">
            {/* Instructions */}
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Rank the angles from smallest to largest
              </h2>
              <p className="text-gray-600">
                Click on the angles in order from smallest to largest. 
                You must select all 4 angles to proceed.
              </p>
            </div>

            {/* Angles grid */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 text-center">
                Select the angles in order:
              </h3>
              <div className="grid grid-cols-2 gap-6 max-w-2xl mx-auto">
                {currentQuestion.angles.map((angle) => (
                  <div key={angle.id} className="flex justify-center">
                    <AngleDisplay
                      angle={angle}
                      isSelected={isAngleSelected(angle.id)}
                      selectionOrder={getSelectionOrder(angle.id) || undefined}
                      onClick={handleAngleClick}
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Answer slots */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <AnswerSlots
                selections={currentSelections}
                angles={currentQuestion.angles}
                onClear={clearSelections}
              />
            </div>

            {/* Navigation buttons */}
            <div className="flex items-center justify-between max-w-4xl mx-auto">
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <span>
                  {canProceed 
                    ? 'Ready to proceed' 
                    : `Select ${4 - currentSelections.length} more angle${4 - currentSelections.length !== 1 ? 's' : ''}`
                  }
                </span>
              </div>

              <div className="flex items-center space-x-4">
                {/* Clear selections button (duplicate for convenience) */}
                <button
                  onClick={clearSelections}
                  disabled={currentSelections.length === 0}
                  className={`
                    px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200
                    ${currentSelections.length === 0
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }
                  `}
                >
                  Clear
                </button>

                {/* Next/Submit button */}
                {isLastQuestion ? (
                  <button
                    onClick={handleSubmit}
                    disabled={!canProceed}
                    className={`
                      px-6 py-2 rounded-lg font-medium transition-colors duration-200
                      ${canProceed
                        ? 'bg-green-600 text-white hover:bg-green-700 shadow-lg'
                        : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      }
                    `}
                  >
                    Submit Test
                  </button>
                ) : (
                  <button
                    onClick={handleNext}
                    disabled={!canProceed}
                    className={`
                      px-6 py-2 rounded-lg font-medium transition-colors duration-200
                      ${canProceed
                        ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-lg'
                        : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      }
                    `}
                  >
                    Next Question
                    <svg
                      className="w-4 h-4 ml-2 inline"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                  </button>
                )}
              </div>
            </div>

            {/* Debug info (only in development) */}
            {process.env.NODE_ENV === 'development' && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-xs">
                <details>
                  <summary className="cursor-pointer font-medium text-yellow-800">
                    Debug Info (Development Only)
                  </summary>
                  <div className="mt-2 space-y-1 text-yellow-700">
                    <div>Question ID: {currentQuestion.id}</div>
                    <div>Selections: [{currentSelections.join(', ')}]</div>
                    <div>Correct Order: [{currentQuestion.correctOrder.join(', ')}]</div>
                    <div>Can Proceed: {canProceed ? 'Yes' : 'No'}</div>
                    <div>Time Remaining: {state.timeRemaining}s</div>
                  </div>
                </details>
              </div>
            )}
          </div>
        </div>
      </div>
    </TestFlowErrorBoundary>
  );
}