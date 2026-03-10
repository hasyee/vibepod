import { createContext, useContext } from 'react';

interface LocalStorageContextValue {
  get: <T>(key: string) => T | null;
  set: <T>(key: string, data: T) => void;
}

const LocalStorageContext = createContext<LocalStorageContextValue | null>(null);

function get<T>(key: string): T | null {
  try {
    const value = localStorage.getItem(key);
    return value ? JSON.parse(value) : null;
  } catch {
    return null;
  }
}

function set<T>(key: string, data: T): void {
  localStorage.setItem(key, JSON.stringify(data));
}

export function LocalStorageProvider({ children }: { children: React.ReactNode }) {
  return (
    <LocalStorageContext.Provider value={{ get, set }}>
      {children}
    </LocalStorageContext.Provider>
  );
}

export function useLocalStorage() {
  const ctx = useContext(LocalStorageContext);
  if (!ctx) throw new Error('useLocalStorage must be used within LocalStorageProvider');
  return ctx;
}
