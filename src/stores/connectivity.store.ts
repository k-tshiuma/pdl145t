import { create } from 'zustand';

type ConnectivityStatus = 'online' | 'degraded' | 'offline';

interface ConnectivityState {
  status: ConnectivityStatus;
  lastOnline: Date | null;
  setStatus: (status: ConnectivityStatus) => void;
}

export const useConnectivityStore = create<ConnectivityState>()((set) => ({
  status: navigator.onLine ? 'online' : 'offline',
  lastOnline: navigator.onLine ? new Date() : null,

  setStatus: (status) =>
    set({
      status,
      ...(status === 'online' ? { lastOnline: new Date() } : {}),
    }),
}));

// Écouteurs natifs du navigateur
if (typeof window !== 'undefined') {
  window.addEventListener('online', () => {
    useConnectivityStore.getState().setStatus('online');
  });

  window.addEventListener('offline', () => {
    useConnectivityStore.getState().setStatus('offline');
  });
}
