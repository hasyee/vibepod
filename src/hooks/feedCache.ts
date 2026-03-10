function openDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('feeds', 1);
    request.onupgradeneeded = () => {
      request.result.createObjectStore('feeds');
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

async function get(feedUrl: string): Promise<string | null> {
  const db = await openDatabase();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction('feeds', 'readonly');
    const request = transaction.objectStore('feeds').get(feedUrl);
    request.onsuccess = () => resolve(request.result ?? null);
    request.onerror = () => reject(request.error);
  });
}

async function set(feedUrl: string, feedContent: string): Promise<void> {
  const db = await openDatabase();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction('feeds', 'readwrite');
    const request = transaction.objectStore('feeds').put(feedContent, feedUrl);
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

async function listKeys(): Promise<string[]> {
  const db = await openDatabase();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction('feeds', 'readonly');
    const request = transaction.objectStore('feeds').getAllKeys();
    request.onsuccess = () => resolve(request.result as string[]);
    request.onerror = () => reject(request.error);
  });
}

async function remove(feedUrl: string): Promise<void> {
  const db = await openDatabase();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction('feeds', 'readwrite');
    const request = transaction.objectStore('feeds').delete(feedUrl);
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

export function useFeedCache() {
  return { get, set, listKeys, remove };
}
