'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTest, useTestActions } from '@/providers/TestProvider';
import { calculateScore, getCompletionTime, getPerformanceLevel } from '@/lib/scoring';
import { saveTestSession } from '@/lib/storage';
import { TestReview } from '@/components/TestReview';

export default function ResultsPage() {
  const router = useRouter();
  const { state } = useTest();
  const { resetTest } = useTestActions();
  const [isSaved, setIsSaved] = useState(false);
  const [showReview, setShowReview] = useState(false);

  // Redirect if no completed session
  useEffect(() => {
    if (!state.currentSession || !state.currentSession.isCompleted) {
      router.push('/');
      return;
    }

    // Save the completed test session to history
    const saveSession = async () => {
      try {
        await saveTestSession(state.currentSession!);
        setIsSaved(true);
      } catch (error) {
        console.error('Failed to save test session:', error);
        // Continue anyway - don't block the user
        setIsSaved(true);
      }
    };

    if (!isSaved) {
      saveSession();
    }
  }, [state.currentSession, router, isSaved]);

  if (!state.currentSession || !state.currentSession.isCompleted) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading results...</p>
        </div>
      </div>
    );
  }

  const session = state.currentSession;
  const score = calculateScore(session);
  const completionTime = getCompletionTime(session);
  const performance = getPerformanceLevel(score);

  const handleCloseReview = () => {
    setShowReview(false);
  };

  // Show review interface if requested
  if (showReview) {
    return (
      <TestReview 
        session={session} 
        onClose={handleCloseReview}
      />
    );
  }

  const handleTakeNewTest = () => {
    resetTest();
    router.push('/');
  };

  const handleReviewAnswers = () => {
    setShowReview(true);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Test Complete!
          </h1>
          <p className="text-gray-600">
            Here are your results for the DAT Angle Practice Test
          </p>
        </div>

        {/* Results Card */}
        <div className="bg-white rounded-lg shadow-lg p-8 mb-6">
          {/* Score Display */}
          <div className="text-center mb-8">
            <div className="text-6xl font-bold text-blue-600 mb-2">
              {score}/15
            </div>
            <div className="text-xl text-gray-600 mb-4">
              {Math.round((score / 15) * 100)}% Correct
            </div>
            <div className={`text-lg font-semibold ${performance.color}`}>
              {performance.level}
            </div>
            <p className="text-gray-600 mt-2 max-w-md mx-auto">
              {performance.description}
            </p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold text-gray-900">
                {completionTime}
              </div>
              <div className="text-sm text-gray-600">
                Completion Time
              </div>
            </div>
            
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">
                {score}
              </div>
              <div className="text-sm text-gray-600">
                Correct Answers
              </div>
            </div>
            
            <div className="text-center p-4 bg-red-50 rounded-lg">
              <div className="text-2xl font-bold text-red-600">
                {15 - score}
              </div>
              <div className="text-sm text-gray-600">
                Incorrect Answers
              </div>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mb-8">
            <div className="flex justify-between text-sm text-gray-600 mb-2">
              <span>Progress</span>
              <span>{score}/15 questions correct</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div 
                className="bg-blue-600 h-3 rounded-full transition-all duration-500"
                style={{ width: `${(score / 15) * 100}%` }}
              ></div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={handleReviewAnswers}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              Review Answers
            </button>
            
            <button
              onClick={handleTakeNewTest}
              className="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors font-medium"
            >
              Take New Test
            </button>
          </div>
        </div>

        {/* Additional Info */}
        <div className="bg-blue-50 rounded-lg p-6 text-center">
          <h3 className="text-lg font-semibold text-blue-900 mb-2">
            About Your Score
          </h3>
          <p className="text-blue-800 text-sm">
            This practice test simulates the angle ranking portion of the DAT Perceptual Ability Test. 
            Regular practice can help improve your spatial reasoning and angle discrimination skills.
          </p>
        </div>

        {/* Save Status */}
        {isSaved && (
          <div className="mt-4 text-center text-sm text-gray-500">
            ✓ Test results saved to your browser history
          </div>
        )}
      </div>
    </div>
  );
}