import { useState, useEffect } from 'react';

export function useOnlineStatus(): boolean {
  const [isOnline, setIsOnline] = useState(() => {
    if (typeof window === 'undefined') return true;
    // Electron: always online (local server)
    if (window.electronAPI?.isElectron) return true;
    return navigator.onLine;
  });

  useEffect(() => {
    // Skip event listeners in Electron (always online)
    if (typeof window !== 'undefined' && window.electronAPI?.isElectron) {
      return;
    }

    function handleOnline() {
      setIsOnline(true);
    }

    function handleOffline() {
      setIsOnline(false);
    }

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return isOnline;
}
