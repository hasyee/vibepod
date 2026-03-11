import { IndexDb } from '../indexdb.utils';
import type { FeedMeta } from '../types';
import { IndexDbStore } from '../types';

const DB_NAME = 'feeds';
const DB_STORES = [IndexDbStore.feedContents, IndexDbStore.feedMeta];

async function get(feedUrl: string): Promise<string | null> {
  const db = await IndexDb.openDb(DB_NAME, DB_STORES);
  return IndexDb.get<string>(db, IndexDbStore.feedContents, feedUrl);
}

async function set(feedUrl: string, feedContent: string): Promise<void> {
  const db = await IndexDb.openDb(DB_NAME, DB_STORES);
  const meta: FeedMeta = { updatedAt: new Date().toISOString() };
  await IndexDb.set(db, IndexDbStore.feedContents, feedUrl, feedContent);
  await IndexDb.set(db, IndexDbStore.feedMeta, feedUrl, meta);
}

async function listKeys(): Promise<string[]> {
  const db = await IndexDb.openDb(DB_NAME, DB_STORES);
  return IndexDb.listKeys(db, IndexDbStore.feedContents);
}

async function remove(feedUrl: string): Promise<void> {
  const db = await IndexDb.openDb(DB_NAME, DB_STORES);
  await IndexDb.remove(db, IndexDbStore.feedContents, feedUrl);
  await IndexDb.remove(db, IndexDbStore.feedMeta, feedUrl);
}

async function getMeta(feedUrl: string): Promise<FeedMeta | null> {
  const db = await IndexDb.openDb(DB_NAME, DB_STORES);
  return IndexDb.get<FeedMeta>(db, IndexDbStore.feedMeta, feedUrl);
}

export function useFeedCache() {
  return { get, set, listKeys, remove, getMeta };
}
