/**
 * Scoring system for the DAT Angle Practice application
 * Compares user answers to correct order and calculates final score
 */

import { TestSession, Question, QuestionResult } from '@/types';

/**
 * Calculate the final score for a completed test session
 * @param session - The completed test session
 * @returns Score out of 15
 */
export function calculateScore(session: TestSession): number {
  if (!session.isCompleted || !session.questions) {
    return 0;
  }

  let correctAnswers = 0;

  for (let i = 0; i < session.questions.length; i++) {
    const question = session.questions[i];
    const userAnswer = session.userAnswers[i];

    if (isAnswerCorrect(question, userAnswer)) {
      correctAnswers++;
    }
  }

  return correctAnswers;
}

/**
 * Check if a user's answer for a question is correct
 * @param question - The question with correct order
 * @param userAnswer - The user's selected angle IDs in order
 * @returns True if the answer is correct
 */
export function isAnswerCorrect(question: Question, userAnswer: string[] | null): boolean {
  if (!userAnswer || userAnswer.length !== 4) {
    return false;
  }

  // Compare user answer to correct order
  return arraysEqual(userAnswer, question.correctOrder);
}

/**
 * Generate detailed results for each question in the test
 * @param session - The completed test session
 * @returns Array of question results with correctness information
 */
export function generateQuestionResults(session: TestSession): QuestionResult[] {
  if (!session.isCompleted || !session.questions) {
    return [];
  }

  return session.questions.map((question, index) => {
    const userAnswer = session.userAnswers[index] || [];
    const isCorrect = isAnswerCorrect(question, userAnswer);

    return {
      questionId: question.id,
      userAnswer,
      correctAnswer: question.correctOrder,
      isCorrect,
    };
  });
}

/**
 * Calculate completion time in a human-readable format
 * @param session - The completed test session
 * @returns Formatted completion time string
 */
export function getCompletionTime(session: TestSession): string {
  if (!session.startTime || !session.endTime) {
    return 'Unknown';
  }

  const totalSeconds = Math.floor((session.endTime - session.startTime) / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;

  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

/**
 * Get performance statistics for a test session
 * @param session - The completed test session
 * @returns Performance statistics object
 */
export function getPerformanceStats(session: TestSession) {
  const score = calculateScore(session);
  const percentage = Math.round((score / 15) * 100);
  const completionTime = getCompletionTime(session);
  const questionResults = generateQuestionResults(session);

  return {
    score,
    totalQuestions: 15,
    percentage,
    completionTime,
    questionResults,
    passedQuestions: questionResults.filter(q => q.isCorrect).length,
    failedQuestions: questionResults.filter(q => !q.isCorrect).length,
  };
}

/**
 * Utility function to compare two arrays for equality
 * @param arr1 - First array
 * @param arr2 - Second array
 * @returns True if arrays are equal
 */
function arraysEqual(arr1: string[], arr2: string[]): boolean {
  if (arr1.length !== arr2.length) {
    return false;
  }

  for (let i = 0; i < arr1.length; i++) {
    if (arr1[i] !== arr2[i]) {
      return false;
    }
  }

  return true;
}

/**
 * Get a performance level description based on score
 * @param score - Score out of 15
 * @returns Performance level description
 */
export function getPerformanceLevel(score: number): {
  level: string;
  description: string;
  color: string;
} {
  const percentage = (score / 15) * 100;

  if (percentage >= 90) {
    return {
      level: 'Excellent',
      description: 'Outstanding performance! You have excellent angle discrimination skills.',
      color: 'text-green-600',
    };
  } else if (percentage >= 80) {
    return {
      level: 'Good',
      description: 'Good performance! You have solid angle discrimination skills.',
      color: 'text-blue-600',
    };
  } else if (percentage >= 70) {
    return {
      level: 'Fair',
      description: 'Fair performance. Consider more practice to improve your skills.',
      color: 'text-yellow-600',
    };
  } else if (percentage >= 60) {
    return {
      level: 'Needs Improvement',
      description: 'Your angle discrimination skills need improvement. More practice recommended.',
      color: 'text-orange-600',
    };
  } else {
    return {
      level: 'Poor',
      description: 'Significant improvement needed. Focus on practicing angle discrimination.',
      color: 'text-red-600',
    };
  }
}