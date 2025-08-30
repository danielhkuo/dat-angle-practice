import { TestSession } from '@/types';

// Storage configuration
const STORAGE_KEYS = {
  TEST_HISTORY: 'dat-angle-practice-history',
  SETTINGS: 'dat-angle-practice-settings',
  CURRENT_SESSION: 'dat-angle-practice-current-session'
} as const;

const DEFAULT_SETTINGS = {
  maxStoredTests: 50,
  lastCleanup: Date.now()
};

interface StorageSettings {
  maxStoredTests: number;
  lastCleanup: number;
}

/**
 * Check if localStorage is available and functional
 */
function isLocalStorageAvailable(): boolean {
  try {
    const testKey = '__localStorage_test__';
    localStorage.setItem(testKey, 'test');
    localStorage.removeItem(testKey);
    return true;
  } catch {
    return false;
  }
}

/**
 * Safely parse JSON from localStorage with error handling
 */
function safeParseJSON<T>(value: string | null, fallback: T): T {
  if (!value) return fallback;
  
  try {
    return JSON.parse(value) as T;
  } catch (error) {
    console.warn('Failed to parse JSON from localStorage:', error);
    return fallback;
  }
}

/**
 * Get storage settings with defaults
 */
function getStorageSettings(): StorageSettings {
  if (!isLocalStorageAvailable()) {
    return DEFAULT_SETTINGS;
  }

  const settingsJson = localStorage.getItem(STORAGE_KEYS.SETTINGS);
  return safeParseJSON(settingsJson, DEFAULT_SETTINGS);
}

/**
 * Update storage settings
 */
function updateStorageSettings(settings: Partial<StorageSettings>): void {
  if (!isLocalStorageAvailable()) return;

  const currentSettings = getStorageSettings();
  const newSettings = { ...currentSettings, ...settings };
  
  try {
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(newSettings));
  } catch (error) {
    console.warn('Failed to update storage settings:', error);
  }
}

/**
 * Validate test session data structure
 */
function isValidTestSession(data: unknown): data is TestSession {
  if (!data || typeof data !== 'object' || data === null) {
    return false;
  }
  
  const obj = data as Record<string, unknown>;
  
  return (
    typeof obj.id === 'string' &&
    Array.isArray(obj.questions) &&
    Array.isArray(obj.userAnswers) &&
    typeof obj.startTime === 'number' &&
    typeof obj.isCompleted === 'boolean' &&
    obj.questions.length === 15 &&
    obj.userAnswers.length === 15
  );
}

/**
 * Clean up old test sessions using FIFO logic
 */
function cleanupOldSessions(sessions: TestSession[], maxSessions: number): TestSession[] {
  if (sessions.length <= maxSessions) {
    return sessions;
  }

  // Sort by startTime (oldest first) and keep only the most recent maxSessions
  const sortedSessions = [...sessions].sort((a, b) => a.startTime - b.startTime);
  const sessionsToKeep = sortedSessions.slice(-maxSessions);
  
  console.log(`Cleaned up ${sessions.length - sessionsToKeep.length} old test sessions`);
  return sessionsToKeep;
}

/**
 * Save a completed test session to localStorage
 */
export function saveTestSession(session: TestSession): boolean {
  if (!isLocalStorageAvailable()) {
    console.warn('localStorage is not available. Test session will not be saved.');
    return false;
  }

  if (!isValidTestSession(session)) {
    console.error('Invalid test session data. Cannot save to localStorage.');
    return false;
  }

  try {
    // Get current test history
    const currentHistory = getTestHistory();
    
    // Add new session
    const updatedHistory = [...currentHistory, session];
    
    // Apply FIFO cleanup
    const settings = getStorageSettings();
    const cleanedHistory = cleanupOldSessions(updatedHistory, settings.maxStoredTests);
    
    // Save updated history
    localStorage.setItem(STORAGE_KEYS.TEST_HISTORY, JSON.stringify(cleanedHistory));
    
    // Update cleanup timestamp
    updateStorageSettings({ lastCleanup: Date.now() });
    
    console.log(`Test session ${session.id} saved successfully`);
    return true;
  } catch (error) {
    console.error('Failed to save test session:', error);
    
    // If storage is full, try to clean up and retry once
    if (error instanceof DOMException && error.name === 'QuotaExceededError') {
      try {
        const currentHistory = getTestHistory();
        const settings = getStorageSettings();
        const reducedHistory = cleanupOldSessions(currentHistory, Math.floor(settings.maxStoredTests / 2));
        
        localStorage.setItem(STORAGE_KEYS.TEST_HISTORY, JSON.stringify(reducedHistory));
        localStorage.setItem(STORAGE_KEYS.TEST_HISTORY, JSON.stringify([...reducedHistory, session]));
        
        console.log('Storage cleanup successful, test session saved');
        return true;
      } catch (retryError) {
        console.error('Failed to save test session even after cleanup:', retryError);
      }
    }
    
    return false;
  }
}

