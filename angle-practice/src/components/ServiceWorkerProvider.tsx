'use client';

import React, { useEffect, useState } from 'react';
import { useServiceWorker } from '@/lib/serviceWorker';

interface ServiceWorkerProviderProps {
  children: React.ReactNode;
}

export function ServiceWorkerProvider({ children }: ServiceWorkerProviderProps) {
  const [showUpdatePrompt, setShowUpdatePrompt] = useState(false);
  const [isOfflineNotified, setIsOfflineNotified] = useState(false);

  const {
    isOfflineMode,
    skipWaiting
  } = useServiceWorker({
    onSuccess: () => {
      console.log('Service worker registered successfully');
    },
    onUpdate: () => {
      console.log('Service worker update available');
      setShowUpdatePrompt(true);
    },
    onError: (error) => {
      console.error('Service worker registration failed:', error);
    }
  });

  // Show offline notification
  useEffect(() => {
    if (isOfflineMode && !isOfflineNotified) {
      setIsOfflineNotified(true);
      // You could show a toast notification here
      console.log('App is now offline');
    } else if (!isOfflineMode && isOfflineNotified) {
      setIsOfflineNotified(false);
      console.log('App is back online');
    }
  }, [isOfflineMode, isOfflineNotified]);

  const handleUpdateApp = async () => {
    try {
      await skipWaiting();
      setShowUpdatePrompt(false);
      // The page will reload automatically when the new service worker takes control
    } catch (error) {
      console.error('Failed to update app:', error);
    }
  };

  const handleDismissUpdate = () => {
    setShowUpdatePrompt(false);
  };

  return (
    <>
      {children}
      
      {/* Offline indicator */}
      {isOfflineMode && (
        <div className="fixed bottom-4 left-4 bg-yellow-100 border border-yellow-300 rounded-lg p-3 shadow-lg z-50">
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse"></div>
            <span className="text-sm font-medium text-yellow-800">
              You&apos;re offline
            </span>
          </div>
          <p className="text-xs text-yellow-700 mt-1">
            The app will continue to work with cached content
          </p>
        </div>
      )}

      {/* Update available prompt */}
      {showUpdatePrompt && (
        <div className="fixed top-4 left-4 right-4 z-50 max-w-md mx-auto">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 shadow-lg">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <svg
                  className="w-5 h-5 text-blue-400"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div className="ml-3 flex-1">
                <h3 className="text-sm font-medium text-blue-800">
                  Update Available
                </h3>
                <p className="mt-1 text-sm text-blue-700">
                  A new version of the app is available. Update now to get the latest features and improvements.
                </p>
                <div className="mt-3 flex space-x-2">
                  <button
                    onClick={handleUpdateApp}
                    className="bg-blue-600 text-white px-3 py-1 rounded text-sm font-medium hover:bg-blue-700 transition-colors"
                  >
                    Update Now
                  </button>
                  <button
                    onClick={handleDismissUpdate}
                    className="bg-blue-100 text-blue-800 px-3 py-1 rounded text-sm font-medium hover:bg-blue-200 transition-colors"
                  >
                    Later
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}