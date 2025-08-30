'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTestActions } from '@/providers/TestProvider';
import { getCurrentSession, clearCurrentSession, getStorageInfo } from '@/lib/storage';
import { TestSession } from '@/types';

export default function Home() {
  const router = useRouter();
  const { startNewTest, loadSession } = useTestActions();
  const [incompleteSession, setIncompleteSession] = useState<TestSession | null>(null);
  const [showRecoveryPrompt, setShowRecoveryPrompt] = useState(false);
  const [storageAvailable, setStorageAvailable] = useState(true);

  useEffect(() => {
    // Check for incomplete session on mount
    const storageInfo = getStorageInfo();
    setStorageAvailable(storageInfo.isAvailable);
    
    if (storageInfo.hasCurrentSession) {
      const session = getCurrentSession();
      if (session) {
        setIncompleteSession(session);
        setShowRecoveryPrompt(true);
      }
    }
  }, []);

  const handleStartNewTest = () => {
    startNewTest();
    router.push('/test');
  };

  const handleResumeTest = () => {
    if (incompleteSession) {
      loadSession(incompleteSession);
      router.push('/test');
    }
  };

  const handleDiscardSession = () => {
    clearCurrentSession();
    setIncompleteSession(null);
    setShowRecoveryPrompt(false);
  };

  const handleStartFresh = () => {
    if (incompleteSession) {
      clearCurrentSession();
    }
    handleStartNewTest();
  };

  return (
    <div className="bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 min-h-full">
      <div className="container mx-auto px-4 py-8 sm:py-16">
        <div className="max-w-4xl mx-auto text-center">
          {/* Header */}
          <div className="mb-8 sm:mb-12">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white mb-4">
              Master Angle Ranking
            </h2>
            <p className="text-lg sm:text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Practice realistic angle ranking questions for the DAT Perceptual Ability Test. 
              Improve your spatial reasoning skills with timed practice sessions.
            </p>
          </div>

          {/* Features */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 sm:mb-12">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-md">
              <div className="text-3xl mb-3">⏱️</div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                Timed Practice
              </h3>
              <p className="text-gray-600 dark:text-gray-300 text-sm">
                15 questions in 10 minutes, just like the real DAT
              </p>
            </div>
            
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-md">
              <div className="text-3xl mb-3">📐</div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                Realistic Angles
              </h3>
              <p className="text-gray-600 dark:text-gray-300 text-sm">
                Challenging angle sets with small degree differences
              </p>
            </div>
            
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-md">
              <div className="text-3xl mb-3">📊</div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                Detailed Review
              </h3>
              <p className="text-gray-600 dark:text-gray-300 text-sm">
                Review your answers and learn from mistakes
              </p>
            </div>
          </div>

          {/* Session Recovery Prompt */}
          {showRecoveryPrompt && incompleteSession && (
            <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-6 mb-8">
              <div className="flex items-center justify-center mb-4">
                <div className="text-2xl mr-3">⚠️</div>
                <h3 className="text-lg font-semibold text-yellow-800 dark:text-yellow-200">
                  Incomplete Test Found
                </h3>
              </div>
              <p className="text-yellow-700 dark:text-yellow-300 mb-6">
                You have an incomplete practice test. Would you like to resume where you left off 
                or start a new test?
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <button
                  onClick={handleResumeTest}
                  className="bg-yellow-600 hover:bg-yellow-700 text-white font-medium py-2 px-6 rounded-lg transition-colors"
                >
                  Resume Test
                </button>
                <button
                  onClick={handleStartFresh}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-6 rounded-lg transition-colors"
                >
                  Start New Test
                </button>
                <button
                  onClick={handleDiscardSession}
                  className="bg-gray-500 hover:bg-gray-600 text-white font-medium py-2 px-4 rounded-lg transition-colors"
                >
                  Discard
                </button>
              </div>
            </div>
          )}

          {/* Storage Warning */}
          {!storageAvailable && (
            <div className="bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg p-4 mb-8">
              <p className="text-orange-700 dark:text-orange-300 text-sm">
                ⚠️ Local storage is not available. Your test history won&apos;t be saved, but you can still take practice tests.
              </p>
            </div>
          )}

          {/* Main Action */}
          {!showRecoveryPrompt && (
            <div className="space-y-4">
              <button
                onClick={handleStartNewTest}
                className="bg-blue-600 hover:bg-blue-700 text-white font-semibold text-lg py-4 px-8 rounded-lg shadow-lg transition-all duration-200 transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-blue-300 dark:focus:ring-blue-800"
              >
                Start Practice Test
              </button>
              
              <p className="text-gray-500 dark:text-gray-400 text-sm">
                15 questions • 10 minutes • No registration required
              </p>
            </div>
          )}

          {/* Instructions */}
          <div className="mt-12 sm:mt-16 bg-white dark:bg-gray-800 rounded-lg p-6 sm:p-8 shadow-md text-left">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 text-center">
              How It Works
            </h2>
            <div className="space-y-4 text-gray-600 dark:text-gray-300">
              <div className="flex items-start">
                <span className="bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full w-6 h-6 flex items-center justify-center text-sm font-semibold mr-3 mt-0.5 flex-shrink-0">
                  1
                </span>
                <p>
                  Each question shows 4 angles in a grid. Your task is to rank them from 
                  <strong> smallest to largest</strong> by clicking on them in order.
                </p>
              </div>
              <div className="flex items-start">
                <span className="bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full w-6 h-6 flex items-center justify-center text-sm font-semibold mr-3 mt-0.5 flex-shrink-0">
                  2
                </span>
                <p>
                  Selected angles will show numbered badges (1, 2, 3, 4) and appear in the 
                  answer slots below the grid.
                </p>
              </div>
              <div className="flex items-start">
                <span className="bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full w-6 h-6 flex items-center justify-center text-sm font-semibold mr-3 mt-0.5 flex-shrink-0">
                  3
                </span>
                <p>
                  You must select all 4 angles to proceed. Click &quot;Next&quot; to move to the next question 
                  or use &quot;Clear Selections&quot; to start over.
                </p>
              </div>
              <div className="flex items-start">
                <span className="bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full w-6 h-6 flex items-center justify-center text-sm font-semibold mr-3 mt-0.5 flex-shrink-0">
                  4
                </span>
                <p>
                  Complete all 15 questions within 10 minutes. The test will auto-submit when time runs out.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
