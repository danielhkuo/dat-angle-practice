import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import {
  saveTestSession,
  getTestHistory,
  saveCurrentSession,
  getCurrentSession,
  clearCurrentSession,
  getTestSessionById,
  deleteTestSession,
  clearAllTestHistory,
  getStorageInfo
} from '../storage';
import { TestSession } from '@/types';

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  
  return {
    getItem: vi.fn((key: string) => store[key] || null),
    setItem: vi.fn((key: string, value: string) => {
      store[key] = value;
    }),
    removeItem: vi.fn((key: string) => {
      delete store[key];
    }),
    clear: vi.fn(() => {
      store = {};
    }),
    get length() {
      return Object.keys(store).length;
    },
    key: vi.fn((index: number) => Object.keys(store)[index] || null)
  };
})();

// Mock console methods
const consoleMock = {
  warn: vi.fn(),
  error: vi.fn(),
  log: vi.fn()
};

describe('Storage', () => {
  beforeEach(() => {
    // Reset localStorage mock
    localStorageMock.clear();
    vi.clearAllMocks();
    
    // Mock global localStorage
    Object.defineProperty(window, 'localStorage', {
      value: localStorageMock,
      writable: true
    });
    
    // Mock console methods
    vi.spyOn(console, 'warn').mockImplementation(consoleMock.warn);
    vi.spyOn(console, 'error').mockImplementation(consoleMock.error);
    vi.spyOn(console, 'log').mockImplementation(consoleMock.log);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  // Helper function to create a valid test session
  const createTestSession = (id: string = 'test-session-1', isCompleted: boolean = true): TestSession => ({
    id,
    questions: Array(15).fill(null).map((_, i) => ({
      id: i + 1,
      angles: [
        { id: 'a1', degrees: 30, rotation: 0, armLength1: 100, armLength2: 120 },
        { id: 'a2', degrees: 45, rotation: 90, armLength1: 110, armLength2: 130 },
        { id: 'a3', degrees: 60, rotation: 180, armLength1: 120, armLength2: 140 },
        { id: 'a4', degrees: 75, rotation: 270, armLength1: 130, armLength2: 150 }
      ],
      correctOrder: ['a1', 'a2', 'a3', 'a4']
    })),
    userAnswers: Array(15).fill(['a1', 'a2', 'a3', 'a4']),
    startTime: Date.now() - 600000, // 10 minutes ago
    endTime: isCompleted ? Date.now() : null,
    isCompleted,
    score: isCompleted ? 15 : undefined
  });

  describe('saveTestSession', () => {
    it('should save a valid test session successfully', () => {
      const session = createTestSession();
      const result = saveTestSession(session);
      
      expect(result).toBe(true);
      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'dat-angle-practice-history',
        expect.stringContaining(session.id)
      );
    });

    it('should return false when localStorage is not available', () => {
      // Mock localStorage to throw an error
      localStorageMock.setItem.mockImplementation(() => {
        throw new Error('localStorage not available');
      });
      
      const session = createTestSession();
      const result = saveTestSession(session);
      
      expect(result).toBe(false);
      expect(consoleMock.warn).toHaveBeenCalledWith(
        expect.stringContaining('localStorage is not available')
      );
    });

    it('should return false for invalid test session data', () => {
      const invalidSession = { id: 'invalid', questions: [] } as unknown as TestSession;
      const result = saveTestSession(invalidSession);
      
      expect(result).toBe(false);
      expect(consoleMock.error).toHaveBeenCalledWith(
        expect.stringContaining('Invalid test session data')
      );
    });

    it('should handle storage errors gracefully', () => {
      // Mock setItem to throw a generic error
      localStorageMock.setItem.mockImplementationOnce(() => {
        throw new Error('Storage error');
      });
      
      const session = createTestSession();
      const result = saveTestSession(session);
      
      // Should return false when storage fails
      expect(result).toBe(false);
    });

    it('should apply FIFO cleanup when max sessions exceeded', () => {
      // Save multiple sessions to trigger cleanup
      const sessions = Array(55).fill(null).map((_, i) => 
        createTestSession(`session-${i}`, true)
      );
      
      sessions.forEach(session => {
        saveTestSession(session);
      });
      
      const history = getTestHistory();
      expect(history.length).toBeLessThanOrEqual(50);
      expect(consoleMock.log).toHaveBeenCalledWith(
        expect.stringContaining('Cleaned up')
      );
    });
  });

  describe('getTestHistory', () => {
    it('should return empty array when no history exists', () => {
      const history = getTestHistory();
      expect(history).toEqual([]);
    });

    it('should return saved test sessions sorted by start time', () => {
      const session1 = createTestSession('session-1');
      const session2 = createTestSession('session-2');
      session2.startTime = session1.startTime + 1000; // 1 second later
      
      saveTestSession(session1);
      saveTestSession(session2);
      
      const history = getTestHistory();
      expect(history).toHaveLength(2);
      expect(history[0].id).toBe('session-2'); // Most recent first
      expect(history[1].id).toBe('session-1');
    });

    it('should filter out corrupted sessions', () => {
      // Manually add corrupted data
      localStorageMock.setItem('dat-angle-practice-history', JSON.stringify([
        createTestSession('valid-session'),
        { id: 'corrupted', questions: 'invalid' }, // Corrupted data
        createTestSession('another-valid-session')
      ]));
      
      const history = getTestHistory();
      expect(history).toHaveLength(2);
      expect(history.every(session => session.id.includes('valid'))).toBe(true);
      expect(consoleMock.warn).toHaveBeenCalledWith(
        'Found corrupted test session, removing:',
        expect.objectContaining({ id: 'corrupted' })
      );
    });

    it('should return empty array when localStorage is not available', () => {
      // Mock localStorage to not be available
      Object.defineProperty(window, 'localStorage', {
        value: undefined,
        writable: true
      });
      
      const history = getTestHistory();
      expect(history).toEqual([]);
    });

    it('should handle corrupted localStorage data gracefully', () => {
      // Mock getItem to return invalid JSON
      localStorageMock.getItem.mockReturnValueOnce('invalid-json');
      
      const history = getTestHistory();
      expect(history).toEqual([]);
      // Function should handle the error gracefully and return empty array
    });
  });

  describe('saveCurrentSession and getCurrentSession', () => {
    it('should save and retrieve current session', () => {
      const session = createTestSession('current-session', false);
      
      const saveResult = saveCurrentSession(session);
      expect(saveResult).toBe(true);
      
      const retrievedSession = getCurrentSession();
      expect(retrievedSession).toEqual(session);
    });

    it('should return null when no current session exists', () => {
      const session = getCurrentSession();
      expect(session).toBeNull();
    });

    it('should clear invalid current session data', () => {
      localStorageMock.setItem('dat-angle-practice-current-session', 'invalid-json');
      
      const session = getCurrentSession();
      expect(session).toBeNull();
      expect(localStorageMock.removeItem).toHaveBeenCalledWith('dat-angle-practice-current-session');
    });
  });

  describe('clearCurrentSession', () => {
    it('should clear current session', () => {
      const session = createTestSession('current-session', false);
      saveCurrentSession(session);
      
      clearCurrentSession();
      
      const retrievedSession = getCurrentSession();
      expect(retrievedSession).toBeNull();
      expect(localStorageMock.removeItem).toHaveBeenCalledWith('dat-angle-practice-current-session');
    });

    it('should handle errors gracefully when localStorage is unavailable', () => {
      // Mock localStorage to not be available
      Object.defineProperty(window, 'localStorage', {
        value: undefined,
        writable: true
      });
      
      // Should not throw and should handle gracefully
      expect(() => clearCurrentSession()).not.toThrow();
      // No warning expected when localStorage is simply unavailable
    });
  });

  describe('getTestSessionById', () => {
    it('should return session by ID', () => {
      const session = createTestSession('target-session');
      saveTestSession(session);
      
      const foundSession = getTestSessionById('target-session');
      expect(foundSession).toEqual(session);
    });

    it('should return null for non-existent session', () => {
      const foundSession = getTestSessionById('non-existent');
      expect(foundSession).toBeNull();
    });
  });

  describe('deleteTestSession', () => {
    it('should delete existing session', () => {
      const session1 = createTestSession('session-1');
      const session2 = createTestSession('session-2');
      
      saveTestSession(session1);
      saveTestSession(session2);
      
      const result = deleteTestSession('session-1');
      expect(result).toBe(true);
      
      const history = getTestHistory();
      expect(history).toHaveLength(1);
      expect(history[0].id).toBe('session-2');
    });

    it('should return false for non-existent session', () => {
      const result = deleteTestSession('non-existent');
      expect(result).toBe(false);
    });
  });

  describe('clearAllTestHistory', () => {
    it('should clear all test history and current session', () => {
      const session = createTestSession();
      saveTestSession(session);
      saveCurrentSession(session);
      
      const result = clearAllTestHistory();
      expect(result).toBe(true);
      
      expect(getTestHistory()).toEqual([]);
      expect(getCurrentSession()).toBeNull();
    });

    it('should handle errors gracefully when localStorage is unavailable', () => {
      // Mock localStorage to not be available
      Object.defineProperty(window, 'localStorage', {
        value: undefined,
        writable: true
      });
      
      const result = clearAllTestHistory();
      expect(result).toBe(false);
      // No error expected when localStorage is simply unavailable
    });
  });

  describe('getStorageInfo', () => {
    it('should return correct storage information', () => {
      const session1 = createTestSession('session-1');
      const session2 = createTestSession('session-2', false);
      
      saveTestSession(session1);
      saveCurrentSession(session2);
      
      const info = getStorageInfo();
      expect(info).toEqual({
        isAvailable: true,
        testCount: 1,
        hasCurrentSession: true
      });
    });

    it('should handle localStorage unavailability', () => {
      Object.defineProperty(window, 'localStorage', {
        value: undefined,
        writable: true
      });
      
      const info = getStorageInfo();
      expect(info).toEqual({
        isAvailable: false,
        testCount: 0,
        hasCurrentSession: false
      });
    });
  });
});