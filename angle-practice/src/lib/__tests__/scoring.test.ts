/**
 * Unit tests for the scoring system
 */

import { describe, it, expect } from 'vitest';
import {
  calculateScore,
  isAnswerCorrect,
  generateQuestionResults,
  getCompletionTime,
  getPerformanceStats,
  getPerformanceLevel,
} from '../scoring';
import { TestSession, Question, Angle } from '@/types';

// Test data helpers
const createMockAngle = (id: string, degrees: number): Angle => ({
  id,
  degrees,
  rotation: 0,
  armLength1: 100,
  armLength2: 120,
});

const createMockQuestion = (id: number, angleData: Array<{ id: string; degrees: number }>): Question => {
  const angles = angleData.map(data => createMockAngle(data.id, data.degrees));
  const correctOrder = [...angles]
    .sort((a, b) => a.degrees - b.degrees)
    .map(angle => angle.id);

  return {
    id,
    angles,
    correctOrder,
  };
};

const createMockSession = (
  questions: Question[],
  userAnswers: (string[] | null)[],
  isCompleted: boolean = true,
  startTime: number = Date.now() - 600000, // 10 minutes ago
  endTime: number | null = Date.now()
): TestSession => ({
  id: 'test-session-1',
  questions,
  userAnswers,
  startTime,
  endTime,
  isCompleted,
});

