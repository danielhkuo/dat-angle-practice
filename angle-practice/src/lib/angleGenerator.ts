/**
 * Angle Generation System for DAT Angle Practice
 * 
 * This module provides robust algorithms for generating challenging angle sets
 * that meet the requirements for realistic DAT practice questions.
 */

import { Angle, Question } from '@/types';

// Configuration constants for angle generation
const ANGLE_CONFIG = {
  // Minimum and maximum degree differences between angles
  MIN_DELTA: 2,
  MAX_DELTA: 5,
  
  // Angle ranges for different difficulty levels
  ACUTE_RANGE: { min: 15, max: 85 },
  OBTUSE_RANGE: { min: 95, max: 165 },
  
  // Visual property ranges
  ARM_LENGTH: { min: 60, max: 160 },
  ROTATION_RANGE: { min: 0, max: 359 },
  
  // Constraints
  MAX_GENERATION_ATTEMPTS: 50,
  UNIQUENESS_THRESHOLD: 0.5, // Minimum degree difference for uniqueness
} as const;

/**
 * Generates a set of 4 unique angles with small degree differences
 * @param baseAngle - Starting angle value
 * @returns Array of 4 angle degree values
 */
export function generateAngleSet(baseAngle: number): number[] {
  const angles: number[] = [baseAngle];
  
  // Generate 3 additional angles with increasing deltas
  for (let i = 1; i < 4; i++) {
    const delta = ANGLE_CONFIG.MIN_DELTA + Math.random() * (ANGLE_CONFIG.MAX_DELTA - ANGLE_CONFIG.MIN_DELTA);
    const newAngle = angles[i - 1] + delta;
    
    // Ensure angle stays within valid range (0-180 degrees)
    if (newAngle > 180) {
      // If we exceed 180, work backwards from the base angle
      const backwardDelta = ANGLE_CONFIG.MIN_DELTA + Math.random() * (ANGLE_CONFIG.MAX_DELTA - ANGLE_CONFIG.MIN_DELTA);
      angles.push(Math.max(0, baseAngle - backwardDelta * i));
    } else {
      angles.push(newAngle);
    }
  }
  
  // Sort to ensure proper ordering and verify uniqueness
  angles.sort((a, b) => a - b);
  
  // Verify all angles are unique (minimum threshold difference)
  for (let i = 1; i < angles.length; i++) {
    if (angles[i] - angles[i - 1] < ANGLE_CONFIG.UNIQUENESS_THRESHOLD) {
      // Adjust the angle to maintain uniqueness
      angles[i] = angles[i - 1] + ANGLE_CONFIG.UNIQUENESS_THRESHOLD + Math.random();
    }
  }
  
  return angles;
}

/**
 * Selects an appropriate base angle based on difficulty and variety
 * @returns Base angle value
 */
function selectBaseAngle(): number {
  const angleTypes = ['acute', 'obtuse', 'mixed'] as const;
  const selectedType = angleTypes[Math.floor(Math.random() * angleTypes.length)];
  
  switch (selectedType) {
    case 'acute':
      return ANGLE_CONFIG.ACUTE_RANGE.min + 
             Math.random() * (ANGLE_CONFIG.ACUTE_RANGE.max - ANGLE_CONFIG.ACUTE_RANGE.min);
    
    case 'obtuse':
      return ANGLE_CONFIG.OBTUSE_RANGE.min + 
             Math.random() * (ANGLE_CONFIG.OBTUSE_RANGE.max - ANGLE_CONFIG.OBTUSE_RANGE.min);
    
    case 'mixed':
      // For mixed, start with a mid-range angle that allows for both acute and obtuse
      return 70 + Math.random() * 40; // 70-110 degree range
    
    default:
      return 45; // Fallback
  }
}

/**
 * Adds visual properties to an angle (rotation, arm lengths)
 * @param degrees - The angle value in degrees
 * @param index - Index for generating unique visual properties
 * @returns Complete Angle object with visual properties
 */
function addVisualProperties(degrees: number, index: number): Angle {
  // Generate unique ID
  const id = `angle-${index}-${Math.round(degrees * 100)}`;
  
  // Generate random rotation (0-359 degrees)
  const rotation = Math.floor(Math.random() * ANGLE_CONFIG.ROTATION_RANGE.max);
  
  // Generate varied arm lengths for visual diversity
  const armLength1 = ANGLE_CONFIG.ARM_LENGTH.min + 
                     Math.random() * (ANGLE_CONFIG.ARM_LENGTH.max - ANGLE_CONFIG.ARM_LENGTH.min);
  const armLength2 = ANGLE_CONFIG.ARM_LENGTH.min + 
                     Math.random() * (ANGLE_CONFIG.ARM_LENGTH.max - ANGLE_CONFIG.ARM_LENGTH.min);
  
  return {
    id,
    degrees: Math.round(degrees * 10) / 10, // Round to 1 decimal place
    rotation,
    armLength1: Math.round(armLength1),
    armLength2: Math.round(armLength2),
  };
}

