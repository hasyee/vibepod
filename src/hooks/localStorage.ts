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

export function useLocalStorage() {
  return { get, set };
}
