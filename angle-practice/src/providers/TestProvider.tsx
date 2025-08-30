'use client';

import React, { createContext, useContext, useReducer, useCallback, useEffect } from 'react';
import { TestState, TestAction, TestSession, TestContextType, Question } from '@/types';
import { generateTestQuestions } from '@/lib/angleGenerator';
import { saveCurrentSession, clearCurrentSession } from '@/lib/storage';

// Initial state for the test
const initialState: TestState = {
  currentSession: null,
  currentQuestionIndex: 0,
  timeRemaining: 600, // 10 minutes in seconds
  isActive: false,
  currentSelections: [],
};

// Test state reducer
function testReducer(state: TestState, action: TestAction): TestState {
  switch (action.type) {
    case 'START_TEST':
      return {
        ...state,
        currentSession: action.payload,
        currentQuestionIndex: 0,
        timeRemaining: 600, // 10 minutes
        isActive: true,
        currentSelections: [],
      };

    case 'SELECT_ANGLE': {
      const angleId = action.payload;
      const currentSelections = [...state.currentSelections];
      
      // If angle is already selected, remove it and all subsequent selections
      const existingIndex = currentSelections.indexOf(angleId);
      if (existingIndex !== -1) {
        return {
          ...state,
          currentSelections: currentSelections.slice(0, existingIndex),
        };
      }
      
      // If we have 4 selections, don't add more
      if (currentSelections.length >= 4) {
        return state;
      }
      
      // Add the new selection
      return {
        ...state,
        currentSelections: [...currentSelections, angleId],
      };
    }

    case 'DESELECT_ANGLE': {
      const angleId = action.payload;
      const currentSelections = [...state.currentSelections];
      const index = currentSelections.indexOf(angleId);
      
      if (index !== -1) {
        // Remove this selection and all subsequent ones
        return {
          ...state,
          currentSelections: currentSelections.slice(0, index),
        };
      }
      
      return state;
    }

    case 'CLEAR_SELECTIONS':
      return {
        ...state,
        currentSelections: [],
      };

    case 'NEXT_QUESTION': {
      if (!state.currentSession || state.currentSelections.length !== 4) {
        return state;
      }

      // Save current answer to session
      const updatedSession = {
        ...state.currentSession,
        userAnswers: [
          ...state.currentSession.userAnswers.slice(0, state.currentQuestionIndex),
          state.currentSelections,
          ...state.currentSession.userAnswers.slice(state.currentQuestionIndex + 1),
        ],
      };

      // Check if this was the last question
      const isLastQuestion = state.currentQuestionIndex >= 14;
      
      if (isLastQuestion) {
        // Complete the test
        const completedSession = {
          ...updatedSession,
          endTime: Date.now(),
          isCompleted: true,
        };
        
        return {
          ...state,
          currentSession: completedSession,
          isActive: false,
          currentSelections: [],
        };
      }

      // Move to next question
      return {
        ...state,
        currentSession: updatedSession,
        currentQuestionIndex: state.currentQuestionIndex + 1,
        currentSelections: [],
      };
    }

    case 'SUBMIT_TEST': {
      if (!state.currentSession) {
        return state;
      }

      // Save current answer if there are selections
      const updatedAnswers = [...state.currentSession.userAnswers];
      if (state.currentSelections.length > 0) {
        updatedAnswers[state.currentQuestionIndex] = state.currentSelections;
      }

      const completedSession = {
        ...state.currentSession,
        userAnswers: updatedAnswers,
        endTime: Date.now(),
        isCompleted: true,
      };

      return {
        ...state,
        currentSession: completedSession,
        isActive: false,
        currentSelections: [],
      };
    }

    case 'UPDATE_TIMER':
      return {
        ...state,
        timeRemaining: Math.max(0, action.payload),
      };

    case 'END_TEST': {
      if (!state.currentSession) {
        return state;
      }

      const endedSession = {
        ...state.currentSession,
        endTime: Date.now(),
        isCompleted: true,
      };

      return {
        ...state,
        currentSession: endedSession,
        isActive: false,
        currentSelections: [],
      };
    }

    case 'LOAD_SESSION':
      return {
        ...state,
        currentSession: action.payload,
        currentQuestionIndex: 0,
        timeRemaining: 600,
        isActive: false,
        currentSelections: [],
      };

    case 'RESET_TEST':
      return {
        ...initialState,
      };

    default:
      return state;
  }
}

// Create the context
const TestContext = createContext<TestContextType | undefined>(undefined);

// Provider component
interface TestProviderProps {
  children: React.ReactNode;
}

