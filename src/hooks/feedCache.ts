import { openDb, IndexDb } from '../indexdb.utils';
import type { FeedMeta } from '../types';
import { IndexDbStore } from '../types';

async function get(feedUrl: string): Promise<string | null> {
  const db = await openDb();
  return IndexDb.get<string>(db, IndexDbStore.FeedContent, feedUrl);
}

async function set(feedUrl: string, feedContent: string): Promise<void> {
  const db = await openDb();
  const meta: FeedMeta = { updatedAt: new Date().toISOString() };
  await IndexDb.set(db, IndexDbStore.FeedContent, feedUrl, feedContent);
  await IndexDb.set(db, IndexDbStore.FeedMeta, feedUrl, meta);
}

async function listKeys(): Promise<string[]> {
  const db = await openDb();
  return IndexDb.listKeys(db, IndexDbStore.FeedContent);
}

async function remove(feedUrl: string): Promise<void> {
  const db = await openDb();
  await IndexDb.remove(db, IndexDbStore.FeedContent, feedUrl);
  await IndexDb.remove(db, IndexDbStore.FeedMeta, feedUrl);
}

async function getMeta(feedUrl: string): Promise<FeedMeta | null> {
  const db = await openDb();
  return IndexDb.get<FeedMeta>(db, IndexDbStore.FeedMeta, feedUrl);
}

export function useFeedCache() {
  return { get, set, listKeys, remove, getMeta };
}
