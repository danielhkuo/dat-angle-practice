/**
 * Unit tests for the angle generation system
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  generateAngleSet,
  generateQuestion,
  generateTestQuestions,
  getCorrectOrder,
  validateQuestion,
} from '../angleGenerator';
import { Angle, Question } from '@/types';

describe('angleGenerator', () => {
  beforeEach(() => {
    // Reset random seed for consistent testing
    vi.spyOn(Math, 'random').mockRestore();
  });

  describe('generateAngleSet', () => {
    it('should generate exactly 4 angles', () => {
      const baseAngle = 45;
      const angleSet = generateAngleSet(baseAngle);
      
      expect(angleSet).toHaveLength(4);
    });

    it('should include the base angle', () => {
      const baseAngle = 45;
      const angleSet = generateAngleSet(baseAngle);
      
      expect(angleSet).toContain(baseAngle);
    });

    it('should generate angles with small differences', () => {
      const baseAngle = 45;
      const angleSet = generateAngleSet(baseAngle);
      const sortedAngles = [...angleSet].sort((a, b) => a - b);
      
      // Check that consecutive angles have differences between 2-5 degrees (approximately)
      for (let i = 1; i < sortedAngles.length; i++) {
        const difference = sortedAngles[i] - sortedAngles[i - 1];
        expect(difference).toBeGreaterThan(0.5); // Minimum uniqueness threshold
        expect(difference).toBeLessThan(10); // Reasonable maximum for challenging questions
      }
    });

    it('should generate unique angles', () => {
      const baseAngle = 45;
      const angleSet = generateAngleSet(baseAngle);
      const uniqueAngles = new Set(angleSet.map(angle => Math.round(angle * 10)));
      
      expect(uniqueAngles.size).toBe(4);
    });

    it('should keep angles within valid range (0-180)', () => {
      const testCases = [10, 45, 90, 135, 170];
      
      testCases.forEach(baseAngle => {
        const angleSet = generateAngleSet(baseAngle);
        
        angleSet.forEach(angle => {
          expect(angle).toBeGreaterThanOrEqual(0);
          expect(angle).toBeLessThanOrEqual(180);
        });
      });
    });

    it('should handle edge case of base angle near 180', () => {
      const baseAngle = 175;
      const angleSet = generateAngleSet(baseAngle);
      
      expect(angleSet).toHaveLength(4);
      angleSet.forEach(angle => {
        expect(angle).toBeGreaterThanOrEqual(0);
        expect(angle).toBeLessThanOrEqual(180);
      });
    });

    it('should handle edge case of base angle near 0', () => {
      const baseAngle = 5;
      const angleSet = generateAngleSet(baseAngle);
      
      expect(angleSet).toHaveLength(4);
      angleSet.forEach(angle => {
        expect(angle).toBeGreaterThanOrEqual(0);
        expect(angle).toBeLessThanOrEqual(180);
      });
    });
  });

  describe('generateQuestion', () => {
    it('should generate a question with correct structure', () => {
      const questionId = 1;
      const question = generateQuestion(questionId);
      
      expect(question.id).toBe(questionId);
      expect(question.angles).toHaveLength(4);
      expect(question.correctOrder).toHaveLength(4);
    });

    it('should generate angles with unique IDs', () => {
      const question = generateQuestion(1);
      const angleIds = question.angles.map(angle => angle.id);
      const uniqueIds = new Set(angleIds);
      
      expect(uniqueIds.size).toBe(4);
    });

    it('should generate angles with visual properties', () => {
      const question = generateQuestion(1);
      
      question.angles.forEach(angle => {
        expect(angle.id).toBeDefined();
        expect(typeof angle.degrees).toBe('number');
        expect(typeof angle.rotation).toBe('number');
        expect(typeof angle.armLength1).toBe('number');
        expect(typeof angle.armLength2).toBe('number');
        
        // Check ranges
        expect(angle.degrees).toBeGreaterThanOrEqual(0);
        expect(angle.degrees).toBeLessThanOrEqual(180);
        expect(angle.rotation).toBeGreaterThanOrEqual(0);
        expect(angle.rotation).toBeLessThan(360);
        expect(angle.armLength1).toBeGreaterThanOrEqual(80);
        expect(angle.armLength1).toBeLessThanOrEqual(140);
        expect(angle.armLength2).toBeGreaterThanOrEqual(80);
        expect(angle.armLength2).toBeLessThanOrEqual(140);
      });
    });

    it('should generate correct order that matches actual angle ordering', () => {
      const question = generateQuestion(1);
      const expectedOrder = getCorrectOrder(question.angles);
      
      expect(question.correctOrder).toEqual(expectedOrder);
    });

    it('should generate different questions for different IDs', () => {
      const question1 = generateQuestion(1);
      const question2 = generateQuestion(2);
      
      expect(question1.id).not.toBe(question2.id);
      
      // While angles might occasionally be similar due to randomness,
      // the IDs should be different
      const ids1 = question1.angles.map(a => a.id).sort();
      const ids2 = question2.angles.map(a => a.id).sort();
      expect(ids1).not.toEqual(ids2);
    });

    it('should handle multiple generations without errors', () => {
      // Test that we can generate many questions without issues
      for (let i = 1; i <= 50; i++) {
        expect(() => generateQuestion(i)).not.toThrow();
      }
    });
  });

  describe('generateTestQuestions', () => {
    it('should generate exactly 15 questions', () => {
      const questions = generateTestQuestions();
      
      expect(questions).toHaveLength(15);
    });

    it('should generate questions with sequential IDs', () => {
      const questions = generateTestQuestions();
      
      questions.forEach((question, index) => {
        expect(question.id).toBe(index + 1);
      });
    });

    it('should generate valid questions', () => {
      const questions = generateTestQuestions();
      
      questions.forEach(question => {
        expect(validateQuestion(question)).toBe(true);
      });
    });
  });

  describe('getCorrectOrder', () => {
    it('should return angle IDs sorted by degrees', () => {
      const angles: Angle[] = [
        { id: 'a', degrees: 60, rotation: 0, armLength1: 100, armLength2: 100 },
        { id: 'b', degrees: 30, rotation: 0, armLength1: 100, armLength2: 100 },
        { id: 'c', degrees: 90, rotation: 0, armLength1: 100, armLength2: 100 },
        { id: 'd', degrees: 45, rotation: 0, armLength1: 100, armLength2: 100 },
      ];
      
      const correctOrder = getCorrectOrder(angles);
      
      expect(correctOrder).toEqual(['b', 'd', 'a', 'c']);
    });

    it('should handle angles with decimal degrees', () => {
      const angles: Angle[] = [
        { id: 'a', degrees: 45.5, rotation: 0, armLength1: 100, armLength2: 100 },
        { id: 'b', degrees: 45.2, rotation: 0, armLength1: 100, armLength2: 100 },
        { id: 'c', degrees: 45.8, rotation: 0, armLength1: 100, armLength2: 100 },
        { id: 'd', degrees: 45.1, rotation: 0, armLength1: 100, armLength2: 100 },
      ];
      
      const correctOrder = getCorrectOrder(angles);
      
      expect(correctOrder).toEqual(['d', 'b', 'a', 'c']);
    });

    it('should not modify the original array', () => {
      const angles: Angle[] = [
        { id: 'a', degrees: 60, rotation: 0, armLength1: 100, armLength2: 100 },
        { id: 'b', degrees: 30, rotation: 0, armLength1: 100, armLength2: 100 },
      ];
      const originalOrder = angles.map(a => a.id);
      
      getCorrectOrder(angles);
      
      expect(angles.map(a => a.id)).toEqual(originalOrder);
    });
  });

  describe('validateQuestion', () => {
    const createValidQuestion = (): Question => ({
      id: 1,
      angles: [
        { id: 'a', degrees: 30, rotation: 0, armLength1: 100, armLength2: 100 },
        { id: 'b', degrees: 45, rotation: 90, armLength1: 110, armLength2: 120 },
        { id: 'c', degrees: 60, rotation: 180, armLength1: 90, armLength2: 130 },
        { id: 'd', degrees: 75, rotation: 270, armLength1: 140, armLength2: 80 },
      ],
      correctOrder: ['a', 'b', 'c', 'd'],
    });

    it('should validate a correct question', () => {
      const question = createValidQuestion();
      
      expect(validateQuestion(question)).toBe(true);
    });

    it('should reject question with missing ID', () => {
      const question = createValidQuestion();
      // @ts-expect-error - Testing invalid input
      question.id = undefined;
      
      expect(validateQuestion(question)).toBe(false);
    });

    it('should reject question with wrong number of angles', () => {
      const question = createValidQuestion();
      question.angles = question.angles.slice(0, 3);
      
      expect(validateQuestion(question)).toBe(false);
    });

    it('should reject question with duplicate angle IDs', () => {
      const question = createValidQuestion();
      question.angles[1].id = question.angles[0].id;
      
      expect(validateQuestion(question)).toBe(false);
    });

    it('should reject question with incorrect correctOrder', () => {
      const question = createValidQuestion();
      question.correctOrder = ['d', 'c', 'b', 'a']; // Reverse order
      
      expect(validateQuestion(question)).toBe(false);
    });

    it('should reject question with mismatched correctOrder IDs', () => {
      const question = createValidQuestion();
      question.correctOrder = ['a', 'b', 'c', 'x']; // 'x' doesn't exist
      
      expect(validateQuestion(question)).toBe(false);
    });

    it('should reject question with wrong correctOrder length', () => {
      const question = createValidQuestion();
      question.correctOrder = ['a', 'b', 'c']; // Missing one ID
      
      expect(validateQuestion(question)).toBe(false);
    });
  });

  describe('Edge cases and error handling', () => {
    it('should handle extreme angle values gracefully', () => {
      const extremeAngles = [0, 0.1, 179.9, 180];
      
      extremeAngles.forEach(baseAngle => {
        expect(() => generateAngleSet(baseAngle)).not.toThrow();
        const angleSet = generateAngleSet(baseAngle);
        expect(angleSet).toHaveLength(4);
      });
    });

    it('should generate consistent results with mocked random', () => {
      // Mock Math.random to return predictable values
      const mockRandom = vi.spyOn(Math, 'random');
      mockRandom.mockReturnValue(0.5);
      
      const question1 = generateQuestion(1);
      const question2 = generateQuestion(1);
      
      // With the same random seed, questions should be identical
      expect(question1.angles.map(a => a.degrees)).toEqual(question2.angles.map(a => a.degrees));
      
      mockRandom.mockRestore();
    });

    it('should handle rapid successive generations', () => {
      const startTime = Date.now();
      const questions = [];
      
      // Generate 100 questions rapidly
      for (let i = 0; i < 100; i++) {
        questions.push(generateQuestion(i + 1));
      }
      
      const endTime = Date.now();
      const duration = endTime - startTime;
      
      // Should complete within reasonable time (less than 1 second)
      expect(duration).toBeLessThan(1000);
      expect(questions).toHaveLength(100);
      
      // All questions should be valid
      questions.forEach(question => {
        expect(validateQuestion(question)).toBe(true);
      });
    });
  });

  describe('Statistical properties', () => {
    it('should generate angles with reasonable distribution', () => {
      const questions = generateTestQuestions();
      const allDegrees = questions.flatMap(q => q.angles.map(a => a.degrees));
      
      // Check that we have a reasonable spread of angles
      const minDegree = Math.min(...allDegrees);
      const maxDegree = Math.max(...allDegrees);
      
      expect(minDegree).toBeGreaterThanOrEqual(0);
      expect(maxDegree).toBeLessThanOrEqual(180);
      expect(maxDegree - minDegree).toBeGreaterThan(50); // Should have good spread
    });

    it('should generate varied visual properties', () => {
      const questions = generateTestQuestions();
      const allAngles = questions.flatMap(q => q.angles);
      
      // Check rotation variety
      const rotations = allAngles.map(a => a.rotation);
      const uniqueRotations = new Set(rotations.map(r => Math.floor(r / 10) * 10)); // Group by 10s
      expect(uniqueRotations.size).toBeGreaterThan(10); // Should have varied rotations
      
      // Check arm length variety
      const armLengths1 = allAngles.map(a => a.armLength1);
      const armLengths2 = allAngles.map(a => a.armLength2);
      
      expect(Math.max(...armLengths1) - Math.min(...armLengths1)).toBeGreaterThan(20);
      expect(Math.max(...armLengths2) - Math.min(...armLengths2)).toBeGreaterThan(20);
    });
  });
});