export function TestProvider({ children }: TestProviderProps) {
  const [state, dispatch] = useReducer(testReducer, initialState);

  // Timer effect
  useEffect(() => {
    if (!state.isActive || state.timeRemaining <= 0) {
      return;
    }

    const timer = setInterval(() => {
      dispatch({ type: 'UPDATE_TIMER', payload: state.timeRemaining - 1 });
      
      // Auto-submit when time runs out
      if (state.timeRemaining <= 1) {
        dispatch({ type: 'SUBMIT_TEST' });
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [state.isActive, state.timeRemaining]);

  // Save session to localStorage whenever it changes
  useEffect(() => {
    if (state.currentSession) {
      if (state.currentSession.isCompleted) {
        // Clear current session and save to history
        clearCurrentSession();
      } else if (state.isActive) {
        // Save current session for recovery
        saveCurrentSession(state.currentSession);
      }
    }
  }, [state.currentSession, state.isActive]);

  const contextValue: TestContextType = {
    state,
    dispatch,
  };

  return (
    <TestContext.Provider value={contextValue}>
      {children}
    </TestContext.Provider>
  );
}

// Custom hook to use the test context
export function useTest() {
  const context = useContext(TestContext);
  if (context === undefined) {
    throw new Error('useTest must be used within a TestProvider');
  }
  return context;
}

// Helper hooks for common operations
export function useTestActions() {
  const { dispatch } = useTest();

  const startNewTest = useCallback(() => {
    const questions = generateTestQuestions();
    const session: TestSession = {
      id: `test-${Date.now()}`,
      questions,
      userAnswers: new Array(15).fill(null),
      startTime: Date.now(),
      endTime: null,
      isCompleted: false,
    };
    
    dispatch({ type: 'START_TEST', payload: session });
  }, [dispatch]);

  const selectAngle = useCallback((angleId: string) => {
    dispatch({ type: 'SELECT_ANGLE', payload: angleId });
  }, [dispatch]);

  const deselectAngle = useCallback((angleId: string) => {
    dispatch({ type: 'DESELECT_ANGLE', payload: angleId });
  }, [dispatch]);

  const clearSelections = useCallback(() => {
    dispatch({ type: 'CLEAR_SELECTIONS' });
  }, [dispatch]);

  const nextQuestion = useCallback(() => {
    dispatch({ type: 'NEXT_QUESTION' });
  }, [dispatch]);

  const submitTest = useCallback(() => {
    dispatch({ type: 'SUBMIT_TEST' });
  }, [dispatch]);

  const resetTest = useCallback(() => {
    dispatch({ type: 'RESET_TEST' });
  }, [dispatch]);

  const loadSession = useCallback((session: TestSession) => {
    dispatch({ type: 'LOAD_SESSION', payload: session });
  }, [dispatch]);

  return {
    startNewTest,
    selectAngle,
    deselectAngle,
    clearSelections,
    nextQuestion,
    submitTest,
    resetTest,
    loadSession,
  };
}

// Helper hooks for accessing specific state
export function useCurrentQuestion(): Question | null {
  const { state } = useTest();
  
  if (!state.currentSession || state.currentQuestionIndex >= state.currentSession.questions.length) {
    return null;
  }
  
  return state.currentSession.questions[state.currentQuestionIndex];
}

export function useTestProgress() {
  const { state } = useTest();
  
  return {
    currentQuestionIndex: state.currentQuestionIndex,
    totalQuestions: state.currentSession?.questions.length || 15,
    progress: state.currentSession ? ((state.currentQuestionIndex + 1) / state.currentSession.questions.length) * 100 : 0,
    isLastQuestion: state.currentQuestionIndex >= 14,
  };
}

export function useTestTimer() {
  const { state } = useTest();
  
  const minutes = Math.floor(state.timeRemaining / 60);
  const seconds = state.timeRemaining % 60;
  const formattedTime = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  const isWarning = state.timeRemaining <= 60; // Warning when 1 minute or less
  
  return {
    timeRemaining: state.timeRemaining,
    formattedTime,
    isWarning,
    isActive: state.isActive,
  };
}

export function useSelectionState() {
  const { state } = useTest();
  
  const canProceed = state.currentSelections.length === 4;
  const selectionCount = state.currentSelections.length;
  
  return {
    currentSelections: state.currentSelections,
    canProceed,
    selectionCount,
    isAngleSelected: (angleId: string) => state.currentSelections.includes(angleId),
    getSelectionOrder: (angleId: string) => {
      const index = state.currentSelections.indexOf(angleId);
      return index !== -1 ? index + 1 : null;
    },
  };
}