/**
 * Shuffles an array using Fisher-Yates algorithm
 * @param array - Array to shuffle
 * @returns New shuffled array
 */
function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

/**
 * Validates that a set of angles meets quality requirements
 * @param angles - Array of angle degree values
 * @returns True if angles meet quality standards
 */
function validateAngleSet(angles: number[]): boolean {
  if (angles.length !== 4) return false;
  
  // Check for uniqueness
  const sortedAngles = [...angles].sort((a, b) => a - b);
  for (let i = 1; i < sortedAngles.length; i++) {
    if (sortedAngles[i] - sortedAngles[i - 1] < ANGLE_CONFIG.UNIQUENESS_THRESHOLD) {
      return false;
    }
  }
  
  // Check that all angles are within valid range
  return angles.every(angle => angle >= 0 && angle <= 180);
}

/**
 * Generates a complete Question object with 4 unique angles
 * @param questionId - Question number (1-15)
 * @returns Complete Question object
 */
export function generateQuestion(questionId: number): Question {
  let attempts = 0;
  let angleSet: number[] = [];
  
  // Generate valid angle set with retry logic
  while (attempts < ANGLE_CONFIG.MAX_GENERATION_ATTEMPTS) {
    const baseAngle = selectBaseAngle();
    angleSet = generateAngleSet(baseAngle);
    
    if (validateAngleSet(angleSet)) {
      break;
    }
    
    attempts++;
  }
  
  // Fallback to simple generation if max attempts reached
  if (attempts >= ANGLE_CONFIG.MAX_GENERATION_ATTEMPTS) {
    console.warn(`Question ${questionId}: Using fallback angle generation after ${attempts} attempts`);
    angleSet = [30, 35, 40, 45]; // Simple fallback set
  }
  
  // Create Angle objects with visual properties
  const angles = angleSet.map((degrees, index) => addVisualProperties(degrees, index));
  
  // Create correct order (sorted by degrees ascending)
  const correctOrder = [...angles]
    .sort((a, b) => a.degrees - b.degrees)
    .map(angle => angle.id);
  
  // Shuffle angles for display
  const shuffledAngles = shuffleArray(angles);
  
  return {
    id: questionId,
    angles: shuffledAngles,
    correctOrder,
  };
}

/**
 * Generates a complete test session with 15 questions
 * @returns Array of 15 Question objects
 */
export function generateTestQuestions(): Question[] {
  const questions: Question[] = [];
  
  for (let i = 1; i <= 15; i++) {
    questions.push(generateQuestion(i));
  }
  
  return questions;
}

/**
 * Utility function to get the correct ranking of angles by degrees
 * @param angles - Array of Angle objects
 * @returns Array of angle IDs sorted by degrees (smallest to largest)
 */
export function getCorrectOrder(angles: Angle[]): string[] {
  return [...angles]
    .sort((a, b) => a.degrees - b.degrees)
    .map(angle => angle.id);
}

/**
 * Utility function to validate a generated question
 * @param question - Question object to validate
 * @returns True if question is valid
 */
export function validateQuestion(question: Question): boolean {
  // Check basic structure
  if (!question.id || !question.angles || !question.correctOrder) {
    return false;
  }
  
  // Check angle count
  if (question.angles.length !== 4 || question.correctOrder.length !== 4) {
    return false;
  }
  
  // Check that all angles have unique IDs
  const angleIds = question.angles.map(a => a.id);
  const uniqueIds = new Set(angleIds);
  if (uniqueIds.size !== 4) {
    return false;
  }
  
  // Check that correctOrder contains all angle IDs
  const correctOrderSet = new Set(question.correctOrder);
  const angleIdSet = new Set(angleIds);
  if (correctOrderSet.size !== angleIdSet.size) {
    return false;
  }
  
  for (const id of angleIds) {
    if (!correctOrderSet.has(id)) {
      return false;
    }
  }
  
  // Verify correct order is actually correct
  const expectedOrder = getCorrectOrder(question.angles);
  if (JSON.stringify(expectedOrder) !== JSON.stringify(question.correctOrder)) {
    return false;
  }
  
  return true;
}