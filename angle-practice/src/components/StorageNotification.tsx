'use client';

import React, { useState, useEffect } from 'react';
import { getStorageInfo } from '@/lib/storage';

interface StorageNotificationProps {
  onDismiss?: () => void;
}

export function StorageNotification({ onDismiss }: StorageNotificationProps) {
  const [storageInfo, setStorageInfo] = useState<{
    isAvailable: boolean;
    testCount: number;
    hasCurrentSession: boolean;
  } | null>(null);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    const info = getStorageInfo();
    setStorageInfo(info);

    // Check if user has previously dismissed storage warnings
    const dismissedKey = 'dat-storage-warning-dismissed';
    try {
      const wasDismissed = localStorage.getItem(dismissedKey) === 'true';
      setDismissed(wasDismissed);
    } catch {
      // If localStorage isn't available, don't show as dismissed
      setDismissed(false);
    }
  }, []);

  const handleDismiss = () => {
    setDismissed(true);
    
    // Try to remember dismissal
    try {
      localStorage.setItem('dat-storage-warning-dismissed', 'true');
    } catch {
      // Ignore if localStorage isn't available
    }
    
    if (onDismiss) {
      onDismiss();
    }
  };

  // Don't show notification if dismissed or if storage is available
  if (dismissed || !storageInfo || storageInfo.isAvailable) {
    return null;
  }

  return (
    <div className="fixed top-4 left-4 right-4 z-50 max-w-md mx-auto">
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 shadow-lg">
        <div className="flex items-start">
          <div className="flex-shrink-0">
            <svg
              className="w-5 h-5 text-yellow-400"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                clipRule="evenodd"
              />
            </svg>
          </div>
          <div className="ml-3 flex-1">
            <h3 className="text-sm font-medium text-yellow-800">
              Storage Not Available
            </h3>
            <p className="mt-1 text-sm text-yellow-700">
              Your browser&apos;s local storage is disabled or unavailable. 
              Test results won&apos;t be saved, but you can still take practice tests.
            </p>
          </div>
          <div className="ml-4 flex-shrink-0">
            <button
              onClick={handleDismiss}
              className="inline-flex text-yellow-400 hover:text-yellow-600 focus:outline-none focus:text-yellow-600"
            >
              <span className="sr-only">Dismiss</span>
              <svg className="w-5 h-5" viewBox="0 0 20 20" fill="currentColor">
                <path
                  fillRule="evenodd"
                  d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                  clipRule="evenodd"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Hook for storage error notifications
export function useStorageNotifications() {
  const [notifications, setNotifications] = useState<Array<{
    id: string;
    type: 'warning' | 'error' | 'info';
    title: string;
    message: string;
    timestamp: number;
  }>>([]);

  const addNotification = (
    type: 'warning' | 'error' | 'info',
    title: string,
    message: string
  ) => {
    const notification = {
      id: `${Date.now()}-${Math.random()}`,
      type,
      title,
      message,
      timestamp: Date.now()
    };

    setNotifications(prev => [...prev, notification]);

    // Auto-remove after 5 seconds for non-error notifications
    if (type !== 'error') {
      setTimeout(() => {
        setNotifications(prev => prev.filter(n => n.id !== notification.id));
      }, 5000);
    }
  };

  const removeNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const clearAllNotifications = () => {
    setNotifications([]);
  };

  return {
    notifications,
    addNotification,
    removeNotification,
    clearAllNotifications
  };
}

// Notification display component
export function NotificationContainer() {
  const { notifications, removeNotification } = useStorageNotifications();

  if (notifications.length === 0) {
    return null;
  }

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2 max-w-sm">
      {notifications.map(notification => (
        <div
          key={notification.id}
          className={`rounded-lg p-4 shadow-lg ${
            notification.type === 'error'
              ? 'bg-red-50 border border-red-200'
              : notification.type === 'warning'
              ? 'bg-yellow-50 border border-yellow-200'
              : 'bg-blue-50 border border-blue-200'
          }`}
        >
          <div className="flex items-start">
            <div className="flex-shrink-0">
              {notification.type === 'error' && (
                <svg className="w-5 h-5 text-red-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              )}
              {notification.type === 'warning' && (
                <svg className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              )}
              {notification.type === 'info' && (
                <svg className="w-5 h-5 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
              )}
            </div>
            <div className="ml-3 flex-1">
              <h3 className={`text-sm font-medium ${
                notification.type === 'error'
                  ? 'text-red-800'
                  : notification.type === 'warning'
                  ? 'text-yellow-800'
                  : 'text-blue-800'
              }`}>
                {notification.title}
              </h3>
              <p className={`mt-1 text-sm ${
                notification.type === 'error'
                  ? 'text-red-700'
                  : notification.type === 'warning'
                  ? 'text-yellow-700'
                  : 'text-blue-700'
              }`}>
                {notification.message}
              </p>
            </div>
            <div className="ml-4 flex-shrink-0">
              <button
                onClick={() => removeNotification(notification.id)}
                className={`inline-flex ${
                  notification.type === 'error'
                    ? 'text-red-400 hover:text-red-600'
                    : notification.type === 'warning'
                    ? 'text-yellow-400 hover:text-yellow-600'
                    : 'text-blue-400 hover:text-blue-600'
                } focus:outline-none`}
              >
                <span className="sr-only">Dismiss</span>
                <svg className="w-5 h-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}