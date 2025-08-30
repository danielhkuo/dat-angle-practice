/**
 * Angle Generation System for DAT Angle Practice
 *
 * This module provides robust algorithms for generating challenging angle sets
 * that meet the requirements for realistic DAT practice questions.
 */

import { Angle, Question } from "@/types";

// Configuration constants for angle generation
const ANGLE_CONFIG = {
  // Visual property ranges
  ARM_LENGTH: { min: 50, max: 180 },
  ARM_LENGTH_MIN_DIFF: 30, // Minimum difference between arm lengths
  ROTATION_RANGE: { min: 0, max: 359 },

  // Constraints
  MAX_GENERATION_ATTEMPTS: 50,
  UNIQUENESS_THRESHOLD: 0.5, // Minimum degree difference for uniqueness

  // Reference points for angle discrimination
  REFERENCE_POINTS: [0, 30, 45, 60, 90, 120, 135, 150, 180],

  // Base difficulty multipliers for different regions
  DIFFICULTY_ZONES: {
    // Near-straight angles (easiest reference)
    NEAR_STRAIGHT: { min: 160, max: 180, baseDifficulty: 0.3 },

    // Near-right angles (strong reference point)
    NEAR_RIGHT: { min: 75, max: 105, baseDifficulty: 0.4 },

    // Near 45° and 135° (moderate references)
    NEAR_45: { min: 30, max: 60, baseDifficulty: 0.7 },
    NEAR_135: { min: 120, max: 150, baseDifficulty: 0.6 },

    // Mid-ranges (hardest - no clear references)
    MID_ACUTE: { min: 15, max: 30, baseDifficulty: 0.8 },
    MID_OBTUSE: { min: 105, max: 120, baseDifficulty: 0.8 },

    // Very acute (moderate - approaching zero)
    VERY_ACUTE: { min: 5, max: 15, baseDifficulty: 0.5 },
  },
} as const;

/**
 * Calculates the perceptual difficulty of distinguishing two angles
 * @param angle1 - First angle in degrees
 * @param angle2 - Second angle in degrees
 * @returns Difficulty score (higher = harder to distinguish)
 */
function calculateDiscriminationDifficulty(
  angle1: number,
  angle2: number
): number {
  const diff = Math.abs(angle2 - angle1);
  const avgAngle = (angle1 + angle2) / 2;

  // Find distance to nearest reference point
  const distanceToReference = Math.min(
    ...ANGLE_CONFIG.REFERENCE_POINTS.map((ref) => Math.abs(avgAngle - ref))
  );

  // Base difficulty increases as we get further from reference points
  const referenceDifficulty = Math.min(distanceToReference / 15, 1); // Cap at 15° distance

  // Smaller degree differences are exponentially harder
  const deltaDifficulty = Math.pow(6 / Math.max(diff, 0.5), 1.5);

  return referenceDifficulty * deltaDifficulty;
}

/**
 * Determines which difficulty zone an angle falls into
 * @param angle - Angle in degrees
 * @returns Zone configuration object
 */
function getDifficultyZone(angle: number) {
  const zones = ANGLE_CONFIG.DIFFICULTY_ZONES;

  for (const [zoneName, zone] of Object.entries(zones)) {
    if (angle >= zone.min && angle <= zone.max) {
      return { ...zone, name: zoneName };
    }
  }

  // Default to mid-acute (hardest) for edge cases
  return { ...zones.MID_ACUTE, name: "MID_ACUTE" };
}

/**
 * Generates a set of 4 unique angles with balanced difficulty distribution
 * @param baseAngle - Starting angle value
 * @returns Array of 4 angle degree values
 */
export function generateAngleSet(baseAngle: number): number[] {
  const angles: number[] = [];
  const targetDifficulties = [0.3, 0.5, 0.8]; // Easy, medium, hard pairs

  // Start with base angle
  angles.push(baseAngle);

  // Generate 3 additional angles to create pairs with target difficulties
  for (let i = 0; i < 3; i++) {
    const targetDifficulty = targetDifficulties[i];
    let bestAngle = baseAngle;
    let bestScore = Infinity;

    // Try multiple candidates to find one that matches target difficulty
    for (let attempt = 0; attempt < 20; attempt++) {
      // Generate candidate angle with varying deltas
      const delta = 1 + Math.random() * 12; // 1-13 degree range
      const direction = Math.random() < 0.5 ? 1 : -1;
      const candidate = baseAngle + delta * direction;

      // Ensure within valid range
      if (candidate < 5 || candidate > 175) continue;

      // Calculate actual difficulty
      const actualDifficulty = calculateDiscriminationDifficulty(
        baseAngle,
        candidate
      );
      const difficultyError = Math.abs(actualDifficulty - targetDifficulty);

      // Check if this is closer to our target
      if (difficultyError < bestScore) {
        bestScore = difficultyError;
        bestAngle = candidate;
      }
    }

    angles.push(bestAngle);
  }

  // Sort angles
  angles.sort((a, b) => a - b);

  // Ensure minimum separation to avoid identical angles
  for (let i = 1; i < angles.length; i++) {
    if (angles[i] - angles[i - 1] < 0.8) {
      angles[i] = angles[i - 1] + 0.8 + Math.random() * 0.5;
    }
  }

  return angles;
}

/**
 * Selects an appropriate base angle from different difficulty zones
 * @returns Base angle value
 */
function selectBaseAngle(): number {
  const zones = Object.values(ANGLE_CONFIG.DIFFICULTY_ZONES);
  const selectedZone = zones[Math.floor(Math.random() * zones.length)];

  // Select a base angle from the middle of the chosen zone
  const zoneRange = selectedZone.max - selectedZone.min;
  const centerOffset = zoneRange * 0.2; // Stay away from zone edges

  return (
    selectedZone.min +
    centerOffset +
    Math.random() * (zoneRange - 2 * centerOffset)
  );
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

  // Generate varied arm lengths with significant difference between them
  const armLength1 =
    ANGLE_CONFIG.ARM_LENGTH.min +
    Math.random() * (ANGLE_CONFIG.ARM_LENGTH.max - ANGLE_CONFIG.ARM_LENGTH.min);

  // Ensure second arm is significantly different from first
  let armLength2;
  do {
    armLength2 =
      ANGLE_CONFIG.ARM_LENGTH.min +
      Math.random() *
        (ANGLE_CONFIG.ARM_LENGTH.max - ANGLE_CONFIG.ARM_LENGTH.min);
  } while (
    Math.abs(armLength2 - armLength1) < ANGLE_CONFIG.ARM_LENGTH_MIN_DIFF
  );

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
    if (
      sortedAngles[i] - sortedAngles[i - 1] <
      ANGLE_CONFIG.UNIQUENESS_THRESHOLD
    ) {
      return false;
    }
  }

  // Check that all angles are within valid range
  return angles.every((angle) => angle >= 0 && angle <= 180);
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
    console.warn(
      `Question ${questionId}: Using fallback angle generation after ${attempts} attempts`
    );
    angleSet = [30, 35, 40, 45]; // Simple fallback set
  }

  // Create Angle objects with visual properties
  const angles = angleSet.map((degrees, index) =>
    addVisualProperties(degrees, index)
  );

  // Create correct order (sorted by degrees ascending)
  const correctOrder = [...angles]
    .sort((a, b) => a.degrees - b.degrees)
    .map((angle) => angle.id);

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
    .map((angle) => angle.id);
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
  const angleIds = question.angles.map((a) => a.id);
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