describe('scoring system', () => {
  describe('isAnswerCorrect', () => {
    it('should return true for correct answer', () => {
      const question = createMockQuestion(1, [
        { id: 'a', degrees: 30 },
        { id: 'b', degrees: 45 },
        { id: 'c', degrees: 60 },
        { id: 'd', degrees: 75 },
      ]);

      const userAnswer = ['a', 'b', 'c', 'd']; // Correct order
      expect(isAnswerCorrect(question, userAnswer)).toBe(true);
    });

    it('should return false for incorrect answer', () => {
      const question = createMockQuestion(1, [
        { id: 'a', degrees: 30 },
        { id: 'b', degrees: 45 },
        { id: 'c', degrees: 60 },
        { id: 'd', degrees: 75 },
      ]);

      const userAnswer = ['b', 'a', 'c', 'd']; // Wrong order
      expect(isAnswerCorrect(question, userAnswer)).toBe(false);
    });

    it('should return false for null answer', () => {
      const question = createMockQuestion(1, [
        { id: 'a', degrees: 30 },
        { id: 'b', degrees: 45 },
        { id: 'c', degrees: 60 },
        { id: 'd', degrees: 75 },
      ]);

      expect(isAnswerCorrect(question, null)).toBe(false);
    });

    it('should return false for incomplete answer', () => {
      const question = createMockQuestion(1, [
        { id: 'a', degrees: 30 },
        { id: 'b', degrees: 45 },
        { id: 'c', degrees: 60 },
        { id: 'd', degrees: 75 },
      ]);

      const userAnswer = ['a', 'b']; // Only 2 selections
      expect(isAnswerCorrect(question, userAnswer)).toBe(false);
    });
  });

  describe('calculateScore', () => {
    it('should calculate correct score for perfect test', () => {
      const questions = Array.from({ length: 15 }, (_, i) =>
        createMockQuestion(i + 1, [
          { id: `${i}-a`, degrees: 30 + i },
          { id: `${i}-b`, degrees: 45 + i },
          { id: `${i}-c`, degrees: 60 + i },
          { id: `${i}-d`, degrees: 75 + i },
        ])
      );

      const userAnswers = questions.map(q => q.correctOrder);
      const session = createMockSession(questions, userAnswers);

      expect(calculateScore(session)).toBe(15);
    });

    it('should calculate correct score for partial correct test', () => {
      const questions = Array.from({ length: 15 }, (_, i) =>
        createMockQuestion(i + 1, [
          { id: `${i}-a`, degrees: 30 + i },
          { id: `${i}-b`, degrees: 45 + i },
          { id: `${i}-c`, degrees: 60 + i },
          { id: `${i}-d`, degrees: 75 + i },
        ])
      );

      // First 10 correct, last 5 incorrect
      const userAnswers = questions.map((q, i) => {
        if (i < 10) {
          return q.correctOrder;
        } else {
          // Return reversed order for incorrect answers
          return [...q.correctOrder].reverse();
        }
      });

      const session = createMockSession(questions, userAnswers);
      expect(calculateScore(session)).toBe(10);
    });

    it('should return 0 for incomplete session', () => {
      const questions = [createMockQuestion(1, [
        { id: 'a', degrees: 30 },
        { id: 'b', degrees: 45 },
        { id: 'c', degrees: 60 },
        { id: 'd', degrees: 75 },
      ])];

      const session = createMockSession(questions, [null], false);
      expect(calculateScore(session)).toBe(0);
    });

    it('should handle null answers correctly', () => {
      const questions = Array.from({ length: 15 }, (_, i) =>
        createMockQuestion(i + 1, [
          { id: `${i}-a`, degrees: 30 + i },
          { id: `${i}-b`, degrees: 45 + i },
          { id: `${i}-c`, degrees: 60 + i },
          { id: `${i}-d`, degrees: 75 + i },
        ])
      );

      // Mix of correct answers and null answers
      const userAnswers = questions.map((q, i) => {
        if (i % 2 === 0) {
          return q.correctOrder;
        } else {
          return null;
        }
      });

      const session = createMockSession(questions, userAnswers);
      expect(calculateScore(session)).toBe(8); // 8 correct out of 15
    });
  });

  describe('getCompletionTime', () => {
    it('should format completion time correctly', () => {
      const startTime = Date.now() - 300000; // 5 minutes ago
      const endTime = Date.now();
      const session = createMockSession([], [], true, startTime, endTime);

      const completionTime = getCompletionTime(session);
      expect(completionTime).toBe('5:00');
    });

    it('should handle seconds correctly', () => {
      const startTime = Date.now() - 125000; // 2 minutes 5 seconds ago
      const endTime = Date.now();
      const session = createMockSession([], [], true, startTime, endTime);

      const completionTime = getCompletionTime(session);
      expect(completionTime).toBe('2:05');
    });

    it('should return "Unknown" for missing timestamps', () => {
      const session = createMockSession([], [], true, 0, null);
      expect(getCompletionTime(session)).toBe('Unknown');
    });
  });

  describe('generateQuestionResults', () => {
    it('should generate correct question results', () => {
      const questions = [
        createMockQuestion(1, [
          { id: 'a', degrees: 30 },
          { id: 'b', degrees: 45 },
          { id: 'c', degrees: 60 },
          { id: 'd', degrees: 75 },
        ]),
        createMockQuestion(2, [
          { id: 'e', degrees: 20 },
          { id: 'f', degrees: 35 },
          { id: 'g', degrees: 50 },
          { id: 'h', degrees: 65 },
        ]),
      ];

      const userAnswers = [
        questions[0].correctOrder, // Correct
        [...questions[1].correctOrder].reverse(), // Incorrect
      ];

      const session = createMockSession(questions, userAnswers);
      const results = generateQuestionResults(session);

      expect(results).toHaveLength(2);
      expect(results[0].isCorrect).toBe(true);
      expect(results[1].isCorrect).toBe(false);
      expect(results[0].questionId).toBe(1);
      expect(results[1].questionId).toBe(2);
    });

    it('should return empty array for incomplete session', () => {
      const session = createMockSession([], [], false);
      const results = generateQuestionResults(session);
      expect(results).toEqual([]);
    });
  });

  describe('getPerformanceStats', () => {
    it('should generate comprehensive performance stats', () => {
      const questions = Array.from({ length: 15 }, (_, i) =>
        createMockQuestion(i + 1, [
          { id: `${i}-a`, degrees: 30 + i },
          { id: `${i}-b`, degrees: 45 + i },
          { id: `${i}-c`, degrees: 60 + i },
          { id: `${i}-d`, degrees: 75 + i },
        ])
      );

      // 12 correct, 3 incorrect
      const userAnswers = questions.map((q, i) => {
        if (i < 12) {
          return q.correctOrder;
        } else {
          return [...q.correctOrder].reverse();
        }
      });

      const session = createMockSession(questions, userAnswers);
      const stats = getPerformanceStats(session);

      expect(stats.score).toBe(12);
      expect(stats.totalQuestions).toBe(15);
      expect(stats.percentage).toBe(80);
      expect(stats.passedQuestions).toBe(12);
      expect(stats.failedQuestions).toBe(3);
      expect(stats.questionResults).toHaveLength(15);
    });
  });

  describe('getPerformanceLevel', () => {
    it('should return excellent for 90%+ scores', () => {
      const level = getPerformanceLevel(14); // 93.3%
      expect(level.level).toBe('Excellent');
      expect(level.color).toBe('text-green-600');
    });

    it('should return good for 80-89% scores', () => {
      const level = getPerformanceLevel(12); // 80%
      expect(level.level).toBe('Good');
      expect(level.color).toBe('text-blue-600');
    });

    it('should return fair for 70-79% scores', () => {
      const level = getPerformanceLevel(11); // 73.3%
      expect(level.level).toBe('Fair');
      expect(level.color).toBe('text-yellow-600');
    });

    it('should return needs improvement for 60-69% scores', () => {
      const level = getPerformanceLevel(9); // 60%
      expect(level.level).toBe('Needs Improvement');
      expect(level.color).toBe('text-orange-600');
    });

    it('should return poor for <60% scores', () => {
      const level = getPerformanceLevel(8); // 53.3%
      expect(level.level).toBe('Poor');
      expect(level.color).toBe('text-red-600');
    });
  });
});