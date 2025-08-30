// Service Worker registration and management utilities

interface ServiceWorkerConfig {
  onUpdate?: (registration: ServiceWorkerRegistration) => void;
  onSuccess?: (registration: ServiceWorkerRegistration) => void;
  onError?: (error: Error) => void;
}

/**
 * Check if service workers are supported
 */
export function isServiceWorkerSupported(): boolean {
  return 'serviceWorker' in navigator;
}

/**
 * Register the service worker
 */
export async function registerServiceWorker(config: ServiceWorkerConfig = {}): Promise<ServiceWorkerRegistration | null> {
  if (!isServiceWorkerSupported()) {
    console.log('Service workers are not supported in this browser');
    return null;
  }

  // Only register in production or when explicitly enabled
  if (process.env.NODE_ENV !== 'production' && !process.env.NEXT_PUBLIC_SW_ENABLED) {
    console.log('Service worker registration skipped in development');
    return null;
  }

  try {
    console.log('Registering service worker...');
    
    const registration = await navigator.serviceWorker.register('/sw.js', {
      scope: '/'
    });

    console.log('Service worker registered successfully:', registration);

    // Handle updates
    registration.addEventListener('updatefound', () => {
      const newWorker = registration.installing;
      if (!newWorker) return;

      console.log('New service worker found, installing...');

      newWorker.addEventListener('statechange', () => {
        if (newWorker.state === 'installed') {
          if (navigator.serviceWorker.controller) {
            // New update available
            console.log('New service worker installed, update available');
            if (config.onUpdate) {
              config.onUpdate(registration);
            }
          } else {
            // First time installation
            console.log('Service worker installed for the first time');
            if (config.onSuccess) {
              config.onSuccess(registration);
            }
          }
        }
      });
    });

    // Listen for controlling service worker changes
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      console.log('Service worker controller changed, reloading page...');
      window.location.reload();
    });

    return registration;
  } catch (error) {
    console.error('Service worker registration failed:', error);
    if (config.onError) {
      config.onError(error as Error);
    }
    return null;
  }
}

/**
 * Unregister the service worker
 */
export async function unregisterServiceWorker(): Promise<boolean> {
  if (!isServiceWorkerSupported()) {
    return false;
  }

  try {
    const registration = await navigator.serviceWorker.getRegistration();
    if (registration) {
      const result = await registration.unregister();
      console.log('Service worker unregistered:', result);
      return result;
    }
    return false;
  } catch (error) {
    console.error('Service worker unregistration failed:', error);
    return false;
  }
}

/**
 * Check if the app is running offline
 */
export function isOffline(): boolean {
  return !navigator.onLine;
}

/**
 * Get the current service worker registration
 */
export async function getServiceWorkerRegistration(): Promise<ServiceWorkerRegistration | null> {
  if (!isServiceWorkerSupported()) {
    return null;
  }

  try {
    const registration = await navigator.serviceWorker.getRegistration();
    return registration || null;
  } catch (error) {
    console.error('Failed to get service worker registration:', error);
    return null;
  }
}

/**
 * Force update the service worker
 */
export async function updateServiceWorker(): Promise<void> {
  const registration = await getServiceWorkerRegistration();
  if (registration) {
    try {
      await registration.update();
      console.log('Service worker update check completed');
    } catch (error) {
      console.error('Service worker update failed:', error);
    }
  }
}

/**
 * Skip waiting for new service worker
 */
export async function skipWaiting(): Promise<void> {
  const registration = await getServiceWorkerRegistration();
  if (registration && registration.waiting) {
    registration.waiting.postMessage({ type: 'SKIP_WAITING' });
  }
}

/**
 * Hook for managing service worker state in React components
 */
export function useServiceWorker(config: ServiceWorkerConfig = {}) {
  const [isSupported, setIsSupported] = React.useState(false);
  const [isRegistered, setIsRegistered] = React.useState(false);
  const [isOfflineMode, setIsOfflineMode] = React.useState(false);
  const [updateAvailable, setUpdateAvailable] = React.useState(false);

  React.useEffect(() => {
    setIsSupported(isServiceWorkerSupported());
    setIsOfflineMode(isOffline());

    // Register service worker
    if (isServiceWorkerSupported()) {
      registerServiceWorker({
        ...config,
        onSuccess: (registration) => {
          setIsRegistered(true);
          if (config.onSuccess) {
            config.onSuccess(registration);
          }
        },
        onUpdate: (registration) => {
          setUpdateAvailable(true);
          if (config.onUpdate) {
            config.onUpdate(registration);
          }
        }
      });
    }

    // Listen for online/offline events
    const handleOnline = () => setIsOfflineMode(false);
    const handleOffline = () => setIsOfflineMode(true);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [config]);

  return {
    isSupported,
    isRegistered,
    isOfflineMode,
    updateAvailable,
    skipWaiting,
    updateServiceWorker
  };
}

// Import React for the hook
import React from 'react';