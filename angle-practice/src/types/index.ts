/**
 * Core TypeScript interfaces for the DAT Angle Practice application
 */

export interface Angle {
  id: string; // Unique identifier within question
  degrees: number; // Actual angle value (e.g., 45.5)
  rotation: number; // Visual rotation 0-359 degrees
  armLength1: number; // First arm length in pixels
  armLength2: number; // Second arm length in pixels
}

export interface Question {
  id: number; // Question number (1-15)
  angles: Angle[]; // Array of 4 angles in shuffled order
  correctOrder: string[]; // Angle IDs sorted by degrees ascending
}

export interface TestSession {
  id: string; // Unique session ID (timestamp-based)
  questions: Question[]; // All 15 questions
  userAnswers: (string[] | null)[]; // User's angle ID selections
  startTime: number; // Test start timestamp
  endTime: number | null; // Test completion timestamp
  isCompleted: boolean; // Completion status
  score?: number; // Final score (0-15)
}

export interface TestState {
  currentSession: TestSession | null;
  currentQuestionIndex: number;
  timeRemaining: number; // Seconds remaining
  isActive: boolean; // Test in progress
  currentSelections: string[]; // Current question selections
}

// Utility types for answer tracking and test state management
export type UserAnswer = string[] | null;

export type TestAction =
  | { type: "START_TEST"; payload: TestSession }
  | { type: "SELECT_ANGLE"; payload: string }
  | { type: "DESELECT_ANGLE"; payload: string }
  | { type: "CLEAR_SELECTIONS" }
  | { type: "NEXT_QUESTION" }
  | { type: "SUBMIT_TEST" }
  | { type: "UPDATE_TIMER"; payload: number }
  | { type: "END_TEST" }
  | { type: "LOAD_SESSION"; payload: TestSession }
  | { type: "RESET_TEST" };

export interface TestContextType {
  state: TestState;
  dispatch: React.Dispatch<TestAction>;
}

// Storage-related types
export interface StorageSchema {
  'dat-angle-practice-history': TestSession[];
  'dat-angle-practice-settings': {
    maxStoredTests: number;
    lastCleanup: number;
  };
}

// Answer tracking types
export type SelectionState = {
  angleId: string;
  position: number; // 1-4 for ranking position
};

export type QuestionResult = {
  questionId: number;
  userAnswer: string[];
  correctAnswer: string[];
  isCorrect: boolean;
  timeSpent?: number;
};

// Test status types
export type TestStatus = 'not_started' | 'in_progress' | 'completed' | 'abandoned';

// Timer-related types
export interface TimerState {
  totalTime: number; // Total test time in seconds (600 for 10 minutes)
  remainingTime: number; // Time remaining in seconds
  isRunning: boolean;
  warningThreshold: number; // Time in seconds when to show warning (60 for 1 minute)
}

// Error handling types
export type StorageError = 'quota_exceeded' | 'unavailable' | 'corrupted' | 'unknown';

export interface AppError {
  type: 'storage' | 'generation' | 'rendering' | 'timer';
  message: string;
  details?: unknown;
}

// Component prop types
export interface AngleDisplayProps {
  angle: Angle;
  isSelected: boolean;
  selectionOrder?: number;
  onClick: (angleId: string) => void;
  disabled?: boolean;
}

export interface TimerProps {
  timeRemaining: number;
  onTimeUp: () => void;
  warningThreshold?: number;
}

export interface AnswerSlotsProps {
  selections: string[];
  angles: Angle[];
  onClear: () => void;
}
