import { IndexDb } from '../indexdb.utils';
import { IndexDbStore } from '../types';

const DB_NAME = 'audio';
const DB_STORES = [IndexDbStore.audioContents];

async function get(audioUrl: string): Promise<Blob | null> {
  const db = await IndexDb.openDb(DB_NAME, DB_STORES);
  return IndexDb.get<Blob>(db, IndexDbStore.audioContents, audioUrl);
}

async function set(audioUrl: string, blob: Blob): Promise<void> {
  const db = await IndexDb.openDb(DB_NAME, DB_STORES);
  await IndexDb.set(db, IndexDbStore.audioContents, audioUrl, blob);
}

async function listKeys(): Promise<string[]> {
  const db = await IndexDb.openDb(DB_NAME, DB_STORES);
  return IndexDb.listKeys(db, IndexDbStore.audioContents);
}

async function remove(audioUrl: string): Promise<void> {
  const db = await IndexDb.openDb(DB_NAME, DB_STORES);
  await IndexDb.remove(db, IndexDbStore.audioContents, audioUrl);
}

export function useAudioCache() {
  return { get, set, listKeys, remove };
}