/**
 * Get all test sessions from localStorage
 */
export function getTestHistory(): TestSession[] {
  if (!isLocalStorageAvailable()) {
    return [];
  }

  try {
    const historyJson = localStorage.getItem(STORAGE_KEYS.TEST_HISTORY);
    const rawHistory = safeParseJSON(historyJson, []);
    
    // Validate and filter out corrupted sessions
    const validSessions: TestSession[] = rawHistory.filter((session: unknown) => {
      const isValid = isValidTestSession(session);
      if (!isValid) {
        console.warn('Found corrupted test session, removing:', session);
      }
      return isValid;
    });
    
    // If we filtered out corrupted data, save the cleaned version
    if (validSessions.length !== rawHistory.length) {
      localStorage.setItem(STORAGE_KEYS.TEST_HISTORY, JSON.stringify(validSessions));
    }
    
    // Sort by startTime (most recent first)
    return validSessions.sort((a, b) => b.startTime - a.startTime);
  } catch (error) {
    console.error('Failed to retrieve test history:', error);
    
    // Clear corrupted data
    try {
      localStorage.removeItem(STORAGE_KEYS.TEST_HISTORY);
    } catch (clearError) {
      console.error('Failed to clear corrupted test history:', clearError);
    }
    
    return [];
  }
}

/**
 * Save current test session for recovery
 */
export function saveCurrentSession(session: TestSession): boolean {
  if (!isLocalStorageAvailable()) {
    return false;
  }

  try {
    localStorage.setItem(STORAGE_KEYS.CURRENT_SESSION, JSON.stringify(session));
    return true;
  } catch (error) {
    console.warn('Failed to save current session for recovery:', error);
    return false;
  }
}

/**
 * Get current test session for recovery
 */
export function getCurrentSession(): TestSession | null {
  if (!isLocalStorageAvailable()) {
    return null;
  }

  try {
    const sessionJson = localStorage.getItem(STORAGE_KEYS.CURRENT_SESSION);
    const session = safeParseJSON(sessionJson, null);
    
    if (session && isValidTestSession(session)) {
      return session;
    }
    
    // Clear invalid session data
    localStorage.removeItem(STORAGE_KEYS.CURRENT_SESSION);
    return null;
  } catch (error) {
    console.warn('Failed to retrieve current session:', error);
    
    // Clear corrupted data
    try {
      localStorage.removeItem(STORAGE_KEYS.CURRENT_SESSION);
    } catch (clearError) {
      console.error('Failed to clear corrupted current session:', clearError);
    }
    
    return null;
  }
}

/**
 * Clear current session (called when test is completed or abandoned)
 */
export function clearCurrentSession(): void {
  if (!isLocalStorageAvailable()) {
    return;
  }

  try {
    localStorage.removeItem(STORAGE_KEYS.CURRENT_SESSION);
  } catch (error) {
    console.warn('Failed to clear current session:', error);
  }
}

/**
 * Get a specific test session by ID
 */
export function getTestSessionById(sessionId: string): TestSession | null {
  const history = getTestHistory();
  return history.find(session => session.id === sessionId) || null;
}

/**
 * Delete a specific test session
 */
export function deleteTestSession(sessionId: string): boolean {
  if (!isLocalStorageAvailable()) {
    return false;
  }

  try {
    const history = getTestHistory();
    const filteredHistory = history.filter(session => session.id !== sessionId);
    
    if (filteredHistory.length === history.length) {
      // Session not found
      return false;
    }
    
    localStorage.setItem(STORAGE_KEYS.TEST_HISTORY, JSON.stringify(filteredHistory));
    return true;
  } catch (error) {
    console.error('Failed to delete test session:', error);
    return false;
  }
}

/**
 * Clear all test history
 */
export function clearAllTestHistory(): boolean {
  if (!isLocalStorageAvailable()) {
    return false;
  }

  try {
    localStorage.removeItem(STORAGE_KEYS.TEST_HISTORY);
    localStorage.removeItem(STORAGE_KEYS.CURRENT_SESSION);
    return true;
  } catch (error) {
    console.error('Failed to clear test history:', error);
    return false;
  }
}

/**
 * Get storage usage information
 */
export function getStorageInfo(): {
  isAvailable: boolean;
  testCount: number;
  hasCurrentSession: boolean;
} {
  const isAvailable = isLocalStorageAvailable();
  
  if (!isAvailable) {
    return {
      isAvailable: false,
      testCount: 0,
      hasCurrentSession: false
    };
  }

  const history = getTestHistory();
  const currentSession = getCurrentSession();

  return {
    isAvailable: true,
    testCount: history.length,
    hasCurrentSession: currentSession !== null
  };
}